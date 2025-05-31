import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Forward the request to the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/endpoints/interviews/${id}`, {
      headers: {
        // Forward authorization header if available
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') as string } 
          : {})
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch interview' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Get job details to include job title and company
    const jobResponse = await fetch(`${API_BASE_URL}/api/jobs/${data.job_id}`, {
      headers: {
        // Forward authorization header if available
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') as string } 
          : {})
      }
    });
    
    if (jobResponse.ok) {
      const jobData = await jobResponse.json();
      data.job_title = jobData.title;
      data.company = jobData.company;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in interview API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Forward the request to the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/endpoints/interviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if available
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') as string } 
          : {})
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to update interview' },
        { status: response.status }
      );
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in interview API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}