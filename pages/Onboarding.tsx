import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SymbolIcon from '../components/ui/SymbolIcon';
import { MessageSquare, HeartHandshake, User, ArrowRight, CheckCircle, ArrowLeft, Shield } from 'lucide-react';

const symbolicNameKeys = ["hopeBearer", "voiceOfLight", "helpingHand", "morningStar", "braveHeart"];
const symbolicIcons = ["Star", "Lantern", "Flower"];

const Onboarding: React.FC = () => {
  const { updateUser } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = React.useState(1);
  const [symbolicName, setSymbolicName] = React.useState('');
  const [symbolicIcon, setSymbolicIcon] = React.useState(symbolicIcons[0]);
  const [error, setError] = React.useState('');

  const handleNext = () => {
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
      setStep(prev => prev - 1);
  };

  const handleIdentitySubmit = () => {
    if (!symbolicName) {
      setError(t('auth.errorSymbolicName'));
      return;
    }
    setError('');
    handleNext();
  };

  const handleComplete = () => {
    if (!symbolicName || !symbolicIcon) return;
    updateUser({
      symbolicName,
      symbolicIcon,
      hasCompletedOnboarding: true,
    });
    // The App.tsx router will automatically handle the redirect
  };
  
  const StepWrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
      <div className="w-full max-w-md text-center animate-fade-in-down space-y-6 flex flex-col items-center">
          {children}
      </div>
  );

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <StepWrapper>
            <img src="/awardlogo.png" alt="Mitché Logo" className="w-24 h-24 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-800">{t('onboarding.step1.title')}</h1>
            <p className="text-gray-600 px-4">{t('onboarding.step1.subtitle')}</p>
            <button onClick={handleNext} className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center justify-center">
              {t('onboarding.buttons.begin')} <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
            </button>
          </StepWrapper>
        );
      case 2:
         return (
             <StepWrapper>
                 <div className="relative w-40 h-40 flex items-center justify-center">
                     <div className="absolute w-full h-full rounded-full bg-amber-500/10 animate-ping-slow"></div>
                     <div className="absolute w-2/3 h-2/3 rounded-full bg-amber-500/20 animate-ping-slow-delay"></div>
                     <MessageSquare className="w-16 h-16 text-[#D4AF37]" />
                 </div>
                 <h1 className="text-3xl font-bold text-gray-800 pt-4">{t('onboarding.step2.title')}</h1>
                 <p className="text-gray-600 px-4">{t('onboarding.step2.description')}</p>
                 <div className="w-full flex gap-4 pt-4">
                     <button onClick={handleBack} className="w-1/3 mt-6 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center">
                         <ArrowLeft className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('onboarding.buttons.back')}
                     </button>
                     <button onClick={handleNext} className="w-2/3 mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center justify-center">
                         {t('onboarding.buttons.next')} <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                     </button>
                 </div>
             </StepWrapper>
         );
      case 3:
         return (
             <StepWrapper>
                  <div className="relative w-40 h-40 flex items-center justify-center">
                      <HeartHandshake className="w-20 h-20 text-[#D4AF37] animate-pulse-glow" />
                  </div>
                 <h1 className="text-3xl font-bold text-gray-800 pt-4">{t('onboarding.step3.title')}</h1>
                 <p className="text-gray-600 px-4">{t('onboarding.step3.description')}</p>
                  <div className="w-full flex gap-4 pt-4">
                     <button onClick={handleBack} className="w-1/3 mt-6 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center">
                         <ArrowLeft className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('onboarding.buttons.back')}
                     </button>
                     <button onClick={handleNext} className="w-2/3 mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center justify-center">
                         {t('onboarding.buttons.next')} <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                     </button>
                 </div>
             </StepWrapper>
         );
      case 4:
          return (
             <StepWrapper>
                  <div className="relative w-40 h-40 flex items-center justify-center">
                     <User className="w-20 h-20 text-gray-400" />
                     <Shield className="w-24 h-24 text-[#D4AF37] absolute opacity-70" />
                  </div>
                 <h1 className="text-3xl font-bold text-gray-800 pt-4">{t('onboarding.step4.title')}</h1>
                 <p className="text-gray-600 px-4">{t('onboarding.step4.description')}</p>
                 <div className="w-full flex gap-4 pt-4">
                     <button onClick={handleBack} className="w-1/3 mt-6 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center">
                         <ArrowLeft className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('onboarding.buttons.back')}
                     </button>
                     <button onClick={handleNext} className="w-2/3 mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center justify-center">
                         {t('onboarding.buttons.createIdentity')} <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                     </button>
                 </div>
             </StepWrapper>
         );
      case 5:
        return (
          <StepWrapper>
            <h1 className="text-3xl font-bold text-gray-800">{t('onboarding.step5.title')}</h1>
            <p className="text-gray-600">{t('onboarding.step5.subtitle')}</p>
            <div className="bg-white p-4 rounded-lg border border-[#EAE2D6] space-y-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.step5.chooseName')}</label>
                <select value={symbolicName} onChange={e => setSymbolicName(e.target.value)} required className="w-full px-4 py-3 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                  <option value="" disabled>{t('auth.selectName')}</option>
                  {symbolicNameKeys.map(nameKey => <option key={nameKey} value={t(`auth.symbolicNames.${nameKey}`)}>{t(`auth.symbolicNames.${nameKey}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t('onboarding.step5.chooseIcon')}</label>
                <div className="flex justify-center gap-4">
                  {symbolicIcons.map(icon => (
                    <button type="button" key={icon} onClick={() => setSymbolicIcon(icon)} className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${symbolicIcon === icon ? 'bg-[#D4AF37] text-white ring-2 ring-offset-2 ring-[#D4AF37]' : 'text-gray-500 bg-gray-100 hover:bg-gray-200 border'}`}>
                      <SymbolIcon name={icon} className="w-8 h-8"/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="w-full flex gap-4">
              <button onClick={handleBack} className="w-1/3 mt-6 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('onboarding.buttons.back')}
              </button>
              <button onClick={handleIdentitySubmit} className="w-2/3 mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center justify-center">
                {t('onboarding.buttons.next')} <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
              </button>
            </div>
          </StepWrapper>
        );
      case 6:
        return (
          <StepWrapper>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-800">{t('onboarding.step6.title')}</h1>
            <p className="text-gray-600">{t('onboarding.step6.subtitle')}</p>
            <div className="bg-white rounded-xl p-6 border-2 border-dashed border-amber-300 w-full">
              <div className="w-20 h-20 bg-[#FBF9F4] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-200">
                <SymbolIcon name={symbolicIcon} className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{symbolicName}</p>
            </div>
            <div className="w-full flex gap-4">
                <button onClick={handleBack} className="w-1/3 mt-6 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('onboarding.buttons.back')}
                </button>
                <button onClick={handleComplete} className="w-2/3 mt-6 bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-opacity-90">
                    {t('onboarding.buttons.complete')}
                </button>
            </div>
          </StepWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <style>{`
      @keyframes ping-slow {
        75%, 100% {
          transform: scale(1.8);
          opacity: 0;
        }
      }
      .animate-ping-slow {
        animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
      .animate-ping-slow-delay {
         animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s;
      }
    `}</style>
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-4">
      <div className="relative flex-grow flex items-center justify-center w-full">
        {renderContent()}
      </div>
      <div className="flex-shrink-0 flex space-x-2 my-8">
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${step === i + 1 ? 'bg-[#D4AF37] scale-125' : 'bg-gray-300'}`}></div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Onboarding;