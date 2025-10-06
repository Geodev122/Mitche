import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ResponsiveLogo from '../../components/ui/ResponsiveLogo';
import { Bell, PlusSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white p-4">
      <header className="flex items-center justify-between">
        <ResponsiveLogo className="w-12 h-12" />
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md bg-[#FBF9F4]"><Bell className="w-5 h-5" /></button>
          <button className="p-2 rounded-md bg-[#D4AF37] text-white"><PlusSquare className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="mt-6">
        <h2 className="text-xl font-bold">{t('dashboard.welcome', { name: user?.symbolicName || '' })}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('dashboard.mobileIntro')}</p>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#FBF9F4] rounded-lg">{t('dashboard.quickActions')}</div>
          <div className="p-3 bg-[#FBF9F4] rounded-lg">{t('dashboard.recent')}</div>
        </section>
      </main>
    </div>
  );
};

export default MobileDashboard;
