const { MongoClient } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/eventura', (err, client) => {
  if (err) {
    console.error('Connection failed:', err);
    return;
  }
  
  const db = client.db();
  
  Promise.all([
    // Fix events
    db.collection('events').updateMany({}, { $set: { isPublic: true } }),
    db.collection('events').updateMany({ status: 'active' }, { $set: { status: 'published' } })
  ])
  .then(([eventUpdate1, eventUpdate2]) => {
    console.log('Fixed events isPublic:', eventUpdate1.modifiedCount);
    console.log('Fixed events status:', eventUpdate2.modifiedCount);
    
    // Count final results
    return Promise.all([
      db.collection('events').find({ status: 'published', isPublic: true }).toArray(),
      db.collection('events').find({}).toArray()
    ]);
  })
  .then(([publishedEvents, allEvents]) => {
    console.log('Published events:', publishedEvents.length);
    console.log('Total events:', allEvents.length);
    
    if (publishedEvents.length > 0) {
      console.log('Sample event:', publishedEvents[0].title, publishedEvents[0].status);
    }
    
    client.close();
    console.log('Database fix completed!');
  })
  .catch(err => {
    console.error('Fix error:', err);
    client.close();
  });
});