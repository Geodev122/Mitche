import React from 'react';
import Card from '../../components/ui/Card';
import { firebaseService } from '../../services/firebase';
import { useToast } from '../../components/ui/Toast';

const SymbolGeneratorPanel: React.FC = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await firebaseService.getAllUsers();
      setUsers(all || []);
      setLoading(false);
    })();
  }, []);

  const generateForUser = async (u: any) => {
    try {
      // For now use DiceBear initials SVG as a placeholder generator
      const svgUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(u.username || u.id)}`;
      // Store the chosen url as user's symbolicIcon (delegated)
      const ok = await firebaseService.updateUser(u.id, { symbolicIcon: svgUrl });
      if (ok) toast.show('Symbol stored', 'success');
      else toast.show('Failed to store symbol', 'error');
    } catch (err) {
      toast.show('Generation failed', 'error');
      console.error(err);
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
