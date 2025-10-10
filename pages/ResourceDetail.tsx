import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import SymbolIcon from '../components/ui/SymbolIcon';
import { ShieldCheck, ArrowLeft, ArrowRight, Clock, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';
import { RatingSystem } from '../components/rating/RatingSystem';
import { doc as docRef, getDoc } from 'firebase/firestore';
import PageContainer from '../components/layout/PageContainer';
import { Resource } from '../types';

let _db_lazy_res: any = null;
async function getDbRes() {
  if (_db_lazy_res) return _db_lazy_res;
  const m = await import('../services/firebase');
  _db_lazy_res = m.db;
  return _db_lazy_res;
}

const ResourceDetail: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { resources } = useData();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [resource, setResource] = React.useState<Resource | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const local = resources.find(r => r.id === resourceId);
    if (local) {
      setResource(local);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        if (!resourceId) {
          if (mounted) setResource(null);
          return;
        }
        const dbInst = await getDbRes();
        const snap = await getDoc(docRef(dbInst, 'resources', resourceId));
        if (mounted) {
          if (snap.exists()) setResource({ id: snap.id, ...(snap.data() as any) });
          else setResource(null);
        }
      } catch (e) {
        console.error('Failed to load resource', e);
        if (mounted) setResource(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [resourceId, resources]);

  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;

  if (loading) return <div className="p-4 text-center">{t('common.loading')}</div>;
  if (!resource) return <div className="p-4 text-center">{t('resources.notFound')}</div>;

  return (
    <PageContainer>
      <header className="flex items-center my-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <BackArrow size={24} className="text-gray-700" />
        </button>
        <div className="w-10 h-10 bg-[#F1EADF] rounded-full flex items-center justify-center ml-2">
          <SymbolIcon name={resource.organizerSymbolicIcon} className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-gray-800 truncate">{resource.title}</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{resource.organizerSymbolicName}</span>
            {resource.organizerIsVerified && <ShieldCheck className="w-3 h-3 text-blue-500" />}
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-semibold text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded-md">
            {t(`resourceCategories.${resource.category}`)}
          </div>
          <p className="text-xs text-gray-400">{timeSince(resource.timestamp, t)}</p>
        </div>
        
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{resource.description}</p>

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-500 text-sm">{t('resources.region')}</p>
              <p className="text-gray-800">{resource.region}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="w-4 h-4 text-gray-400 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-500 text-sm">{t('resources.schedule')}</p>
              <p className="text-gray-800">{resource.schedule}</p>
            </div>
          </div>
          {resource.contactInfo && (
            <div className="flex items-start">
              <Phone className="w-4 h-4 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="font-semibold text-gray-500 text-sm">{t('resources.contact')}</p>
                <p className="text-gray-800">{resource.contactInfo}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">{t('rating.title')}</h2>
        <RatingSystem
          targetId={resource.id}
          targetType="resource"
          targetName={resource.title}
          currentRating={resource.rating}
        />
      </div>
    </PageContainer>
  );
};

export default ResourceDetail;
