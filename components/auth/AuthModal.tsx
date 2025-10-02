import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, signup, generateUniqueUsernames } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState<'login' | 'signup'>('login');
    
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // New state for signup
    const [generatedUsernames, setGeneratedUsernames] = React.useState<string[]>([]);
    const [selectedUsername, setSelectedUsername] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleGenerateUsernames = React.useCallback(() => {
        setIsGenerating(true);
        setSelectedUsername(null);
        setTimeout(() => {
            const names = generateUniqueUsernames();
            setGeneratedUsernames(names);
            setIsGenerating(false);
        }, 300);
    }, [generateUniqueUsernames]);

    React.useEffect(() => {
        if (activeTab === 'signup' && generatedUsernames.length === 0) {
            handleGenerateUsernames();
        }
    }, [activeTab, generatedUsernames.length, handleGenerateUsernames]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }
        
        if (!password.trim()) {
            setError(t('auth.errorPassword'));
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            const result = await login(username.trim(), password.trim());
            if (result.success) {
                onClose();
                resetForm();
            } else {
                setError(result.message || t('auth.errorInvalid'));
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedUsername) {
            setError(t('auth.errorUsernameNotSelected'));
            return;
        }
        
        if (!password.trim()) {
            setError(t('auth.errorPassword'));
            return;
        }
        
        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            const result = await signup(selectedUsername, password.trim());
            if (result.success) {
                onClose();
                resetForm();
            } else {
                setError(result.message || t('auth.errorExists'));
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setUsername('');
        setPassword('');
        setError('');
        setSelectedUsername(null);
        setGeneratedUsernames([]);
        setLoading(false);
    };
    
    const switchTab = (tab: 'login' | 'signup') => {
        setActiveTab(tab);
        resetForm();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('auth.modalTitle')}>
            <div className="flex border-b mb-6">
                <button
                    onClick={() => switchTab('login')}
                    className={`flex-1 py-2 font-semibold transition-colors duration-300 ${activeTab === 'login' ? 'border-b-2 border-[#D4AF37] text-[#3A3A3A]' : 'text-gray-400 hover:text-[#3A3A3A]'}`}
                >
                    {t('auth.login')}
                </button>
                <button
                    onClick={() => switchTab('signup')}
                    className={`flex-1 py-2 font-semibold transition-colors duration-300 ${activeTab === 'signup' ? 'border-b-2 border-[#D4AF37] text-[#3A3A3A]' : 'text-gray-400 hover:text-[#3A3A3A]'}`}
                >
                    {t('auth.signup')}
                </button>
            </div>

            {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                    <InputField id="login-username" label={t('auth.username')} type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                    <InputField id="login-password" label={t('auth.password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    {error && <p className="text-red-500 text-xs text-right">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                        {loading ? t('auth.loginLoading') : t('auth.login')}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-600">{t('auth.chooseUsername')}</label>
                            <button type="button" onClick={handleGenerateUsernames} className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1" disabled={isGenerating}>
                                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                {t('auth.refreshUsernames')}
                            </button>
                        </div>
                        {isGenerating ? (
                            <div className="text-center p-8 text-gray-500">
                                <p>{t('auth.generatingUsernames')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {generatedUsernames.map(name => (
                                    <button
                                        type="button"
                                        key={name}
                                        onClick={() => setSelectedUsername(name)}
                                        className={`w-full text-left p-3 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                                            selectedUsername === name
                                                ? 'bg-amber-50 border-[#D4AF37] text-gray-800 ring-2 ring-[#D4AF37]'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <InputField id="signup-password" label={t('auth.password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    <p className="text-xs text-gray-500 text-center pt-2">{t('auth.identityChoiceInfo')}</p>

                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button type="submit" disabled={loading || !selectedUsername} className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                        {loading ? t('auth.signupLoading') : t('auth.signup')}
                    </button>
                </form>
            )}
        </Modal>
    );
};

const InputField: React.FC<{id: string, label: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean}> = 
({id, label, type, value, onChange, required}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input id={id} type={type} value={value} onChange={onChange} required={required}
            className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
    </div>
);

export default AuthModal;