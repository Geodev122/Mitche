import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import SymbolIcon from '../components/ui/SymbolIcon';
import Modal from '../components/ui/Modal';
import { Request, RequestStatus, Offering, Role, CommendationType } from '../types';
import { timeSince } from '../utils/time';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Info, Heart, Tag, Shield, ShieldCheck, Award } from 'lucide-react';
import CommendationModal from '../components/ui/CommendationModal';
import { ChatInterface } from '../components/chat/ChatInterface';
import { RatingSystem } from '../components/rating/RatingSystem';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/Toast';

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
  const { user, getUserById, enhancedFirebase } = useAuth();
  
  const [isHelpModalOpen, setHelpModalOpen] = React.useState(false);
  const [isEncourageModalOpen, setEncourageModalOpen] = React.useState(false);
  const [isCommendationModalOpen, setCommendationModalOpen] = React.useState(false);
  const [encouragementMessage, setEncouragementMessage] = React.useState('');
  const [isChatOpen, setChatOpen] = React.useState(false);
  const [chatParticipantIds, setChatParticipantIds] = React.useState<string[]>([]);
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
    const offering = {
      requestId: request.id,
      type: 'Encouragement' as 'Encouragement',
      message: encouragementMessage,
      pointsEarned: 3,
    };
    addOffering(offering, user.id);
    setEncourageModalOpen(false);
    setEncouragementMessage('');
  };

  const renderActionButtons = () => {
    let buttons = null;
    if (isOwner) {
      if (request.status === RequestStatus.Pending && !request.isConfirmedByRequester) {
        buttons = <button onClick={() => confirmReceipt(request.id)} className="w-full px-4 py-3 text-sm bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">{t('echoes.card.confirmReceipt')}</button>;
      }
    } else if (request.status === RequestStatus.Open) {
      buttons = (
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setHelpModalOpen(true)} className="flex-1 px-4 py-3 text-sm bg-[#3A3A3A] text-white rounded-lg font-bold hover:bg-opacity-80">{t('echoes.card.provideHelp')}</button>
          <button onClick={() => setEncourageModalOpen(true)} className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">{t('echoes.card.sendEncouragement')}</button>
          <button onClick={async () => {
              // Start or open chat with request owner and deep-link to chat route
              try {
                const convResp = await enhancedFirebase.createConversation({
                  participants: [user.id, request.userId],
                  title: `${request.title}`
                });
                if (convResp.success && convResp.data) {
                  navigate(`/chat/${convResp.data.id}`);
                } else {
                  // Fallback to modal chat
                  setChatParticipantIds([request.userId]);
                  setChatOpen(true);
                }
              } catch (err) {
                console.error('Error creating conversation:', err);
                setChatParticipantIds([request.userId]);
                setChatOpen(true);
              }
            }} className="flex-1 px-4 py-3 text-sm bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Chat</button>
          <button onClick={() => setAddTapestryOpen(true)} className="flex-1 px-4 py-3 text-sm bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600">Add to Tapestry</button>
        </div>
      );
    } else if (request.status === RequestStatus.Pending && isHelper) {
      if (request.isConfirmedByRequester) {
        buttons = <button onClick={() => fulfillRequest(request.id, user.id)} className="w-full px-4 py-3 text-sm bg-[#D4AF37] text-white rounded-lg font-bold hover:bg-opacity-80">{t('echoes.card.claimHopePoints')}</button>;
      } else {
        buttons = <button className="w-full px-4 py-3 text-sm bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed" disabled>{t('echoes.card.waitingReceipt')}</button>;
      }
    }
    
    const canLeaveCommendation = request.status === RequestStatus.Fulfilled && ((isOwner && !request.requesterCommended) || (isHelper && !request.helperCommended));
    if(canLeaveCommendation) {
        buttons = (
            <button onClick={() => setCommendationModalOpen(true)} className="w-full px-4 py-3 text-sm bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center justify-center gap-2">
                <Award size={18} /> {t('commendations.leaveButton')}
            </button>
        );
    }

    if (!buttons) return null;

    return (
        <div className="fixed bottom-16 left-0 right-0 bg-[#FBF9F4]/80 backdrop-blur-sm p-4 border-t border-[#F1EADF] z-10">
            {buttons}
        </div>
    );
  };
  
  const currentStatus = statusStyles[request.status];
  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <>
      <div className="p-4 pb-32">
        <header className="flex items-center my-4">
          <button onClick={() => navigate('/echoes')} className="p-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-full hover:bg-gray-100">
            <BackArrow size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{t('requestDetail.title')}</h1>
        </header>
        
        <div className="space-y-4">
            <Card>
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#F1EADF] rounded-full flex items-center justify-center">
                        <SymbolIcon name={request.userSymbolicIcon} className="w-7 h-7 text-[#D4AF37]" />
                    </div>
                    <div className="mx-3">
                        <h3 className="font-bold text-gray-800">{request.userSymbolicName}</h3>
                        <p className="text-xs text-gray-500">{t('requestDetail.postedOn')} {timeSince(request.timestamp, t)}</p>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{request.description}</p>
                 {helper && 
                    <div className="text-sm text-center bg-blue-50 text-blue-700 font-semibold p-2 rounded-md mt-4 flex items-center justify-center gap-2">
                        <span>{t('requestDetail.helper')}: {helper.symbolicName}</span>
                         {helper.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500" aria-label={t('verifiedOrg') as string} />}
                    </div>
                }
            </Card>
            
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('requestDetail.detailsTitle')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailItem icon={Info} label={t('requestStatus.title')} value={t(currentStatus.text)} />
                    <DetailItem icon={Tag} label={t('createRequest.form.category')} value={t(`requestTypes.${request.type}`)} />
                    <DetailItem icon={Shield} label={t('createRequest.form.mode')} value={request.mode === 'Loud' ? t('createRequest.form.modeLoud') : t('createRequest.form.modeSilent')} />
                </div>
            </Card>

            {renderActionButtons()}

            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-2 px-4 pt-2">{t('requestDetail.encouragementTitle')}</h3>
                {encouragements.length > 0 ? (
                    <div>{encouragements.map(offering => <EncouragementCard key={offering.id} offering={offering} />)}</div>
                ) : (
                    <div className="text-center text-gray-500 py-8 px-4">
                        <Heart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p>{t('requestDetail.noEncouragement')}</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
      
      <Modal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} title={t('echoes.helpModal.titleHelp')}>
        <>
            <p className="text-gray-600 mb-4">{t('echoes.helpModal.bodyHelp')}</p>
            <p className="text-center font-bold text-lg bg-gray-100 p-2 rounded-md">{t('echoes.helpModal.phoneNumber')}</p>
            <p className="text-xs text-gray-400 text-center my-2">{t('echoes.helpModal.dummyPhone')}</p>
        </>
        <button onClick={handleInitiateHelp} className="w-full mt-4 bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-opacity-90">{t('echoes.helpModal.confirmHelp')}</button>
      </Modal>

      <Modal isOpen={isAddTapestryOpen} onClose={() => setAddTapestryOpen(false)} title={t('tapestry.add.title', 'Add to Hope Tapestry')}>
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('tapestry.add.instructions', 'Share a short story to honor or recognize someone.')}</p>
          <textarea value={tapestryStory} onChange={(e) => setTapestryStory(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-md mb-2" placeholder={t('tapestry.add.placeholder', 'Write your story...')} />

          <div className="flex gap-2 mb-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="reveal" checked={tapestryRevealChoice === 'Anonymous'} onChange={() => setTapestryRevealChoice('Anonymous')} /> {t('tapestry.add.anonymous', 'Anonymous')}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="reveal" checked={tapestryRevealChoice === 'Reveal'} onChange={() => setTapestryRevealChoice('Reveal')} /> {t('tapestry.add.reveal', 'Reveal my name')}
            </label>
          </div>

          {tapestryRevealChoice === 'Reveal' && (
            <>
              <input value={tapestryRealName} onChange={(e) => setTapestryRealName(e.target.value)} placeholder={t('tapestry.add.realName', 'Your name')} className="w-full px-3 py-2 border rounded-md mb-2" />
              <input value={tapestryPhotoUrl} onChange={(e) => setTapestryPhotoUrl(e.target.value)} placeholder={t('tapestry.add.photoUrl', 'Photo URL (optional)')} className="w-full px-3 py-2 border rounded-md mb-2" />
            </>
          )}

          <div className="flex gap-2 mb-2">
            <select value={tapestryColor} onChange={(e) => setTapestryColor(e.target.value)} className="px-2 py-2 border rounded-md">
              <option>Amber</option>
              <option>Gold</option>
              <option>Blue</option>
              <option>Green</option>
            </select>
            <select value={tapestryPattern} onChange={(e) => setTapestryPattern(e.target.value)} className="px-2 py-2 border rounded-md">
              <option>Spirals</option>
              <option>Lines</option>
              <option>Dots</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-amber-500 text-white py-2 rounded-md" onClick={async () => {
              if (!tapestryStory.trim()) return;
              const createdId = await addTapestryThread({
                honoreeUserId: request.userId,
                honoreeSymbolicName: request.userSymbolicName,
                honoreeSymbolicIcon: request.userSymbolicIcon,
                isAnonymous: tapestryRevealChoice === 'Anonymous',
                story: tapestryStory,
                color: tapestryColor as any,
                pattern: tapestryPattern as any,
                rippleTag: 1,
                echoes: 0
              });
              if (createdId) {
                setAddTapestryOpen(false);
                setTapestryStory('');
                toast.show(t('tapestry.add.success', 'Added to tapestry successfully'), 'success');
                // Navigate to tapestry and pass highlight id in state
                navigate('/tapestry', { state: { highlightThreadId: createdId } });
              }
            }}>{t('tapestry.add.submit', 'Add to Tapestry')}</button>
            <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md" onClick={() => setAddTapestryOpen(false)}>{t('cancel', 'Cancel')}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEncourageModalOpen} onClose={() => setEncourageModalOpen(false)} title={t('echoes.encourageModal.title')}>
          <textarea 
            value={encouragementMessage}
            onChange={(e) => setEncouragementMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-white border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            placeholder={t('echoes.encourageModal.placeholder')}
          />
          <button onClick={handleSendEncouragement} className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-opacity-90">{t('echoes.encourageModal.send')}</button>
      </Modal>
      
      {isCommendationModalOpen && (
        <CommendationModal 
            isOpen={isCommendationModalOpen}
            onClose={() => setCommendationModalOpen(false)}
            onSubmit={handleLeaveCommendation}
            userName={isOwner ? (helper?.symbolicName || '') : request.userSymbolicName}
        />
      )}
      {isChatOpen && (
        <Modal isOpen={isChatOpen} onClose={() => setChatOpen(false)} title={t('chat.title')}> 
          <ChatInterface participantIds={chatParticipantIds} />
        </Modal>
      )}
    </>
  );
};

export default RequestDetail;