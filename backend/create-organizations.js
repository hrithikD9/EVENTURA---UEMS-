import mongoose from 'mongoose';

async function createOrganizations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventura');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all organizers
    const organizers = await db.collection('users').find({ role: 'organizer' }).toArray();
    console.log('\n📊 Found', organizers.length, 'organizers');
    
    if (organizers.length === 0) {
      console.log('No organizers found!');
      await mongoose.connection.close();
      return;
    }
    
    // Create organizations for each organizer
    let created = 0;
    for (const organizer of organizers) {
      const orgName = organizer.name + ' Organization';
      
      // Check if organization already exists
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
        console.log('✅ Created organization:', orgName);
        created++;
      } else {
        console.log('⏭️  Organization already exists:', orgName);
      }
    }
    
    console.log('\n🎉 Created', created, 'new organizations');
    
    // Verify final count
    const totalOrgs = await db.collection('organizations').countDocuments();
    console.log('Total organizations in database:', totalOrgs);
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createOrganizations();