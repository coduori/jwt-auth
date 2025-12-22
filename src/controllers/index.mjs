import { Router } from "express";

import { requestLogger } from "../middleware/request-logger.mjs";

const router = new Router();

router.use(requestLogger);

router.get("/health", async (req, res) => {
  try {
    const healthStatus = { data: "Alive and kicking!" };
    res.status(200).send({ healthStatus });
  } catch (error) {
    res
      .status(error.status || 500)
      .send({ message: error.message || "Server side error!" });
  }
});



export default router;
