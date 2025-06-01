"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Conversation as ElevenLabsConversation } from "@11labs/client";

// Our simplified interface for the conversation
interface ConversationInfo {
  conversationId: string;
  endSession: () => Promise<void>;
}

interface FormData {
  jobOffer: string;
  fullName: string;
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
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState<any[] | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

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

  // Request user permission to start interview
  const requestPermission = () => {
    setPermissionRequested(true);
  };

  // User has granted permission to proceed with interview
  const grantPermission = () => {
    setPermissionGranted(true);
    setPermissionRequested(false);
  };

  // User has denied permission to proceed with interview
  const denyPermission = () => {
    setPermissionRequested(false);
    setError("Interview cancelled by user");
  };

  const startConversation = async (formData: FormData) => {
    try {
      // First request user permission
      if (!permissionGranted) {
        requestPermission();
        return; // Wait for user to grant permission
      }
      
      setConnectionStatus(translations.connectionStatus.connecting);
      setError(null);

      // Try to request audio permissions, but continue even if not granted
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted");
      } catch (err) {
        console.log("Microphone access not granted, continuing without audio input");
        // Set muted state since we don't have microphone access
        setIsMuted(true);
      }

      // Get agentId from environment variable with fallback
      const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "j6u20kkiKF2sSwOEpZoS";
      
      // Get API key using the same method as in fetchTranscript
      let apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                  window.process?.env?.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                  "";
                  
      // If still not found, try to get it directly from localStorage as a fallback
      if (!apiKey) {
        apiKey = localStorage.getItem('ELEVENLABS_API_KEY') || "";
      }
      
      // Hard-code the API key as a last resort (only for debugging)
      if (!apiKey) {
        apiKey = "sk_7285d9e3401a8364817514d44289c9acad85e3ddeb1e0887";
        console.log("Using hardcoded API key for starting conversation");
      }
      
      // Store the API key in localStorage for future use
      if (apiKey) {
        localStorage.setItem('ELEVENLABS_API_KEY', apiKey);
      }
      
      console.log(`Starting conversation with agent ID: ${agentId}`);
      console.log(`Using API key: ${apiKey ? apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 3) : 'none'}`); 

      // Use the actual ElevenLabs Conversation API
      // The API key must be set as a global environment variable for the client
      // This is the correct way to set the API key for the ElevenLabs client
      if (typeof window !== 'undefined') {
        // @ts-ignore - Setting global variable for ElevenLabs client
        window.ELEVENLABS_API_KEY = apiKey;
      }
      
      // Now start the conversation session
      const conversation = await ElevenLabsConversation.startSession({
        agentId: agentId,
        dynamicVariables: {
          job_offer: formData.jobOffer,
          user_name: formData.fullName
        },
        onConnect: () => {
          setConnectionStatus(translations.connectionStatus.connected);
          setIsConnected(true);
        },
        onDisconnect: () => {
          setConnectionStatus(translations.connectionStatus.ready);
          setIsConnected(false);
          if (sessionInfo) {
            console.log('Session ended:', sessionInfo);
          }
        },
        onError: (message) => {
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

      console.log("Session started:", {
        conversationId,
        agentId: agentId
      });
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
      
      // Check if the API key exists and log a masked version for debugging
      // Try multiple ways to access the environment variable
      let apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                  window.process?.env?.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                  "";
                  
      // If still not found, try to get it directly from localStorage as a fallback
      if (!apiKey) {
        apiKey = localStorage.getItem('ELEVENLABS_API_KEY') || "";
      }
      
      // Hard-code the API key as a last resort (only for debugging)
      if (!apiKey) {
        apiKey = "sk_7285d9e3401a8364817514d44289c9acad85e3ddeb1e0887";
        console.log("Using hardcoded API key for testing");
      }
      
      if (!apiKey) {
        console.error("No ElevenLabs API key found in any source");
        return null;
      }
      
      console.log(`Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`);
      
      // Make a direct API call to ElevenLabs with detailed logging
      console.log(`Making API request to: https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`);
      
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
      const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "j6u20kkiKF2sSwOEpZoS";

      const finalSessionInfo = {
        conversationId: finalConversationId,
        agentId: agentId
      };

      console.log("Session ended:", finalSessionInfo);

      // Fetch the transcript
      const fetchedTranscript = await fetchTranscript(finalConversationId);
      setTranscript(fetchedTranscript);
      console.log("Transcript:", fetchedTranscript);

      // Navigate to the review page
      router.push("/review");

      conversationRef.current = null;
      setIsConnected(false);
      setConnectionStatus(translations.connectionStatus.ready);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
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
  };
};
