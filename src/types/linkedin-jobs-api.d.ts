declare module "linkedin-jobs-api" {
  type LiteralUnion<T extends string> = T | (string & {});

  export interface LinkedinJobsQuery {
    host?: string;
    keyword?: string;
    location?: string;
    dateSincePosted?: LiteralUnion<"past month" | "past week" | "24hr">;
    jobType?: LiteralUnion<
      | "full time"
      | "part time"
      | "contract"
      | "temporary"
      | "volunteer"
      | "internship"
    >;
    remoteFilter?: LiteralUnion<"on site" | "remote" | "hybrid">;
    salary?: LiteralUnion<"40000" | "60000" | "80000" | "100000" | "120000">;
    experienceLevel?: LiteralUnion<
      | "internship"
      | "entry level"
      | "associate"
      | "senior"
      | "director"
      | "executive"
    >;
    sortBy?: LiteralUnion<"recent" | "relevant">;
    limit?: string;
    page?: string;
    has_verification?: boolean;
    under_10_applicants?: boolean;
  }

  export interface LinkedinJob {
    position: string;
    company: string;
    companyLogo: string;
    location: string;
    date: string;
    agoTime: string;
    salary: string;
    jobUrl: string;
  }

  export function query(queryObject: LinkedinJobsQuery): Promise<LinkedinJob[]>;
}
