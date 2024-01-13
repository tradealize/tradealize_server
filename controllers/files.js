const { file } = require("../models");
const fs = require("fs");

const getFile = async (req, res, next) => {
  try {
    let { file_id } = req.params;
    let current_file;
    if (String(file_id).includes(".")) {
      let fileSplit = String(file_id).split(".");
      let name = fileSplit[0];
      let type = fileSplit[1];
      if (fileSplit.length > 2) {
        tyoe = fileSplit[fileSplit.length - 1];
      }
      current_file = await file.findOne({
        where: {
          name,
          type,
        },
      });
    } else {
      current_file = await file.findOne({
        where: {
          file_id,
        },
      });
    }
    let filePath;
    if (current_file === null) {
      filePath = `${__dirname}/files/${file_id}`;
      if (!fs.existsSync(filePath)) {
        return res.sendStatus(404);
      }
    } else {
      current_file = current_file.toJSON();
      filePath = `${__dirname}/files/${current_file.name}.${current_file.type}`;
      if (!fs.existsSync(filePath)) {
        return res.sendStatus(404);
      }
    }
    res.status(200).sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

const createFile = async (req, res, next) => {
  try {
    const { fileName, fileType } = req;
    let current_file = await file.create({
      name: fileName,
      type: fileType,
    });
    current_file = current_file.toJSON();
    res.status(200).send({ file: current_file, file_id: current_file.file_id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFile, createFile };
