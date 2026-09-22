import express from "express";
import { jobSpyController } from "../controller/index.js";
const router = express.Router();

router.get("/", jobSpyController.jobSpy);

export default router;
