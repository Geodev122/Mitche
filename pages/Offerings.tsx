import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Offerings: React.FC = () => {
  const { offerings } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const userOfferings = offerings.filter(o => o.userId === user?.id);

  return (
    <div className="p-4">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('offerings.title')}</h1>
        <p className="text-md text-gray-500 mt-1">{t('offerings.subtitle')}</p>
      </header>
      
      {userOfferings.length > 0 ? (
        userOfferings.map(offering => (
          <Card key={offering.id} className="mb-4">
             <div className="flex items-center">
                <Heart className="w-6 h-6 text-red-400 ml-3 rtl:ml-0 rtl:mr-3" />
                <div>
                    <p className="font-semibold text-gray-700">{t('offerings.responseTo', { id: offering.requestId.slice(-4) })}</p>
                    <p className="text-sm text-gray-500">{offering.message}</p>
                    <p className="text-xs text-right mt-2 text-green-600 font-bold">{t('offerings.hopePoints', {points: offering.pointsEarned })}</p>
                </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center mt-20 text-gray-500">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p>{t('offerings.emptyTitle')}</p>
            <p className="text-sm">{t('offerings.emptySubtitle')}</p>
        </div>
      )}
    </div>
  );
};

export default Offerings;