import express from "express";
import { jobSpyController } from "../controller/index.js";
import { validateBody } from "helper/validate.js";
import { jobSpyBodySchema } from "./jobspy.schema.js";
const router = express.Router();

router.post("/", validateBody(jobSpyBodySchema), jobSpyController.jobSpy);

export default router;
