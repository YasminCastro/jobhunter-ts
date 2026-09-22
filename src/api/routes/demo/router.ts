import express from "express";
import { demoController } from "../controller/index.js";
const router = express.Router();

router.get("/", demoController.demo);

export default router;
