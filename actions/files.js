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

module.exports = { findFileById };
