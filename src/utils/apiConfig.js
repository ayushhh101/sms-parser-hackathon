import { Platform } from 'react-native';

// Function to get local IP automatically
const getLocalIP = async () => {
  try {
    if (Platform.OS === 'web') {
      return 'localhost';
    }

    // For React Native, we'll use a network info library approach
    // First, try to get the IP from the network info
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    // For local development, we need the local network IP
    // This is a fallback approach - in practice, you might want to set this manually
    // or use a more sophisticated method
    
    // Common local IP ranges for development
    const commonIPs = [
      '192.168.1.', '192.168.0.', '192.168.29.', '10.0.0.', '172.16.'
    ];
    
    // You can manually set your IP here for now
    // In a real app, you'd want to use react-native-network-info or similar
    return '192.168.29.218'; // Your current IP
    
  } catch (error) {
    console.log('Could not detect IP, using fallback');
    return '192.168.29.218'; // Fallback to your current IP
  }
};

// Get API base URL with automatic IP detection
export const getApiBaseUrl = async () => {
  const ip = await getLocalIP();
  const baseUrl = `http://${ip}:3000/api`;
  console.log('Using API base URL:', baseUrl);
  return baseUrl;
};

// For immediate use (synchronous)
export const API_BASE_URL = 'http://192.168.29.218:3000/api';

// Instructions for teammates:
// 1. Check your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
// 2. Update the fallback IP in this file
// 3. Or set REACT_NATIVE_API_IP environment variable

export const getApiUrl = (endpoint) => {
  const ip = process.env.REACT_NATIVE_API_IP || '192.168.29.218';
  return `http://${ip}:3000/api${endpoint}`;
};