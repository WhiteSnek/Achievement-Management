const achievementRepo = require("../repositories/achievementRepository");
const mentorRepo = require("../repositories/mentorRepository");

class AchievementController {
  constructor() {
    this.achievement = new achievementRepo();
    this.mentor = new mentorRepo();
  }

  addAchievement = async (req, res) => {
    try {
      const achievement = await this.achievement.create(req.body);
      res.status(201).json(achievement);
    } catch (error) {
      console.log("controller error : " + error);
      res.status(400).json({ message: error.message });
    }
  };

  deleteAchievement = async (req, res) => {
    try {
      const achievement = await this.achievement.destroy(req.params.id);
      res.status(200).json(achievement);
    } catch (error) {
      console.log("controller error : " + error);
      res.status(400).json({ message: error.message });
    }
  };

  getAchievements = async (req, res) => {
    try {
      const achievements = await this.achievement.getAchievementsByUserId(
        req.params.userId
      );
      res.status(200).json(achievements);
    } catch (error) {
      console.log("controller error : " + error);
      res.status(400).json({ message: error.message });
    }
  };

  getAchievementsByMentorAndStatus = async (req, res) => {
    try {
      const { id, status } = req.params;

      const mentor = await this.mentor.getMentorById(id);
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
