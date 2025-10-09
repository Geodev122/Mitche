import * as React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { Users, MessageSquare, Calendar, Shield, ShieldCheck, Check, X, Clock, Plus, Trash, Search } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { User, VerificationStatus } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import AchievementsPanel from '../components/ui/AchievementsPanel';
import NominationsPanel from '../components/admin/NominationsPanel';
import SymbolGeneratorPanel from '../components/admin/SymbolGeneratorPanel';

import Button from '../design-system/Button';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import { Textarea } from '../design-system/Textarea';
import { Checkbox } from '../design-system/Checkbox';

const StatCard: React.FC<{ icon: React.ElementType; value: number; label: string }> = ({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) => (
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

const VerificationStatusBadge: React.FC<{ status?: VerificationStatus }> = ({ status }: { status?: VerificationStatus }) => {
    const { t } = useTranslation();
    if (!status || status === 'NotRequested') return null;

    const styles: { [key in VerificationStatus]: string } = {
        Pending: 'bg-yellow-100 text-yellow-700',
        Approved: 'bg-green-100 text-green-700',
        Rejected: 'bg-red-100 text-red-700',
        NotRequested: '',
    };
    
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {t(`verificationStatus.${status}`)}
        </span>
    );
};


const UserRow: React.FC<{ user: User }> = ({ user }: { user: User }) => {
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


interface DemoItem {
    id: string;
    title: string;
    type: 'resource' | 'event' | 'request';
    content: string;
    [key: string]: any;
}

interface RitualEvent {
    id: string;
    date: string;
    timestamp: any; 
    data?: {
        userId?: string;
        prompt?: string;
    };
    [key: string]: any;
}

const AdminDashboard: React.FC = () => {
    const { getAllUsers, user, updateVerificationStatus } = useAuth();
    const { requests, communityEvents, loading } = useData();
    const { t } = useTranslation();
    const [users, setUsers] = React.useState<User[]>([]);
    const [demoItems, setDemoItems] = React.useState<DemoItem[]>([]);
    const [demoLoading, setDemoLoading] = React.useState(false);
    const [demoTitle, setDemoTitle] = React.useState('');
    const [demoType, setDemoType] = React.useState<'resource' | 'event' | 'request'>('resource');
    const [demoContent, setDemoContent] = React.useState('');
    const [activityTitle, setActivityTitle] = React.useState('Daily Motivation');
    const [activityActive, setActivityActive] = React.useState(true);
    const [activityLimit, setActivityLimit] = React.useState<number | ''>(1);
    const [activities, setActivities] = React.useState<any[]>([]);
    const toast = useToast();

    // Leaderboard aggregates debug state
    const [aggregates, setAggregates] = React.useState<Array<{id: string; points: number}>>([]);
    const [aggRaw, setAggRaw] = React.useState<any>(null);
    const [aggregatesLoading, setAggregatesLoading] = React.useState(false);
    const [perUserDetails, setPerUserDetails] = React.useState<Record<string, any>>({});
    const [showRawAgg, setShowRawAgg] = React.useState(false);

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
            if (res.success) setDemoItems(res.data as DemoItem[] || []);
        } catch (err) {
            console.error('Failed to load demo content', err);
        } finally {
            setDemoLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchDemoContent();
    }, [fetchDemoContent]);

    // Load activities
    const fetchActivities = React.useCallback(async () => {
        try {
            const { db } = await import('../services/firebase');
            const { collection, query, getDocs, orderBy } = await import('firebase/firestore');
            const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Error fetching activities', err);
            setActivities([]);
        }
    }, []);

    React.useEffect(() => { fetchActivities(); }, [fetchActivities]);

    // Fetch pre-aggregated leaderboard global doc
    const fetchAggregates = React.useCallback(async () => {
        setAggregatesLoading(true);
        try {
            const { db } = await import('../services/firebase');
            const { getDoc, doc } = await import('firebase/firestore');
            const docRef = doc(db, 'leaderboard_aggregates', 'global');
            const snap = await getDoc(docRef);
            if (!snap.exists()) {
                setAggregates([]);
                setAggRaw(null);
            } else {
                const data = snap.data() || {};
                setAggRaw(data);
                const totals = data.totals || {};
                const rows = Object.entries(totals).map(([id, pts]) => ({ id, points: Number(pts || 0) }));
                rows.sort((a, b) => b.points - a.points);
                setAggregates(rows);
            }
        } catch (err) {
            console.error('Error fetching aggregates:', err);
            setAggregates([]);
            setAggRaw(null);
        } finally {
            setAggregatesLoading(false);
        }
    }, []);

    // Callable function to run ledger test from Admin UI
    const runLedgerTest = React.useCallback(async (opts?: { receiverIds?: string[]; num?: number }) => {
        try {
            const { getFunctions, httpsCallable } = await import('firebase/functions');
            const functions = getFunctions();
            const fn = httpsCallable(functions, 'adminRunLedgerTest');
            const res = await fn({ receiverIds: opts?.receiverIds, num: opts?.num });
            const payload = (res && (res.data as any)) || {};
            if (payload.success) {
                toast.show(`Created ${((payload.created || []) as any[]).length} ledger entries`, 'success');
                // Refresh aggregates after a short delay to allow triggers to run
                setTimeout(() => fetchAggregates(), 3000);
            } else {
                const err = payload.error || 'unknown';
                toast.show(`Failed: ${err}`, 'error');
            }
        } catch (err) {
            console.error('Error calling adminRunLedgerTest:', err);
            toast.show('Failed to call function', 'error');
        }
    }, [toast, fetchAggregates]);

    const fetchPerUserDetail = React.useCallback(async (userId: string) => {
        try {
            const { db } = await import('../services/firebase');
            const { getDoc, doc } = await import('firebase/firestore');
            const ref = doc(db, 'leaderboard_aggregates', userId);
            const snap = await getDoc(ref);
            setPerUserDetails((prev: Record<string, any>) => ({ ...prev, [userId]: snap.exists() ? snap.data() : null }));
        } catch (err) {
            console.error('Error fetching per-user aggregate:', err);
        }
    }, []);

    // Ritual analytics state
    const [ritualTotal, setRitualTotal] = React.useState<number | null>(null);
    const [ritualToday, setRitualToday] = React.useState<number | null>(null);
    const [ritualRecent, setRitualRecent] = React.useState<RitualEvent[]>([]);
    const [ritualLoading, setRitualLoading] = React.useState(false);

    const fetchRitualAnalytics = React.useCallback(async () => {
        setRitualLoading(true);
        try {
            const { db } = await import('../services/firebase');
            const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
            const q = query(collection(db, 'analytics'), where('eventType', '==', 'daily_ritual_completed'), orderBy('timestamp', 'desc'));
            const snap = await getDocs(q);
            const events: RitualEvent[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as RitualEvent));
            setRitualRecent(events.slice(0, 30));
            setRitualTotal(events.length);
            const today = new Date().toISOString().split('T')[0];
            const todayCount = events.filter(e => e.date === today).length;
            setRitualToday(todayCount);
        } catch (err) {
            console.error('Error fetching ritual analytics:', err);
            setRitualTotal(null);
            setRitualToday(null);
            setRitualRecent([]);
        } finally {
            setRitualLoading(false);
        }
    }, []);

    React.useEffect(() => { fetchRitualAnalytics(); }, [fetchRitualAnalytics]);

    const RitualAnalyticsPanel: React.FC = () => {
        return (
            <div>
                {ritualLoading ? <p className="text-sm text-gray-500">Loading ritual analytics...</p> : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded border">
                                <p className="text-sm text-gray-500">Total Ritual Completions</p>
                                <p className="text-2xl font-bold">{ritualTotal ?? '—'}</p>
                            </div>
                            <div className="p-3 bg-white rounded border">
                                <p className="text-sm text-gray-500">Today</p>
                                <p className="text-2xl font-bold">{ritualToday ?? '—'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Recent Ritual Events</h3>
                            {ritualRecent.length === 0 ? <p className="text-sm text-gray-500">No recent rituals.</p> : (
                                <div className="space-y-2">
                                    {ritualRecent.map((ev: RitualEvent) => (
                                        <div key={ev.id} className="p-2 bg-white rounded border text-xs">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm">{ev.data?.userId || ev.data?.userId}</div>
                                                <div className="text-xs text-gray-400">{new Date(ev.timestamp && ev.timestamp.seconds ? ev.timestamp.toDate() : ev.timestamp).toLocaleString()}</div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">Prompt: {ev.data?.prompt || '—'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

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
    
    const pendingUsers = users.filter((u: User) => u.verificationStatus === 'Pending');

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
                        <div>
                            <SymbolGeneratorPanel />
                        </div>
                        <div className="space-y-3">
                            <StatCard icon={Users} value={users.length} label={t('admin.totalUsers')} />
                            <StatCard icon={MessageSquare} value={requests.length} label={t('admin.totalRequests')} />
                            <StatCard icon={Calendar} value={communityEvents.length} label={t('admin.totalEvents')} />
                        </div>
                    </>
                )}
            </div>

            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.verificationRequests')}</h2>
                {pendingUsers.length > 0 ? (
                    <div className="space-y-2">
                        {pendingUsers.map((u: User) => (
                             <div key={u.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                                    <SymbolIcon name={u.symbolicIcon} className="w-8 h-8 text-amber-700 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{u.symbolicName}</p>
                                        <p className="text-xs text-gray-500 truncate">@{u.username} - {t(`roles.${u.role}`)}</p>
                                    </div>
                                </div>
                                 <div className="flex gap-2 flex-shrink-0">
                                     <Button onClick={() => handleVerificationAction(u.id, 'Rejected')} variant="destructive" size="icon" title={t('admin.reject') as string}>
                                        <X size={16} />
                                     </Button>
                                     <Button onClick={() => handleVerificationAction(u.id, 'Approved')} variant="default" size="icon" title={t('admin.approve') as string}>
                                        <Check size={16} />
                                     </Button>
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

            {/* Ritual analytics panel */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">Ritual Analytics</h2>
                    <div className="flex items-center gap-2">
                        <Button onClick={async () => await fetchRitualAnalytics()}>Refresh</Button>
                    </div>
                </div>
                <RitualAnalyticsPanel />
            </Card>

            {/* Nominations / Award selection workflow */}
            <NominationsPanel />
            
             <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.userManagement')}</h2>
                <div className="space-y-2">
                    {users.map((u: User) => <UserRow key={u.id} user={u} />)}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Achievements</h2>
                <AchievementsPanel />
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Ritual Activities</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center mb-3">
                    <Input className="col-span-2" value={activityTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivityTitle(e.target.value)} placeholder="Activity Title" />
                    <Input type="number" value={activityLimit as any} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivityLimit(e.target.value ? Number(e.target.value) : '')} min={1} placeholder="Limit" />
                    <Checkbox label="Active" checked={activityActive} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivityActive(e.target.checked)} />
                </div>
                <div className="flex gap-2">
                    <Button onClick={async () => {
                        try {
                            const { db } = await import('../services/firebase');
                            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                            await addDoc(collection(db, 'activities'), { title: activityTitle, type: 'ritual', active: activityActive, limitPerUserPerDay: Number(activityLimit) || 1, createdAt: serverTimestamp() });
                            toast.show('Activity created', 'success');
                            setActivityTitle('Daily Motivation');
                            setActivityLimit(1);
                            setActivityActive(true);
                            fetchActivities();
                        } catch (err) {
                            console.error('Failed creating activity', err);
                            toast.show('Failed to create activity', 'error');
                        }
                    }}>Create</Button>
                    <Button onClick={async () => { await fetchActivities(); toast.show('Refreshed', 'success'); }} variant="outline">Refresh</Button>
                </div>

                <div className="mt-4 space-y-2">
                    {activities.length === 0 ? <div className="text-sm text-gray-500">No activities</div> : (
                        activities.map((a: any) => (
                            <div key={a.id} className="p-2 bg-white rounded border flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{a.title}</div>
                                    <div className="text-xs text-gray-400">Limit per user/day: {a.limitPerUserPerDay || 1}</div>
                                </div>
                                <div className="text-sm text-gray-600">{a.active ? 'Active' : 'Inactive'}</div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.demoContentManager') || 'Demo Content'}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                        <div className="col-span-2 flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            <Input className="w-full" placeholder={t('admin.searchDemo') || 'Search demo items'} value={queryText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQueryText(e.target.value); setPage(1); }} />
                        </div>
                        <Select value={pageSize} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                            <option value={5}>5</option>
                            <option value={8}>8</option>
                            <option value={12}>12</option>
                        </Select>
                        <div className="flex gap-2 justify-end">
                            <Input className="w-full" placeholder={t('admin.demoTitle') || 'Title'} value={demoTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoTitle(e.target.value)} />
                            <Select value={demoType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDemoType(e.target.value as any)}>
                                <option value="resource">{t('types.resource') || 'Resource'}</option>
                                <option value="event">{t('types.event') || 'Event'}</option>
                                <option value="request">{t('types.request') || 'Request'}</option>
                            </Select>
                            <Button onClick={handleAddDemo} className="flex items-center justify-center gap-2">
                                <Plus size={16} /> {t('admin.add') || 'Add'}
                            </Button>
                        </div>
                    </div>
                    <Textarea placeholder={t('admin.demoContent') || 'Content'} value={demoContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDemoContent(e.target.value)} />

                    <div>
                        {demoLoading ? (
                            <p className="text-sm text-gray-500">{t('admin.loading')}</p>
                        ) : demoItems.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('admin.noDemoItems') || 'No demo items'}</p>
                        ) : (
                            <div className="space-y-2">
                                {/** Apply search and paginate client-side */}
                                {(() => {
                                    const filtered = demoItems.filter((item: DemoItem) => {
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
                                                {paged.map((item: DemoItem) => (
                                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-800 truncate">{item.title}</p>
                                                            <p className="text-xs text-gray-500 truncate">{item.type} — {item.content}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button onClick={() => handleDeleteDemo(item.id)} variant="destructive" size="icon">
                                                                <Trash size={14} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                                                <div>{t('admin.showing') || 'Showing'} {Math.min(start+1, total)}–{Math.min(start+pageSize, total)} of {total}</div>
                                                <div className="flex items-center gap-2">
                                                    <Button disabled={page <= 1} onClick={() => setPage((p: number) => Math.max(1, p-1))} variant="outline">Prev</Button>
                                                    <Button disabled={start + pageSize >= total} onClick={() => setPage((p: number) => p+1)} variant="outline">Next</Button>
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

            {/* Leaderboard aggregates debug panel */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">Leaderboard Aggregates (debug)</h2>
                    <div className="flex items-center gap-2">
                        <Button onClick={async () => await fetchAggregates()}>Refresh</Button>
                        <Button onClick={() => setShowRawAgg((s: boolean) => !s)} variant="outline">{showRawAgg ? 'Hide Raw' : 'Show Raw'}</Button>
                        <Button onClick={() => { if (confirm('Create sample ledger entries?')) runLedgerTest({ num: 8 }); }} variant="destructive">Run Test</Button>
                    </div>
                </div>

                {aggregatesLoading ? (
                    <p className="text-sm text-gray-500">Loading aggregates...</p>
                ) : (
                    <div className="space-y-2">
                        {aggregates.length === 0 ? (
                            <p className="text-sm text-gray-500">No aggregates found.</p>
                        ) : (
                            <div className="space-y-1">
                                {aggregates.slice(0, 50).map((row: { id: string; points: number }, idx: number) => (
                                    <div key={row.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="font-mono text-sm text-gray-500 w-10">#{idx+1}</div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold truncate">{row.id}</div>
                                                <div className="text-xs text-gray-400 truncate">doc: leaderboard_aggregates/{row.id}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-amber-600">{row.points}</div>
                                            <Button onClick={() => fetchPerUserDetail(row.id)} variant="outline" size="sm">Inspect</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {showRawAgg && (
                            <pre className="mt-3 p-3 bg-gray-50 rounded text-xs overflow-auto">{JSON.stringify(aggRaw || aggregates, null, 2)}</pre>
                        )}
                        {Object.keys(perUserDetails).length > 0 && (
                            <div className="mt-3 space-y-2">
                                <h3 className="text-sm font-semibold">Per-user docs</h3>
                                {Object.entries(perUserDetails).map(([id, data]) => (
                                    <div key={id} className="p-2 bg-white rounded border text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="font-mono text-sm">{id}</div>
                                            <div className="text-sm font-bold text-amber-600">{(data as any).total ?? '—'}</div>
                                        </div>
                                        <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>        </div>
    );
};

export default AdminDashboard;
