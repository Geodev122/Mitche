import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import SymbolIcon from '../components/ui/SymbolIcon';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';
import { RatingSystem } from '../components/rating/RatingSystem';
import { doc as docRef, getDoc } from 'firebase/firestore';
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
  const { enhancedFirebase } = useAuth();
  const { t } = useTranslation();
  const [resource, setResource] = React.useState<any | null>(null);
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (!resource) return <div className="p-4">Resource not found</div>;

  return (
    <div className="p-4 pb-24">
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#F1EADF] rounded-full flex items-center justify-center">
            <SymbolIcon name={resource.organizerSymbolicIcon} className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{resource.title}</h1>
              {resource.organizerIsVerified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="text-sm text-gray-500">{resource.region} • {timeSince(resource.timestamp, t)}</div>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{resource.description}</p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">{t('resources.details')}</h3>
              <p className="text-gray-600">{resource.schedule}</p>
              {resource.contactInfo && <p className="text-gray-600 mt-2">{resource.contactInfo}</p>}
            </div>

            <div className="mt-6">
              <RatingSystem
                targetId={resource.id}
                targetType="offering"
                targetName={resource.title}
                currentRating={resource.rating}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResourceDetail;
