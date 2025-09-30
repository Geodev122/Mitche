import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { PlusCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Request, RequestType, RequestStatus, Role } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';

const RequestCard: React.FC<{ request: Request }> = ({ request }) => {
  const { addOffering, initiateHelp, confirmReceipt, fulfillRequest } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isEncourageModalOpen, setEncourageModalOpen] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');

  if (!user) return null;

  const handleInitiateHelp = () => {
    initiateHelp(request.id, user.id);
    setHelpModalOpen(false);
  };

  const handleSendEncouragement = () => {
    if (encouragementMessage.trim() === '') return;
    const offering = {
        requestId: request.id,
        type: 'Encouragement' as 'Encouragement',
        message: encouragementMessage,
        pointsEarned: 3,
    };
    addOffering(offering, user.id);
    setEncourageModalOpen(false);
    setEncouragementMessage('');
  };

  const statusStyles: { [key in RequestStatus]: { text: string; classes: string } } = {
    [RequestStatus.Open]: { text: t(`requestStatus.${RequestStatus.Open}`), classes: 'bg-green-100 text-green-700' },
    [RequestStatus.Pending]: { text: t(`requestStatus.${RequestStatus.Pending}`), classes: 'bg-yellow-100 text-yellow-700' },
    [RequestStatus.Fulfilled]: { text: t(`requestStatus.${RequestStatus.Fulfilled}`), classes: 'bg-blue-100 text-blue-700' },
    [RequestStatus.Closed]: { text: t(`requestStatus.${RequestStatus.Closed}`), classes: 'bg-gray-100 text-gray-700' },
  };
  const currentStatus = statusStyles[request.status];
  const isOwner = user.id === request.userId;
  const isHelper = user.id === request.helperId;

  const renderActionButtons = () => {
    if (isOwner) {
        if (request.status === RequestStatus.Pending && !request.isConfirmedByRequester) {
            return <button onClick={() => confirmReceipt(request.id)} className="px-4 py-2 text-sm bg-green-500 text-white rounded-full hover:bg-green-600">
                {t('echoes.card.confirmReceipt')}
            </button>;
        }
        return null; // Or show status message
    }

    // Actions for other users
    if (request.status === RequestStatus.Open) {
        return (
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button onClick={() => setHelpModalOpen(true)} className="px-4 py-2 text-sm bg-[#3A3A3A] text-white rounded-full hover:bg-opacity-80">
                  {t('echoes.card.provideHelp')}
              </button>
              <button onClick={() => setEncourageModalOpen(true)} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">{t('echoes.card.sendEncouragement')}</button>
            </div>
        );
    }

    if (request.status === RequestStatus.Pending && isHelper) {
        if (request.isConfirmedByRequester) {
            return <button onClick={() => fulfillRequest(request.id, user.id)} className="px-4 py-2 text-sm bg-[#D4AF37] text-white rounded-full hover:bg-opacity-80">
                {t('echoes.card.claimHopePoints')}
            </button>;
        } else {
            return <button className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded-full cursor-not-allowed" disabled>
                {t('echoes.card.waitingReceipt')}
            </button>;
        }
    }
    
    return null;
  };


  return (
    <>
      <Card className="mb-4 transition-transform transform hover:scale-[1.02] relative">
        <div className="flex items-start">
          <div className="ml-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
            <div className="w-12 h-12 bg-[#F1EADF] rounded-full flex items-center justify-center">
              <SymbolIcon name={request.userSymbolicIcon} className="w-7 h-7 text-[#D4AF37]" />
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">{request.userSymbolicName}</h3>
              <span className="text-xs text-gray-400">{timeSince(request.timestamp, t)}</span>
            </div>
            <span className="text-sm font-semibold text-[#D4AF37]">{t(`requestTypes.${request.type}`)} - {request.region}</span>
            <p className="text-gray-600 mt-2 text-md">{request.description}</p>
            <div className="mt-4">
                {renderActionButtons()}
            </div>
          </div>
        </div>
        {currentStatus && (
          <div className={`absolute top-2 right-2 text-xs ${currentStatus.classes} px-2 py-1 rounded-full font-semibold`}>
              {currentStatus.text}
          </div>
        )}
      </Card>
      
      <Modal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} title={t('echoes.helpModal.titleHelp')}>
        <>
            <p className="text-gray-600 mb-4">{t('echoes.helpModal.bodyHelp')}</p>
            <p className="text-center font-bold text-lg bg-gray-100 p-2 rounded-md">📞 +961 71 123 456</p>
            <p className="text-xs text-gray-400 text-center my-2">{t('echoes.helpModal.dummyPhone')}</p>
        </>
        <button onClick={handleInitiateHelp} className="w-full mt-4 bg-[#3A3A3A] text-white py-2 rounded-lg font-bold hover:bg-opacity-90">
            {t('echoes.helpModal.confirmHelp')}
        </button>
      </Modal>

      <Modal isOpen={isEncourageModalOpen} onClose={() => setEncourageModalOpen(false)} title={t('echoes.encourageModal.title')}>
          <textarea 
            value={encouragementMessage}
            onChange={(e) => setEncouragementMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            placeholder={t('echoes.encourageModal.placeholder')}
          />
          <button onClick={handleSendEncouragement} className="w-full mt-4 bg-[#D4AF37] text-white py-2 rounded-lg font-bold hover:bg-opacity-90">
            {t('echoes.encourageModal.send')}
          </button>
      </Modal>
    </>
  );
};

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const RequestCardSkeleton: React.FC = () => (
  <Card className="mb-4">
    <div className="flex items-start">
      <div className="ml-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
      <div className="flex-grow space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-2/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex space-x-2 rtl:space-x-reverse pt-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-40 rounded-full" />
        </div>
      </div>
    </div>
  </Card>
);

const WallOfEchoes: React.FC = () => {
  const { requests, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<RequestType | 'All'>('All');

  const filteredRequests = requests.filter(req => filter === 'All' || req.type === filter);
  
  const canCreateRequest = user?.role === Role.Citizen;

  return (
    <div className="p-4">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('echoes.title')}</h1>
        <p className="text-md text-gray-500 mt-1">{t('echoes.subtitle')}</p>
      </header>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse bg-white p-1 rounded-full border border-[#F1EADF]">
          <Filter className="w-5 h-5 text-gray-500 mx-2" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as RequestType | 'All')}
            className="bg-transparent focus:outline-none text-sm text-gray-600 py-1"
          >
            <option value="All">{t('echoes.allCategories')}</option>
            {Object.values(RequestType).map(type => <option key={type} value={type}>{t(`requestTypes.${type}`)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div>
          <RequestCardSkeleton />
          <RequestCardSkeleton />
          <RequestCardSkeleton />
        </div>
      ) : (
        <div>
          {filteredRequests.map(request => <RequestCard key={request.id} request={request} />)}
        </div>
      )}

      {canCreateRequest && (
        <Link to="/echoes/new" className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6 bg-[#D4AF37] text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-110">
          <PlusCircle size={28} />
        </Link>
      )}
    </div>
  );
};

export default WallOfEchoes;
