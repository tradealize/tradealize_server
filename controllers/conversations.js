const Sequelize = require("sequelize");
const { Op } = Sequelize;
const { sequelize } = require("../models");

const {
  template,
  conversation,
  user_workflow,
  user_workflow_template,
} = require("../models");

const getConversations = async (req, res, next) => {
  try {
    const { user_id } = req;
    const { sortBy } = req.query;
    const viewArchived = req.query.archived ? true : false;
    let params = {
      user_id,
      archived: viewArchived,
    };

    if (req.query.query) {
      params.name = {
        [Op.like]: `%${req.query.query}%`,
      };
    }

    if (req.query.tags) {
      params.tags = {
        [Op.like]: `%${req.query.tags}%`,
      };
    }

    let order = [];
    if (sortBy && sortBy !== null && sortBy !== "") {
      let sortSplit = String(sortBy).split("_");
      let sortCol = sortSplit[0];
      let sortOrder = sortSplit[1];
      let orderCol = [sortCol, sortOrder];
      order.push(orderCol);
    } else {
      order.push(["createdAt", "DESC"]);
    }

    const conversations = await conversation.findAll({
      where: params,
      order,
    });

    res.status(200).send({ conversations });
  } catch (error) {
    next(error);
  }
};

const getSingleConversation = async (req, res, next) => {
  try {
    const { conversation_id } = req.params;
    const current = await conversation.findOne({
      where: { conversation_id },
    });
    res.status(200).send({ conversation: current });
  } catch (error) {
    next(error);
  }
};

const getAllTags = async (req, res, next) => {
  try {
    const { user_id } = req;
    const { query } = req.query;
    let queryString = "";
    if (query && query !== "" && query !== null) {
      queryString = `AND tags LIKE "%${query}%"`;
    }
    let tags = (
      await sequelize.query(`
      SELECT DISTINCT tags FROM conversation
      WHERE (user_id = ${user_id})
      ${queryString};
    `)
    )[0];
    const tagsSet = new Set();
    tags.forEach(({ tags }) => {
      if (tags !== null) {
        let allTags = String(tags)
          .split(",")
          .filter((tag) => tag !== "");
        allTags.forEach((tag) => tagsSet.add(String(tag).trim()));
      }
    });
    tags = Array.from(tagsSet);
    res.status(201).send({ tags: tags });
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { user_id } = req;
    const { name, tags } = req.body;

    const current = await conversation.create({
      user_id,
      name,
      tags,
    });

    res.status(200).send({ conversation: current });
  } catch (error) {
    next(error);
  }
};

const updateConversation = async (req, res, next) => {
  try {
    const { conversation_id, ...updateFields } = req.body;

    const result = await conversation.update(updateFields, {
      where: { conversation_id },
    });

    if (result[0] === 0) {
      return res.status(404).send("Conversation not found");
    }

    const current = await conversation.findOne({
      where: { conversation_id },
      include: {
        model: user_workflow_template,
        include: [template, user_workflow],
        required: false,
      },
    });

    res.status(200).send({ conversation: current });
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const { conversation_id } = req.params;
    await conversation.destroy({
      where: {
        conversation_id,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  getSingleConversation,
  getAllTags,
};
