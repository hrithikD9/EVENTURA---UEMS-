import mongoose from 'mongoose';
import Organization from './src/models/Organization.js';

async function testOrganizations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventura');
    console.log('✅ Connected to MongoDB');
    
    // Test the Organization model query
    const query = { status: 'active' };
    
    console.log('Testing Organization.find with query:', query);
    
    const organizations = await Organization.find(query)
      .populate('members.executives.user', 'name email')
      .limit(12)
      .sort({ createdAt: -1 });
    
    console.log('\n✅ Found', organizations.length, 'organizations');
    
    organizations.forEach((org, i) => {
      console.log(`\n${i + 1}. ${org.name}`);
      console.log('   Status:', org.status);
      console.log('   Type:', org.type);
      console.log('   Category:', org.category);
      console.log('   Executives:', org.members?.executives?.length || 0);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testOrganizations();