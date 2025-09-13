"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Conversation as ElevenLabsConversation } from "@11labs/client";
import { getElevenLabsConfig } from "@/lib/elevenlabs-config";

// Our simplified interface for the conversation
interface ConversationInfo {
  conversationId: string;
  endSession: () => Promise<void>;
}

interface CompanyInfo {
  name: string;
  size: string;
  sector: string;
  about: string;
  website: string;
}

interface FormData {
  jobOffer: string;
  fullName: string;
  candidateSummary?: string;
  // New company structure
  currentCompany?: CompanyInfo;
  externalCompany?: CompanyInfo | null;
  // Legacy fields for backward compatibility
  companyName?: string;
  companySize?: string;
  companySector?: string;
  companyAbout?: string;
  companyWebsite?: string;
  // External company fields
  external_company_name?: string;
  external_company_size?: string;
  external_company_sector?: string;
  external_company_about?: string;
  external_company_website?: string;
  jobOfferQuestions?: string[];
  language?: "fr" | "en";
  // TTS parameters for ElevenLabs voice configuration
  ttsTemperature?: number;
  ttsStability?: number;
  ttsSpeed?: number;
  ttsSimilarityBoost?: number;
}

interface SessionInfo {
  conversationId: string;
  agentId: string;
}

const translations = {
  connectionStatus: {
    ready: "Ready to connect",
    connecting: "Connecting to interviewer...",
    connected: "Connected with interviewer",
    disconnected: "Disconnected",
    error: "Connection error",
  },
};

export const useConversation = () => {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState(
    translations.connectionStatus.ready
  );
  const [isConnected, setIsConnected] = useState(false);
  const conversationRef = useRef<ElevenLabsConversation | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState<any[] | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Simulate audio levels for visualization
  useEffect(() => {
    if (isConnected && !isMuted) {
      const interval = setInterval(() => {
        setAudioLevel(
          Math.random() * 0.5 + (Math.random() > 0.8 ? 0.5 : 0)
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isConnected, isMuted]);

  // These functions are no longer needed with the simplified flow
  // but kept for backward compatibility
  const requestPermission = () => {};
  const grantPermission = () => {};
  const denyPermission = () => {};

  const startConversation = async (formData: FormData) => {
    try {
      setError(null);
      
      // Request browser microphone and camera permissions
      try {
        // This will trigger the browser permission dialog for both audio and video
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: !isCameraOff
        });
        console.log("Microphone access granted");
        setPermissionGranted(true);
        
        // If camera is enabled, store the stream
        if (!isCameraOff) {
          setCameraStream(mediaStream);
          console.log("Camera access granted");
        }
      } catch (err) {
        console.log("Media access not granted:", err);
        setIsMuted(true);
        setIsCameraOff(true);
      }
      
      // Now that permission has been handled, start connecting
      setConnectionStatus(translations.connectionStatus.connecting);

      // Get ElevenLabs configuration (agent ID and API key) from our helper
      const { agentId, apiKey } = getElevenLabsConfig();
      
      // Log the agent ID for debugging
      console.log(`Using agent ID: ${agentId ? agentId : "[empty]"}`);
      
      console.log(`Starting conversation with agent ID: ${agentId}`);
      

      // Our helper function has already set up the global variables for ElevenLabs client
      
      // Now start the conversation session
      const conversation = await ElevenLabsConversation.startSession({
        agentId: agentId,
        dynamicVariables: {
          job_offer: formData.jobOffer,
          user_name: formData.fullName,
          candidate_summary: formData.candidateSummary || '',
          company_name: formData.companyName || '',
          company_size: formData.companySize || '',
          company_sector: formData.companySector || '',
          company_about: formData.companyAbout || '',
          company_website: formData.companyWebsite || '',
          external_company_name: formData.external_company_name || '',
          external_company_size: formData.external_company_size || '',
          external_company_sector: formData.external_company_sector || '',
          external_company_about: formData.external_company_about || '',
          external_company_website: formData.external_company_website || '',
          joboffer_questions: formData.jobOfferQuestions && Array.isArray(formData.jobOfferQuestions) && formData.jobOfferQuestions.length > 0 ? JSON.stringify(formData.jobOfferQuestions) : '[]'
        },
        // Build overrides object for language and TTS parameters
        ...(() => {
          const overrides: any = {};
          
          // Language override
          if (formData.language === "en") {
            overrides.agent = {
              language: "en" // Override to English only when specifically selected
            };
          }
          
          // TTS parameters override
          const ttsOverrides: any = {};
          if (formData.ttsStability !== undefined) {
            ttsOverrides.stability = formData.ttsStability;
          }
          if (formData.ttsSpeed !== undefined) {
            ttsOverrides.speed = formData.ttsSpeed;
          }
          if (formData.ttsSimilarityBoost !== undefined) {
            ttsOverrides.similarity_boost = formData.ttsSimilarityBoost;
          }
          
          if (Object.keys(ttsOverrides).length > 0) {
            overrides.tts = ttsOverrides;
          }
          
          // Temperature goes in prompt overrides
          if (formData.ttsTemperature !== undefined) {
            overrides.prompt = {
              temperature: formData.ttsTemperature
            };
          }
          
          console.log('=== ELEVENLABS OVERRIDES DEBUG ===');
          console.log('Final overrides object:', JSON.stringify(overrides, null, 2));
          console.log('==================================');
          
          return Object.keys(overrides).length > 0 ? { overrides } : {};
        })(),
        onConnect: () => {
          setConnectionStatus(translations.connectionStatus.connected);
          setIsConnected(true);
        },
        onDisconnect: () => {
          setConnectionStatus(translations.connectionStatus.ready);
          setIsConnected(false);
          setSessionEnded(true);
          if (sessionInfo) {
            console.log('Session ended:', sessionInfo);
          }
          // Automatically navigate to review page when session ends
          router.push("/review");
        },
        onError: (message: any) => {
          console.error('Error:', message);
          setConnectionStatus(`${translations.connectionStatus.error}: ${message}`);
          setIsConnected(false);
          setError(`Connection error: ${message}`);
        }
      });

      conversationRef.current = conversation;
      
      // Get the conversation ID using the public method
      const conversationId = conversation.getId();

      setSessionInfo({
        conversationId,
        agentId: agentId
      });

      console.log("=== INTERVIEW SESSION STARTED ===");
      console.log(`Conversation ID: ${conversationId}`);
      console.log(`Agent ID: ${agentId}`);
      console.log("==================================");
      
      // Store the conversation ID in localStorage for debugging purposes
      localStorage.setItem('debug_conversation_id', conversationId);
      console.log("Conversation ID stored in localStorage as 'debug_conversation_id'");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      const errorMessage = (error as Error)?.message || "unknown error";
      setConnectionStatus(
        `${translations.connectionStatus.error}: ${errorMessage}`
      );
      setError(`Failed to start conversation: ${errorMessage}`);
      setIsConnected(false);
    }
  };

  const fetchTranscript = async (conversationId: string) => {
    try {
      console.log(`Fetching transcript for conversation: ${conversationId}`);
      
      // Get ElevenLabs configuration (agent ID and API key) from our helper
      const { apiKey } = getElevenLabsConfig();
      
      if (!apiKey) {
        console.error("No ElevenLabs API key found in any source");
        return null;
      }
      
      
      
      
      
      // Use the exact same format as the successful playground request
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          method: "GET",
          headers: {
            "Xi-Api-Key": apiKey, // Note the capitalization change from "xi-api-key" to "Xi-Api-Key"
          },
        }
      );

      // Log the response status and headers for debugging
      console.log(`API response status: ${response.status} ${response.statusText}`);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error (${response.status}): ${errorText}`);
        
        // For 401 errors, provide more specific guidance
        if (response.status === 401) {
          console.error("Authentication failed. Please check that your ElevenLabs API key is valid and has the necessary permissions.");
          // Continue execution to handle the error gracefully
        } else {
          throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
        }
        
        // Return null for unauthorized errors instead of throwing
        return null;
      }

      // Parse and log the response data
      const data = await response.json();
      console.log('ElevenLabs API response data:', JSON.stringify(data, null, 2));
      
      // The transcript is directly in the data.transcript field based on the playground response
      if (data.transcript) {
        console.log('Found transcript in response.transcript');
        return data.transcript;
      } else {
        console.warn('No transcript found in API response');
        return null;
      }
    } catch (err) {
      console.error("Error fetching transcript:", err);
      return null;
    }
  };

  const stopConversation = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();

      // Get the conversation ID using the public method
      const finalConversationId = conversationRef.current.getId();

      // Get agentId from environment variable with fallback
      const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "";

      const finalSessionInfo = {
        conversationId: finalConversationId,
        agentId: agentId
      };

      console.log("Session ended:", finalSessionInfo);

      // Fetch the transcript
      const fetchedTranscript = await fetchTranscript(finalConversationId);
      setTranscript(fetchedTranscript);
      console.log("Transcript:", fetchedTranscript);

      // Set session ended state to trigger automatic navigation
      setSessionEnded(true);
      console.log("Session ended state set to true");
      
      // Note: We no longer navigate directly here, as the interview room component
      // will handle navigation based on the sessionEnded state

      conversationRef.current = null;
      setIsConnected(false);
      setConnectionStatus(translations.connectionStatus.ready);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleCamera = async () => {
    try {
      // If turning camera on
      if (isCameraOff) {
        // Request camera access
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(mediaStream);
        setIsCameraOff(false);
        console.log("Camera turned on");
      } else {
        // If turning camera off
        if (cameraStream) {
          // Stop all video tracks
          cameraStream.getVideoTracks().forEach(track => {
            track.stop();
          });
          setCameraStream(null);
        }
        setIsCameraOff(true);
        console.log("Camera turned off");
      }
    } catch (err) {
      console.error("Error toggling camera:", err);
      setIsCameraOff(true);
      setError("Failed to access camera. Please check your permissions.");
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  return {
    connectionStatus,
    isConnected,
    error,
    startConversation,
    stopConversation,
    isMuted,
    toggleMute,
    isCameraOff,
    toggleCamera,
    isScreenSharing,
    toggleScreenShare,
    audioLevel,
    fetchTranscript,
    transcript,
    permissionRequested,
    permissionGranted,
    grantPermission,
    denyPermission,
    cameraStream,
    sessionEnded,
  };
};
