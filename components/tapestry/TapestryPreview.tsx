import React from 'react';
import { useData } from '../../context/DataContext';
import { TapestryThread, Role } from '../../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../ui/ConfirmationModal';

const TapestryPreview: React.FC = () => {
  const { tapestryThreads, echoThread } = useData();
  const { t } = useTranslation();

  const preview = tapestryThreads.slice(0, 3);
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedThread, setSelectedThread] = React.useState<TapestryThread | null>(null);

  // Only show tapestry preview to specific roles
  if (!user || ![Role.Citizen, Role.NGO, Role.Admin].includes(user.role)) return null;

  const handleEchoClick = (thread: TapestryThread) => {
    setSelectedThread(thread);
    setConfirmOpen(true);
  };

  const handleConfirmEcho = () => {
    if (selectedThread) echoThread(selectedThread.id);
    setConfirmOpen(false);
    setSelectedThread(null);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{t('tapestry.previewTitle', 'Tapestry')}</h3>
        <a href="/tapestry" className="text-sm text-amber-600">{t('tapestry.more', 'More')}</a>
      </div>

      {preview.length === 0 ? (
        <div className="text-sm text-gray-500">{t('tapestry.previewEmpty', 'No tapestry stories yet.')}</div>
      ) : (
        <ul className="space-y-3">
          {preview.map((thread: TapestryThread) => (
            <li key={thread.id} className="p-3 border rounded flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">{thread.honoreeSymbolicName || t('tapestry.anonymous')}</div>
                <div className="text-xs text-gray-500 mt-1">{(thread.story || '').substring(0, 80)}{(thread.story || '').length > 80 ? '…' : ''}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-500">{t('tapestry.echoes', { count: thread.echoes })}</div>
                <button onClick={() => handleEchoClick(thread)} className="mt-2 px-3 py-1 bg-amber-600 text-white rounded text-sm">{t('tapestry.echo', 'Echo')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmEcho}
        title={t('tapestry.confirmEchoTitle', 'Echo this story?')}
        confirmText={t('tapestry.echo', 'Echo') as string}
      >
        {selectedThread ? (
          <div className="text-sm">{(selectedThread.story || '').substring(0, 200)}</div>
        ) : null}
      </ConfirmationModal>
    </div>
  );
};

export default TapestryPreview;
