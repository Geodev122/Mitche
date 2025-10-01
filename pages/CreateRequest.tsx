import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RequestType, RequestMode } from '../types';
import { ArrowRight, ArrowLeft, Eye, Shield } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const CreateRequest: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const { addRequest } = useData();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<RequestType>(RequestType.Emotional);
  const [mode, setMode] = React.useState<RequestMode>(RequestMode.Loud);
  const [region, setRegion] = React.useState('');
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);

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
      <div className="p-4 pb-32">
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
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode(RequestMode.Loud)} className={`p-4 rounded-lg text-center transition-all duration-200 border-2 ${mode === RequestMode.Loud ? 'bg-amber-50 border-[#D4AF37]' : 'bg-white border-gray-200'}`}>
                <Eye className={`w-6 h-6 mx-auto mb-2 ${mode === RequestMode.Loud ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                <p className="font-bold text-sm">{t('createRequest.form.modeLoud')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('createRequest.form.modeLoudDesc')}</p>
              </button>
              <button type="button" onClick={() => setMode(RequestMode.Silent)} className={`p-4 rounded-lg text-center transition-all duration-200 border-2 ${mode === RequestMode.Silent ? 'bg-amber-50 border-[#D4AF37]' : 'bg-white border-gray-200'}`}>
                <Shield className={`w-6 h-6 mx-auto mb-2 ${mode === RequestMode.Silent ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                <p className="font-bold text-sm">{t('createRequest.form.modeSilent')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('createRequest.form.modeSilentDesc')}</p>
              </button>
            </div>
          </div>

          <div className="fixed bottom-16 left-0 right-0 bg-[#FBF9F4]/80 backdrop-blur-sm p-4 border-t border-[#F1EADF]">
            <button type="submit" className="w-full bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
              {t('createRequest.form.submit')}
            </button>
          </div>
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
