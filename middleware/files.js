const { file } = require("../models");
const moment = require("moment");

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

const validateFileName = async (req, res, next) => {
  try {
    let name = req.file.originalname;
    name = processFileName(name);
    req.fileName = name;
    next();
  } catch (error) {
    next(error);
  }
};

const insertFile = async (req, res, next) => {
  try {
    const { fileName, fileType } = req;
    const current_file = await file.create({
      name: fileName,
      type: fileType,
    });
    req.file_id = current_file.file_id;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { insertFile, validateFileName, processFileName };
