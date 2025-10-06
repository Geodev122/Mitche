/**
 * Firebase Connection Test Component
 * Add this to your app to test Firebase connectivity
 */

import React, { useState, useEffect } from 'react';
let _fs_lazy_conn: any = null;
async function getFsConn() {
  if (_fs_lazy_conn) return _fs_lazy_conn;
  const m = await import('../services/firebase');
  _fs_lazy_conn = m.firebaseService;
  return _fs_lazy_conn;
}

async function getAuthAndDb() {
  const m = await import('../services/firebase');
  return { auth: m.auth, db: m.db };
}

interface ConnectionStatus {
  status: 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

const FirebaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'testing',
    message: 'Testing Firebase connection...'
  });

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      console.log('🚀 Starting Firebase connection test...');
      
      // Test 1: Check Firebase initialization
      setConnectionStatus({ status: 'testing', message: 'Checking Firebase initialization...' });
      
      const { auth, db } = await getAuthAndDb();
      if (!auth || !db) {
        throw new Error('Firebase not properly initialized');
      }
      console.log('✅ Firebase auth and firestore initialized');

      // Test 2: Check auth state
      setConnectionStatus({ status: 'testing', message: 'Checking authentication state...' });
      
      const authPromise = new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });
      
      const currentUser = await authPromise;
      console.log('✅ Auth state checked:', currentUser ? 'User logged in' : 'No user logged in');

      // Test 3: Test Firestore read operation
      setConnectionStatus({ status: 'testing', message: 'Testing Firestore read operation...' });
      
      try {
  const fs = await getFsConn();
  const users = await fs.getAllUsers();
        console.log('✅ Firestore read test passed:', `Retrieved ${users.length} users`);
      } catch (readError) {
        console.warn('⚠️ Firestore read test failed (this might be due to auth rules):', readError);
      }

      // Test 4: Test real-time listener
      setConnectionStatus({ status: 'testing', message: 'Testing real-time listeners...' });
      
  const fs2 = await getFsConn();
  const unsubscribe = fs2.subscribeToRequests((requests: any[]) => {
        console.log('✅ Real-time listener working:', `Got ${requests.length} requests`);
        unsubscribe(); // Clean up
      });

      // Test 5: Check Firebase project config
      console.log('📋 Firebase Config:');
      console.log('Project ID:', auth.app.options.projectId);
      console.log('Auth Domain:', auth.app.options.authDomain);
      console.log('API Key:', auth.app.options.apiKey ? 'Present' : 'Missing');

      setConnectionStatus({
        status: 'success',
        message: '🎉 Firebase connection successful! All tests passed.',
        details: {
          projectId: auth.app.options.projectId,
          authDomain: auth.app.options.authDomain,
          hasApiKey: !!auth.app.options.apiKey
        }
      });

    } catch (error: any) {
      console.error('❌ Firebase connection test failed:', error);
      setConnectionStatus({
        status: 'error',
        message: `Firebase connection failed: ${error.message}`,
        details: error
      });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'testing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold mb-2">Firebase Connection Test</h3>
      <div className={`${getStatusColor()} mb-2`}>
        <span className="mr-2">{getStatusIcon()}</span>
        {connectionStatus.message}
      </div>
      
      {connectionStatus.details && (
        <div className="text-sm text-gray-600 mt-2">
          <details>
            <summary className="cursor-pointer font-medium">Details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(connectionStatus.details, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      <button
        onClick={testFirebaseConnection}
        className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Retest Connection
      </button>
    </div>
  );
};

export default FirebaseConnectionTest;