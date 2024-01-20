const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const API_KEY = process.env.CLARIFAI_API_KEY;
const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();

metadata.set("authorization", `Key ${API_KEY}`);

const getImageCompletion = async (prompt, image_url) =>
  new Promise((resolve, reject) => {
    const USER_ID = "openai";
    const APP_ID = "chat-completion";
    const MODEL_ID = "openai-gpt-4-vision";

    stub.PostModelOutputs(
      {
        // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
        model_id: MODEL_ID,
        inputs: [
          {
            data: {
              image: { url: image_url },
              text: { raw: prompt },
            },
          },
        ],

        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID,
        },
      },
      metadata,
      (err, response) => {
        if (err) {
          return reject(err);
        }

        if (response.status.code !== 10000) {
          return reject(response.status);
        }

        resolve({
          choices: [
            {
              message: {
                content: response.outputs[0].data.text.raw,
                role: "assistant",
              },
            },
          ],
          usage: {},
        });
      }
    );
  });

module.exports = { getImageCompletion };
