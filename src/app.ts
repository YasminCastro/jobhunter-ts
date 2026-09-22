import winston from "winston";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import type { Request, Response, NextFunction } from "express";
import errorHandler from "./middleware/error.js";
import router from "./api/routes/index.js";

const PORT = process.env.PORT || 3000;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

logger.info("Application is starting...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.get("/", (req, res) => {
  logger.info("Received request for root endpoint");
  res.json({ message: "Welcome to the JobHunter!" });
});

app.use(router);

app.use((req, res) => {
  logger.warn(`Unhandled request: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(500).send("Internal Server Error");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
