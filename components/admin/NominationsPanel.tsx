import React from 'react';
import Card from '../../components/ui/Card';
import { firebaseService } from '../../services/firebase';
import { useToast } from '../../components/ui/Toast';

const STATUS_ORDER = ['longlist', 'shortlist', 'finalist', 'winner'];

const NominationsPanel: React.FC = () => {
  const [nominations, setNominations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    setLoading(true);
    const unsub = firebaseService.subscribeToNominations((items) => {
      setNominations(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const [newUserId, setNewUserId] = React.useState('');
  const [newReason, setNewReason] = React.useState('');

  const addNomination = async () => {
    if (!newUserId) return toast.show('Enter a user id', 'error');
    const ok = await firebaseService.addNomination({ userId: newUserId, reason: newReason });
    if (ok) {
      toast.show('Nomination added', 'success');
      setNewUserId('');
      setNewReason('');
    } else {
      toast.show('Failed to add nomination', 'error');
    }
  };

  const advance = async (id: string, current: string) => {
    const idx = STATUS_ORDER.indexOf(current);
    const next = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
    const ok = await firebaseService.updateNomination(id, { status: next });
    if (ok) toast.show(`Moved to ${next}`, 'success');
    else toast.show('Failed to update', 'error');
  };

  const regress = async (id: string, current: string) => {
    const idx = STATUS_ORDER.indexOf(current);
    const prev = STATUS_ORDER[Math.max(idx - 1, 0)];
    const ok = await firebaseService.updateNomination(id, { status: prev });
    if (ok) toast.show(`Moved to ${prev}`, 'success');
    else toast.show('Failed to update', 'error');
  };

  return (
    <Card>
      <h3 className="text-lg font-bold mb-3">Nominations</h3>
      <div className="mb-3">
        <div className="flex gap-2 items-center">
          <input className="p-2 border rounded w-48" placeholder="User ID to nominate" value={newUserId} onChange={e => setNewUserId(e.target.value)} />
          <input className="p-2 border rounded flex-1" placeholder="Reason (optional)" value={newReason} onChange={e => setNewReason(e.target.value)} />
          <button className="px-3 py-1 bg-amber-500 text-white rounded" onClick={addNomination}>Add</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="space-y-2">
          {nominations.length === 0 ? <p className="text-sm text-gray-500">No nominations</p> : (
            nominations.map(n => (
              <div key={n.id} className="p-2 bg-white rounded border flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{n.userId} — {n.reason || '—'}</div>
                  <div className="text-xs text-gray-400">Status: {n.status} — Created: {new Date(n.createdAt.seconds ? n.createdAt.seconds * 1000 : n.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => regress(n.id, n.status)} className="px-2 py-1 border rounded">Prev</button>
                  <button onClick={() => advance(n.id, n.status)} className="px-2 py-1 bg-amber-500 text-white rounded">Next</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default NominationsPanel;
