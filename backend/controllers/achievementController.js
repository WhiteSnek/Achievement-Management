const achievementRepo = require("../repositories/achievementRepository");
const mentorRepo = require("../repositories/mentorRepository");
const fs = require("fs");
const path = require("path");
const redis = require("redis");
const dotenv = require("dotenv");
const { uploadToS3 }= require('../s3-client.js');

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL, // Update with your Redis server URL if different
});
redisClient.connect().catch(console.error);

class AchievementController {
  constructor() {
    this.achievement = new achievementRepo();
    this.mentor = new mentorRepo();
  }

  // to handle achievement creation and file url saving in proof from s3
  addProofs = async (req, res) => {
    const { mentorId, userId, achievementId } = req.body;
    const files = req.files; // `req.files` will be an array of files
  
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
  
    try {
      const achievement = await this.achievement.getOne(achievementId);
      if (!achievement) {
        return res.status(404).json({ error: "Achievement not found" });
      }
  
      // Upload each file to S3 and get the URLs
      const fileURLs = await Promise.all(files.map(async (file, index) => {
        const key = `${mentorId}/${userId}/${achievementId}/file_${index + 1}.png`;
        return await uploadToS3(file.buffer, "bucket-private-site", key);
      }));
  
      // Update the achievement with file URLs
      achievement.proof = fileURLs;
      const savedAchievement = await achievement.save();
  
      res.status(200).json({ message: "Files uploaded successfully", savedAchievement });
    } catch (err) {
      console.error('Error uploading files:', err);
      res.status(500).json({ error: err.message });
    }
  };

  addAchievement = async (req, res) => {
    const {
      // mentorId,
      userId,
      name,
      date,
      type,
      description,
      location,
      is_Technical,
      mode,
      result,
      verificationStatus,
    } = req.body;
    // const fileURL = req.fileURL;

    const newAchievement = await this.achievement.create({
      userId: userId,
      name,
      date,
      type,
      description,
      location,
      is_Technical,
      mode,
      result,
      verificationStatus,
      // proof: fileURL,
    });
    try {
      const savedAchievement = await newAchievement.save();
      // await redisClient.del(`savedAchievement:${userId}`;

      //-- as already saved the proof --
      // savedAchievement.proof = req.fileUrl;
      // await savedAchievement.save();

      res.status(200).json({
        message: "achivement and file uploaded",
        achievement: savedAchievement,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error in uploading file" });
    }
  };

  deleteAchievement = async (req, res) => {
    try {
      const achievement = await this.achievement.destroy(req.params.id);
      await redisClient.del(`achievements:${achievement.userId}`);
      res.status(200).json(achievement);
    } catch (error) {
      console.log("controller error : " + error);
      res.status(400).json({ message: error.message });
    }
  };

  getAchievements = async (req, res) => {
    const userId = req.params.userId;

    // // Check cache first
    // const cacheKey = `achievements:${userId}`;
    // const cachedAchievements = await redisClient.get(cacheKey);

    // if (cachedAchievements) {
    //   return res.status(200).json(JSON.parse(cachedAchievements));
    // }
    try {
      const achievements = await this.achievement.getAchievementsByUserId(
        userId
      );
      // await redisClient.set(cacheKey, JSON.stringify(achievements), {
      //   EX: 3600, // Cache expiration time in seconds
      // });
      res.status(200).json(achievements);
    } catch (error) {
      console.log("controller error : " + error);
      res.status(400).json({ message: error.message });
    }
  };

  getAllAchievements = async (req, res) => {
    // const cacheKey = "achievements:all";

    try {
      // const cachedAchievements = await redisClient.get(cacheKey);

      // if (cachedAchievements) {
      //   return res.status(200).json(JSON.parse(cachedAchievements));
      // }

      const achievements = await achievementRepo.getAllAchievements();

      // await redisClient.set(cacheKey, JSON.stringify(achievements), {
      //   EX: 3600,
      // });

      res.status(200).json(achievements);
    } catch (error) {
      console.error("Controller error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  getAchievementsInCSV = async (req, res) => {
    try {
      const achievements = await this.achievement.getAchievementsByUserIdInCSV(
        req.params.userId
      );
      // Handle the case where no achievements are found or mentor is not found
      if (!achievements || achievements.length === 0) {
        throw new Error("Mentor not found or no achievements for the user");
      }
      // Extract headers
      const headers = Object?.keys(Object?.values(achievements[0])[2]);
      // Convert data to CSV format
      let csv = headers.join(",") + "\n";
      achievements.forEach((achievement) => {
        let row = headers.map((header) => achievement[header] || "").join(",");
        csv += row + "\n";
      });

      // Define the file path in the ../uploads directory
      const uploadsDir = path.join(__dirname, "../uploads");

      // Create the uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, "achievements.csv");
      const fileUrl = `http://localhost:3000/uploads/achievements.csv`;
      // Write the CSV to a file
      fs.writeFileSync(filePath, csv);

      res.status(200).json({ achievements, fileUrl });
    } catch (error) {
      console.error("Controller error:", error);
      res.status(400).json({ message: error.message });
    }
  };

  getAchievementsByMentorAndStatus = async (req, res) => {
    const { mentorId, status } = req.params;
    try {
      const mentor = await this.mentor.getMentorById(mentorId);
      const validStatuses = ["pending", "accepted", "rejected"];

      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      const achievements =
        await this.achievement.getAchievementsByUserIdsAndStatus(
          mentor.studentUserIds,
          status
        );

      res.status(200).json(achievements);
    } catch (error) {
      console.log("controller error : " + error);

      res.status(400).json({ message: error.message });
    }
  };

  getAchievementsByMentorAndStatusInCSV = async (req, res) => {
    try {
      const { mentorId, status } = req.params;
      const mentor = await this.mentor.getMentorById(mentorId);
      const validStatuses = ["pending", "accepted", "rejected"];

      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      const achievements =
        await this.achievement.getAchievementsByUserIdsAndStatus(
          mentor.studentUserIds,
          status
        );

      // Handle the case where no achievements are found
      if (!achievements || achievements.length === 0) {
        throw new Error("No achievements found for the given status");
      }

      // Extract headers for user and achievement info
      const userHeaders = Object.keys(Object.values(achievements[0].userId)[2]);

      const achievementHeaders = Object.keys(
        Object.values(achievements[0])[2]
      ).filter((key) => key !== "userId");
      console.log(achievementHeaders);
      // Create CSV data
      let csv = "Student Information\n";
      csv += userHeaders.join(",") + "\n";
      let uniqueStudents = new Set();
      achievements.forEach((achievement) => {
        let userRow = userHeaders
          .map((header) => achievement.userId[header] || "")
          .join(",");
        if (!uniqueStudents.has(userRow)) {
          csv += userRow + "\n";
          uniqueStudents.add(userRow);
        }
      });

      csv += "\nAchievements\n";
      csv += achievementHeaders.join(",") + "\n";
      achievements.forEach((achievement) => {
        let achievementRow = achievementHeaders
          .map((header) => {
            if (header === "userId") {
              return achievement[header] ? achievement[header]._id : "";
            }
            return achievement[header] || "";
          })
          .join(",");
        csv += achievementRow + "\n";
      });

      // Log the generated CSV
      console.log(csv);

      // Define the file path in the ../uploads directory
      const uploadsDir = path.join(__dirname, "../uploads");

      // Create the uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, "student_achievements.csv");
      const fileUrl = `http://localhost:3000/uploads/student_achievements.csv`;
      // Write the CSV to a file
      fs.writeFileSync(filePath, csv);

      res.status(200).json({ achievements, fileUrl });
    } catch (error) {
      console.error("Controller error:", error);
      res.status(400).json({ message: error.message });
    }
  };

  getOneAchievement = async (req, res) => {
    try {
      const achievement = await this.achievement.getOne(req.params.id);

      res.status(200).json(achievement);
    } catch (error) {
      console.log("controller error : " + error);

      res.status(400).json({ message: error.message });
    }
  };

  // TODO: Create route, controller to handle "get achievement proof"

  getAchievementProof = async (req, res) => {
    // controller code here
  };

  updateAchievement = async (req, res) => {
    try {
      const achievement = await this.achievement.updateAchievement(
        req.params.id,
        req.body
      );

      res.status(200).json(achievement);
    } catch (error) {
      console.log("controller error : " + error);

      res.status(400).json({ message: error.message });
    }
  };

  verifyAchievement = async (req, res) => {
    try {
      const { id, status } = req.params;
      console.log(id, status);

      const achievement = await this.achievement.updateAchievement(id, {
        verificationStatus: status,
      });

      res.status(200).json(achievement);
    } catch (error) {
      console.log("controller error : " + error);

      res.status(400).json({ message: error.message });
    }
  };
}

module.exports = new AchievementController();
