const mongoose = require('mongoose');

// Simple direct fix
mongoose.connect('mongodb://localhost:27017/eventura')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Fix events: add isPublic and fix status
    const Event = mongoose.model('Event', new mongoose.Schema({}, { collection: 'events' }));
    
    // Update all events to have isPublic: true
    const result1 = await Event.updateMany(
      { isPublic: { $ne: true } },
      { $set: { isPublic: true } }
    );
    console.log('Added isPublic to', result1.modifiedCount, 'events');
    
    // Convert 'active' status to 'published'
    const result2 = await Event.updateMany(
      { status: 'active' },
      { $set: { status: 'published' } }
    );
    console.log('Updated status for', result2.modifiedCount, 'events');
    
    // Check final results
    const publishedEvents = await Event.find({ status: 'published', isPublic: true });
    const allEvents = await Event.find({});
    
    console.log('\n✅ Results:');
    console.log('Total events:', allEvents.length);
    console.log('Published public events:', publishedEvents.length);
    
    if (publishedEvents.length > 0) {
      console.log('\nSample event:');
      console.log('Title:', publishedEvents[0].title);
      console.log('Status:', publishedEvents[0].status);
      console.log('isPublic:', publishedEvents[0].isPublic);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
  });