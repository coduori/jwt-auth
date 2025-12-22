import bodyParser from "body-parser";
import compression from "compression";

import api from "./controllers/index.mjs";
import { logger } from "./utils/logger.mjs";

export default async function setup({ app, port }) {
  app.set("port", port);

  app.use(compression());

  app.use(bodyParser.json({ limit: "16mb" }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  app.use(api);

  app.use((_req, res) => {
    res
      .status(404)
      .send({ status: 404, message: "The requested resource was not found" });
  });

  app.use((err, _req, res, _next) => {
    logger.error(err.stack);
    let message =
      process.env.NODE_ENV === "production"
        ? "Something went wrong, we're looking into it..."
        : err.stack;
    message = err.message || message;
    res.status(err.status || 500).send({ status: 500, message });
  });
}
