import { Job } from "@/types/job";

export async function fetchJobs(): Promise<Job[]> {
  try {
    // Get token from localStorage with safeguards
    const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
    
    // Create a simple GET request first to avoid preflight issues
    const url = 'http://localhost:8000/api/jobs';
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
    // Return empty array as fallback
    return [];
  }
}