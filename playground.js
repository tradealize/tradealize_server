const {
  getImageCompletion,
  predictWorkflowTTA,
} = require("./middleware/clarifai");
const fs = require("fs");

const prompt =
  "Identifica en esta gráfica los parámetros de precio de compra, stop loss, take profit y volumen de RSI. Interpreta la estrategia que esta usando el usuario para realizar esta operativa.";
const image_url =
  "https://tradealizebot.s3.us-west-1.amazonaws.com/photo_4983747254640815626_w.jpg";

const content = `Lo siento, pero no puedo proporcionar detalles específicos de la imagen que proporcionaste. No obstante, puedo explicarte cómo interpretar una gráfica de trading y qué representan en general los términos que mencionaste:

1. Precio de Compra (Entry Price): Este es el nivel de precio al que un trader decide entrar al mercado, es decir, el precio al que compra un activo. En una gráfica, generalmente se marca con una línea horizontal o se indica con una anotación en el punto de entrada.

2. Stop Loss (SL): Es un mecanismo de gestión de riesgos que establece un nivel de precio en el cual una posición abierta se cerrará automáticamente para limitar las pérdidas si el mercado se mueve en contra de la dirección anticipada por el trader. El stop loss se representa comúnmente con una línea horizontal por debajo del precio de compra para posiciones largas (compras) o por encima para posiciones cortas (ventas).

3. Take Profit (TP): Es el nivel de precio al que el trader pretende cerrar una posición para tomar ganancias. Al igual que el stop loss, se representa con una línea horizontal, pero en este caso, está por encima del precio de compra para posiciones largas o por debajo para posiciones cortas.

4. Volumen de RSI (Relative Strength Index): El RSI es un indicador de momentum que mide la velocidad y cambio de los movimientos de precio. El volumen no es directamente parte del RSI, pero podría referirse al volumen de trading (la cantidad de activos intercambiados) durante los periodos en que el RSI está en cierto nivel. El RSI típicamente se grafica en un rango de 0 a 100 y se considera que un activo está sobrecomprado cuando está por encima de 70 y sobrevendido cuando está por debajo de 30.

La estrategia de trading que está usando el usuario no se puede determinar con exactitud sin más información, pero podría basarse en el uso de RSI como indicador para momentar la entrada (compra cuando el RSI indica sobrevendido) y la salida (venta cuando el RSI indica sobrecomprado), mientras que el stop loss y el take profit están establecidos para gestionar el riesgo y asegurar ganancias respectivamente.`;

async function main() {
  /*getImageCompletion(prompt, image_url)
    .then((response) => {
      console.log("Finished Image Completion");
      const { choices } = response;
      const { content } = choices[0].message;
      console.log(content);*/

  predictWorkflowTTA(content)
    .then((result) => {
      console.log("Finished Workflow");
      const { outputs } = result.results[0];

      const dalleOutput = outputs.find(
        ({ model }) => model.name === "dall-e-3"
      );

      if (dalleOutput && dalleOutput !== null) {
        const { image } = dalleOutput.data;
        const { base64 } = image;
        fs.writeFileSync(`${__dirname}/image.png`, base64, {
          encoding: "base64",
        });
      }

      const ttsOutput = outputs.find(
        ({ model }) => model.name === "openai-tts-1"
      );

      if (ttsOutput && ttsOutput !== null) {
        const { audio } = ttsOutput.data;
        const { audio_format } = audio.audio_info;
        const { base64 } = audio;
        fs.writeFileSync(`${__dirname}/audio.${audio_format}`, base64);
      }
    })
    .catch((error) => {
      console.log("Error on TTA");
      console.log(error);
    });
  /*})
    .catch((error) => {
      console.log("Error on Image Completion");
      console.log(error);
    });*/
}

main();
