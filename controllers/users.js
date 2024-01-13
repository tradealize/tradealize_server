const Sequelize = require("sequelize");
const admin = require("firebase-admin");
const { user, purchase, conversation, invoice, product } = require("../models");
const { Op } = Sequelize;
const pageSize = 50;

const getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email || email === "" || email === null || email === "undefined") {
      return res
        .status(400)
        .send({ code: 400, status: "failed", message: "Email is missing" });
    }
    const current_user = await user.findOne({
      where: {
        email,
      },
    });
    if (current_user === null) {
      return res
        .status(404)
        .send({ code: 404, status: "failed", message: "User not found" });
    }
    res.status(200).send({
      code: 200,
      status: "success",
      user: current_user,
      message: "User found",
    });
  } catch (error) {
    next(error);
  }
};

const getResetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    const link = await admin.auth().generatePasswordResetLink(email);

    res
      .status(200)
      .send({ code: 200, status: "success", message: "Link generated.", link });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    let { page } = req.query;

    if (isNaN(page)) page = 1;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    let params = {};
    if (req.query.query) {
      params = {
        [Op.or]: [
          {
            email: {
              [Op.like]: `%${req.query.query}%`,
            },
          },
          {
            name: {
              [Op.like]: `%${req.query.query}%`,
            },
          },
          {
            last_name: {
              [Op.like]: `%${req.query.query}%`,
            },
          },
        ],
      };
    }
    let users = await user.findAll({
      where: params,
      group: ["user_id"],
      order: [["name", "ASC"]],
    });
    if (!req.query.query) {
      users = users.slice(offset, offset + limit);
    }

    res.status(200).send({ users });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const current_user = req.user;
    res.status(200).send({ user: current_user });
  } catch (error) {
    next(error);
  }
};

const getUsersByQuery = async (req, res, next) => {
  try {
    const { query } = req.query;
    const users = await user.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${query}%`,
            },
          },
          {
            last_name: {
              [Op.like]: `%${query}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      },
    });
    res.status(200).send({ users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const current_user = await user.findOne({
      where: {
        user_id,
      },
      include: [{ model: purchase, include: product }],
    });

    if (!current_user) {
      return res.sendStatus(404);
    }

    const user_invoices = await invoice.findAll({
      where: { user_id },
      include: {
        model: purchase,
        required: true,
        include: product,
      },
    });

    const userData = {
      ...current_user.toJSON(),
      invoices: user_invoices.map((invoice) => invoice.toJSON()),
    };

    res.status(200).json({ user: userData });
  } catch (error) {
    next(error);
  }
};

const getUserByUid = async (req, res, next) => {
  try {
    const { user } = req;
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ error });
  }
};

const getUserByPhone = async (req, res, next) => {
  try {
    let { phone } = req.query;
    const current_user = await user.findOne({
      where: {
        phone,
        phone_provider: true,
      },
    });
    if (current_user === null) {
      return res.sendStatus(404);
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const data = req.body;
    const { email, phone } = data;

    if (!data.uid && !data.password) {
      return res.status(400).send({
        code: 400,
        status: "failed",
        message: "Cannot create user without UID or password.",
      });
    }

    if (email && email !== "" && email !== null) {
      const userExists = await user.findOne({ where: { email } });
      if (userExists !== null) {
        return res.status(409).send({
          code: 400,
          status: "failed",
          message: "User already exists",
        });
      }
      data.email_provider = true;
    } else if (phone && phone !== "" && phone !== null) {
      const userExists = await user.findOne({ where: { phone } });
      if (userExists !== null) {
        return res.status(409).send({
          code: 400,
          status: "failed",
          message: "User already exists",
        });
      }
      data.phone_provider = true;
    }

    if (
      data.password &&
      data.password !== null &&
      data.password !== "" &&
      !data.uid
    ) {
      if (String(data.password).length < 6) {
        return res.status(400).send({
          code: 400,
          status: "failed",
          message: "Password must be at least 6 characters long.",
        });
      }
      const userResult = await admin
        .auth()
        .createUser({ email: data.email, password: data.password });
      data.uid = userResult.uid;
    }

    const currentUser = await user.create(data);

    if (req.hostname.includes("bemodo") && req.hostname !== "bemodo.ai") {
      await purchase.create({
        user_id: currentUser.user_id,
        payment_method_id: 3,
        expiration_days: 30,
        admin_enabled: true,
        status: "active",
        product_id: 1,
      });
    }

    await conversation.create({
      user_id: currentUser.user_id,
      name: "My First Conversation",
    });

    res.status(200).send({
      code: 200,
      user: currentUser,
      status: "success",
      message: "User updated.",
    });
  } catch (error) {
    next(error);
  }
};

const createUserNoSignUp = async (req, res, next) => {
  try {
    const data = req.body;
    const { email, phone } = data;
    if (email && email !== "" && email !== null) {
      const userExists = await user.findOne({ where: { email } });
      if (userExists !== null) {
        return res.status(409).send({
          code: 400,
          status: "failed",
          message: "User already exists",
        });
      }
      data.email_provider = true;
    } else if (phone && phone !== "" && phone !== null) {
      const userExists = await user.findOne({ where: { phone } });
      if (userExists !== null) {
        return res.status(409).send({
          code: 400,
          status: "failed",
          message: "User already exists",
        });
      }
      data.phone_provider = true;
    }

    if (!data.uid) {
      if (String(data.password).length < 6) {
        return res.status(400).send({
          code: 400,
          status: "failed",
          message: "Password must be at least 6 characters long.",
        });
      }
      const userResult = await admin.auth().createUser({ email });
      data.uid = userResult.uid;
    }

    const currentUser = await user.create(data);

    await conversation.create({
      user_id: currentUser.user_id,
      name: "My First Conversation",
    });

    res.status(200).send({
      code: 200,
      user: currentUser,
      status: "success",
      message: "User created.",
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { user_id } = req;
    const data = req.body;
    let current_user = await user.findOne({
      where: {
        user_id,
      },
    });
    if (current_user === null) {
      return res.sendStatus(404);
    }
    current_user = current_user.toJSON();
    const { email } = current_user;
    if (current_user.email !== email) {
      await admin.auth().updateUser(current_user.uid, { email });
    }
    await user.update(data, {
      where: {
        user_id,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const updateUserAdmin = async (req, res, next) => {
  try {
    const data = req.body;
    const { user_id, email } = data;
    let current_user = null;
    if (
      user_id &&
      user_id !== "" &&
      user_id !== null &&
      user_id !== "undefined"
    ) {
      current_user = await user.findOne({
        where: {
          user_id,
        },
      });
    }
    if (current_user === null) {
      current_user = await user.findOne({
        where: {
          email,
        },
      });
      if (current_user === null) {
        return res.status(404).send({
          code: 400,
          status: "failed",
          message: "User not found.",
        });
      }
    }
    current_user = current_user.toJSON();
    if (current_user.email !== email) {
      await admin.auth().updateUser(current_user.uid, { email });
    }
    if (data.password && data.password !== null && data.password !== "") {
      if (String(data.password).length < 6) {
        return res.status(400).send({
          code: 400,
          status: "failed",
          message: "Password must be at least 6 characters long.",
        });
      }
      await admin
        .auth()
        .updateUser(current_user.uid, { password: data.password });
    }
    const updateData = { ...data };
    delete data.user_id;
    await user.update(updateData, {
      where: {
        user_id: current_user.user_id,
      },
    });
    res.status(200).send({
      code: 200,
      status: "success",
      message: "User updated.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    await user.destroy({
      where: {
        user_id,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const giveAccess = async (req, res, next) => {
  try {
    const { user_id, product_id, is_gift, payment_method_id, status } =
      req.body;

    let current_product = await product.findOne({
      where: {
        product_id,
      },
    });
    if (current_product === null) {
      return res.sendStatus(404);
    }
    current_product = current_product.toJSON();

    const {
      sale_price,
      price,
      expiration_days,
      subscription_interval,
      subscription_period,
      free_trial_length,
      free_trial_period,
      free_trial_end,
      word_amount,
    } = current_product;

    const product_price = isNaN(sale_price) || !sale_price ? price : sale_price;

    await purchase.create({
      user_id,
      product_id,
      payment_method_id,
      expiration_days,
      subscription_interval,
      subscription_period,
      free_trial_length,
      free_trial_period,
      free_trial_end,
      word_amount,
      admin_enabled: true,
      status: !status ? "pending" : status,
      amount: is_gift ? 0 : product_price,
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResetPasswordLink,
  getAllUsers,
  getUserById,
  getUserByUid,
  getUserByPhone,
  getCurrentUser,
  getUsersByQuery,
  updateUserAdmin,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  giveAccess,
  createUserNoSignUp,
};
