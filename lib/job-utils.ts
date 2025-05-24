import { fetchJob } from "./api-service";

// Utility function to get job title by ID
export const getJobTitle = async (jobId: string | number): Promise<string> => {
  try {
    const job = await fetchJob(jobId);
    return job.title;
  } catch (error) {
    console.error("Error fetching job title:", error);
    return "Unknown Position";
  }
};

// Utility function to get company by job ID
export const getCompany = async (jobId: string | number): Promise<string> => {
  try {
    const job = await fetchJob(jobId);
    return job.company;
  } catch (error) {
    console.error("Error fetching company:", error);
    return "Unknown Company";
  }
};