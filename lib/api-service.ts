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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export async function fetchJobs() {
  // Get token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null;
  
  // Use the correct API endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/jobs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return await response.json();
}

export const fetchJob = async (id: string | number): Promise<Job> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("karzo_token") : null;
  
  const response = await fetch(`${API_URL}/api/jobs/${id}`, {
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch job');
  }
  
  return response.json();
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