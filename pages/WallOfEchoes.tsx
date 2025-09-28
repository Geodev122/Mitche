import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { PlusCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Request, RequestType, RequestStatus } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';

const RequestCard: React.FC<{ request: Request }> = ({ request }) => {
  const { addOffering, fulfillRequest } = useData();
  const { user } = useAuth();

  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval > 1) return `منذ ${Math.floor(interval)} دقيقة`;
    return `منذ ${Math.floor(seconds)} ثانية`;
  };

  const handleHelp = () => {
    if (!user || user.id === request.userId) return;
    
    const offering = {
      requestId: request.id,
      type: 'Help' as 'Help',
      message: `${user.symbolicName} is offering help.`,
      pointsEarned: 10,
    };
    addOffering(offering, user.id);
    fulfillRequest(request.id, user.id);
    alert('شكراً لمساعدتك! تم إرسال إشعار لصاحب الطلب.');
  };

  const handleEncourage = () => {
    if (!user || user.id === request.userId) return;
    
    const offering = {
        requestId: request.id,
        type: 'Encouragement' as 'Encouragement',
        message: `رسالة تشجيع من ${user.symbolicName}`,
        pointsEarned: 3,
    };
    addOffering(offering, user.id);
    alert('تم إرسال رسالة التشجيع!');
  }

  const statusStyles: { [key in RequestStatus]: { text: string; classes: string } } = {
    [RequestStatus.Open]: { text: 'مفتوح', classes: 'bg-green-100 text-green-700' },
    [RequestStatus.Pending]: { text: 'قيد المراجعة', classes: 'bg-yellow-100 text-yellow-700' },
    [RequestStatus.Fulfilled]: { text: 'تمت المساعدة', classes: 'bg-blue-100 text-blue-700' },
    [RequestStatus.Closed]: { text: 'مغلق', classes: 'bg-gray-100 text-gray-700' },
  };
  const currentStatus = statusStyles[request.status];

  return (
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
            <span className="text-xs text-gray-400">{timeSince(request.timestamp)}</span>
          </div>
          <span className="text-sm font-semibold text-[#D4AF37]">{request.type} - {request.region}</span>
          <p className="text-gray-600 mt-2 text-md">{request.description}</p>
          {request.status === RequestStatus.Open && (
            <div className="mt-4 flex space-x-2 rtl:space-x-reverse">
              <button onClick={handleHelp} className="px-4 py-2 text-sm bg-[#3A3A3A] text-white rounded-full hover:bg-opacity-80">تقديم مساعدة</button>
              <button onClick={handleEncourage} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">إرسال تشجيع</button>
            </div>
           )}
        </div>
      </div>
       {currentStatus && (
        <div className={`absolute top-2 right-2 text-xs ${currentStatus.classes} px-2 py-1 rounded-full font-semibold`}>
            {currentStatus.text}
        </div>
       )}
    </Card>
  );
};

const WallOfEchoes: React.FC = () => {
  const { requests, loading } = useData();
  const [filter, setFilter] = useState<RequestType | 'All'>('All');

  const filteredRequests = requests.filter(req => filter === 'All' || req.type === filter);

  return (
    <div className="p-4">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">جدار الصدى</h1>
        <p className="text-md text-gray-500 mt-1">هنا ترتفع الأصوات وتتلاقى الأيادي</p>
      </header>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse bg-white p-1 rounded-full border border-[#F1EADF]">
          <Filter className="w-5 h-5 text-gray-500 mx-2" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as RequestType | 'All')}
            className="bg-transparent focus:outline-none text-sm text-gray-600 py-1"
          >
            <option value="All">كل الفئات</option>
            {Object.values(RequestType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">جاري تحميل الأصداء...</p>
      ) : (
        <div>
          {filteredRequests.map(request => <RequestCard key={request.id} request={request} />)}
        </div>
      )}

      <Link to="/echoes/new" className="fixed bottom-24 right-6 bg-[#D4AF37] text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-110">
        <PlusCircle size={28} />
      </Link>
    </div>
  );
};

export default WallOfEchoes;