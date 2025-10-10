import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SymbolIcon from '../components/ui/SymbolIcon';
import ResponsiveLogo from '../components/ui/ResponsiveLogo';
import { MessageSquare, HeartHandshake, User, ArrowRight, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import { Input } from '../design-system/Input';
import Button from '../design-system/Button';
import { Role } from '../types';

const Onboarding: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const navigate = ReactRouterDOM.useNavigate();
  const [step, setStep] = React.useState(1);
  const [displayName, setDisplayName] = React.useState('');
  const [error, setError] = React.useState('');

  const handleNext = () => {
    setStep((prev: number) => prev + 1);
  };
  
  const handleBack = () => {
      setStep((prev: number) => prev - 1);
  };

  const handleNameSubmit = async () => {
    if (!displayName.trim()) {
      setError(t('onboarding.error.nameRequired'));
      return;
    }
    // Optional: Add username validation logic here (e.g., check for uniqueness)
    setError('');
    await handleComplete();
  };

  const handleComplete = async () => {
    if (!displayName) return;
    
    try {
      await updateUser({
        displayName: displayName,
        hasCompletedOnboarding: true,
      });
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    }
  };
  
  const StepWrapper: React.FC<{children: React.ReactNode}> = ({children}: {children: React.ReactNode}) => (
      <div className="w-full max-w-md text-center animate-fade-in-down space-y-6 flex flex-col items-center">
          {children}
      </div>
  );

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <StepWrapper>
            <ResponsiveLogo className="w-24 h-24 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-800">{t('onboarding.step1.title')}</h1>
            <p className="text-gray-600 px-4">{t('onboarding.step1.subtitle')}</p>
            <Button onClick={handleNext} className="w-full mt-6">
              {t('onboarding.buttons.begin')} <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
            </Button>
          </StepWrapper>
        );
      case 2:
        const isCitizen = user?.role === Role.Citizen;
        const nameLabel = isCitizen ? t('onboarding.usernameLabel') : t('onboarding.realNameLabel');
        const namePlaceholder = isCitizen ? t('onboarding.usernamePlaceholder') : t('onboarding.realNamePlaceholder');

        return (
          <StepWrapper>
            <User className="w-16 h-16 text-[#D4AF37]" />
            <h1 className="text-3xl font-bold text-gray-800">{t('onboarding.nameStep.title')}</h1>
            <p className="text-gray-600 px-4">{isCitizen ? t('onboarding.nameStep.subtitleCitizen') : t('onboarding.nameStep.subtitleOrg')}</p>
            <div className="w-full space-y-4 text-left">
              <Input
                id="displayName"
                label={nameLabel}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={namePlaceholder}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="w-full flex gap-4 pt-4">
              <Button onClick={handleBack} variant="outline" className="w-1/3 mt-6">
                <ArrowLeft className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('onboarding.buttons.back')}
              </Button>
              <Button onClick={handleNameSubmit} className="w-2/3 mt-6">
                {t('onboarding.buttons.complete')} <CheckCircle className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
              </Button>
            </div>
          </StepWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-4">
      <div className="relative flex-grow flex items-center justify-center w-full">
        {renderContent()}
      </div>
      <div className="flex-shrink-0 flex space-x-2 my-8">
        {Array.from({length: 2}).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${step === i + 1 ? 'bg-[#D4AF37] scale-125' : 'bg-gray-300'}`}></div>
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
