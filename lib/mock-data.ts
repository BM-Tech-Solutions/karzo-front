export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  postedDate: string
}

export interface Interview {
  id: string
  candidateId: string
  jobId: string
  scheduledFor: string
  duration: number // in minutes
  status: "scheduled" | "completed" | "cancelled"
  score?: number
  feedback?: string
  recordingUrl?: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  resumeUrl: string
  interviews: Interview[]
}

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: "job1",
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    description:
      "We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using React and TypeScript.",
    requirements: [
      "Proficiency in React and TypeScript",
      "Experience with state management libraries",
      "Understanding of responsive design principles",
      "Knowledge of modern CSS frameworks",
    ],
    postedDate: "2023-05-15",
  },
  {
    id: "job2",
    title: "Backend Engineer",
    company: "DataSystems",
    location: "New York, NY",
    description: "Join our backend team to build scalable APIs and services using Node.js and PostgreSQL.",
    requirements: [
      "Strong Node.js experience",
      "Database design and optimization skills",
      "Experience with RESTful API design",
      "Knowledge of cloud services (AWS/Azure/GCP)",
    ],
    postedDate: "2023-05-10",
  },
  {
    id: "job3",
    title: "Full Stack Developer",
    company: "InnovateTech",
    location: "San Francisco, CA",
    description: "Looking for a versatile developer who can work across the entire stack, from frontend to backend.",
    requirements: [
      "Experience with React and Node.js",
      "Database management skills",
      "Understanding of DevOps principles",
      "Ability to work in an agile environment",
    ],
    postedDate: "2023-05-05",
  },
]

// Mock Interviews
export const mockInterviews: Interview[] = [
  {
    id: "int1",
    candidateId: "1",
    jobId: "job1",
    scheduledFor: "2023-05-20T14:00:00Z",
    duration: 30,
    status: "scheduled",
  },
  {
    id: "int2",
    candidateId: "1",
    jobId: "job2",
    scheduledFor: "2023-05-15T10:00:00Z",
    duration: 45,
    status: "completed",
    score: 85,
    feedback: "Strong technical skills, good communication. Recommended for next round.",
    recordingUrl: "/mock-recording.mp4",
  },
  {
    id: "int3",
    candidateId: "2",
    jobId: "job3",
    scheduledFor: "2023-05-18T15:30:00Z",
    duration: 30,
    status: "scheduled",
  },
]

// Mock Candidates
export const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    resumeUrl: "/mock-resume.pdf",
    interviews: [mockInterviews[0], mockInterviews[1]],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 987-6543",
    resumeUrl: "/mock-resume.pdf",
    interviews: [mockInterviews[2]],
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "(555) 456-7890",
    resumeUrl: "/mock-resume.pdf",
    interviews: [],
  },
]

// Admin Dashboard Stats
export const mockAdminStats = {
  totalCandidates: 45,
  interviewsCompleted: 32,
  interviewsScheduled: 13,
  averageScore: 72,
}
