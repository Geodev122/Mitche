import * as React from 'react';
import { useData } from '../context/DataContext';
import { PlusCircle, MessageSquare, Star } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { Request, RequestType, RequestStatus, Role, RequestMode } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';
import { useRatingModal } from '../context/RatingModalContext';
import { Skeleton } from '../components/ui/Skeleton';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/ui/PageHeader';
import Button from '../design-system/Button';
import Card from '../components/ui/Card';

const RequestCard: React.FC<{ request: Request }> = ({ request }) => {
  const { t } = useTranslation();
  const { enhancedFirebase } = useAuth();
  const { openRatingModal } = useRatingModal();

  const statusStyles: { [key in RequestStatus]: { text: string; classes: string } } = {
    [RequestStatus.Open]: { text: t(`requestStatus.${RequestStatus.Open}`), classes: 'bg-green-100 text-green-700' },
    [RequestStatus.Pending]: { text: t(`requestStatus.${RequestStatus.Pending}`), classes: 'bg-yellow-100 text-yellow-700' },
    [RequestStatus.Fulfilled]: { text: t(`requestStatus.${RequestStatus.Fulfilled}`), classes: 'bg-blue-100 text-blue-700' },
    [RequestStatus.Closed]: { text: t(`requestStatus.${RequestStatus.Closed}`), classes: 'bg-gray-100 text-gray-700' },
  };
  const currentStatus = statusStyles[request.status];

  return (
    <ReactRouterDOM.Link to={`/echoes/${request.id}`} className="block">
      <Card className="transition-transform transform active:scale-95 relative p-4">
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
        
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {request.rating && (
            <div className="flex items-center gap-1 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{request.rating.average ? request.rating.average.toFixed(1) : '-'}</span>
              <span className="text-xs text-gray-400">({request.rating.count || 0})</span>
            </div>
          )}
          <div className="p-1 rounded-full hover:bg-gray-100">
            <Star
              className="w-5 h-5 text-amber-400 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openRatingModal({ id: request.id, type: 'request', name: request.title });
              }}
            />
          </div>
        </div>
      </Card>
    </ReactRouterDOM.Link>
  );
};

const RequestCardSkeleton: React.FC = () => (
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

const FilterChip: React.FC<{ label: string; value: any; currentFilter: any; setFilter: (value: any) => void; }> = 
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


const WallOfEchoes: React.FC = () => {
  const { requests, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<RequestType | 'All'>('All');

  const visibleRequests = user?.role === Role.Citizen
    ? requests.filter(req => req.mode === RequestMode.Loud)
    : requests;

  const filteredRequests = requests.filter(r => r.mode === 'Loud');

    return (
        <PageContainer>
            <PageHeader
                icon={MessageSquare}
                title={t('echoes.title')}
                subtitle={t('echoes.subtitle')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && Array.from({ length: 6 }).map((_, i) => <RequestCardSkeleton key={i} />)}
                {!loading && filteredRequests.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-500">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="font-semibold">{t('echoes.emptyTitle')}</p>
                        <p className="text-sm">{t('echoes.emptySubtitle')}</p>
                    </div>
                )}
                {!loading && filteredRequests.map(request => <RequestCard key={request.id} request={request} />)}
            </div>

            {user?.role === Role.Citizen && (
                <ReactRouterDOM.Link to="/echoes/new" className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6">
                    <Button size="lg" className="shadow-lg">
                        <PlusCircle size={20} className="mr-2" /> {t('echoes.create')}
                    </Button>
                </ReactRouterDOM.Link>
            )}
        </PageContainer>
    );
};

export default WallOfEchoes;