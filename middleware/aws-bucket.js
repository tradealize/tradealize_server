const fs = require("fs");
const multer = require("multer");
const moment = require("moment");
const multerS3 = require("multer-s3");
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3Config = {
  region,
  accessKeyId,
  secretAccessKey,
};

const s3 = new S3(s3Config);

const processFileName = (name) => {
  name = name.split(".")[0];
  if (String(name).length > 200) {
    name = name.substring(200);
  }
  name = name.replace(" ", "_");
  name = name.replace(":", "_");
  const momentString = moment().format("YYYY_MM_DD_HH_mm_ss");
  if (String(name).length > 200) {
    name = `${name.substring(200)}_${momentString}`;
  } else {
    name = `${name}_${momentString}`;
  }
  return name;
};

const getFileStream = (file_key) => {
  const downloadParams = {
    Key: file_key,
    Bucket: bucketName,
  };
  return s3.getObject(downloadParams).createReadStream();
};

const uploadFileFromDisk = (filePath, fileName) => {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: fileName,
  };

  return s3.upload(uploadParams).promise();
};

const uploadSingleFile = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    key: function (request, file, callback) {
      let name = file.originalname;
      let nameSplit = file.originalname.split(".");
      if (nameSplit.length > 1) {
        name = nameSplit[0] + "." + nameSplit[nameSplit.length - 1];
      }
      const extension = name.match(/\.[0-9a-z]+$/i)[0].replace(".", "");
      name = processFileName(name);
      const fileName = `${name}.${extension}`;
      request.fileName = name;
      request.fileType = extension;
      callback(null, fileName);
    },
  }),
}).single("file");

module.exports = { getFileStream, uploadSingleFile, uploadFileFromDisk };
