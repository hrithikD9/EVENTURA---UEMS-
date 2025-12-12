// Quick MongoDB test
require('mongodb').MongoClient.connect('mongodb://localhost:27017/eventura', (err, client) => {
  if (err) {
    console.error('Failed to connect:', err);
    return;
  }
  
  const db = client.db();
  
  db.collection('events').find({}).toArray()
    .then(events => {
      console.log('Events found:', events.length);
      
      if (events.length === 0) {
        console.log('No events in database!');
        client.close();
        return;
      }
      
      console.log('\nEvent details:');
      events.forEach((event, i) => {
        console.log(`${i+1}. ${event.title}`);
        console.log(`   Status: ${event.status}`);
        console.log(`   isPublic: ${event.isPublic}`);
        console.log(`   Date: ${event.date}`);
      });
      
      // Quick fix
      return Promise.all([
        db.collection('events').updateMany({}, { $set: { isPublic: true } }),
        db.collection('events').updateMany({ status: 'active' }, { $set: { status: 'published' } })
      ]);
    })
    .then(([r1, r2]) => {
      if (r1 && r2) {
        console.log('\nFixed isPublic:', r1.modifiedCount);
        console.log('Fixed status:', r2.modifiedCount);
      }
      return db.collection('events').find({ status: 'published', isPublic: true }).toArray();
    })
    .then(fixedEvents => {
      console.log('\nPublished events after fix:', fixedEvents.length);
      client.close();
    })
    .catch(err => {
      console.error('Error:', err);
      client.close();
    });
});