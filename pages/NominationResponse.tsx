import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { Shield, UserCheck, CheckCircle, ArrowRight } from 'lucide-react';

const NominationResponse: React.FC = () => {
  const { user } = useAuth();
  const { acceptNomination } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Choice, 2: Reveal Confirm, 3: Reveal Form, 4: Anonymous Confirm, 5: Finished
  const [realName, setRealName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  if (!user || (!user.nominationStatus && !isFinished)) {
    return (
      <div className="p-6 text-center">
        <p>لا يوجد ترشيح نشط.</p>
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
        alert("الرجاء إدخال اسمك الحقيقي.");
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">لقد وصل نورك إلى المعبد</h1>
            <p className="text-gray-600 mb-6">تم ترشيحك لجائزة حامل الأمل. هل تود أن تخطو إلى الأمام، أم تبقى نجماً صامتاً؟</p>
            <div className="space-y-4">
              <button onClick={() => setStep(2)} className="w-full flex items-center justify-center py-3 px-4 bg-white border border-yellow-500 rounded-lg text-yellow-600 font-semibold hover:bg-yellow-50">
                  <UserCheck className="w-5 h-5 ml-2" /> كشف الهوية
              </button>
              <button onClick={() => setStep(4)} className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Shield className="w-5 h-5 ml-2" /> البقاء مجهولاً
              </button>
            </div>
          </Card>
        );

      case 2: // Reveal Confirmation
        return (
            <Card className="text-center animate-fade-in-down">
                <UserCheck className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-3">تأكيد كشف الهوية</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    باختيارك كشف هويتك، سيتم عرض اسمك الحقيقي وصورتك بشكل علني على خيط قصتك في "نسيج الأمل". هذا العمل القوي يربط وجهاً بالأمل الذي ألهمته، مما يسمح للمجتمع برؤية الشخص خلف الاسم الرمزي والاحتفاء به. هل أنت مستعد للخطو نحو النور؟
                </p>
                <div className="space-y-3">
                    <button onClick={() => setStep(3)} className="w-full py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600">
                        نعم، أؤكد الكشف
                    </button>
                    <button onClick={() => setStep(1)} className="w-full py-2 text-gray-600 text-sm hover:underline">
                        العودة
                    </button>
                </div>
            </Card>
        );

      case 3: // Reveal Form
        return (
          <Card className="animate-fade-in-down">
             <button onClick={() => setStep(2)} className="mb-4 text-gray-500 hover:text-gray-800 flex items-center">
                 <ArrowRight size={20} />
                <span className="mr-2">العودة</span>
             </button>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">الكشف عن هويتك</h2>
            <form onSubmit={handleRevealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">الاسم الحقيقي</label>
                <input type="text" value={realName} onChange={e => setRealName(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder="اسمك الذي سيظهر في الاحتفال" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">صورة شخصية (اختياري)</label>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/>
              </div>
              <button type="submit" className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90">
                  تأكيد ومتابعة
              </button>
            </form>
          </Card>
        );
        
      case 4: // Anonymous Confirmation
        return (
            <Card className="text-center animate-fade-in-down">
                <Shield className="w-12 h-12 mx-auto text-sky-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-3">تأكيد البقاء مجهولاً</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    باختيارك البقاء مجهولاً، سيستمر اسمك وأيقونتك الرمزية في تمثيلك في "نسيج الأمل". ستلهم قصتك الآخرين بينما تظل هويتك سراً ثميناً. هل هذا هو طريقك المختار؟
                </p>
                <div className="space-y-3">
                    <button onClick={handleFinalAnonymous} className="w-full py-3 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600">
                        نعم، أؤكد إخفاء الهوية
                    </button>
                    <button onClick={() => setStep(1)} className="w-full py-2 text-gray-600 text-sm hover:underline">
                        العودة
                    </button>
                </div>
            </Card>
        );

      case 5: // Finished
        return (
          <Card className="text-center animate-fade-in-down">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">سواء كان اسمك معروفاً أم لا، فإن إرثك خالد.</h1>
              <p className="text-gray-600 mb-6">سيتم تكريم اختيارك بكل تبجيل واحترام.</p>
              <button onClick={() => navigate('/tapestry')} className="w-full mt-4 bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-[#5c5c5c]">
                  شاهد نسيج الأمل
              </button>
          </Card>
        );

      default:
        return null;
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto mt-8">
      {renderStep()}
    </div>
  );
};

export default NominationResponse;
