import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { MessageSquare, Calendar, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdvancedSearch } from '../../components/search/AdvancedSearch';
import TapestryPreview from '../../components/tapestry/TapestryPreview';
import { RatingSystem } from '../../components/rating/RatingSystem';
import Modal from '../../components/ui/Modal';
import { DEMO_REQUESTS, DEMO_EVENTS, DEMO_RESOURCES } from './demoData';

const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [ratingModalOpen, setRatingModalOpen] = React.useState(false);
  const [ratingTarget, setRatingTarget] = React.useState<{ id: string; type: any; name?: string } | null>(null);

  // Safety check - should not happen due to App.tsx routing, but good practice
  if (!user) {
    return <ReactRouterDOM.Navigate to="/login" replace />;
  }

  if (!user.hasCompletedOnboarding) {
    return <ReactRouterDOM.Navigate to="/onboarding" replace />;
  }

  const navTiles = [
    { title: 'Wall of Echoes', subtitle: 'Request or respond to calls', path: '/echoes', icon: MessageSquare },
    { title: 'Community Events', subtitle: 'Join initiatives and gatherings', path: '/events', icon: Calendar },
    { title: 'Hope Tapestry', subtitle: 'Read stories of resilience', path: '/tapestry', icon: BookOpen },
  ];

  return (
    <div className="p-4 pb-24">
      <header className="text-center my-8">
        <h1 className="text-2xl text-gray-700">
          {t('sanctuary.welcome', { name: user?.symbolicName || 'Friend' })}
        </h1>
        <p className="text-md text-gray-500 mt-2">"{t('sanctuary.quote')}"</p>
      </header>

      {/* Tapestry preview (Phase 1 feature surfaced on Home) */}
      <div className="mb-6">
        <TapestryPreview />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navTiles.map((tile) => (
          <div 
            key={tile.path} 
            onClick={() => navigate(tile.path)} 
            className="bg-white rounded-xl shadow-sm border border-[#F1EADF] p-6 flex items-center space-x-4 rtl:space-x-reverse cursor-pointer hover:shadow-md hover:border-[#D4AF37] active:scale-95 transition-all duration-300"
          >
            <div className="bg-[#FBF9F4] p-4 rounded-full">
                <tile.icon className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-800">{tile.title}</h2>
              <p className="text-sm text-gray-500">{tile.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Embed a compact Advanced Search panel so Phase1 search is available from the dashboard */}
      <div className="mt-8">
        <AdvancedSearch
          searchType="requests"
          onSearch={(results) => {
            setSearchResults(results || []);
          }}
        />

        {searchResults.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold mb-2">Search Preview ({searchResults.length})</h4>
            <ul className="space-y-2">
              {searchResults.slice(0,5).map((r: any) => (
                <li key={r.id || r.title} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{r.title || r.description?.substring(0,50) || 'Untitled'}</div>
                    <div className="text-xs text-gray-500">{r.region || r.location?.region}</div>
                  </div>
                  <div>
                    <button onClick={() => navigate(r.id ? `/echoes/${r.id}` : '/echoes')} className="px-3 py-1 bg-blue-600 text-white rounded-md">Open</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold mb-3">Quick Rating Example</h3>
          <RatingSystem
            targetId="sample-user-1"
            targetType="user"
            targetName="Community Helper"
            currentRating={{ average: 4.6, count: 21 }}
            showReviewForm={true}
          />
        </div>

        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold mb-3">Open Chat</h3>
          <p className="text-sm text-gray-500 mb-3">Start a conversation related to any request or offering. Chats are powered by real-time Firebase messaging.</p>
          <button onClick={() => navigate('/echoes')} className="px-4 py-2 bg-blue-600 text-white rounded-md">Go to Echoes</button>
        </div>
      </div>

      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title={ratingTarget ? `Rate ${ratingTarget.name || ratingTarget.id}` : 'Rate'}>
        {ratingTarget && (
          <RatingSystem
            targetId={ratingTarget.id}
            targetType={ratingTarget.type}
            targetName={ratingTarget.name}
            onRatingSubmitted={() => setRatingModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default CitizenDashboard;