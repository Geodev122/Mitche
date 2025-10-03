import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { Users, MessageSquare, Calendar, Shield, ShieldCheck, Check, X, Clock, Plus, Trash, Search } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { User, VerificationStatus } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';

const StatCard: React.FC<{ icon: React.ElementType, value: number, label: string }> = ({ icon: Icon, value, label }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 bg-gray-100 rounded-full mr-4 rtl:mr-0 rtl:ml-4">
            <Icon className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    </Card>
);

const VerificationStatusBadge: React.FC<{ status?: VerificationStatus }> = ({ status }) => {
    const { t } = useTranslation();
    if (!status || status === 'NotRequested') return null;

    const styles = {
        Pending: 'bg-yellow-100 text-yellow-700',
        Approved: 'bg-green-100 text-green-700',
        Rejected: 'bg-red-100 text-red-700',
    };
    
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {t(`verificationStatus.${status}`)}
        </span>
    );
};


const UserRow: React.FC<{ user: User }> = ({ user }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border gap-2">
            <div className="flex items-center space-x-3 rtl:space-x-reverse flex-grow min-w-0">
                <SymbolIcon name={user.symbolicIcon} className="w-8 h-8 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-800 truncate" title={user.symbolicName}>{user.symbolicName}</p>
                        {user.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" aria-label={t('verifiedOrg') as string} />}
                    </div>
                    <p className="text-xs text-gray-500 truncate" title={user.username}>@{user.username} - {t(`roles.${user.role}`)}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 text-right">
                 <div className="w-12">
                    <p className="font-bold text-sm text-amber-600">{user.hopePoints}</p>
                    <p className="text-xs text-gray-500">{t('leaderboard.points')}</p>
                </div>
                <div className="w-24">
                    <VerificationStatusBadge status={user.verificationStatus} />
                </div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const { getAllUsers, user, updateVerificationStatus } = useAuth();
    const { requests, communityEvents, loading } = useData();
    const { t } = useTranslation();
    const [users, setUsers] = React.useState<User[]>([]);
    const [demoItems, setDemoItems] = React.useState<any[]>([]);
    const [demoLoading, setDemoLoading] = React.useState(false);
    const [demoTitle, setDemoTitle] = React.useState('');
    const [demoType, setDemoType] = React.useState('resource');
    const [demoContent, setDemoContent] = React.useState('');
    const toast = useToast();

    // search & pagination
    const [queryText, setQueryText] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(8);

    const refreshUsers = React.useCallback(() => {
        setUsers(getAllUsers());
    }, [getAllUsers]);

    React.useEffect(() => {
        refreshUsers();
    }, [refreshUsers]);

    // Demo content management
    const fetchDemoContent = React.useCallback(async () => {
        setDemoLoading(true);
        try {
            const { enhancedFirebaseService } = await import('../services/firebase-enhanced');
            const res = await enhancedFirebaseService.getDemoContent();
            if (res.success) setDemoItems(res.data || []);
        } catch (err) {
            console.error('Failed to load demo content', err);
        } finally {
            setDemoLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchDemoContent();
    }, [fetchDemoContent]);

    const handleAddDemo = async () => {
        if (!demoTitle) {
            toast.show('Please enter a title', 'error');
            return;
        }
        setDemoLoading(true);
        try {
            const { enhancedFirebaseService } = await import('../services/firebase-enhanced');
            const item = { title: demoTitle, type: demoType, content: demoContent };
            const res = await enhancedFirebaseService.addDemoContent(item);
            if (res.success) {
                setDemoTitle('');
                setDemoContent('');
                fetchDemoContent();
                toast.show('Demo item added', 'success');
            }
        } catch (err) {
            console.error('Failed to add demo content', err);
            toast.show('Failed to add demo item', 'error');
        } finally {
            setDemoLoading(false);
        }
    };

    const handleDeleteDemo = async (id: string) => {
        if (!confirm('Delete demo item? This cannot be undone.')) return;
        setDemoLoading(true);
        try {
            const { enhancedFirebaseService } = await import('../services/firebase-enhanced');
            const res = await enhancedFirebaseService.deleteDemoContent(id);
            if (res.success) fetchDemoContent();
        } catch (err) {
            console.error('Failed to delete demo content', err);
            toast.show('Failed to delete demo item', 'error');
        } finally {
            setDemoLoading(false);
        }
    };

    const handleVerificationAction = (userId: string, status: 'Approved' | 'Rejected') => {
        updateVerificationStatus(userId, status);
        refreshUsers();
    };
    
    const pendingUsers = users.filter(u => u.verificationStatus === 'Pending');

    return (
        <div className="p-4 pb-24 space-y-6">
            <header className="my-6">
                 <div className="text-center">
                    <Shield className="w-12 h-12 mx-auto text-[#3A3A3A] mb-2"/>
                    <h1 className="text-3xl font-bold text-gray-800">{t('admin.title')}</h1>
                    <p className="text-md text-gray-500 mt-1">{t('admin.subtitle')}</p>
                </div>
                <p className="text-center text-lg text-gray-600 mt-4">{t('sanctuary.welcome', { name: user?.symbolicName })}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <p>{t('admin.loading')}</p>
                ) : (
                    <>
                        <StatCard icon={Users} value={users.length} label={t('admin.totalUsers')} />
                        <StatCard icon={MessageSquare} value={requests.length} label={t('admin.totalRequests')} />
                        <StatCard icon={Calendar} value={communityEvents.length} label={t('admin.totalEvents')} />
                    </>
                )}
            </div>

            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.verificationRequests')}</h2>
                {pendingUsers.length > 0 ? (
                    <div className="space-y-2">
                        {pendingUsers.map(u => (
                             <div key={u.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                                    <SymbolIcon name={u.symbolicIcon} className="w-8 h-8 text-amber-700 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{u.symbolicName}</p>
                                        <p className="text-xs text-gray-500 truncate">@{u.username} - {t(`roles.${u.role}`)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                     <button onClick={() => handleVerificationAction(u.id, 'Rejected')} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors" title={t('admin.reject') as string}>
                                        <X size={16} />
                                     </button>
                                     <button onClick={() => handleVerificationAction(u.id, 'Approved')} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors" title={t('admin.approve') as string}>
                                        <Check size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-6">
                        <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p>{t('admin.noPendingRequests')}</p>
                    </div>
                )}
            </Card>
            
             <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.userManagement')}</h2>
                <div className="space-y-2">
                    {users.map(u => <UserRow key={u.id} user={u} />)}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.demoContentManager') || 'Demo Content'}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                        <div className="col-span-2 flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input className="p-2 border rounded w-full" placeholder={t('admin.searchDemo') || 'Search demo items'} value={queryText} onChange={e => { setQueryText(e.target.value); setPage(1); }} />
                        </div>
                        <select className="p-2 border rounded" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                            <option value={5}>5</option>
                            <option value={8}>8</option>
                            <option value={12}>12</option>
                        </select>
                        <div className="flex gap-2 justify-end">
                            <input className="p-2 border rounded w-full" placeholder={t('admin.demoTitle') || 'Title'} value={demoTitle} onChange={e => setDemoTitle(e.target.value)} />
                            <select className="p-2 border rounded" value={demoType} onChange={e => setDemoType(e.target.value)}>
                                <option value="resource">{t('types.resource') || 'Resource'}</option>
                                <option value="event">{t('types.event') || 'Event'}</option>
                                <option value="request">{t('types.request') || 'Request'}</option>
                            </select>
                            <button onClick={handleAddDemo} className="p-2 bg-amber-500 text-white rounded flex items-center justify-center gap-2">
                                <Plus size={16} /> {t('admin.add') || 'Add'}
                            </button>
                        </div>
                    </div>
                    <textarea className="w-full p-2 border rounded" placeholder={t('admin.demoContent') || 'Content'} value={demoContent} onChange={e => setDemoContent(e.target.value)} />

                    <div>
                        {demoLoading ? (
                            <p className="text-sm text-gray-500">{t('admin.loading')}</p>
                        ) : demoItems.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('admin.noDemoItems') || 'No demo items'}</p>
                        ) : (
                            <div className="space-y-2">
                                {/** Apply search and paginate client-side */}
                                {(() => {
                                    const filtered = demoItems.filter(item => {
                                        if (!queryText) return true;
                                        const q = queryText.toLowerCase();
                                        return (item.title || '').toLowerCase().includes(q) || (item.content || '').toLowerCase().includes(q) || (item.type || '').toLowerCase().includes(q);
                                    });
                                    const total = filtered.length;
                                    const start = (page - 1) * pageSize;
                                    const paged = filtered.slice(start, start + pageSize);
                                    return (
                                        <>
                                            <div className="space-y-2">
                                                {paged.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-800 truncate">{item.title}</p>
                                                            <p className="text-xs text-gray-500 truncate">{item.type} — {item.content}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleDeleteDemo(item.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100">
                                                                <Trash size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                                                <div>{t('admin.showing') || 'Showing'} {Math.min(start+1, total)}–{Math.min(start+pageSize, total)} of {total}</div>
                                                <div className="flex items-center gap-2">
                                                    <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                                                    <button disabled={start + pageSize >= total} onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default AdminDashboard;
