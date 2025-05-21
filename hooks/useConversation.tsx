"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

// Mock the ElevenLabs Conversation class for our frontend
interface Conversation {
  getId: () => string
  endSession: () => Promise<void>
  connection: {
    conversationId: string
  }
}

interface FormData {
  jobOffer: string
  fullName: string
}

interface SessionInfo {
  conversationId: string
  agentId: string
}

const translations = {
  connectionStatus: {
    ready: "Ready to connect",
    connecting: "Connecting to interviewer...",
    connected: "Connected with interviewer",
    disconnected: "Disconnected",
    error: "Connection error",
  },
}

// This is a mock implementation based on the provided hook
export const useConversation = () => {
  const router = useRouter()
  const [connectionStatus, setConnectionStatus] = useState(translations.connectionStatus.ready)
  const [isConnected, setIsConnected] = useState(false)
  const conversationRef = useRef<Conversation | null>(null)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  // Simulate audio levels for visualization
  useEffect(() => {
    if (isConnected && !isMuted) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.5 + (Math.random() > 0.8 ? 0.5 : 0))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setAudioLevel(0)
    }
  }, [isConnected, isMuted])

  const startConversation = async (formData: FormData) => {
    try {
      setConnectionStatus(translations.connectionStatus.connecting)
      setError(null)

      // Request audio permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err) {
        throw new Error("Microphone access is required for the interview")
      }

      // Create mock conversation object
      const mockConversation: Conversation = {
        getId: () => "mock-conversation-id",
        endSession: async () => {
          return Promise.resolve()
        },
        connection: {
          conversationId: "mock-conversation-id",
        },
      }

      conversationRef.current = mockConversation
      const conversationId = "mock-conversation-id"

      // Simulate a connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSessionInfo({
        conversationId,
        agentId: "aun2qU5FKmQiucBVTNFR",
      })

      setConnectionStatus(translations.connectionStatus.connected)
      setIsConnected(true)

      console.log("Session started:", {
        conversationId,
        agentId: "aun2qU5FKmQiucBVTNFR",
      })
    } catch (error) {
      console.error("Failed to start conversation:", error)
      const errorMessage = (error as Error)?.message || "unknown error"
      setConnectionStatus(`${translations.connectionStatus.error}: ${errorMessage}`)
      setError(`Failed to start conversation: ${errorMessage}`)
      setIsConnected(false)
    }
  }

  const stopConversation = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession()

      const finalConversationId = conversationRef.current.getId() || conversationRef.current.connection.conversationId

      const finalSessionInfo = {
        conversationId: finalConversationId,
        agentId: "aun2qU5FKmQiucBVTNFR",
      }

      console.log("Session ended:", finalSessionInfo)

      // Navigate to the review page
      router.push("/review")

      conversationRef.current = null
      setIsConnected(false)
      setConnectionStatus(translations.connectionStatus.ready)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff)
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
  }

  return {
    connectionStatus,
    isConnected,
    startConversation,
    stopConversation,
    sessionInfo,
    error,
    isMuted,
    toggleMute,
    isCameraOff,
    toggleCamera,
    isScreenSharing,
    toggleScreenShare,
    audioLevel,
  }
}
