import * as React from 'react';
import { useAuth } from '../context/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Shield } from 'lucide-react';
import Button from '../design-system/Button';
import AuthModal from '../components/auth/AuthModal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import ResponsiveLogo from '../components/ui/ResponsiveLogo';

const Login: React.FC = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const { t } = useTranslation();

    if (user) {
        return <ReactRouterDOM.Navigate to="/" />;
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-[#FBF9F4] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-full max-w-5xl flex justify-end p-4">
                    <LanguageSwitcher />
                </div>
                <ResponsiveLogo className="w-40 h-40 mx-auto mb-4 animate-fade-in-down" />
                <h1 className="text-3xl font-bold text-[#3A3A3A]">{t('login.welcome')}</h1>
                <p className="text-gray-500 text-lg mt-2 mb-8">{t('appSlogan')}</p>

                <div className="max-w-2xl w-full bg-amber-50/50 border border-amber-200/60 rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                        <div className="flex-shrink-0 pt-1 mx-auto sm:mx-0">
                            <Shield className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-amber-800">{t('login.safeHavenTitle')}</h2>
                            <p className="text-sm text-amber-700 mt-2 text-start" style={{ lineHeight: '1.7' }}>
                                {t('login.safeHavenDesc')}
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full max-w-sm text-lg"
                >
                    {t('login.startJourney')}
                </Button>
                
                 <p className="text-xs text-gray-400 mt-8 text-center max-w-sm">
                    {t('login.agreement')}
                </p>
            </div>
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Login;