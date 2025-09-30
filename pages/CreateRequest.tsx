
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RequestType, RequestMode } from '../types';
import { ArrowRight } from 'lucide-react';

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const { addRequest } = useData();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RequestType>(RequestType.Emotional);
  const [mode, setMode] = useState<RequestMode>(RequestMode.Loud);
  const [region, setRegion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    addRequest({ title, description, type, mode, region }, user);
    navigate('/echoes');
  };

  return (
    <div className="p-4">
      <header className="flex items-center my-6">
        <button onClick={() => navigate(-1)} className="p-2">
            <ArrowRight size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mr-4">اطلق نداءك</h1>
      </header>
      <p className="text-center text-md text-gray-500 mb-6">كل طلب هو بذرة أمل. صف ما تحتاجه بصدق.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">عنوان الطلب</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder="مثال: بحاجة إلى دعم نفسي" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">فئة الطلب</label>
          <select value={type} onChange={e => setType(e.target.value as RequestType)} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
            {Object.values(RequestType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">المنطقة</label>
          <input type="text" value={region} onChange={e => setRegion(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder="مثال: بيروت" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">وصف الطلب</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder="اشرح طلبك بالتفصيل..."></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">نوع الطلب</label>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <button type="button" onClick={() => setMode(RequestMode.Loud)} className={`flex-1 py-3 rounded-lg text-sm transition-colors ${mode === RequestMode.Loud ? 'bg-[#3A3A3A] text-white' : 'bg-white border'}`}>
              <p className="font-bold">طلب عالي (علني)</p>
              <p className="text-xs px-2">يظهر على جدار الصدى للجميع</p>
            </button>
            <button type="button" onClick={() => setMode(RequestMode.Silent)} className={`flex-1 py-3 rounded-lg text-sm transition-colors ${mode === RequestMode.Silent ? 'bg-[#3A3A3A] text-white' : 'bg-white border'}`}>
              <p className="font-bold">طلب صامت (خاص)</p>
              <p className="text-xs px-2">يُرسل فقط للمنظمات والجهات المعنية</p>
            </button>
          </div>
        </div>

        <button type="submit" className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
          إرسال الطلب
        </button>
      </form>
    </div>
  );
};

export default CreateRequest;