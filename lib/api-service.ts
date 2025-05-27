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
const API_URL = 'http://localhost:8000';

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