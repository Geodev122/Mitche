import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CommunityEventType } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const CreateEvent: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const { addCommunityEvent } = useData();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<CommunityEventType>(CommunityEventType.Volunteer);
  const [region, setRegion] = React.useState('');
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    addCommunityEvent({ title, description, type, region }, user);
    navigate('/events');
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
          <h1 className="text-2xl font-bold text-gray-800 mx-4">{t('createEvent.title')}</h1>
        </header>
        <p className="text-center text-md text-gray-500 mb-6">{t('createEvent.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createEvent.form.title')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createEvent.form.titlePlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createEvent.form.category')}</label>
            <select value={type} onChange={e => setType(e.target.value as CommunityEventType)} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
              {Object.values(CommunityEventType).map(t_val => <option key={t_val} value={t_val}>{t(`communityEventTypes.${t_val}`)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createEvent.form.region')}</label>
            <input type="text" value={region} onChange={e => setRegion(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createEvent.form.regionPlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createEvent.form.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createEvent.form.descriptionPlaceholder')}></textarea>
          </div>

          <div className="fixed bottom-16 left-0 right-0 bg-[#FBF9F4]/80 backdrop-blur-sm p-4 border-t border-[#F1EADF]">
            <button type="submit" className="w-full bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
              {t('createEvent.form.submit')}
            </button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => navigate(-1)}
        title={t('createEvent.discardTitle')}
        confirmText={t('createEvent.discardConfirm')}
        cancelText={t('createEvent.discardCancel')}
      >
        <p>{t('createEvent.discardBody')}</p>
      </ConfirmationModal>
    </>
  );
};

export default CreateEvent;
