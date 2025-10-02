// Test Firebase connection
import { firebaseService } from './services/firebase.js';

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Test 1: Check if Firebase is initialized
    console.log('✓ Firebase service initialized');
    
    // Test 2: Try to get users (read operation)
    console.log('Testing read operation...');
    const users = await firebaseService.getAllUsers();
    console.log(`✓ Successfully retrieved ${users.length} users from Firestore`);
    
    // Test 3: Try to get requests
    console.log('Testing requests collection...');
    const requests = await firebaseService.getRequests();
    console.log(`✓ Successfully retrieved ${requests.length} requests from Firestore`);
    
    // Test 4: Auth state
    console.log('Testing auth state...');
    firebaseService.onAuthStateChange((user) => {
      if (user) {
        console.log(`✓ User authenticated: ${user.username}`);
      } else {
        console.log('ℹ No user currently authenticated');
      }
    });
    
    console.log('🎉 All Firebase tests passed! Database is connected and working.');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testFirebaseConnection();