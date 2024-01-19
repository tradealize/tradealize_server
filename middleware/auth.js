const admin = require("firebase-admin");
const { user } = require("../models");

const fbAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization;
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken) {
        req.uid = decodedToken.uid;
      }
      const current_customer = await user.findOne({
        where: {
          uid: decodedToken.uid,
        },
      });
      if (current_customer !== null) {
        req.uid = decodedToken.uid;
        req.customer_id = current_customer.customer_id;
        return next();
      }
      return res.sendStatus(401);
    }
    next();
  } catch (e) {
    console.log(e.stack);
    if (!e.code) {
      next(e);
    } else {
      res.status(401).send(e);
    }
  }
};

const token = async (req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    return res.status(400).send("La solicitud no incluye un token");
  }
};

module.exports = {
  token,
  fbAuth,
};
