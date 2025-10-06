import React from 'react';
import Card from './Card';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import i18n from '../../i18n';

const prompts = [
  'Send a short message of encouragement to someone today.',
  'Share a useful resource or tip in the community events page.',
  'Spend 5 minutes reflecting on someone who helped you — say thanks.',
  'Offer to help with a small chore for a neighbor or friend.'
];

const DailyRitual: React.FC = () => {
  const { user } = useAuth();
  const data = useData();
  const toast = useToast();
  const [prompt] = React.useState(() => prompts[Math.floor(Math.random() * prompts.length)]);
  const [completed, setCompleted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  if (!user) return null;

  const handleComplete = async () => {
    if (completed) return;
    setLoading(true);
    try {
      // Award ritual point to the performer (actor-only) and record analytics
  const requestId = `ritual_${user.id}_${Date.now()}`;
  const res = await data.giveRitualPoint({ prompt, requestId });
      if (res.success) {
        toast.show('Daily ritual completed — Hope point awarded!', 'success');
        setCompleted(true);
        // create sparkle particles around the button
        try {
          const btn = document.activeElement as HTMLElement | null;
          const rectAny = (btn && btn.getBoundingClientRect()) || ({ left: window.innerWidth / 2, top: window.innerHeight / 2, width: 80, height: 32 } as any);
          const host = document.body;
          for (let i = 0; i < 8; i++) {
            const s = document.createElement('span');
            s.className = 'ritual-sparkle sparkle absolute';
            const left = rectAny.left + (Math.random() * (rectAny.width || 80));
            const top = rectAny.top + (Math.random() * (rectAny.height || 32));
            s.style.left = `${left}px`;
            s.style.top = `${top}px`;
            s.style.pointerEvents = 'none';
            host.appendChild(s);
            setTimeout(() => s.remove(), 900);
          }
        } catch (err) {
          // non-critical
        }
      } else {
        toast.show(i18n?.t ? i18n.t(res.messageKey) : res.messageKey, 'error');
      }
    } catch (err) {
      console.error(err);
      toast.show('An error occurred', 'error');
    }
    setLoading(false);
  };

  return (
    <Card>
      <div className="flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-2">Daily Ritual</h3>
        <p className="text-sm text-gray-600 mb-4">{prompt}</p>
        <div className="flex gap-2">
          <button onClick={handleComplete} disabled={completed || loading} className="flex-1 bg-amber-500 text-white py-2 rounded-md font-semibold hover:bg-amber-600 disabled:opacity-60">{completed ? 'Completed' : (loading ? 'Completing...' : 'Mark Complete')}</button>
          <button onClick={() => navigator.clipboard?.writeText(prompt)} className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md">Copy</button>
        </div>
      </div>
    </Card>
  );
};

export default DailyRitual;
