import express from "express";
const router = express.Router();
import demoRouter from "./demo/router.js";
import jobSpyRouter from "./jobspy/router.js";

router.use("/demo", demoRouter);
router.use("/jobspy", jobSpyRouter);

export default router;
