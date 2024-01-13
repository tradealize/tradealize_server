const express = require("express");
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const moment = require("moment");
const Sentry = require("@sentry/node");
const applyRoutes = require("./routes");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const Tracing = require("@sentry/tracing");
const http = require("http").createServer(app);
const serviceAccount = require("./serviceAccount.json");
const { createSocket } = require("./middleware/socket");

const parseJSON = bodyParser.json();
const parseURL = bodyParser.urlencoded({ extended: true });

function shouldParseJSON(req) {
  if (String(req.url).includes("webhook")) return false;
  return true;
}

app.use((req, res, next) =>
  shouldParseJSON(req) ? parseJSON(req, res, next) : next()
);
app.use((req, res, next) =>
  shouldParseJSON(req) ? parseURL(req, res, next) : next()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const allowedOrigins = String(process.env.ALLOWED_ORIGINS).split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin: " +
          origin;
        console.log(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

applyRoutes("/api", app);

createSocket(http);

if (process.env.NODE_ENV !== "development") {
  app.use(express.static(`${__dirname}/build`));

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  app.get("/*", (req, res) => {
    res.sendFile(`${__dirname}/build/index.html`);
  });
}

// Optional fallthrough error handler
app.use(function onError(error, req, res, next) {
  const { response } = error;
  if (response) {
    const { data } = response;
    if (typeof data === "object" && data !== null) {
      if (data.error && data.error !== null) {
        error = { ...data.error };
      } else {
        error = { ...data };
      }
    }
  }
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  console.log(moment().utc().format("YYYY-MM-DD HH:mm:ss"));
  console.log(error);
  if (process.env.NODE_ENV !== "development") {
    return res.end(res.sentry + "\n");
  }
  res.status(500).send(error);
});

http.listen(port, () => {
  console.log(`Tradealize Server running on port ${port}`);
});
