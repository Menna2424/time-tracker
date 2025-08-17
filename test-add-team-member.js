// Simple test to verify the add team member functionality
// This can be run in the browser console or as a Node.js script

// Mock localStorage for testing
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    clear: () => {}
  };
}

// Test the repository functionality
async function testAddTeamMember() {
  console.log('🧪 Testing Add Team Member Functionality...');
  
  try {
    // Import the necessary modules (this would need to be adapted for the actual environment)
    const { MockTeamRepository } = await import('./src/infrastructure/repositories/mockTeamRepository.js');
    const { AddTeamMember } = await import('./src/application/useCases/AddTeamMember.js');
    
    const repository = new MockTeamRepository();
    const addTeamMemberUseCase = new AddTeamMember(repository);
    
    // Test 1: Get initial team members
    console.log('📋 Getting initial team members...');
    const initialMembers = await repository.getTeamMembers();
    console.log(`Initial members count: ${initialMembers.length}`);
    
    // Test 2: Add a new team member
    console.log('➕ Adding new team member...');
    const newMember = await addTeamMemberUseCase.execute({
      name: 'Test User',
      email: 'test@example.com',
      hourlyRate: 45.00
    });
    
    console.log('✅ New member added:', newMember);
    
    // Test 3: Verify the member was added
    console.log('🔍 Verifying member was added...');
    const updatedMembers = await repository.getTeamMembers();
    console.log(`Updated members count: ${updatedMembers.length}`);
    
    const addedMember = updatedMembers.find(m => m.id === newMember.id);
    if (addedMember) {
      console.log('✅ Member found in repository:', addedMember);
    } else {
      console.log('❌ Member not found in repository');
    }
    
    // Test 4: Test validation
    console.log('🔍 Testing validation...');
    try {
      await addTeamMemberUseCase.execute({
        name: '',
        email: 'invalid-email',
        hourlyRate: -10
      });
      console.log('❌ Validation should have failed');
    } catch (error) {
      console.log('✅ Validation working correctly:', error.message);
    }
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testAddTeamMember = testAddTeamMember;
  console.log('Test function available as window.testAddTeamMember()');
} else {
  // Node.js environment
  testAddTeamMember();
}

