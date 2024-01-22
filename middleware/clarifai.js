const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const API_KEY = "8095f75eeca04f8db4e223066fc461f0";
const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();

const predictWorkflowTTA = async (PROMPT) =>
  new Promise((resolve, reject) => {
    const APP_ID = "Traderalize";
    const USER_ID = "chekosworld";
    const WORKFLOW_ID = "worfklow-tta-tti";
    const PAT = "8095f75eeca04f8db4e223066fc461f0";

    metadata.set("authorization", "Key " + PAT);

    stub.PostWorkflowResults(
      {
        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID,
        },
        workflow_id: WORKFLOW_ID,
        inputs: [{ data: { text: { raw: PROMPT } } }],
      },
      metadata,
      (err, response) => {
        if (err) {
          return reject(err);
        }

        if (response.status.code !== 10000) {
          return reject(response.status);
        }

        resolve(response);
      }
    );
  });

const predictWorkflowImage = async (PROMPT, IMAGE_URL) =>
  new Promise((resolve, reject) => {
    const APP_ID = "Traderalize";
    const USER_ID = "chekosworld";
    const WORKFLOW_ID = "workflow-663344";
    const PAT = "8095f75eeca04f8db4e223066fc461f0";

    metadata.set("authorization", "Key " + PAT);

    stub.PostWorkflowResults(
      {
        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID,
        },
        workflow_id: WORKFLOW_ID,
        inputs: [
          { data: { image: { url: IMAGE_URL } }, text: { raw: PROMPT } },
        ],
      },
      metadata,
      (err, response) => {
        if (err) {
          return reject(err);
        }

        if (response.status.code !== 10000) {
          return reject(response.status);
        }

        resolve(response);
      }
    );
  });
const getImageCompletion = async (prompt, image_url) =>
  new Promise((resolve, reject) => {
    const USER_ID = "openai";
    const APP_ID = "chat-completion";
    const MODEL_ID = "openai-gpt-4-vision";

    metadata.set("authorization", `Key ${API_KEY}`);

    return stub.PostModelOutputs(
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

module.exports = {
  predictWorkflowTTA,
  getImageCompletion,
  predictWorkflowImage,
};
