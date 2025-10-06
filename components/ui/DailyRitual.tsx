import React from 'react';
import Card from './Card';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';

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
      // Give daily point to a random recipient (for demo we'll gift to a known community member or self-avoid)
      // For now, gift to the user themselves to represent completed ritual
      const res = await data.giveDailyPoint(user.id);
      if (res.success) {
        toast.show('Daily ritual completed — Hope point awarded!', 'success');
        setCompleted(true);
      } else {
        toast.show('Unable to award point: ' + res.messageKey, 'error');
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
