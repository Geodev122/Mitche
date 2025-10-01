import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ResourceCategory } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const CreateResource: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const { addResource } = useData();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<ResourceCategory>(ResourceCategory.Food);
  const [region, setRegion] = React.useState('');
  const [schedule, setSchedule] = React.useState('');
  const [contactInfo, setContactInfo] = React.useState('');
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    addResource({ title, description, category, region, schedule, contactInfo }, user);
    navigate('/resources');
  };

  const handleBackNavigation = () => {
    if (title.trim() || description.trim() || region.trim() || schedule.trim() || contactInfo.trim()) {
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
          <h1 className="text-2xl font-bold text-gray-800 mx-4">{t('createResource.title')}</h1>
        </header>
        <p className="text-center text-md text-gray-500 mb-6">{t('createResource.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createResource.form.title')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createResource.form.titlePlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createResource.form.category')}</label>
            <select value={category} onChange={e => setCategory(e.target.value as ResourceCategory)} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
              {Object.values(ResourceCategory).map(c_val => <option key={c_val} value={c_val}>{t(`resourceCategories.${c_val}`)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createResource.form.region')}</label>
            <input type="text" value={region} onChange={e => setRegion(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createResource.form.regionPlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createResource.form.schedule')}</label>
            <input type="text" value={schedule} onChange={e => setSchedule(e.target.value)} required className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createResource.form.schedulePlaceholder')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createResource.form.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createResource.form.descriptionPlaceholder')}></textarea>
          </div>
          
           <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('createResource.form.contact')}</label>
            <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" placeholder={t('createResource.form.contactPlaceholder')} />
          </div>

          <div className="fixed bottom-16 left-0 right-0 bg-[#FBF9F4]/80 backdrop-blur-sm p-4 border-t border-[#F1EADF]">
            <button type="submit" className="w-full bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
              {t('createResource.form.submit')}
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

export default CreateResource;