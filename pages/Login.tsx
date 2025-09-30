import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';

const Login: React.FC = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (user) {
        return <Navigate to="/" />;
    }

    return (
        <>
            <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-4 text-center">
                <img src="/awardlogo.png" alt="Mitché Logo" className="w-40 h-40 mx-auto mb-4 animate-fade-in-down" />
                <h1 className="text-3xl font-bold text-[#3A3A3A]">مرحباً بك في Mitché</h1>
                <p className="text-gray-500 text-lg mt-2 mb-8">حيث يتردد صدى الأمل</p>

                <div className="max-w-2xl w-full bg-amber-50/50 border border-amber-200/60 rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                        <div className="flex-shrink-0 pt-1 mx-auto sm:mx-0">
                            <Shield className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-amber-800">ملاذك الآمن</h2>
                            <p className="text-sm text-amber-700 mt-2" style={{ lineHeight: '1.7' }}>
                                Mitché هو ملاذ آمن لتقديم وتلقي المساعدة مع الحفاظ على سرية الهوية. هنا، طلبات المساعدة هي 'أصداء'، وعروض الدعم هي 'عطايا'. هويتك محمية، مما يسمح للكرامة والرحمة بالازدهار.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full max-w-sm bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors text-lg shadow-md"
                >
                    ابدأ رحلتك
                </button>
                
                 <p className="text-xs text-gray-400 mt-8 text-center max-w-sm">
                    بالدخول، أنت توافق على مبدأ السرية والاحترام المتبادل الذي تقوم عليه منصتنا.
                </p>
            </div>
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Login;