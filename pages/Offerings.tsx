
import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { Heart } from 'lucide-react';

const Offerings: React.FC = () => {
  const { offerings } = useData();
  const { user } = useAuth();
  
  const userOfferings = offerings.filter(o => o.userId === user?.id);

  return (
    <div className="p-4">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">عطاياك</h1>
        <p className="text-md text-gray-500 mt-1">كل عطاء هو ضوء يضاف إلى كوكبة الأمل</p>
      </header>
      
      {userOfferings.length > 0 ? (
        userOfferings.map(offering => (
          <Card key={offering.id} className="mb-4">
             <div className="flex items-center">
                <Heart className="w-6 h-6 text-red-400 ml-3" />
                <div>
                    <p className="font-semibold text-gray-700">استجابة لطلب #{offering.requestId.slice(-4)}</p>
                    <p className="text-sm text-gray-500">{offering.message}</p>
                    <p className="text-xs text-right mt-2 text-green-600 font-bold">+{offering.pointsEarned} نقاط أمل</p>
                </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center mt-20 text-gray-500">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p>لم تقم بأي عطاء بعد.</p>
            <p className="text-sm">استجب لنداء على جدار الصدى لتبدأ رحلتك.</p>
        </div>
      )}
    </div>
  );
};

export default Offerings;
