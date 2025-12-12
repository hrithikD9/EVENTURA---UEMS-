// Comprehensive database fix script
console.log('Starting database fixes...');

require('mongodb').MongoClient.connect('mongodb://localhost:27017/eventura', async (err, client) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  
  const db = client.db();
  
  try {
    // Fix 1: Update events with isPublic flag and fix status
    console.log('1. Fixing events...');
    
    // Add isPublic: true to all events that don't have it
    const eventResult1 = await db.collection('events').updateMany(
      { isPublic: { $exists: false } }, 
      { $set: { isPublic: true } }
    );
    console.log('  - Added isPublic to', eventResult1.modifiedCount, 'events');
    
    // Convert 'active' status to 'published'
    const eventResult2 = await db.collection('events').updateMany(
      { status: 'active' }, 
      { $set: { status: 'published' } }
    );
    console.log('  - Updated status from "active" to "published" for', eventResult2.modifiedCount, 'events');
    
    // Fix 2: Create organizations for organizers
    console.log('2. Creating missing organizations...');
    
    const organizers = await db.collection('users').find({ role: 'organizer' }).toArray();
    console.log('  - Found', organizers.length, 'organizers');
    
    for (let organizer of organizers) {
      const orgName = organizer.name + ' Organization';
      const existing = await db.collection('organizations').findOne({ name: orgName });
      
      if (!existing) {
        await db.collection('organizations').insertOne({
          name: orgName,
          description: `Organization managed by ${organizer.name}`,
          type: 'Other',
          category: 'Other',
          status: 'active',
          contactInfo: { 
            email: organizer.email, 
            phone: '', 
            website: '', 
            address: '' 
          },
          members: { 
            executives: [{ 
              user: organizer._id, 
              position: 'President', 
              joinedAt: new Date() 
            }] 
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('  - Created organization:', orgName);
      } else {
        console.log('  - Organization already exists:', orgName);
      }
    }
    
    // Fix 3: Verify final state
    console.log('3. Verifying fixes...');
    
    const totalEvents = await db.collection('events').countDocuments();
    const publicEvents = await db.collection('events').countDocuments({ isPublic: true });
    const publishedEvents = await db.collection('events').countDocuments({ status: 'published' });
    const totalOrgs = await db.collection('organizations').countDocuments();
    
    console.log('  - Total events:', totalEvents);
    console.log('  - Public events:', publicEvents);
    console.log('  - Published events:', publishedEvents);
    console.log('  - Total organizations:', totalOrgs);
    
    console.log('\n✅ All fixes completed successfully!');
    console.log('\nNow you should be able to see:');
    console.log('- Events in the Events page');
    console.log('- Organizations in the Organizations page');
    
  } catch (error) {
    console.error('❌ Error during fixes:', error);
  } finally {
    client.close();
  }
});