import { API_BASE_URL } from "./config";
import { fetchWithCompanyAuth } from "./company-auth-context";

export interface Invitation {
  id: number;
  email: string;
  status: "pending" | "accepted" | "expired";
  created_at: string;
  expires_at: string;
  job_offer_id?: number;
  job_title?: string;
  message?: string;
  resend_count: number;
  last_sent_at?: string;
}

export interface InvitationCreate {
  email: string;
  job_offer_id?: number;
  message?: string;
  // Language field
  language?: "fr" | "en" | "candidate_choice";
  // TTS parameters for ElevenLabs voice configuration
  tts_temperature?: number;
  tts_stability?: number;
  tts_speed?: number;
  tts_similarity_boost?: number;
  // External company fields
  external_company_name?: string;
  external_company_email?: string;
  external_company_size?: string;
  external_company_sector?: string;
  external_company_about?: string;
  external_company_website?: string;
}

export interface BulkInvitationCreate {
  emails: string[];
  job_offer_id?: number;
  message?: string;
  // Language field
  language?: "fr" | "en" | "candidate_choice";
  // TTS parameters for ElevenLabs voice configuration
  tts_temperature?: number;
  tts_stability?: number;
  tts_speed?: number;
  tts_similarity_boost?: number;
  // External company fields
  external_company_name?: string;
  external_company_email?: string;
  external_company_size?: string;
  external_company_sector?: string;
  external_company_about?: string;
  external_company_website?: string;
}

// Get all invitations for the current company
export const getInvitations = async (): Promise<Invitation[]> => {
  const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/invitations/`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch invitations");
  }
  
  return response.json();
};

// Create a new invitation
export const createInvitation = async (data: InvitationCreate): Promise<Invitation> => {
  const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/invitations/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create invitation");
  }
  
  return response.json();
};

// Create multiple invitations at once
export const createBulkInvitations = async (data: BulkInvitationCreate): Promise<Invitation[]> => {
  const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/invitations/bulk`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create bulk invitations");
  }
  
  return response.json();
};

// Delete an invitation
export const deleteInvitation = async (id: number): Promise<void> => {
  const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/invitations/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete invitation");
  }
};

// Resend an invitation
export const resendInvitation = async (id: number): Promise<Invitation> => {
  const response = await fetchWithCompanyAuth(`${API_BASE_URL}/api/invitations/${id}/resend`, {
    method: "PUT",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to resend invitation");
  }
  
  return response.json();
};
