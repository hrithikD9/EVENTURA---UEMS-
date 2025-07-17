/**
 * Server Availability Check Utility
 * Run this from the command line with Node.js to test if your backend server is running
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET',
  timeout: 3000
};

console.log('Checking if server is running at http://localhost:5000/...');

const req = http.request(options, (res) => {
  console.log(`✅ Server responded with status code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Failed to connect to server:', error.message);
  console.log('\nIf you need to start the server, run these commands:');
  console.log('cd /home/hrithik/Documents/Eventura/backend');
  console.log('node server.js');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Connection timed out after 3 seconds');
  req.destroy();
  process.exit(1);
});

req.end();
