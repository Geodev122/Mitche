import React from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { PlusCircle, PackageSearch, ShieldCheck, Star } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { Resource, ResourceCategory, Role } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';
import { useRatingModal } from '../context/RatingModalContext';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const { t } = useTranslation();
  const { enhancedFirebase } = useAuth();
  const { openRatingModal } = useRatingModal();

  React.useEffect(() => {
    enhancedFirebase?.recordAnalytics?.('card_impression', { targetType: 'resource', targetId: resource.id });
  }, [resource.id, enhancedFirebase]);

  return (
    <ReactRouterDOM.Link to={`/resources/${resource.id}`} className="block">
      <Card className="mb-4 transition-transform transform hover:scale-[1.02] relative">
        <div className="flex items-start">
          <div className="ml-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
            <div className="w-12 h-12 bg-[#F1EADF] rounded-full flex items-center justify-center">
              <SymbolIcon name={resource.organizerSymbolicIcon} className="w-7 h-7 text-[#D4AF37]" />
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">{resource.organizerSymbolicName}</h3>
                {resource.organizerIsVerified && <ShieldCheck className="w-4 h-4 text-blue-500" aria-label={t('verifiedOrg') as string} />}
              </div>
              <span className="text-xs text-gray-400">{timeSince(resource.timestamp, t)}</span>
            </div>
            <span className="text-sm font-semibold text-gray-500">{resource.region}</span>
            <h4 className="font-bold text-lg text-gray-800 mt-2">{resource.title}</h4>
            <p className="text-gray-600 mt-1 text-md whitespace-pre-wrap">{resource.description}</p>

            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
              <div className="font-semibold text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded-md">{t(`resourceCategories.${resource.category}`)}</div>
              <p className="text-gray-600 font-medium">{resource.schedule}</p>
              {resource.contactInfo && <p className="text-gray-500">{resource.contactInfo}</p>}
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              {resource.rating && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">{resource.rating.average ? resource.rating.average.toFixed(1) : '-'}</span>
                  <span className="text-xs text-gray-400">({resource.rating.count || 0})</span>
                </div>
              )}
              <div className="p-1 rounded-full hover:bg-gray-100">
                <Star
                  className="w-5 h-5 text-amber-400 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openRatingModal({ id: resource.id, type: 'offering', name: resource.title });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </ReactRouterDOM.Link>
  );
};

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const ResourceCardSkeleton: React.FC = () => (
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


const ResourceHub: React.FC = () => {
  const { resources, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<ResourceCategory | 'All'>('All');

  const filteredResources = resources.filter(res => filter === 'All' || res.category === filter);
  
  const canCreateResource = user && user.isVerified && [Role.NGO, Role.PublicWorker, Role.Admin].includes(user.role);

  return (
    <div className="p-4 pb-24">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('resources.title')}</h1>
        <p className="text-md text-gray-500 mt-1">{t('resources.subtitle')}</p>
      </header>

      <div className="mb-4">
          <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 -mx-4 px-4">
              <FilterChip label={t('echoes.allCategories')} value="All" currentFilter={filter} setFilter={setFilter} />
              {Object.values(ResourceCategory).map(type => (
                <FilterChip key={type} label={t(`resourceCategories.${type}`)} value={type} currentFilter={filter} setFilter={setFilter} />
              ))}
          </div>
      </div>

      {loading ? (
        <div>
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
        </div>
      ) : filteredResources.length > 0 ? (
        <div>
          {filteredResources.map(resource => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
            <PackageSearch size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-semibold">{t('resources.emptyTitle')}</p>
            <p className="text-sm">{t('resources.emptySubtitle')}</p>
        </div>
      )}

      {canCreateResource && (
        <ReactRouterDOM.Link to="/resources/new" className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6 bg-[#D4AF37] text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-110">
          <PlusCircle size={28} />
        </ReactRouterDOM.Link>
      )}
    </div>
  );
};

export default ResourceHub;