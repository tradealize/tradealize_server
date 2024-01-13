const { USER_NOT_FOUND } = require("../constants");
const { user, staff } = require("../models");
const moment = require("moment");
const jwt = require("jwt-simple");
const tokenSecret = process.env.TOKEN_SECRET; //HAY QUE MOVERLO A UN ENV

const userAuth = async (req, res, next) => {
  try {
    const { uid } = req;
    let current_user = await user.findOne({
      where: {
        uid,
      },
    });
    if (current_user === null) {
      return res.status(404).send({
        code: 404,
        status: "failed",
        message: USER_NOT_FOUND,
      });
    }
    current_user = current_user.toJSON();

    /*if (current_user.role === null) {
      let device_token = req.device_token;
      let expiration = moment().add(7, "days").valueOf();
      let current_device_token = jwt.encode(
        {
          user_id: current_user.user_id,
          expiration,
        },
        tokenSecret
      );

      //User's sign in on new device
      if (current_user.device_token === null) {
        //Update to generated device token
        await user.update(
          {
            device_token: current_device_token,
          },
          { where: { user_id: current_user.user_id } }
        );
      } else if (current_user.device_token !== device_token) {
        //Update to generated device token
        await user.update(
          {
            device_token: null,
          },
          { where: { user_id: current_user.user_id } }
        );
        //  await fbadmin.auth().revokeRefreshTokens(current_user.uid);

        // return res.sendStatus(428);
      }
      //Else if user
      current_user.device_token = device_token;
    }*/
    req.user_id = current_user.user_id;
    req.user = current_user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { userAuth };
