import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Get the job_offer_id from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const jobOfferId = searchParams.get('job_offer_id');
    
    if (!jobOfferId) {
      return NextResponse.json({ error: 'Missing job_offer_id parameter' }, { status: 400 });
    }
    
    // Make a request to the backend API to fetch job questions
    const response = await fetch(`${API_BASE_URL}/api/v1/job-questions?job_offer_id=${jobOfferId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching job questions: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch job questions: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    const questions = await response.json();
    return NextResponse.json(questions);
    
  } catch (error) {
    console.error('Error in job questions API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
