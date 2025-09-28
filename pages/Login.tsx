import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import SymbolIcon from '../components/ui/SymbolIcon';

const symbolicNames = ["حامل_الأمل", "صوت_النور", "يد_العون", "نجمة_الصباح", "قلب_شجاع"];
const symbolicIcons = ["Star", "Lantern", "Flower"];

const loginTabs = [
    { id: 'id', label: 'دخول بالهوية' },
    { id: 'phone', label: 'دخول برقم الهاتف' },
];

const Login: React.FC = () => {
    const { user, login } = useAuth();
    
    const [loginMethod, setLoginMethod] = useState<'id' | 'phone'>('id');
    const [idNumber, setIdNumber] = useState('');
    const [idError, setIdError] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    
    const [symbolicName, setSymbolicName] = useState('');
    const [symbolicIcon, setSymbolicIcon] = useState(symbolicIcons[0]);

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setIdNumber(value);
        if (value && !/^\d+$/.test(value)) {
            setIdError('الرجاء إدخال أرقام فقط.');
        } else {
            setIdError('');
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhoneNumber(value);
        // Basic validation for a phone number format
        if (value && !/^\+?\d{7,}$/.test(value)) {
            setPhoneError('صيغة رقم الهاتف غير صالحة.');
        } else {
            setPhoneError('');
        }
    };

    const handleSendCode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (phoneNumber && !phoneError) {
            setCodeSent(true);
            // In a real app, an API call would be made here.
            // For testing, we are bypassing the code verification.
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (symbolicName.trim() === '') {
            alert('الرجاء اختيار اسم رمزي.');
            return;
        }

        if (loginMethod === 'id') {
            if (idNumber.trim() !== '' && !idError) {
                login(idNumber, symbolicName, symbolicIcon);
            }
        } else { // phone
            if (phoneNumber.trim() !== '' && !phoneError) {
                if (!codeSent) {
                    alert('الرجاء الضغط على "إرسال" لتفعيل رقمك أولاً.');
                    return;
                }
                // Verification code check is depreciated for testing purposes.
                login(phoneNumber, symbolicName, symbolicIcon);
            } else {
                 alert('الرجاء إكمال جميع الحقول المطلوبة.');
            }
        }
    };

    if (user) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <img src="/awardlogo.png" alt="Mitché Logo" className="w-40 h-40 mx-auto mb-4 animate-fade-in-down" />
                <h1 className="text-3xl font-bold text-[#3A3A3A]">مرحباً بك في Mitché</h1>
                <p className="text-gray-600 mt-2 mb-8">حيث يتردد صدى الأمل</p>
            </div>
            <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-lg border border-[#F1EADF]">
                <div className="flex border-b mb-6">
                    {loginTabs.map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setLoginMethod(tab.id as 'id' | 'phone')} 
                            className={`flex-1 py-2 font-semibold transition-colors duration-300 ${loginMethod === tab.id ? 'border-b-2 border-[#D4AF37] text-[#3A3A3A]' : 'text-gray-400 hover:text-[#3A3A3A]'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {loginMethod === 'id' ? (
                        <div>
                            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-600 mb-2 text-right">الرقم الوطني أو رقم التسجيل</label>
                            <input 
                                id="idNumber"
                                type="text" 
                                value={idNumber} 
                                onChange={handleIdChange} 
                                required 
                                className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-1 text-right ${idError ? 'border-red-400 ring-red-400' : 'border-[#EAE2D6] focus:ring-[#D4AF37]'}`} 
                                placeholder="e.g., 1234567890" />
                            {idError && <p className="text-red-500 text-xs mt-1 text-right">{idError}</p>}
                        </div>
                    ) : (
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600 mb-2 text-right">رقم الهاتف (واتساب)</label>
                                <div className="flex gap-2">
                                    <input 
                                        id="phoneNumber"
                                        type="tel" 
                                        value={phoneNumber} 
                                        onChange={handlePhoneChange} 
                                        required 
                                        disabled={codeSent}
                                        className={`flex-grow w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-1 text-right ${phoneError ? 'border-red-400 ring-red-400' : 'border-[#EAE2D6] focus:ring-[#D4AF37]'}`} 
                                        placeholder="e.g., +96170123456" />
                                    <button 
                                        onClick={handleSendCode} 
                                        disabled={codeSent || !!phoneError || !phoneNumber}
                                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        {codeSent ? 'أُرسل' : 'إرسال'}
                                    </button>
                                </div>
                                {phoneError && <p className="text-red-500 text-xs mt-1 text-right">{phoneError}</p>}
                            </div>
                            {codeSent && (
                                <p className="text-green-600 text-xs mt-1 text-right animate-fade-in-down">
                                    تم تفعيل الرقم. يمكنك المتابعة لتسجيل الدخول.
                                </p>
                            )}
                        </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-[#EAE2D6]">
                        <label className="block text-sm font-medium text-gray-600 mb-2 text-right">اختر هويتك الرمزية</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <select 
                                    value={symbolicName} 
                                    onChange={e => setSymbolicName(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-right"
                                >
                                    <option value="" disabled>-- اختر اسماً --</option>
                                    {symbolicNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="flex justify-around gap-2">
                                    {symbolicIcons.map(icon => (
                                        <button 
                                            type="button" 
                                            key={icon} 
                                            onClick={() => setSymbolicIcon(icon)}
                                            className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${symbolicIcon === icon ? 'bg-[#D4AF37] text-white ring-2 ring-offset-2 ring-[#D4AF37]' : 'text-gray-500 bg-white hover:bg-gray-100 border'}`}
                                            aria-label={`Select ${icon} icon`}
                                            title={`أيقونة ${icon}`}
                                        >
                                            <SymbolIcon name={icon} className="w-7 h-7"/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
                        دخول إلى الملاذ
                    </button>
                </form>
            </div>
             <p className="text-xs text-gray-400 mt-8 text-center">
                هويتك الحقيقية محمية. اسمك وأيقونتك الرمزية هما واجهتك في هذا المكان الآمن.
            </p>
        </div>
    );
};

export default Login;