import express from "express";
import { jobSpyController } from "../controller/index.js";
import { validateBody, validateQuery } from "helper/validate.js";
import { jobSpyBodySchema, sentJobsQuerySchema } from "./jobspy.schema.js";
const router = express.Router();

router.get("/", validateQuery(sentJobsQuerySchema), jobSpyController.listJobs);
router.post("/", validateBody(jobSpyBodySchema), jobSpyController.jobSpy);

export default router;
