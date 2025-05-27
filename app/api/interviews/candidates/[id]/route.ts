import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    // Build the URL with query parameters if present
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/interviews/candidates/${id}`;
    if (limit) {
      url += `?limit=${limit}`;
    }
    
    // Forward the request to the backend API
    const response = await fetch(url, {
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
        { error: errorData.detail || 'Failed to fetch candidate interviews' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in candidate interviews API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
