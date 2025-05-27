# Frontend API Service Documentation

## Overview

This document provides documentation for the Karzo frontend API service functions. These functions handle communication with the backend API and provide a clean interface for the frontend components to interact with the backend.

## Base Configuration

The API service uses a base URL defined as a constant:

```typescript
const API_URL = 'http://localhost:8000';
```

In production, this should be updated to point to the production API server.

## Authentication

Most API calls require authentication. The API service automatically retrieves the authentication token from localStorage and includes it in the request headers:

```typescript
const token = typeof window !== 'undefined' ? localStorage.getItem('karzo_token') : null;
```

## Core Utility Function

The API service uses a core utility function `apiRequest` to handle all API requests. This function:

1. Adds the appropriate headers (including authentication)
2. Handles error responses
3. Parses JSON responses
4. Provides consistent logging

```typescript
async function apiRequest<T>(url: string, method: string = 'GET', body?: any): Promise<T>
```

## Available Functions

### Jobs

#### Fetch All Jobs

```typescript
export async function fetchJobs(): Promise<Job[]>
```

Retrieves a list of all available jobs.

#### Fetch a Specific Job

```typescript
export const fetchJob = async (id: string | number): Promise<Job>
```

Retrieves a specific job by its ID.

#### Create a New Job

```typescript
export const createJob = async (job: JobCreate): Promise<Job>
```

Creates a new job with the provided data.

#### Update a Job

```typescript
export const updateJob = async (id: string | number, job: Partial<JobCreate>): Promise<Job>
```

Updates an existing job with the provided data.

#### Delete a Job

```typescript
export const deleteJob = async (id: string | number): Promise<Job>
```

Deletes a job by its ID.

### Interviews

#### Fetch Interviews for a Candidate

```typescript
export async function fetchCandidateInterviews(candidateId: number): Promise<Interview[]>
```

Retrieves all interviews for a specific candidate.

#### Fetch a Specific Interview

```typescript
export async function fetchInterview(interviewId: number): Promise<Interview>
```

Retrieves a specific interview by its ID.

#### Create a New Interview

```typescript
export async function createInterview(interview: InterviewCreate): Promise<Interview>
```

Creates a new interview with the provided data.

## Data Types

### Job

```typescript
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  posted_date: string;
}
```

### JobCreate

```typescript
export interface JobCreate {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
}
```

### Interview

```typescript
export interface Interview {
  id: number;
  job_title: string;
  company: string;
  date: string;
  status: string;
}
```

### InterviewCreate

```typescript
export interface InterviewCreate {
  candidate_id: number;
  job_id: number;
  date: string;
  status: string;
}
```

## Error Handling

All API functions include consistent error handling:

1. Errors are logged to the console with detailed information
2. User-friendly error messages are thrown
3. HTTP error responses are parsed to extract detailed error information when available

Example error handling:

```typescript
try {
  // API request code
} catch (error) {
  console.error('Error message:', error);
  throw new Error('User-friendly error message');
}
```

## Best Practices

When using the API service functions:

1. Always wrap calls in try/catch blocks to handle errors gracefully
2. Use async/await for cleaner code
3. Provide appropriate loading and error states in the UI
4. Consider implementing retry logic for transient errors
5. Validate input data before sending it to the API
