import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RequestType, RequestMode } from '../types';
import { ArrowRight, ArrowLeft, Eye, Shield } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import { Textarea } from '../design-system/Textarea';
import Button from '../design-system/Button';
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
    <PageContainer>
      <div className="pb-32">
        <header className="flex items-center my-6">
          <button onClick={handleBackNavigation} className="p-2">
              <BackArrow size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mx-4">{t('createRequest.title')}</h1>
        </header>
        <p className="text-center text-md text-gray-500 mb-6">{t('createRequest.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('createRequest.form.title')}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder={t('createRequest.form.titlePlaceholder')}
          />
          
          <Select
            label={t('createRequest.form.category')}
            value={type}
            onChange={e => setType(e.target.value as RequestType)}
          >
            {Object.values(RequestType).map(t_val => <option key={t_val} value={t_val}>{t(`requestTypes.${t_val}`)}</option>)}
          </Select>

          <Input
            label={t('createRequest.form.region')}
            value={region}
            onChange={e => setRegion(e.target.value)}
            required
            placeholder={t('createRequest.form.regionPlaceholder')}
          />
          
          <Textarea
            label={t('createRequest.form.description')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={5}
            placeholder={t('createRequest.form.descriptionPlaceholder')}
          />
          
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

          <div className="fixed bottom-4 left-0 right-0 bg-transparent p-4">
            <Button type="submit" className="w-full max-w-md mx-auto">{t('createRequest.form.submit')}</Button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => navigate(-1)}
        title={t('createRequest.confirm.title')}
      >
        <p>{t('createRequest.confirm.message')}</p>
      </ConfirmationModal>
    </PageContainer>
  );
};

export default CreateRequest;