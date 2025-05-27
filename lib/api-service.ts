// API service for making requests to the backend

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  posted_date: string;
}

export interface JobCreate {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
}

const API_URL = 'http://localhost:8000';


export async function fetchJobs() {
  try {
    // Get token from localStorage with safeguards
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    
    // Create a simple GET request to avoid preflight issues
    const url = `${API_URL}/api/jobs`;
    console.log('Fetching jobs from:', url);
    
    // Create request with minimal headers to avoid triggering preflight
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch jobs: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        } catch (textError) {
          // If we can't get text either, just use status code
        }
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Successfully fetched jobs:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export const fetchJob = async (id: string | number): Promise<Job> => {
  try {
    // Get token from localStorage with safeguards
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    
    // Create a simple GET request to avoid preflight issues
    const url = `${API_URL}/api/jobs/${id}`;
    console.log(`Fetching job with ID ${id} from:`, url);
    
    // Create request with minimal headers to avoid triggering preflight
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch job: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        } catch (textError) {
          // If we can't get text either, just use status code
        }
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Successfully fetched job:', data);
    return data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const createJob = async (job: JobCreate): Promise<Job> => {
  // Get token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null;
  
  const response = await fetch(`${API_URL}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(job),
  });
  
  if (!response.ok) {
    // Try to get more detailed error information
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create job');
    } catch (e) {
      throw new Error('Failed to create job');
    }
  }
  
  return response.json();
};

export const updateJob = async (id: string | number, job: Partial<JobCreate>): Promise<Job> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null;
  
  const response = await fetch(`${API_URL}/api/jobs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(job),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update job');
  }
  
  return response.json();
};

export const deleteJob = async (id: string | number): Promise<Job> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null;
  
  const response = await fetch(`${API_URL}/api/jobs/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete job');
  }
  
  return response.json();
};


// Add these types and functions to your existing api-service.ts file

export interface Interview {
  id: number;
  job_title: string;
  company: string;
  date: string;
  time: string;
  status: string;
}

export async function fetchCandidateInterviews(candidateId: number): Promise<Interview[]> {
  try {
    // Get token from localStorage with safeguards
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    
    if (!token) {
      console.error('No authentication token found');
      return [];
    }
    
    // Create a simple GET request to avoid preflight issues
    const url = `${API_URL}/api/interviews/candidates/${candidateId}`;
    console.log(`Fetching interviews for candidate ${candidateId} from:`, url);
    
    // Create request with minimal headers to avoid triggering preflight
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch interviews: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        } catch (textError) {
          // If we can't get text either, just use status code
        }
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} interviews for candidate ${candidateId}`);

    
    // Format the data to match our Interview interface
    return data.map((interview: any) => ({
      id: interview.id,
      job_title: interview.job_title,
      company: interview.company,
      date: new Date(interview.date).toLocaleDateString(),
      time: new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: interview.status
    }));
  } catch (error) {
    console.error('Error fetching candidate interviews:', error);
    return [];
  }
}