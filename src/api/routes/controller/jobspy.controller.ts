import type { NextFunction, Request, Response } from "express";
import ErrorResponse from "../../../helper/errorResponse.js";

import linkedIn from "linkedin-jobs-api";
import axios from "axios";
import * as cheerio from "cheerio";
import randomUseragent from "random-useragent";
import delay from "helper/delay.js";
import logger from "helper/logger.js";
import type { JobSpyBody } from "../jobspy/jobspy.schema.js";
import matchesAny from "helper/matchesAny.js";
import { buildJobKey, isJobSent, markJobAsSent } from "helper/sentJobs.js";

const MAX_PAGES = 10;
const RESULTS_LIMIT = 10;

export const jobSpy = async (
  req: Request<{}, {}, JobSpyBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      position,
      location,
      remoteFilter,
      dateSincePosted,
      experienceLevel,
      discardKeywords,
      focusKeywords,
    } = req.body;

    const baseQueryOptions = {
      keyword: position,
      location: location ?? undefined,
      dateSincePosted: dateSincePosted ?? undefined,
      remoteFilter: remoteFilter ?? undefined,
      experienceLevel: experienceLevel ?? undefined,
      limit: "10",
      has_verification: false,
      under_10_applicants: false,
    };

    logger.info("Starting job search", { baseQueryOptions });

    const results: any[] = [];
    let page = 0;

    while (page < MAX_PAGES && results.length < RESULTS_LIMIT) {
      const response = await linkedIn.query({
        ...baseQueryOptions,
        page: page.toString(),
      });

      logger.info(`Page ${page} returned ${response.length} job(s)`);

      if (response.length === 0) break;

      let newJobsInPage = 0;

      for (const [index, job] of response.entries()) {
        if (results.length >= RESULTS_LIMIT) break;

        const jobKey = buildJobKey(job);

        if (isJobSent(jobKey)) {
          logger.info(`Skipping "${job.position}" (already seen)`, {
            jobUrl: job.jobUrl,
          });
          continue;
        }

        newJobsInPage++;
        markJobAsSent(jobKey, job);

        logger.info(
          `Processing ${index + 1}/${response.length}: ${job.position} at ${job.company}`,
          { jobUrl: job.jobUrl },
        );

        if (focusKeywords?.length && !matchesAny(job.position, focusKeywords)) {
          logger.info(`Skipping "${job.position}" (no focusKeywords match)`);
          continue;
        }

        if (matchesAny(job.position, discardKeywords)) {
          logger.info(`Skipping "${job.position}" (matched discardKeywords)`);
          continue;
        }

        const jobDescription = await fetchJobDescription(job.jobUrl);
        await delay(2000 + Math.random() * 1000);

        results.push({
          ...job,
          jobDescription: jobDescription,
        });
      }

      // Só avança de página se esta página inteira já tiver sido vista antes;
      // do contrário, encerramos por aqui mesmo sem atingir o RESULTS_LIMIT.
      if (newJobsInPage > 0) break;

      page++;
    }

    logger.info(`Job search completed. ${results.length} job(s) processed`);

    res.status(200).json({
      success: true,
      results: results,
    });
  } catch (error) {
    logger.error("Job search failed", { error });
    next(new ErrorResponse(error, 500));
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
