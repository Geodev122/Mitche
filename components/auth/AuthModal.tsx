import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import SymbolIcon from '../ui/SymbolIcon';
import { useTranslation } from 'react-i18next';

const symbolicNameKeys = ["hopeBearer", "voiceOfLight", "helpingHand", "morningStar", "braveHeart"];
const symbolicIcons = ["Star", "Lantern", "Flower"];

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, signup } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [symbolicName, setSymbolicName] = useState('');
    const [symbolicIcon, setSymbolicIcon] = useState(symbolicIcons[0]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        if (result.success) {
            onClose();
        } else {
            setError(t('auth.errorInvalid'));
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (symbolicName.trim() === '') {
            setError(t('auth.errorSymbolicName'));
            return;
        }
        setError('');
        setLoading(true);
        const result = await signup(username, password, symbolicName, symbolicIcon);
        setLoading(false);
        if (result.success) {
            onClose();
        } else {
            setError(t('auth.errorExists'));
        }
    };
    
    const resetForm = () => {
        setUsername('');
        setPassword('');
        setSymbolicName('');
        setSymbolicIcon(symbolicIcons[0]);
        setError('');
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
                    <InputField id="signup-username" label={t('auth.username')} type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                    <InputField id="signup-password" label={t('auth.password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-[#EAE2D6]">
                        <label className="block text-sm font-medium text-gray-600 mb-2">{t('auth.chooseSymbolicIdentity')}</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <select value={symbolicName} onChange={e => setSymbolicName(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                                    <option value="" disabled>{t('auth.selectName')}</option>
                                    {symbolicNameKeys.map(nameKey => <option key={nameKey} value={t(`auth.symbolicNames.${nameKey}`)}>{t(`auth.symbolicNames.${nameKey}`)}</option>)}
                                </select>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="flex justify-around gap-2">
                                    {symbolicIcons.map(icon => (
                                        <button type="button" key={icon} onClick={() => setSymbolicIcon(icon)}
                                            className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${symbolicIcon === icon ? 'bg-[#D4AF37] text-white ring-2 ring-offset-2 ring-[#D4AF37]' : 'text-gray-500 bg-white hover:bg-gray-100 border'}`}>
                                            <SymbolIcon name={icon} className="w-7 h-7"/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
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
