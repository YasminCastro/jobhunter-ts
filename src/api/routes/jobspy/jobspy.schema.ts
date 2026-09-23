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
    .default("24hr")
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
  focusKeywords: z.array(z.string()).optional(),
  discardKeywords: z.array(z.string()).optional(),
});

export type JobSpyBody = z.infer<typeof jobSpyBodySchema>;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

// Aceita "YYYY-MM-DD" ou data ISO completa e converte para timestamp (ms).
// Datas sem horário são interpretadas em UTC; no endDate, o dia inteiro é incluído.
// String vazia é tratada como ausente (ex.: filtro em branco no n8n).
const dateParam = (name: string, { endOfDay = false } = {}) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        error: `${name} must be a valid date (YYYY-MM-DD or ISO 8601)`,
      })
      .transform((value) => {
        const time = Date.parse(value);
        return endOfDay && DATE_ONLY.test(value) ? time + DAY_MS - 1 : time;
      })
      .optional(),
  );

export const sentJobsQuerySchema = z
  .object({
    startDate: dateParam("startDate"),
    endDate: dateParam("endDate", { endOfDay: true }),
  })
  .refine(
    ({ startDate, endDate }) =>
      startDate === undefined || endDate === undefined || startDate <= endDate,
    { error: "startDate must be before or equal to endDate" },
  );

export type SentJobsQuery = z.infer<typeof sentJobsQuerySchema>;
