const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;
 
app.use(express.json());
 
 
const windowSize = 10;
let window = [];
const baseUrl = 'http://20.244.56.144/evaluation-service';
let authToken = null;
 
const endpointMap = {
  'p': 'primes',
  'f': 'fibonacci',
  'e': 'even',
  'r': 'random'
};
 
async function getAuthToken() {
  if (authToken) return authToken;
 
  authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJwYXZpbmthbHlhYW4uMjRtY2FAa2N0LmFjLmluIiwiZXhwIjoxNzUwNDg3ODcyLCJpYXQiOjE3NTA0ODc1NzIsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIwYjM3ZGFkZC1hMzA1LTQ0MGUtOTZiZS0yZThmNWJjYjhhMmIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJwYXZpbiBrYWx5YWFuIHMgcyIsInN1YiI6ImQxZDg3ZmE0LTUxNTgtNDgzZC1iNDU2LTE4ZjM5Y2M1YzBiNyJ9LCJlbWFpbCI6InBhdmlua2FseWFhbi4yNG1jYUBrY3QuYWMuaW4iLCJuYW1lIjoicGF2aW4ga2FseWFhbiBzIHMiLCJyb2xsTm8iOiIyNG1jYTAzOCIsImFjY2Vzc0NvZGUiOiJXY1RTS3YiLCJjbGllbnRJRCI6ImQxZDg3ZmE0LTUxNTgtNDgzZC1iNDU2LTE4ZjM5Y2M1YzBiNyIsImNsaWVudFNlY3JldCI6IkpWU2htZGpqZEpIeEhDZ0oifQ.Sliu9_vNgnj_oNZpSQilUj00JOocJEvLCx2uKGLNabY';
    return authToken;
}
 
async function fetchNumbers(numberId) {
  try {
    const token = await getAuthToken();
    console.log(`Fetching ${numberId} with token: ${token.substring(0, 10)}...`);
    const path = endpointMap[numberId] || numberId;
    const response = await axios.get(`${baseUrl}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 500
    });
    console.log(`Fetched ${numberId}:`, response.data.numbers);
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching ${numberId}:`, error.message, error.response?.status);
    return [];
  }
}
 
 
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return parseFloat(sum / numbers.length).toFixed(2);
}
 
app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;
  const validIds = ['p', 'f', 'e', 'r'];
  if (!validIds.includes(numberId)) {
    return res.status(400).json({ error: 'Invalid numberId' });
  }
 
  const startTime = Date.now();
  const newNumbers = await fetchNumbers(numberId);
 
  if (newNumbers.length === 0 || Date.now() - startTime > 500) {
    return res.status(200).json({
      windowPrevState: [...window],
      numbers: [],
      avg: calculateAverage(window)
    });
  }
 
  const updatedWindow = [...window, ...newNumbers].slice(-windowSize);
  window = updatedWindow;
 
  const response = {
    windowPrevState: window.length > newNumbers.length ? window.slice(0, -newNumbers.length) : [],
    numbers: newNumbers,
    avg: calculateAverage(window)
  };
 
  res.json(response);
});
 
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
 