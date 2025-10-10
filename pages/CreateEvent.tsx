import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CommunityEventType } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import PageContainer from '../components/layout/PageContainer';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import { Textarea } from '../design-system/Textarea';
import Button from '../design-system/Button';

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
    <PageContainer>
      <div className="pb-32">
        <header className="flex items-center my-6">
          <button onClick={handleBackNavigation} className="p-2">
              <BackArrow size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mx-4">{t('createEvent.title')}</h1>
        </header>
        <p className="text-center text-md text-gray-500 mb-6">{t('createEvent.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('createEvent.form.title')}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder={t('createEvent.form.titlePlaceholder')}
          />
          
          <Select
            label={t('createEvent.form.category')}
            value={type}
            onChange={e => setType(e.target.value as CommunityEventType)}
          >
            {Object.values(CommunityEventType).map(t_val => <option key={t_val} value={t_val}>{t(`communityEventTypes.${t_val}`)}</option>)}
          </Select>

          <Input
            label={t('createEvent.form.region')}
            value={region}
            onChange={e => setRegion(e.target.value)}
            required
            placeholder={t('createEvent.form.regionPlaceholder')}
          />
          
          <Textarea
            label={t('createEvent.form.description')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={5}
            placeholder={t('createEvent.form.descriptionPlaceholder')}
          />

          <div className="fixed bottom-4 left-0 right-0 bg-transparent p-4">
            <Button type="submit" className="w-full max-w-md mx-auto">
              {t('createEvent.form.submit')}
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

export default CreateEvent;