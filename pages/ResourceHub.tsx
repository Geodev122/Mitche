import * as React from 'react';
import { useData } from '../context/DataContext';
import { PlusCircle, PackageSearch, ShieldCheck, Star } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { Resource, ResourceCategory, Role } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';
import { useRatingModal } from '../context/RatingModalContext';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';
import { Skeleton } from '../components/ui/Skeleton';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/ui/PageHeader';
import Button from '../design-system/Button';
import Card from '../components/ui/Card';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const { t } = useTranslation();
  const { openRatingModal } = useRatingModal();

  return (
    <ReactRouterDOM.Link to={`/resources/${resource.id}`} className="block">
      <Card className="mb-4 transition-transform transform hover:scale-[1.02] relative p-4">
        <div className="flex items-start">
          <div className="mr-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
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
            <p className="text-gray-600 mt-1 text-md line-clamp-3">{resource.description}</p>

            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
              <div className="font-semibold text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded-md">{t(`resourceCategories.${resource.category}`)}</div>
              <p className="text-gray-600 font-medium">{resource.schedule}</p>
              {resource.contactInfo && <p className="text-gray-500">{resource.contactInfo}</p>}
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-2">
            {resource.rating && (
              <div className="flex items-center gap-1 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">{resource.rating.average ? resource.rating.average.toFixed(1) : '-'}</span>
                <span className="text-xs text-gray-400">({resource.rating.count || 0})</span>
              </div>
            )}
        </div>
        <div className="absolute bottom-2 right-2 p-1 rounded-full hover:bg-gray-100">
            <Star
              className="w-5 h-5 text-amber-400 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openRatingModal({ id: resource.id, type: 'resource', name: resource.title });
              }}
            />
        </div>
      </Card>
    </ReactRouterDOM.Link>
  );
};

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

  const filteredResources = filter === 'All' ? resources : resources.filter(r => r.category === filter);

  const canCreateResource = user && user.isVerified && [Role.NGO, Role.PublicWorker, Role.Admin].includes(user.role);

  return (
    <PageContainer>
      <PageHeader
        icon={PackageSearch}
        title={t('resourceHub.title')}
        subtitle={t('resourceHub.subtitle')}
      />
      <div className="mb-4">
          <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 -mx-4 px-4">
              <FilterChip label={t('echoes.allCategories')} value="All" currentFilter={filter} setFilter={setFilter} />
              {Object.values(ResourceCategory).map(type => (
                <FilterChip key={type} label={t(`resourceCategories.${type}`)} value={type} currentFilter={filter} setFilter={setFilter} />
              ))}
          </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="mt-6 space-y-4">
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
        <ReactRouterDOM.Link to="/resources/new" className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6">
          <Button size="lg" className="shadow-lg">
            <PlusCircle size={20} className="mr-2" /> {t('resources.create')}
          </Button>
        </ReactRouterDOM.Link>
      )}
    </PageContainer>
  );
};

export default ResourceHub;