import { z } from "zod";

export const jobSpyBodySchema = z.object({
  position: z
    .string({ error: "position is required" })
    .min(1, "position is required"),
  location: z
    .string({ error: "location is required" })
    .min(1, "location is required")
    .optional(),
  remoteFilter: z
    .enum(["on site", "remote", "hybrid"], {
      error: "remoteFilter must be one of: on site, remote, hybrid",
    })
    .nullish(),
  dateSincePosted: z
    .enum(["24hr", "past week", "past month"], {
      error:
        "dateSincePosted must be one of: past 24 hours, past week, past month",
    })
    .default("past week")
    .nullish(),
  experienceLevel: z
    .enum(
      [
        "internship",
        "entry level",
        "associate",
        "senior",
        "director",
        "executive",
      ],
      {
        error:
          "experienceLevel must be one of: internship, entry level, associate, senior, director, executive",
      },
    )
    .nullish(),
});

export type JobSpyBody = z.infer<typeof jobSpyBodySchema>;
