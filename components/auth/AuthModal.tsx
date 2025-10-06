import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import { useTranslation } from 'react-i18next';
import { Role } from '../../types';
import { RefreshCw } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, signup, signInWithGoogle, generateUniqueUsernames } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState<'login' | 'signup'>('login');
    
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [googleLoading, setGoogleLoading] = React.useState(false);

    // New state for signup
    const [generatedUsernames, setGeneratedUsernames] = React.useState<string[]>([]);
    const [selectedUsername, setSelectedUsername] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState<Role>(Role.Citizen);
    const [documents, setDocuments] = React.useState<File[]>([]);

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
            // Prepare document upload placeholders (client will upload files to storage in a later step)
            const result = await signup(selectedUsername, password.trim(), {
                role: selectedRole,
                submittedFiles: documents
            });
            if (result.success) {
                // If role requires admin approval, inform the user
                if (selectedRole === 'NGO' || selectedRole === 'PublicWorker') {
                    alert(t('auth.pendingApproval'));
                }
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

    const handleGoogleSignIn = async () => {
        setError('');
        setGoogleLoading(true);
        
        try {
            const result = await signInWithGoogle();
            if (result.success) {
                onClose();
                resetForm();
            } else {
                setError(result.message || 'Failed to sign in with Google');
            }
        } catch (error) {
            setError('An unexpected error occurred with Google sign-in');
        } finally {
            setGoogleLoading(false);
        }
    };
    
    const resetForm = () => {
        setUsername('');
        setPassword('');
        setError('');
        setSelectedUsername(null);
        setGeneratedUsernames([]);
        setLoading(false);
        setGoogleLoading(false);
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
                    <button type="submit" disabled={loading || googleLoading} className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                        {loading ? t('auth.loginLoading') : t('auth.login')}
                    </button>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">{t('auth.orDivider')}</span>
                        </div>
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={handleGoogleSignIn}
                        disabled={loading || googleLoading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {googleLoading ? t('auth.googleSignInLoading') : t('auth.googleSignIn')}
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
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">{t('auth.role')}</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setSelectedRole(Role.Citizen)} className={`px-3 py-2 rounded ${selectedRole === Role.Citizen ? 'bg-[#D4AF37] text-white' : 'bg-white border'}`}>Citizen</button>
                                <button type="button" onClick={() => setSelectedRole(Role.NGO)} className={`px-3 py-2 rounded ${selectedRole === Role.NGO ? 'bg-[#D4AF37] text-white' : 'bg-white border'}`}>NGO</button>
                                <button type="button" onClick={() => setSelectedRole(Role.PublicWorker)} className={`px-3 py-2 rounded ${selectedRole === Role.PublicWorker ? 'bg-[#D4AF37] text-white' : 'bg-white border'}`}>Public Worker</button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">{t('auth.uploadDocs')}</label>
                            <input type="file" multiple onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : [];
                                setDocuments(files);
                            }} className="w-full text-sm" />
                            {documents.length > 0 && <p className="text-xs text-gray-600 mt-1">{documents.length} {t('auth.documentsSelected')}</p>}
                        </div>
                    </div>
                    <InputField id="signup-password" label={t('auth.password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    <p className="text-xs text-gray-500 text-center pt-2">{t('auth.identityChoiceInfo')}</p>

                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button type="submit" disabled={loading || googleLoading || !selectedUsername} className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                        {loading ? t('auth.signupLoading') : t('auth.signup')}
                    </button>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">{t('auth.orDivider')}</span>
                        </div>
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={handleGoogleSignIn}
                        disabled={loading || googleLoading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {googleLoading ? t('auth.googleSignInLoading') : t('auth.googleSignIn')}
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