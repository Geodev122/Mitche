import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ResourceCategory } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import PageContainer from '../components/layout/PageContainer';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import { Textarea } from '../design-system/Textarea';
import Button from '../design-system/Button';

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
    <PageContainer>
      <div className="pb-32">
        <header className="flex items-center my-6">
          <button onClick={handleBackNavigation} className="p-2">
              <BackArrow size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mx-4">{t('createResource.title')}</h1>
        </header>
        <p className="text-center text-md text-gray-500 mb-6">{t('createResource.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('createResource.form.title')}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder={t('createResource.form.titlePlaceholder')}
          />
          
          <Select
            label={t('createResource.form.category')}
            value={category}
            onChange={e => setCategory(e.target.value as ResourceCategory)}
          >
            {Object.values(ResourceCategory).map(c_val => <option key={c_val} value={c_val}>{t(`resourceCategories.${c_val}`)}</option>)}
          </Select>

          <Input
            label={t('createResource.form.region')}
            value={region}
            onChange={e => setRegion(e.target.value)}
            required
            placeholder={t('createResource.form.regionPlaceholder')}
          />
          
          <Input
            label={t('createResource.form.schedule')}
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
            required
            placeholder={t('createResource.form.schedulePlaceholder')}
          />

          <Textarea
            label={t('createResource.form.description')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            placeholder={t('createResource.form.descriptionPlaceholder')}
          />
          
          <Input
            label={t('createResource.form.contact')}
            value={contactInfo}
            onChange={e => setContactInfo(e.target.value)}
            placeholder={t('createResource.form.contactPlaceholder')}
          />

          <div className="fixed bottom-4 left-0 right-0 bg-transparent p-4">
            <Button type="submit" className="w-full max-w-md mx-auto">
              {t('createResource.form.submit')}
            </Button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => navigate(-1)}
        title={t('createEvent.discardTitle')}
        message={t('createEvent.discardBody')}
        confirmText={t('createEvent.discardConfirm')}
        cancelText={t('createEvent.discardCancel')}
      />
    </PageContainer>
  );
};

export default CreateResource;