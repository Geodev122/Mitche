import React from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { PlusCircle, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommunityEvent, CommunityEventType, Role } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';

const EventCard: React.FC<{ event: CommunityEvent }> = ({ event }) => {
  const { t } = useTranslation();
  
  const typeStyles = {
    [CommunityEventType.Volunteer]: { text: t(`communityEventTypes.${CommunityEventType.Volunteer}`), classes: 'bg-green-100 text-green-700' },
    [CommunityEventType.Event]: { text: t(`communityEventTypes.${CommunityEventType.Event}`), classes: 'bg-purple-100 text-purple-700' },
  };
  const currentTypeStyle = typeStyles[event.type];

  return (
    <Card className="mb-4 transition-transform transform hover:scale-[1.02] relative">
      <div className="flex items-start">
        <div className="ml-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
          <div className="w-12 h-12 bg-[#F1EADF] rounded-full flex items-center justify-center">
            <SymbolIcon name={event.organizerSymbolicIcon} className="w-7 h-7 text-[#D4AF37]" />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800">{event.organizerSymbolicName}</h3>
            <span className="text-xs text-gray-400">{timeSince(event.timestamp, t)}</span>
          </div>
          <span className="text-sm font-semibold text-gray-500">{t(`roles.${event.organizerRole}`)} - {event.region}</span>
          <h4 className="font-bold text-lg text-gray-800 mt-2">{event.title}</h4>
          <p className="text-gray-600 mt-1 text-md">{event.description}</p>
        </div>
      </div>
      <div className={`absolute top-2 right-2 text-xs ${currentTypeStyle.classes} px-2 py-1 rounded-full font-semibold`}>
          {currentTypeStyle.text}
      </div>
    </Card>
  );
};

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const EventCardSkeleton: React.FC = () => (
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
        <Skeleton className="h-4 w-4/5 mt-2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  </Card>
);

const CommunityEvents: React.FC = () => {
  const { communityEvents, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();

  const canCreateEvent = user && [Role.NGO, Role.PublicWorker, Role.Admin].includes(user.role);

  return (
    <div className="p-4">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('events.title')}</h1>
        <p className="text-md text-gray-500 mt-1">{t('events.subtitle')}</p>
      </header>

      {loading ? (
        <div>
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : communityEvents.length > 0 ? (
        <div>
          {communityEvents.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <div className="text-center mt-20 text-gray-500">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p>{t('events.emptyTitle')}</p>
            <p className="text-sm">{t('events.emptySubtitle')}</p>
        </div>
      )}

      {canCreateEvent && (
        <Link to="/events/new" className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6 bg-[#D4AF37] text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-110">
          <PlusCircle size={28} />
        </Link>
      )}
    </div>
  );
};

export default CommunityEvents;
