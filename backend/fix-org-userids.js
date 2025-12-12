import mongoose from 'mongoose';

async function fixOrganizationUserIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventura');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const orgs = await db.collection('organizations').find({}).toArray();
    
    console.log('Found', orgs.length, 'organizations to fix');
    
    for (const org of orgs) {
      // Fix the user field to be ObjectId
      const executives = org.members.executives.map(exec => ({
        ...exec,
        user: new mongoose.Types.ObjectId(exec.user)
      }));
      
      await db.collection('organizations').updateOne(
        { _id: org._id },
        { $set: { 'members.executives': executives } }
      );
      
      console.log('✅ Fixed:', org.name);
    }
    
    console.log('\n✅ All organizations fixed!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOrganizationUserIds();