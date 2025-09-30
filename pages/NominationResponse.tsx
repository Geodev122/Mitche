import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { Shield, UserCheck, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NominationResponse: React.FC = () => {
  const { user } = useAuth();
  const { acceptNomination } = useData();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1); // 1: Choice, 2: Reveal Confirm, 3: Reveal Form, 4: Anonymous Confirm, 5: Finished
  const [realName, setRealName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  
  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;

  if (!user || (!user.nominationStatus && !isFinished)) {
    return (
      <div className="p-6 text-center">
        <p>{t('nomination.noNomination')}</p>
      </div>
    );
  }
   if (user.nominationStatus !== 'Nominated' && !isFinished) {
    // User already responded
    navigate('/tapestry');
    return null;
  }
  
  const handleFinalAnonymous = () => {
    acceptNomination(user.id, 'Anonymous');
    setIsFinished(true);
    setStep(5);
  };

  const handleRevealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realName) {
        // Simple validation, can be improved
        return;
    }
    const photoUrl = photo ? URL.createObjectURL(photo) : undefined;
    acceptNomination(user.id, 'Reveal', { realName, photoUrl });
    setIsFinished(true);
    setStep(5);
  };

  const renderStep = () => {
    switch(step) {
      case 1: // Initial Choice
        return (
          <Card className="text-center animate-fade-in-down">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('nomination.title')}</h1>
            <p className="text-gray-600 mb-6">{t('nomination.subtitle')}</p>
            <div className="space-y-4">
              <button onClick={() => setStep(2)} className="w-full flex items-center justify-center py-3 px-4 bg-white border border-yellow-500 rounded-lg text-yellow-600 font-semibold hover:bg-yellow-50">
                  <UserCheck className="w-5 h-5 mx-2" /> {t('nomination.revealIdentity')}
              </button>
              <button onClick={() => setStep(4)} className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Shield className="w-5 h-5 mx-2" /> {t('nomination.stayAnonymous')}
              </button>
            </div>
          </Card>
        );

      case 2: // Reveal Confirmation
        return (
            <Card className="text-center animate-fade-in-down">
                <UserCheck className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-3">{t('nomination.confirmRevealTitle')}</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    {t('nomination.confirmRevealBody')}
                </p>
                <div className="space-y-3">
                    <button onClick={() => setStep(3)} className="w-full py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600">
                        {t('nomination.confirmRevealButton')}
                    </button>
                    <button onClick={() => setStep(1)} className="w-full py-2 text-gray-600 text-sm hover:underline">
                        {t('nomination.back')}
                    </button>
                </div>
            </Card>
        );

      case 3: // Reveal Form
        return (
          <Card className="animate-fade-in-down relative">
             <button onClick={() => setStep(2)} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-gray-800">
                 <BackArrow size={20} />
             </button>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">{t('nomination.revealFormTitle')}</h2>
            <form onSubmit={handleRevealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('nomination.realName')}</label>
                <input type="text" value={realName} onChange={e => setRealName(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('nomination.realNamePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('nomination.photo')}</label>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/>
              </div>
              <button type="submit" className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90">
                  {t('nomination.confirmAndContinue')}
              </button>
            </form>
          </Card>
        );
        
      case 4: // Anonymous Confirmation
        return (
            <Card className="text-center animate-fade-in-down">
                <Shield className="w-12 h-12 mx-auto text-sky-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-3">{t('nomination.confirmAnonymousTitle')}</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    {t('nomination.confirmAnonymousBody')}
                </p>
                <div className="space-y-3">
                    <button onClick={handleFinalAnonymous} className="w-full py-3 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600">
                        {t('nomination.confirmAnonymousButton')}
                    </button>
                    <button onClick={() => setStep(1)} className="w-full py-2 text-gray-600 text-sm hover:underline">
                        {t('nomination.back')}
                    </button>
                </div>
            </Card>
        );

      case 5: // Finished
        return (
          <Card className="text-center animate-fade-in-down">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('nomination.finishedTitle')}</h1>
              <p className="text-gray-600 mb-6">{t('nomination.finishedSubtitle')}</p>
              <button onClick={() => navigate('/tapestry')} className="w-full mt-4 bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-[#5c5c5c]">
                  {t('nomination.viewTapestry')}
              </button>
          </Card>
        );

      default:
        return null;
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto mt-8 pb-24">
      {renderStep()}
    </div>
  );
};

export default NominationResponse;