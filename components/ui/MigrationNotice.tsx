import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const MigrationNotice: React.FC = () => {
  const { isFirebaseEnabled, migrateToFirebase } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  if (!isFirebaseEnabled || migrationComplete) {
    return null;
  }

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      await migrateToFirebase();
      setMigrationComplete(true);
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-blue-800 font-semibold mb-2">🔄 Data Migration Available</h3>
      <p className="text-blue-700 text-sm mb-3">
        We've upgraded to cloud storage! Migrate your local data to sync across all your devices and enable real-time updates.
      </p>
      <button
        onClick={handleMigration}
        disabled={isMigrating}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isMigrating ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Migrating...
          </>
        ) : (
          'Migrate to Cloud'
        )}
      </button>
    </div>
  );
};

export default MigrationNotice;