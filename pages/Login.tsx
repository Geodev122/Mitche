
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import SymbolIcon from '../components/ui/SymbolIcon';

const symbolicNames = ["حامل_الأمل", "صوت_النور", "يد_العون", "نجمة_الصباح", "قلب_شجاع"];
const symbolicIcons = ["Star", "Lantern", "Flower"];

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const [idNumber, setIdNumber] = useState('');
  const [selectedName, setSelectedName] = useState(symbolicNames[0]);
  const [selectedIcon, setSelectedIcon] = useState(symbolicIcons[0]);
  const [step, setStep] = useState(1);

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for demonstration
    if (idNumber.length > 5) {
      setStep(2);
    } else {
      alert("الرجاء إدخال رقم هوية صالح.");
    }
  };
  
  const handleFinalSubmit = () => {
    login(idNumber, selectedName, selectedIcon);
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F4] p-4 text-center">
      <h1 className="text-4xl font-bold text-[#3A3A3A] mb-2">ادخل الملاذ</h1>
      <p className="text-[#7F7B74] mb-8">حيث كل صوت يجد صدى، وكل يد تجد من يمسك بها</p>

      {step === 1 && (
        <form onSubmit={handleIdSubmit} className="w-full max-w-sm">
          <p className="mb-4 text-sm text-[#7F7B74]">
            يُستخدم رقم الهوية للتحقق فقط ولن يتم عرضه أو تخزينه أبداً. خصوصيتك هي أمانة.
          </p>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="أدخل رقم هويتك اللبنانية"
            className="w-full px-4 py-3 bg-white border border-[#EAE2D6] rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
          <button type="submit" className="w-full mt-4 bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-[#5c5c5c] transition-colors">
            تأكيد الهوية
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm animate-fade-in">
          <h2 className="text-2xl font-semibold mb-4">اختر هويتك الرمزية</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#7F7B74] mb-2">اختر اسماً رمزياً</label>
            <select value={selectedName} onChange={e => setSelectedName(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                {symbolicNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="mb-8">
             <label className="block text-sm font-medium text-[#7F7B74] mb-2">اختر أيقونة رمزية</label>
             <div className="flex justify-center space-x-4">
                {symbolicIcons.map(icon => (
                    <button key={icon} onClick={() => setSelectedIcon(icon)} className={`p-4 rounded-full transition-all duration-300 ${selectedIcon === icon ? 'bg-[#D4AF37] text-white' : 'bg-white border border-[#EAE2D6]'}`}>
                        <SymbolIcon name={icon} className="w-8 h-8"/>
                    </button>
                ))}
             </div>
          </div>
          
          <button onClick={handleFinalSubmit} className="w-full mt-4 bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-[#5c5c5c] transition-colors">
            دخول Sanctuary
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
