import React from 'react';
import Card from '../../components/ui/Card';
let _fs2: any = null;
async function getFs2() {
  if (_fs2) return _fs2;
  const m = await import('../../services/firebase');
  _fs2 = m.firebaseService;
  return _fs2;
}
import { useToast } from '../../components/ui/Toast';

const SymbolGeneratorPanel: React.FC = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const fs = await getFs2();
      const all = await fs.getAllUsers();
      setUsers(all || []);
      setLoading(false);
    })();
  }, []);

  const generateForUser = async (u: any) => {
    try {
      toast.show('Generating symbol…', 'info');
      // Call functions callable generateSymbolicIcon
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const fn = httpsCallable(functions, 'generateSymbolicIcon');
      const res = await fn({ userId: u.id, prompt: `A warm gold-tone symbolic icon representing community care for ${u.username || u.id}` });
      const payload = (res && (res.data as any)) || {};
      if (payload.success && payload.url) {
        toast.show('Generated symbol', 'success');
        // update local list
        setUsers(prev => prev.map(p => p.id === u.id ? { ...p, symbolicIcon: payload.url } : p));
      } else {
        toast.show(`Generation failed: ${payload.error || 'unknown'}`, 'error');
      }
    } catch (err) {
      console.error('Generation error', err);
      toast.show('Generation failed', 'error');
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-bold mb-3">Symbol Generator (Admin)</h3>
      {loading ? <p>Loading users...</p> : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="p-2 bg-white rounded border flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold truncate">{u.username || u.id}</div>
                <div className="text-xs text-gray-500 truncate">{u.symbolicIcon || 'No symbol'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => generateForUser(u)} className="px-3 py-1 bg-amber-500 text-white rounded">Generate</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SymbolGeneratorPanel;
