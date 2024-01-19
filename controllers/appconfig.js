const { appconfig } = require("../models");
const { Op } = require("sequelize");

const getAppConfig = async (req, res, next) => {
  try {
    const config = await appconfig.findAll();
    res.status(200).send({ config });
  } catch (error) {
    next(error);
  }
};

const updateAppConfig = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    await appconfig.update(
      { value },
      {
        where: {
          id: {
            [Op.gt]: 0,
          },
          key,
        },
      }
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppConfig, updateAppConfig };
