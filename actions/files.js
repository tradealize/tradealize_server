const { file } = require("../models");

const findFileById = async (file_id) => {
  let current_file = await file.findOne({
    where: {
      file_id,
    },
  });
  if (current_file === null) return current_file;
  current_file = current_file.toJSON();
  return current_file;
};
const createFileFromData = async (data) => {
  delete data.file_id;
  const current_file = await file.create(data);
  return current_file.toJSON();
};

module.exports = { findFileById, createFileFromData };
