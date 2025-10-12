import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SymbolIcon from '../components/ui/SymbolIcon';
import { Request, RequestStatus, Offering, Role, CommendationType } from '../types';
import { timeSince } from '../utils/time';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Info, Heart, Tag, Shield, ShieldCheck, Award } from 'lucide-react';
import CommendationModal from '../components/ui/CommendationModal';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/Toast';
import PageContainer from '../components/layout/PageContainer';
import Button from '../design-system/Button';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { Textarea } from '../design-system/Textarea';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import Modal from '../design-system/Modal';
import { TapestryThreadColor, TapestryThreadPattern } from '../types/tapestryThread';


const statusStyles: { [key in RequestStatus]: { text: string; classes: string } } = {
  [RequestStatus.Open]: { text: 'requestStatus.Open', classes: 'bg-green-100 text-green-700' },
  [RequestStatus.Pending]: { text: 'requestStatus.Pending', classes: 'bg-yellow-100 text-yellow-700' },
  [RequestStatus.Fulfilled]: { text: 'requestStatus.Fulfilled', classes: 'bg-blue-100 text-blue-700' },
  [RequestStatus.Closed]: { text: 'requestStatus.Closed', classes: 'bg-gray-100 text-gray-700' },
};

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start text-sm">
    <Icon className="w-4 h-4 text-gray-400 mt-1 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0" />
    <div>
      <p className="font-semibold text-gray-500">{label}</p>
      <p className="text-gray-800">{value}</p>
    </div>
  </div>
);

const EncouragementCard: React.FC<{ offering: Offering }> = ({ offering }) => {
  const { getUserById } = useAuth();
  const { t } = useTranslation();
  const sender = getUserById(offering.userId);
  if (!sender) return null;

  return (
    <div className="flex items-start space-x-3 rtl:space-x-reverse p-4 border-b last:border-b-0">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
        <SymbolIcon name={sender.symbolicIcon} className="w-6 h-6 text-gray-500" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <p className="font-bold text-sm text-gray-800">{sender.symbolicName}</p>
          <p className="text-xs text-gray-400">{timeSince(offering.timestamp, t)}</p>
        </div>
        <p className="text-gray-600 text-sm mt-1">{offering.message}</p>
      </div>
    </div>
  );
};

const RequestDetail: React.FC = () => {
  const { requestId } = ReactRouterDOM.useParams<{ requestId: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const { t, i18n } = useTranslation();
  const { getRequestById, getOfferingsForRequest, addOffering, initiateHelp, confirmReceipt, fulfillRequest, leaveCommendation } = useData();
  const { addTapestryThread } = useData();
  const { user, getUserById } = useAuth();
  
  const [isHelpModalOpen, setHelpModalOpen] = React.useState(false);
  const [isEncourageModalOpen, setEncourageModalOpen] = React.useState(false);
  const [isCommendationModalOpen, setCommendationModalOpen] = React.useState(false);
  const [encouragementMessage, setEncouragementMessage] = React.useState('');
  
  const [isAddTapestryOpen, setAddTapestryOpen] = React.useState(false);
  const [tapestryStory, setTapestryStory] = React.useState('');
  const [tapestryRevealChoice, setTapestryRevealChoice] = React.useState<'Reveal' | 'Anonymous'>('Anonymous');
  const [tapestryRealName, setTapestryRealName] = React.useState('');
  const [tapestryPhotoUrl, setTapestryPhotoUrl] = React.useState('');
  const [tapestryColor, setTapestryColor] = React.useState('Amber');
  const [tapestryPattern, setTapestryPattern] = React.useState('Spirals');
  const toast = useToast();

  if (!requestId || !user) {
    return <ReactRouterDOM.Navigate to="/echoes" />;
  }

  const request = getRequestById(requestId);
  const offerings = getOfferingsForRequest(requestId);
  const encouragements = offerings.filter(o => o.type === 'Encouragement');
  
  if (!request) {
    return <div className="p-6 text-center">{t('requestDetail.notFound')}</div>;
  }
  
  const helper = request.helperId ? getUserById(request.helperId) : null;
  const isOwner = user.id === request.userId;
  const isHelper = user.id === request.helperId;

  const handleInitiateHelp = () => {
    initiateHelp(request.id, user.id);
    setHelpModalOpen(false);
  };
  
  const handleLeaveCommendation = (commendations: CommendationType[]) => {
    const fromRole = isOwner ? 'requester' : 'helper';
    leaveCommendation(request.id, fromRole, commendations);
  };


  const handleSendEncouragement = () => {
    if (encouragementMessage.trim() === '') return;
    addOffering({
      requestId: request.id,
      type: 'Encouragement',
      message: encouragementMessage,
      pointsEarned: 3,
    }, user.id);
    setEncourageModalOpen(false);
    setEncouragementMessage('');
    toast.show(t('requestDetail.encouragementSent'));
  };

  const handleAddTapestry = () => {
    if (tapestryStory.trim() === '') return;
    addTapestryThread({
      story: tapestryStory,
      isAnonymous: tapestryRevealChoice === 'Anonymous',
      authorName: tapestryRevealChoice === 'Reveal' ? tapestryRealName : user.symbolicName || 'Anonymous',
      authorPhotoUrl: tapestryRevealChoice === 'Reveal' ? tapestryPhotoUrl : user.photoUrl,
      color: tapestryColor as TapestryThreadColor,
      pattern: tapestryPattern as TapestryThreadPattern,
    });
    setAddTapestryOpen(false);
    // Reset tapestry form
    setTapestryStory('');
    setTapestryRevealChoice('Anonymous');
    setTapestryRealName('');
    setTapestryPhotoUrl('');
    toast.show(t('requestDetail.tapestryAdded'));
  };

  const renderActionButtons = () => {
    if (isOwner) {
      if (request.status === RequestStatus.Pending && !request.isConfirmedByRequester) {
        return <Button onClick={() => confirmReceipt(request.id)} variant="primary" className="w-full">{t('echoes.card.confirmReceipt')}</Button>;
      }
    } else if (request.status === RequestStatus.Open) {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setHelpModalOpen(true)} variant="primary" className="flex-1">{t('echoes.card.provideHelp')}</Button>
          <Button onClick={() => setEncourageModalOpen(true)} variant="secondary" className="flex-1">{t('echoes.card.sendEncouragement')}</Button>
          <Button onClick={() => setAddTapestryOpen(true)} variant="outline" className="flex-1">{t('requestDetail.addToTapestry')}</Button>
        </div>
      );
    } else if (request.status === RequestStatus.Pending && isHelper) {
      if (request.isConfirmedByRequester) {
        return <Button onClick={() => fulfillRequest(request.id, user.id)} variant="primary" className="w-full">{t('echoes.card.claimHopePoints')}</Button>;
      } else {
        return <Button className="w-full" disabled>{t('echoes.card.waitingReceipt')}</Button>;
      }
    }
    
    const canLeaveCommendation = request.status === RequestStatus.Fulfilled && ((isOwner && !request.requesterCommended) || (isHelper && !request.helperCommended));
    if(canLeaveCommendation) {
        return (
            <Button onClick={() => setCommendationModalOpen(true)} variant="primary" className="w-full flex items-center justify-center gap-2">
                <Award size={18} /> {t('commendations.leaveButton')}
            </Button>
        );
    }

    return null;
  };

  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <PageContainer>
      <div className="pb-24">
        <header className="flex items-center my-4">
          <button onClick={() => navigate(-1)} className="p-2">
            <BackArrow size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 mx-4 truncate">{request.title}</h1>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[request.status].classes}`}>
              {t(statusStyles[request.status].text)}
            </div>
            <p className="text-xs text-gray-400">{timeSince(request.timestamp, t)}</p>
          </div>
          
          <p className="text-gray-700 mb-6">{request.description}</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <DetailItem icon={Tag} label={t('requestDetail.type')} value={t(`requestTypes.${request.type}`)} />
            <DetailItem icon={Info} label={t('requestDetail.region')} value={request.region} />
            <DetailItem icon={request.mode === 'Loud' ? ShieldCheck : Shield} label={t('requestDetail.mode')} value={t(`requestModes.${request.mode}`)} />
            {helper && (
              <div className="flex items-start text-sm col-span-2">
                <SymbolIcon name={helper.symbolicIcon} className="w-4 h-4 text-gray-400 mt-1 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-500">{t('requestDetail.helper')}</p>
                  <p className="text-gray-800">{helper.symbolicName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {encouragements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              {t('requestDetail.encouragementsTitle')}
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {encouragements.map(offering => <EncouragementCard key={offering.id} offering={offering} />)}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FBF9F4]/80 backdrop-blur-sm p-4 border-t border-[#F1EADF]">
        <div className="max-w-2xl mx-auto">
          {renderActionButtons()}
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={isHelpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onConfirm={handleInitiateHelp}
        title={t('requestDetail.confirmHelp.title')}
        confirmText={t('requestDetail.confirmHelp.confirm')}
        cancelText={t('requestDetail.confirmHelp.cancel')}
      >
        <p>{t('requestDetail.confirmHelp.message')}</p>
      </ConfirmationModal>

      <Modal isOpen={isEncourageModalOpen} onClose={() => setEncourageModalOpen(false)} title={t('requestDetail.encourageModal.title')}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t('requestDetail.encourageModal.description')}</p>
          <Textarea 
            value={encouragementMessage}
            onChange={(e) => setEncouragementMessage(e.target.value)}
            placeholder={t('requestDetail.encourageModal.placeholder')}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEncourageModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSendEncouragement}>{t('requestDetail.encourageModal.submit')}</Button>
          </div>
        </div>
      </Modal>

      <CommendationModal
        isOpen={isCommendationModalOpen}
        onClose={() => setCommendationModalOpen(false)}
        onSubmit={handleLeaveCommendation}
        userName={isOwner ? helper?.symbolicName || 'Helper' : request.user?.symbolicName || 'Requester'}
      />

      <Modal isOpen={isAddTapestryOpen} onClose={() => setAddTapestryOpen(false)} title={t('requestDetail.tapestryModal.title')}>
        <div className="space-y-4">
            <p className="text-sm text-gray-600">{t('requestDetail.tapestryModal.description')}</p>
            <Textarea
                value={tapestryStory}
                onChange={e => setTapestryStory(e.target.value)}
                placeholder={t('requestDetail.tapestryModal.storyPlaceholder')}
                rows={5}
                required
            />
            <Select label={t('requestDetail.tapestryModal.identityLabel')} value={tapestryRevealChoice} onChange={e => setTapestryRevealChoice(e.target.value as 'Reveal' | 'Anonymous')}>
                <option value="Anonymous">{t('requestDetail.tapestryModal.anonymous')}</option>
                <option value="Reveal">{t('requestDetail.tapestryModal.reveal')}</option>
            </Select>
            {tapestryRevealChoice === 'Reveal' && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <Input
                        label={t('requestDetail.tapestryModal.realNameLabel')}
                        value={tapestryRealName}
                        onChange={e => setTapestryRealName(e.target.value)}
                        placeholder={t('requestDetail.tapestryModal.realNamePlaceholder')}
                    />
                    <Input
                        label={t('requestDetail.tapestryModal.photoUrlLabel')}
                        value={tapestryPhotoUrl}
                        onChange={e => setTapestryPhotoUrl(e.target.value)}
                        placeholder={t('requestDetail.tapestryModal.photoUrlPlaceholder')}
                    />
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Select label={t('requestDetail.tapestryModal.colorLabel')} value={tapestryColor} onChange={e => setTapestryColor(e.target.value)}>
                  {Object.values(TapestryThreadColor).map(color => <option key={color} value={color}>{color}</option>)}
              </Select>
              <Select label={t('requestDetail.tapestryModal.patternLabel')} value={tapestryPattern} onChange={e => setTapestryPattern(e.target.value)}>
                  {Object.values(TapestryThreadPattern).map(pattern => <option key={pattern} value={pattern}>{pattern}</option>)}
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setAddTapestryOpen(false)}>{t('common.cancel')}</Button>
                <Button variant="primary" onClick={handleAddTapestry}>{t('requestDetail.tapestryModal.submit')}</Button>
            </div>
        </div>
      </Modal>

    </PageContainer>
  );
};

export default RequestDetail;