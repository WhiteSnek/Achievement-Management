const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessId : process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME
});

module.exports = s3;