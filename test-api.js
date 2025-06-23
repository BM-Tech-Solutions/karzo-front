// Simple script to test the API
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8000';

async function testJobsAPI() {
  try {
    console.log('Fetching job offer with ID 2...');
    const response = await fetch(`${API_BASE_URL}/api/v1/job-offers/2`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Job data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('Failed to fetch job data');
      try {
        const errorText = await response.text();
        console.error(`Error: ${errorText}`);
      } catch (e) {
        console.error('Could not parse error response');
      }
    }
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

testJobsAPI();
