import React, { FC, useState } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { PlusCircle, MessageSquare } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { Request, RequestType, RequestStatus, Role, RequestMode } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';

const RequestCard: FC<{ request: Request }> = ({ request }) => {
  const { t } = useTranslation();

  const statusStyles: { [key in RequestStatus]: { text: string; classes: string } } = {
    [RequestStatus.Open]: { text: t(`requestStatus.${RequestStatus.Open}`), classes: 'bg-green-100 text-green-700' },
    [RequestStatus.Pending]: { text: t(`requestStatus.${RequestStatus.Pending}`), classes: 'bg-yellow-100 text-yellow-700' },
    [RequestStatus.Fulfilled]: { text: t(`requestStatus.${RequestStatus.Fulfilled}`), classes: 'bg-blue-100 text-blue-700' },
    [RequestStatus.Closed]: { text: t(`requestStatus.${RequestStatus.Closed}`), classes: 'bg-gray-100 text-gray-700' },
  };
  const currentStatus = statusStyles[request.status];

  return (
    <ReactRouterDOM.Link to={`/echoes/${request.id}`} className="block">
      <Card className="transition-transform transform active:scale-95 relative">
        <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-[#F1EADF] rounded-full flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
              <SymbolIcon name={request.userSymbolicIcon} className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-gray-800">{request.userSymbolicName}</h3>
              <span className="text-xs text-gray-400">{timeSince(request.timestamp, t)}</span>
            </div>
             {currentStatus && (
              <div className={`text-xs ${currentStatus.classes} px-2 py-1 rounded-full font-semibold`}>
                  {currentStatus.text}
              </div>
            )}
        </div>
        <h4 className="font-bold text-gray-800 text-lg my-1">{request.title}</h4>
        <div className="text-sm font-semibold text-[#D4AF37] mb-2">{t(`requestTypes.${request.type}`)} - {request.region}</div>
        <p className="text-gray-600 text-md line-clamp-2">{request.description}</p>
      </Card>
    </ReactRouterDOM.Link>
  );
};

const Skeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const RequestCardSkeleton: FC = () => (
  <Card className="mb-4">
    <div className="flex items-start">
      <div className="mr-4 rtl:ml-0 rtl:ml-4 flex-shrink-0">
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
      </div>
    </div>
  </Card>
);

const FilterChip: FC<{ label: string; value: any; currentFilter: any; setFilter: (value: any) => void; }> = 
({ label, value, currentFilter, setFilter }) => (
  <button
    onClick={() => setFilter(value)}
    className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors whitespace-nowrap ${
      currentFilter === value
        ? 'bg-[#3A3A3A] text-white border-transparent'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);


const WallOfEchoes: FC = () => {
  const { requests, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<RequestType | 'All'>('All');

  const visibleRequests = user?.role === Role.Citizen
    ? requests.filter(req => req.mode === RequestMode.Loud)
    : requests;

  const filteredRequests = visibleRequests.filter(req => filter === 'All' || req.type === filter);
  
  const canCreateRequest = user?.role === Role.Citizen;

  return (
    <div className="p-4 pb-24">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('echoes.title')}</h1>
        <p className="text-md text-gray-500 mt-1">{t('echoes.subtitle')}</p>
      </header>

      <div className="mb-4">
          <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 -mx-4 px-4">
              <FilterChip label={t('echoes.allCategories')} value="All" currentFilter={filter} setFilter={setFilter} />
              {Object.values(RequestType).map(type => (
                <FilterChip key={type} label={t(`requestTypes.${type}`)} value={type} currentFilter={filter} setFilter={setFilter} />
              ))}
          </div>
      </div>


      {loading ? (
        <div className="space-y-4">
          <RequestCardSkeleton />
          <RequestCardSkeleton />
          <RequestCardSkeleton />
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map(request => <RequestCard key={request.id} request={request} />)}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-semibold">{t('echoes.emptyTitle')}</p>
            <p className="text-sm">{t('echoes.emptySubtitle')}</p>
        </div>
      )}

      {canCreateRequest && (
        <ReactRouterDOM.Link to="/echoes/new" className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6 bg-[#D4AF37] text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-110 active:scale-100">
          <PlusCircle size={28} />
        </ReactRouterDOM.Link>
      )}
    </div>
  );
};

export default WallOfEchoes;