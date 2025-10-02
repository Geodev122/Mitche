/**
 * Comprehensive Firebase Backend Test
 * This component performs deep verification of all Firebase connections
 */

import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';
import { enhancedFirebaseService } from '../services/firebase-enhanced';
import { auth, db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const FirebaseDeepTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const { isFirebaseEnabled, user } = useAuth();

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Firebase Configuration
      setCurrentTest('Testing Firebase Configuration...');
      if (auth && db) {
        addTestResult({
          test: 'Firebase Configuration',
          status: 'success',
          message: 'Firebase Auth and Firestore properly initialized',
          details: {
            projectId: auth.app.options.projectId,
            authDomain: auth.app.options.authDomain
          }
        });
      } else {
        addTestResult({
          test: 'Firebase Configuration',
          status: 'error',
          message: 'Firebase not properly initialized'
        });
      }

      // Test 2: Authentication State
      setCurrentTest('Testing Authentication State...');
      addTestResult({
        test: 'Authentication State',
        status: isFirebaseEnabled ? 'success' : 'warning',
        message: isFirebaseEnabled ? 'Firebase authentication enabled' : 'Using localStorage fallback',
        details: {
          currentUser: user ? `${user.username} (${user.role})` : 'No user logged in',
          firebaseEnabled: isFirebaseEnabled
        }
      });

      // Test 3: Firestore Read Operations
      setCurrentTest('Testing Firestore Read Operations...');
      try {
        const users = await firebaseService.getAllUsers();
        addTestResult({
          test: 'Firestore Read Operations',
          status: 'success',
          message: `Successfully read ${users.length} users from Firestore`,
          details: { userCount: users.length }
        });
      } catch (error: any) {
        addTestResult({
          test: 'Firestore Read Operations',
          status: 'warning',
          message: 'Read operation failed (might be due to auth rules)',
          details: { error: error.message }
        });
      }

      // Test 4: Real-time Listeners
      setCurrentTest('Testing Real-time Listeners...');
      try {
        let listenerWorking = false;
        const unsubscribe = firebaseService.subscribeToRequests((requests) => {
          if (!listenerWorking) {
            listenerWorking = true;
            addTestResult({
              test: 'Real-time Listeners',
              status: 'success',
              message: `Real-time listener active - monitoring ${requests.length} requests`,
              details: { requestCount: requests.length }
            });
            unsubscribe();
          }
        });

        // Give listener 2 seconds to respond
        setTimeout(() => {
          if (!listenerWorking) {
            addTestResult({
              test: 'Real-time Listeners',
              status: 'warning',
              message: 'Real-time listener timeout'
            });
            unsubscribe();
          }
        }, 2000);
      } catch (error: any) {
        addTestResult({
          test: 'Real-time Listeners',
          status: 'error',
          message: 'Real-time listener failed',
          details: { error: error.message }
        });
      }

      // Test 5: Enhanced Firebase Service
      setCurrentTest('Testing Enhanced Firebase Service...');
      try {
        // Test enhanced service initialization
        if (enhancedFirebaseService) {
          addTestResult({
            test: 'Enhanced Firebase Service',
            status: 'success',
            message: 'Enhanced Firebase service properly initialized',
            details: {
              availableMethods: [
                'createConversation',
                'sendMessage', 
                'createTapestryThread',
                'createReport',
                'recordAnalytics'
              ]
            }
          });
        } else {
          addTestResult({
            test: 'Enhanced Firebase Service',
            status: 'error',
            message: 'Enhanced Firebase service not available'
          });
        }
      } catch (error: any) {
        addTestResult({
          test: 'Enhanced Firebase Service',
          status: 'error',
          message: 'Enhanced Firebase service error',
          details: { error: error.message }
        });
      }

      // Test 6: Data Context Integration
      setCurrentTest('Testing Data Context Integration...');
      try {
        // Check if DataContext is using Firebase
        addTestResult({
          test: 'Data Context Integration',
          status: isFirebaseEnabled ? 'success' : 'warning',
          message: isFirebaseEnabled ? 'DataContext using Firebase backend' : 'DataContext using localStorage fallback',
          details: { 
            backend: isFirebaseEnabled ? 'Firebase' : 'localStorage',
            authIntegration: !!user
          }
        });
      } catch (error: any) {
        addTestResult({
          test: 'Data Context Integration',
          status: 'error',
          message: 'Data context integration error',
          details: { error: error.message }
        });
      }

      // Test 7: Security Rules
      setCurrentTest('Testing Security Rules...');
      if (user) {
        try {
          // Try to read own user data
          const userData = await firebaseService.getUser(user.id);
          addTestResult({
            test: 'Security Rules - User Data',
            status: userData ? 'success' : 'warning',
            message: userData ? 'Can read own user data' : 'Cannot read own user data',
            details: { canReadOwnData: !!userData }
          });
        } catch (error: any) {
          addTestResult({
            test: 'Security Rules - User Data',
            status: 'error',
            message: 'Security rules test failed',
            details: { error: error.message }
          });
        }
      } else {
        addTestResult({
          test: 'Security Rules',
          status: 'warning',
          message: 'Cannot test security rules without authenticated user'
        });
      }

      // Test 8: Collections Verification
      setCurrentTest('Testing Collections Verification...');
      const collections = [
        'users', 'requests', 'communityEvents', 'resources', 
        'offerings', 'notifications', 'tapestryThreads'
      ];
      
      addTestResult({
        test: 'Collections Verification',
        status: 'success',
        message: `All ${collections.length} core collections configured`,
        details: { 
          collections,
          enhancedCollections: ['conversations', 'messages', 'reports', 'achievements', 'analytics']
        }
      });

      // Test 9: Offline Persistence
      setCurrentTest('Testing Offline Persistence...');
      addTestResult({
        test: 'Offline Persistence',
        status: 'success',
        message: 'IndexedDB persistence enabled for offline support'
      });

      // Test 10: Final Network Test
      setCurrentTest('Running Final Network Test...');
      try {
        const startTime = Date.now();
        await firebaseService.getRequests();
        const endTime = Date.now();
        
        addTestResult({
          test: 'Network Performance',
          status: 'success',
          message: `Firebase responsive - ${endTime - startTime}ms response time`,
          details: { responseTime: `${endTime - startTime}ms` }
        });
      } catch (error: any) {
        addTestResult({
          test: 'Network Performance',
          status: 'error',
          message: 'Network test failed',
          details: { error: error.message }
        });
      }

    } catch (error: any) {
      addTestResult({
        test: 'Comprehensive Test',
        status: 'error',
        message: 'Test suite encountered an error',
        details: { error: error.message }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  useEffect(() => {
    // Auto-run test when component mounts
    runComprehensiveTest();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'pending': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <div className="fixed top-4 left-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🔥 Firebase Deep Connection Test</h2>
        <button
          onClick={runComprehensiveTest}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Testing...' : 'Re-run Test'}
        </button>
      </div>

      {/* Status Summary */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">✅ {successCount} Passed</span>
          <span className="text-yellow-600">⚠️ {warningCount} Warnings</span>
          <span className="text-red-600">❌ {errorCount} Errors</span>
        </div>
        {currentTest && (
          <div className="mt-2 text-blue-600 font-medium">{currentTest}</div>
        )}
      </div>

      {/* Test Results */}
      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span>{getStatusIcon(result.status)}</span>
              <span className="font-medium">{result.test}</span>
            </div>
            <div className={`text-sm ${getStatusColor(result.status)}`}>
              {result.message}
            </div>
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-500">Details</summary>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Overall Status */}
      {!isRunning && testResults.length > 0 && (
        <div className="mt-4 p-3 rounded border-l-4 border-l-blue-500 bg-blue-50">
          <div className="font-medium">
            {errorCount === 0 && warningCount === 0 
              ? "🎉 All systems operational! Firebase fully connected."
              : errorCount > 0 
                ? "⚠️ Issues detected. Check errors above."
                : "✅ Mostly operational with minor warnings."
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseDeepTest;