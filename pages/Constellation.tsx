import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import SymbolIcon from '../components/ui/SymbolIcon';
import { Award, ShieldCheck, LogOut, Download } from 'lucide-react';
import { HopePointCategory, Role } from '../types';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const roleTranslation: { [key in Role]: string } = {
    [Role.Citizen]: 'مواطن',
    [Role.NGO]: 'منظمة غير حكومية',
    [Role.PublicWorker]: 'عامل في القطاع العام',
    [Role.Admin]: 'مدير',
};

const BarChart: React.FC<{ data: ChartData[]; max: number }> = ({ data, max }) => {
  return (
    <div className="w-full space-y-2">
      {data.map(item => (
        <div key={item.label} className="flex items-center">
          <div className="w-1/3 text-xs text-gray-500">{item.label}</div>
          <div className="w-2/3 bg-gray-200 rounded-full h-4">
            <div
              className={`${item.color} h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold`}
              style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }}
              title={`${item.value} points`}
            >
              {item.value > 0 ? item.value : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


const Constellation: React.FC = () => {
  const { user, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  if (!user) return null;

  const breakdown = user.hopePointsBreakdown || {};
  const chartData: ChartData[] = [
    { label: HopePointCategory.CommunityBuilder, value: breakdown[HopePointCategory.CommunityBuilder] || 0, color: 'bg-emerald-400' },
    { label: HopePointCategory.SilentHero, value: breakdown[HopePointCategory.SilentHero] || 0, color: 'bg-sky-400' },
    { label: HopePointCategory.VoiceOfCompassion, value: breakdown[HopePointCategory.VoiceOfCompassion] || 0, color: 'bg-amber-400' },
  ];

  const maxPoints = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="p-4">
      <header className="text-center my-6">
        <div className="w-24 h-24 bg-white border-2 border-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <SymbolIcon name={user.symbolicIcon} className="w-12 h-12 text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">{user.symbolicName}</h1>
        <p className="text-sm bg-gray-100 text-gray-600 font-semibold inline-block px-3 py-1 rounded-full mt-2">{roleTranslation[user.role]}</p>
        <p className="text-md text-gray-500 mt-2">نجم في كوكبة الأمل</p>
      </header>
      
      <Card className="text-center mb-6">
        <p className="text-sm text-gray-500">مجموع نقاط الأمل</p>
        <p className="text-5xl font-bold text-[#D4AF37] my-2">{user.hopePoints}</p>
        <p className="text-xs text-gray-400">"كل نقطة هي شهادة على نورك"</p>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">تفصيل نقاط الأمل</h2>
        <div className="space-y-4">
          <BarChart data={chartData} max={maxPoints} />
          <ul className="text-sm text-gray-600 pt-4 border-t border-gray-100">
             {chartData.map(item => (
                <li key={item.label} className="flex justify-between items-center py-1">
                    <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full ${item.color} ml-2`}></span>
                        <span>{item.label}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                </li>
             ))}
          </ul>
        </div>
      </Card>
      
      <div className="space-y-2 text-sm">
        {deferredPrompt && (
          <button onClick={handleInstallClick} className="w-full flex items-center justify-center py-3 px-4 bg-green-50 border rounded-lg text-green-700 font-semibold">
              <Download className="w-5 h-5 ml-2" /> تثبيت التطبيق
          </button>
        )}
        <button className="w-full flex items-center justify-center py-3 px-4 bg-white border rounded-lg text-gray-700">
            <Award className="w-5 h-5 ml-2" /> ترشيحات الجوائز
        </button>
        <button className="w-full flex items-center justify-center py-3 px-4 bg-white border rounded-lg text-gray-700">
            <ShieldCheck className="w-5 h-5 ml-2" /> إعدادات الخصوصية
        </button>
        <button onClick={logout} className="w-full flex items-center justify-center py-3 px-4 bg-red-50 border rounded-lg text-red-600">
            <LogOut className="w-5 h-5 ml-2" /> تسجيل الخروج
        </button>
      </div>

    </div>
  );
};

export default Constellation;