import type { NextFunction, Request, Response } from "express";
import ErrorResponse from "../../../helper/errorResponse.js";

import linkedIn from "linkedin-jobs-api";
import axios from "axios";
import * as cheerio from "cheerio";
import randomUseragent from "random-useragent";
import delay from "helper/delay.js";
import logger from "helper/logger.js";

export const jobSpy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const queryOptions = {
      keyword: "Full Stack Developer",
      location: "Brazil",
      dateSincePosted: "past week",
      jobType: "full time",
      remoteFilter: "remote",
      experienceLevel: "entry level",
      limit: "10",
      page: "0",
      has_verification: false,
      under_10_applicants: false,
    };

    logger.info("Starting job search", { queryOptions });

    const results: any[] = [];
    const response = await linkedIn.query(queryOptions);

    logger.info(`LinkedIn search returned ${response.length} job(s)`);

    for (const [index, job] of response.entries()) {
      logger.info(
        `Fetching description ${index + 1}/${response.length}: ${job.position} at ${job.company}`,
        { jobUrl: job.jobUrl },
      );
      const jobDescription = await fetchJobDescription(job.jobUrl);
      results.push({
        ...job,
        jobDescription: jobDescription,
      });
      await delay(2000 + Math.random() * 1000);
    }

    logger.info(`Job search completed. ${results.length} job(s) processed`);

    const message = "JobSpy message";
    res.status(200).json({
      success: true,
      message: message,
      results: results,
    });
  } catch (error) {
    logger.error("Job search failed", { error });
    next(new ErrorResponse(error, 500));
  } finally {
  }
};

async function fetchJobDescription(
  jobUrl: string,
  attempt = 1,
): Promise<string> {
  try {
    const { data } = await axios.get(jobUrl, {
      headers: { "User-Agent": randomUseragent.getRandom() },
    });
    const $ = cheerio.load(data);
    return $(".show-more-less-html__markup").text().trim();
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 429 &&
      attempt < 3
    ) {
      logger.warn(
        `Rate limited (429) fetching ${jobUrl}, retrying attempt ${attempt + 1}/3`,
      );
      await delay(Math.pow(2, attempt) * 2000);
      return fetchJobDescription(jobUrl, attempt + 1);
    }
    logger.error(`Failed to fetch job description from ${jobUrl}`, { error });
    throw error;
  }
}
