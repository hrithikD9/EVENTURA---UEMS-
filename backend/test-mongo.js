// Simple MongoDB direct connection test
const { MongoClient } = require('mongodb');

async function testMongoDB() {
  const uri = 'mongodb://localhost:27017/eventura';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check events
    const events = await db.collection('events').find({}).toArray();
    console.log('Events found:', events.length);
    if (events.length > 0) {
      console.log('Sample event:', {
        title: events[0].title,
        status: events[0].status,
        isPublic: events[0].isPublic
      });
    }
    
    // Check organizations
    const orgs = await db.collection('organizations').find({}).toArray();
    console.log('Organizations found:', orgs.length);
    if (orgs.length > 0) {
      console.log('Sample org:', {
        name: orgs[0].name,
        status: orgs[0].status
      });
    }
    
    console.log('Test complete');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testMongoDB();