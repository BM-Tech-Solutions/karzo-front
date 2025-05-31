// API service for making requests to the backend

/**
 * Interface for Job objects returned from the API
 */
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  posted_date: string;
}

/**
 * Interface for creating a new Job
 */
export interface JobCreate {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
}

/**
 * Interface for Interview objects returned from the API
 */
export interface Interview {
  id: number;
  candidate_id: number;
  candidate_name?: string;
  candidate_email?: string;
  job_id: number;
  job_title: string;
  company: string;
  date: string;
  status: string;
}

/**
 * Interface for creating a new Interview
 */
export interface InterviewCreate {
  candidate_id: number;
  job_id: number;
  date: string;
  status: string;
}

// Base API URL
import { API_BASE_URL } from './config';

const API_URL = API_BASE_URL;

/**
 * Utility function to make API requests with proper error handling
 * @param url - The URL to make the request to
 * @param method - The HTTP method to use
 * @param body - The request body (optional)
 * @returns The response data
 */
async function apiRequest<T>(url: string, method: string = 'GET', body?: any): Promise<T> {
  try {
    // Get token from localStorage with safeguards
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    
    // Log the request for debugging
    console.log(`${method} request to: ${url}`);
    
    // Create request with minimal headers to avoid triggering preflight
    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch data: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        } catch (textError) {
          // If we can't get text either, just use the status
        }
      }
      throw new Error(errorMessage);
    }
    
    // For 204 No Content responses, return empty object
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}


/**
 * Fetch all jobs from the API
 * @returns A list of jobs
 */
export async function fetchJobs(): Promise<Job[]> {
  try {
    const url = `${API_URL}/api/jobs`;
    console.log('Fetching jobs from:', url);
    
    const jobs = await apiRequest<Job[]>(url);
    console.log('Successfully fetched jobs:', jobs.length);
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs');
  }
}

/**
 * Fetch a specific job by ID
 * @param id - The ID of the job to fetch
 * @returns The job details
 */
export const fetchJob = async (id: string | number): Promise<Job> => {
  try {
    const url = `${API_URL}/api/jobs/${id}`;
    console.log(`Fetching job with ID ${id} from:`, url);
    
    const job = await apiRequest<Job>(url);
    return job;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw new Error('Failed to fetch job');
  }
};

/**
 * Create a new job
 * @param job - The job data to create
 * @returns The created job
 */
export const createJob = async (job: JobCreate): Promise<Job> => {
  try {
    const url = `${API_URL}/api/jobs`;
    console.log('Creating new job:', job.title);
    
    const createdJob = await apiRequest<Job>(url, 'POST', job);
    console.log('Successfully created job:', createdJob.id);
    return createdJob;
  } catch (error) {
    console.error('Error creating job:', error);
    throw new Error('Failed to create job');
  }
};

/**
 * Update an existing job
 * @param id - The ID of the job to update
 * @param job - The job data to update
 * @returns The updated job
 */
export const updateJob = async (id: string | number, job: Partial<JobCreate>): Promise<Job> => {
  try {
    const url = `${API_URL}/api/jobs/${id}`;
    console.log(`Updating job with ID ${id}`);
    
    const updatedJob = await apiRequest<Job>(url, 'PUT', job);
    console.log('Successfully updated job:', updatedJob.id);
    return updatedJob;
  } catch (error) {
    console.error('Error updating job:', error);
    throw new Error('Failed to update job');
  }
};

/**
 * Delete a job
 * @param id - The ID of the job to delete
 * @returns The deleted job
 */
export const deleteJob = async (id: string | number): Promise<Job> => {
  try {
    const url = `${API_URL}/api/jobs/${id}`;
    console.log(`Deleting job with ID ${id}`);
    
    const deletedJob = await apiRequest<Job>(url, 'DELETE');
    console.log('Successfully deleted job:', id);
    return deletedJob;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw new Error('Failed to delete job');
  }
};


/**
 * Fetch interviews for a specific candidate
 * @param candidateId - The ID of the candidate to fetch interviews for
 * @returns List of interviews for the candidate
 */
export async function fetchCandidateInterviews(candidateId: number): Promise<Interview[]> {
  try {
    // Check for token first to provide a better error message
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required to fetch interviews');
    }
    
    const url = `${API_URL}/api/interviews/candidates/${candidateId}`;
    console.log(`Fetching interviews for candidate ${candidateId} from:`, url);
    
    const interviews = await apiRequest<Interview[]>(url);
    console.log(`Successfully fetched ${interviews.length} interviews for candidate ${candidateId}`);
    return interviews;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    throw new Error('Failed to fetch interviews');
  }
}

/**
 * Fetch a specific interview by ID
 * @param interviewId - The ID of the interview to fetch
 * @returns The interview details
 */
export async function fetchInterview(interviewId: number): Promise<Interview> {
  try {
    const url = `${API_URL}/api/interviews/${interviewId}`;
    console.log(`Fetching interview with ID ${interviewId} from:`, url);
    
    const interview = await apiRequest<Interview>(url);
    console.log('Successfully fetched interview:', interviewId);
    return interview;
  } catch (error) {
    console.error('Error fetching interview:', error);
    throw new Error('Failed to fetch interview data');
  }
}

/**
 * Create a new interview
 * @param interview - The interview data to create
 * @returns The created interview
 */
export async function createInterview(interview: InterviewCreate): Promise<Interview> {
  try {
    const url = `${API_URL}/api/interviews/`;
    console.log('Creating new interview for candidate:', interview.candidate_id);
    
    const createdInterview = await apiRequest<Interview>(url, 'POST', interview);
    console.log('Successfully created interview:', createdInterview.id);
    return createdInterview;
  } catch (error) {
    console.error('Error creating interview:', error);
    throw new Error('Failed to save interview');
  }
}

/**
 * Fetch all interviews (admin only)
 * @returns List of all interviews
 */
export async function fetchAllInterviews(): Promise<Interview[]> {
  try {
    // Check for token first to provide a better error message
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required to fetch interviews');
    }
    
    const url = `${API_URL}/api/interviews/`;
    console.log('Fetching all interviews');
    
    const interviews = await apiRequest<Interview[]>(url);
    console.log(`Successfully fetched ${interviews.length} interviews`);
    return interviews;
  } catch (error) {
    console.error('Error fetching all interviews:', error);
    throw new Error('Failed to fetch interviews');
  }
}

/**
 * Delete an interview by ID
 * @param id - The ID of the interview to delete
 * @returns The deleted interview
 */
export const deleteInterview = async (id: number): Promise<void> => {
  try {
    console.log(`Deleting interview with ID ${id}`);
    
    // First, try to delete any associated report
    try {
      // Check if a report exists for this interview
      const reportUrl = `${API_URL}/api/reports/interviews/${id}`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : '';
      
      // Try to fetch the report to see if it exists
      const reportCheckResponse = await fetch(reportUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If report exists, delete it first
      if (reportCheckResponse.ok) {
        console.log(`Found report for interview ${id}, deleting it first`);
        await deleteReport(id);
      }
    } catch (reportError) {
      console.log(`No report found for interview ${id} or error checking:`, reportError);
      // Continue with interview deletion even if report check/deletion fails
    }
    
    // Now delete the interview
    const url = `${API_URL}/api/interviews/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : ''}`
      }
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to delete interview: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use text
        const errorText = await response.text();
        if (errorText) errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }
    
    console.log('Successfully deleted interview:', id);
  } catch (error) {
    console.error('Error in deleteInterview:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Interface for Report objects returned from the API
 */
export interface Report {
  id: number;
  interview_id: number;
  candidate_id: number;
  score: number;
  duration: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
  status: string;
  conversation_id?: string;
  transcript?: any[];
  transcript_summary?: string;
}

/**
 * Interface for creating a new Report
 */
export interface ReportCreate {
  interview_id: number;
  candidate_id: number;
  score?: number;
  duration?: string;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  status?: string;
  conversation_id?: string;
  transcript?: any[];
  transcript_summary?: string;
}

/**
 * Fetch a report for a specific interview
 * @param interviewId - The ID of the interview to fetch the report for
 * @returns The report details or null if no report exists
 */
export async function fetchInterviewReport(interviewId: number): Promise<Report | null> {
  try {
    const url = `${API_URL}/api/reports/interviews/${interviewId}`;
    
    // Use fetch directly to handle 404 responses gracefully
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    // If report doesn't exist (404), return null instead of throwing an error
    if (response.status === 404) {
      return null;
    }
    
    // For other error statuses, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch report: ${response.status}`);
    }
    
    // Parse and return the report
    const report = await response.json();
    return report;
  } catch (error: unknown) {
    // Only log errors that aren't 404s (which we already handled)
    if (error instanceof Error && error.message !== 'Failed to fetch report: 404') {
      console.error('Error fetching interview report:', error);
    }
    throw error;
  }
}

/**
 * Fetch all reports for a specific candidate
 * @param candidateId - The ID of the candidate to fetch reports for
 * @returns List of reports for the candidate
 */
export async function fetchCandidateReports(candidateId: number): Promise<Report[]> {
  try {
    const url = `${API_URL}/api/reports/candidates/${candidateId}`;
    console.log(`Fetching reports for candidate with ID ${candidateId}`);
    
    const reports = await apiRequest<Report[]>(url);
    console.log(`Successfully fetched ${reports.length} reports for candidate ${candidateId}`);
    return reports;
  } catch (error) {
    console.error('Error fetching candidate reports:', error);
    throw new Error('Failed to fetch candidate reports');
  }
}

/**
 * Create a new report
 * @param report - The report data to create
 * @returns The created report
 */
export async function createReport(report: ReportCreate): Promise<Report> {
  try {
    const url = `${API_URL}/api/reports/`;
    console.log(`Creating report for interview ${report.interview_id}`);
    
    const createdReport = await apiRequest<Report>(url, 'POST', report);
    console.log('Successfully created report:', createdReport.id);
    return createdReport;
  } catch (error) {
    console.error('Error creating report:', error);
    throw new Error('Failed to create report');
  }
}

/**
 * Fetch all reports (admin only)
 * @returns List of all reports
 */
export async function fetchAllReports(): Promise<Report[]> {
  try {
    // Get all completed interviews first
    const interviews = await fetchAllInterviews();
    const completedInterviews = interviews.filter(interview => interview.status === 'completed');
    console.log(`Found ${completedInterviews.length} completed interviews`);
    
    // For each completed interview, try to get its report
    const reports: Report[] = [];
    
    for (const interview of completedInterviews) {
      try {
        const url = `${API_URL}/api/reports/interviews/${interview.id}`;
        const report = await apiRequest<Report>(url);
        reports.push(report);
      } catch (err) {
        // If no report exists for this interview, just skip it
        console.log(`No report found for interview ${interview.id}`);
      }
    }
    
    console.log(`Successfully fetched ${reports.length} reports`);
    return reports;
  } catch (error) {
    console.error('Error fetching all reports:', error);
    throw new Error('Failed to fetch all reports');
  }
}

/**
 * Delete a report by ID
 * @param id - The ID of the report to delete
 * @returns void
 */
export async function deleteReport(id: number): Promise<void> {
  try {
    const token = localStorage.getItem('karzo_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:8000/api/reports/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete report');
    }
    
    console.log('Successfully deleted report:', id);
  } catch (error) {
    console.error('Error in deleteReport:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Delete a candidate by ID
 * @param id - The ID of the candidate to delete
 * @returns void
 */
export async function deleteCandidate(id: number): Promise<void> {
  try {
    const url = `${API_URL}/api/candidates/${id}`;
    console.log(`Deleting candidate with ID ${id}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : ''}`
      }
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to delete candidate: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use text
        const errorText = await response.text();
        if (errorText) errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }
    
    console.log('Successfully deleted candidate:', id);
  } catch (error) {
    console.error('Error in deleteCandidate:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Generate a report from an ElevenLabs transcript
 * @param reportId - The ID of the report to generate
 * @param conversationId - The ElevenLabs conversation ID
 * @returns The response message
 */
export async function generateReportFromTranscript(reportId: number, conversationId: string): Promise<{message: string, report_id: number}> {
  try {
    const token = localStorage.getItem('karzo_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get the ElevenLabs API key from localStorage or environment
    const elevenlabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                            localStorage.getItem('ELEVENLABS_API_KEY') || 
                            "sk_7285d9e3401a8364817514d44289c9acad85e3ddeb1e0887";

    const response = await fetch(`http://localhost:8000/api/transcript/generate-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        report_id: reportId,
        conversation_id: conversationId,
        elevenlabs_api_key: elevenlabsApiKey
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate report from transcript');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating report from transcript:', error);
    throw error;
  }
}

/**
 * Check the status of a report
 * @param reportId - The ID of the report to check
 * @returns The report status
 */
export async function checkReportStatus(reportId: number): Promise<{status: string}> {
  try {
    const token = localStorage.getItem('karzo_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:8000/api/transcript/check-report-status/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to check report status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking report status:', error);
    throw error;
  }
}