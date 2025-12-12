const { MongoClient } = require('mongodb');

async function fixEventsData() {
  const client = new MongoClient('mongodb://localhost:27017/eventura');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('events');
    
    // First, let's see what we have
    const events = await collection.find({}).toArray();
    console.log('\n📊 Current Events in Database:');
    console.log('Total events found:', events.length);
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(`\nEvent ${i + 1}:`);
      console.log('  Title:', event.title);
      console.log('  Status:', event.status);
      console.log('  isPublic:', event.isPublic);
      console.log('  Date:', event.date);
      console.log('  Organizer:', event.organizer?.name || 'None');
    }
    
    // Fix the events
    console.log('\n🔧 Applying Fixes...');
    
    // Fix 1: Set isPublic to true for all events
    const result1 = await collection.updateMany(
      { $or: [{ isPublic: { $ne: true } }, { isPublic: { $exists: false } }] },
      { $set: { isPublic: true } }
    );
    console.log('✅ Set isPublic=true for', result1.modifiedCount, 'events');
    
    // Fix 2: Change status from 'active' to 'published' 
    const result2 = await collection.updateMany(
      { status: 'active' },
      { $set: { status: 'published' } }
    );
    console.log('✅ Changed status from "active" to "published" for', result2.modifiedCount, 'events');
    
    // Fix 3: Set default status to 'published' for any events without status
    const result3 = await collection.updateMany(
      { $or: [{ status: { $exists: false } }, { status: null }, { status: '' }] },
      { $set: { status: 'published' } }
    );
    console.log('✅ Set default status="published" for', result3.modifiedCount, 'events');
    
    // Check final state
    const finalEvents = await collection.find({ status: 'published', isPublic: true }).toArray();
    console.log('\n🎉 Final Results:');
    console.log('Events with status="published" and isPublic=true:', finalEvents.length);
    
    if (finalEvents.length > 0) {
      console.log('\n📋 Sample Fixed Event:');
      const sample = finalEvents[0];
      console.log('  Title:', sample.title);
      console.log('  Status:', sample.status);
      console.log('  isPublic:', sample.isPublic);
      console.log('  Date:', sample.date);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixEventsData();