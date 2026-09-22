import express from "express";
const router = express.Router();
import demoRouter from "./demo/router.js";

router.use("/demo", demoRouter);

export default router;
