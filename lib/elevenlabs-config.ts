/**
 * ElevenLabs configuration helper
 * This file centralizes the logic for retrieving ElevenLabs credentials
 * from various sources to ensure they're always available
 */

export const getElevenLabsConfig = () => {
  // Debug: Log all environment variables that start with NEXT_PUBLIC
  if (typeof window !== 'undefined') {
    console.log('Environment variables check:');
    console.log('NEXT_PUBLIC_AGENT_ID:', process.env.NEXT_PUBLIC_AGENT_ID);
    console.log('NEXT_PUBLIC_ELEVENLABS_API_KEY:', process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'Found' : 'Not found');
  }
  
  // Get agent ID from environment variable with multiple fallbacks
  let agentId = process.env.NEXT_PUBLIC_AGENT_ID || "";
  
  // If running in browser and agent ID is empty, try localStorage
  if (typeof window !== 'undefined' && !agentId) {
    agentId = localStorage.getItem('ELEVENLABS_AGENT_ID') || "";
    console.log(`Trying to get agent ID from localStorage: ${agentId ? "Found" : "Not found"}`);
  }
  

  
  // Get API key using multiple fallback methods
  let apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "";
  
  // If running in browser and API key is empty, try localStorage
  if (typeof window !== 'undefined' && !apiKey) {
    apiKey = localStorage.getItem('ELEVENLABS_API_KEY') || "";
    console.log(`Trying to get API key from localStorage: ${apiKey ? "Found" : "Not found"}`);
  }
  

  
  // Store credentials in localStorage for future use if they exist
  if (typeof window !== 'undefined') {
    if (agentId) {
      localStorage.setItem('ELEVENLABS_AGENT_ID', agentId);
    }
    if (apiKey) {
      localStorage.setItem('ELEVENLABS_API_KEY', apiKey);
    }
    
    // Set global variables for ElevenLabs client
    // @ts-ignore - Setting global variable for ElevenLabs client
    window.ELEVENLABS_API_KEY = apiKey;
    // @ts-ignore - Setting global variable for ElevenLabs client
    window.ELEVENLABS_AGENT_ID = agentId;
  }
  
  // Log configuration status
  if (!agentId) {
    console.error("No ElevenLabs agent ID found in any source. WebSocket connection will likely fail.");
  }
  if (!apiKey) {
    console.error("No ElevenLabs API key found in any source. API calls will likely fail.");
  }
  
  return { agentId, apiKey };
};
