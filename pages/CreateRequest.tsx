import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RequestType, RequestMode } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const { addRequest } = useData();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RequestType>(RequestType.Emotional);
  const [mode, setMode] = useState<RequestMode>(RequestMode.Loud);
  const [region, setRegion] = useState('');
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    addRequest({ title, description, type, mode, region }, user);
    navigate('/echoes');
  };

  const handleBackNavigation = () => {
    if (title.trim() || description.trim() || region.trim()) {
        setConfirmModalOpen(true);
    } else {
        navigate(-1);
    }
  };

  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <>
      <div className="p-4">
        <header className="flex items-center my-6">
          <button onClick={handleBackNavigation} className="p-2">
              <BackArrow size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mx-4">{t('createRequest.title')}</h1>
        </header>
        <p className="text-center text-md text-gray-500 mb-6">{t('createRequest.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createRequest.form.title')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createRequest.form.titlePlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createRequest.form.category')}</label>
            <select value={type} onChange={e => setType(e.target.value as RequestType)} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
              {Object.values(RequestType).map(t_val => <option key={t_val} value={t_val}>{t(`requestTypes.${t_val}`)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createRequest.form.region')}</label>
            <input type="text" value={region} onChange={e => setRegion(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createRequest.form.regionPlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createRequest.form.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createRequest.form.descriptionPlaceholder')}></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">{t('createRequest.form.mode')}</label>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <button type="button" onClick={() => setMode(RequestMode.Loud)} className={`flex-1 py-3 rounded-lg text-sm transition-colors ${mode === RequestMode.Loud ? 'bg-[#3A3A3A] text-white' : 'bg-white border'}`}>
                <p className="font-bold">{t('createRequest.form.modeLoud')}</p>
                <p className="text-xs px-2">{t('createRequest.form.modeLoudDesc')}</p>
              </button>
              <button type="button" onClick={() => setMode(RequestMode.Silent)} className={`flex-1 py-3 rounded-lg text-sm transition-colors ${mode === RequestMode.Silent ? 'bg-[#3A3A3A] text-white' : 'bg-white border'}`}>
                <p className="font-bold">{t('createRequest.form.modeSilent')}</p>
                <p className="text-xs px-2">{t('createRequest.form.modeSilentDesc')}</p>
              </button>
            </div>
          </div>

          <button type="submit" className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
            {t('createRequest.form.submit')}
          </button>
        </form>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => navigate(-1)}
        title={t('createRequest.discardTitle')}
        confirmText={t('createRequest.discardConfirm')}
        cancelText={t('createRequest.discardCancel')}
      >
        <p>{t('createRequest.discardBody')}</p>
      </ConfirmationModal>
    </>
  );
};

export default CreateRequest;