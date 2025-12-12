// Test script to check API endpoints
const https = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`${description}:`);
          console.log(`  Status: ${res.statusCode}`);
          console.log(`  Count: ${parsed.count || 0}`);
          console.log(`  Success: ${parsed.success}`);
          if (parsed.data && parsed.data.length > 0) {
            console.log(`  First item: ${parsed.data[0].title || parsed.data[0].name}`);
          }
          console.log('');
          resolve(parsed);
        } catch (err) {
          console.log(`${description}: Parse error`, err.message);
          resolve(null);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`${description}: Connection error`, err.message);
      resolve(null);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('Testing API endpoints...\n');
  
  await testEndpoint('/api/events', 'Events API');
  await testEndpoint('/api/organizations', 'Organizations API');
  
  console.log('Tests complete!');
}

runTests();