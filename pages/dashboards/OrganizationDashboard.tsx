import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import { ArrowRight, MessageSquare, Shield, Calendar, PlusCircle } from 'lucide-react';
import { Request, RequestMode, RequestStatus } from '../../types';
import { timeSince } from '../../utils/time';

const StatCard: React.FC<{ value: number, label: string, icon: React.ElementType }> = ({ value, label, icon: Icon }) => (
    <div className="bg-white p-4 rounded-xl border border-[#F1EADF] shadow-sm flex flex-col items-center justify-center text-center">
        <Icon className="w-8 h-8 text-[#D4AF37] mb-2" />
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);

const RequestRow: React.FC<{ request: Request, t: any }> = ({ request, t }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
        <div>
            <p className="font-semibold text-sm text-gray-800 line-clamp-1">{request.title}</p>
            <p className="text-xs text-gray-500">{request.region} - {timeSince(request.timestamp, t)}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </div>
);


const OrganizationDashboard: React.FC = () => {
    const { user } = useAuth();
    const { requests, communityEvents } = useData();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!user) return null;

    const openRequests = requests.filter(r => r.status === RequestStatus.Open);
    const silentRequests = openRequests.filter(r => r.mode === RequestMode.Silent);
    const loudRequests = openRequests.filter(r => r.mode === RequestMode.Loud);
    const orgEvents = communityEvents.filter(e => e.organizerId === user.id);

    return (
        <div className="p-4 pb-24 space-y-6">
            <header className="text-center my-4">
                <h1 className="text-2xl text-gray-700">{t('sanctuary.welcome', { name: user?.symbolicName })}</h1>
                <p className="text-md text-gray-500 mt-2">{t('orgDashboard.subtitle')}</p>
            </header>

            <div className="grid grid-cols-3 gap-3">
                <StatCard value={loudRequests.length} label={t('orgDashboard.metrics.openRequests')} icon={MessageSquare} />
                <StatCard value={silentRequests.length} label={t('orgDashboard.metrics.silentRequests')} icon={Shield} />
                <StatCard value={orgEvents.length} label={t('orgDashboard.metrics.eventsOrganized')} icon={Calendar} />
            </div>

            <Card>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-gray-800">{t('orgDashboard.silentWhispers.title')}</h2>
                    <button onClick={() => navigate('/echoes')} className="text-sm font-semibold text-[#D4AF37]">{t('orgDashboard.viewAll')}</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">{t('orgDashboard.silentWhispers.subtitle')}</p>
                <div className="space-y-2">
                    {silentRequests.slice(0, 3).map(req => (
                        <div key={req.id} onClick={() => navigate(`/echoes/${req.id}`)} className="cursor-pointer">
                            <RequestRow request={req} t={t} />
                        </div>
                    ))}
                    {silentRequests.length === 0 && <p className="text-center text-sm text-gray-400 py-4">{t('orgDashboard.silentWhispers.empty')}</p>}
                </div>
            </Card>

             <Card>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-gray-800">{t('orgDashboard.echoes.title')}</h2>
                    <button onClick={() => navigate('/echoes')} className="text-sm font-semibold text-[#D4AF37]">{t('orgDashboard.viewAll')}</button>
                </div>
                 <div className="space-y-2">
                    {loudRequests.slice(0, 3).map(req => (
                        <div key={req.id} onClick={() => navigate(`/echoes/${req.id}`)} className="cursor-pointer">
                            <RequestRow request={req} t={t} />
                        </div>
                    ))}
                    {loudRequests.length === 0 && <p className="text-center text-sm text-gray-400 py-4">{t('echoes.emptyTitle')}</p>}
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-gray-800">{t('orgDashboard.events.title')}</h2>
                    <button onClick={() => navigate('/events')} className="text-sm font-semibold text-[#D4AF37]">{t('orgDashboard.viewAll')}</button>
                </div>
                <div className="space-y-2">
                     {orgEvents.slice(0, 3).map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                            <div>
                                <p className="font-semibold text-sm text-gray-800">{event.title}</p>
                                <p className="text-xs text-gray-500">{event.region} - {timeSince(event.timestamp, t)}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                    ))}
                    {orgEvents.length === 0 && <p className="text-center text-sm text-gray-400 py-4">{t('constellation.noEvents')}</p>}
                </div>
                <button onClick={() => navigate('/events/new')} className="w-full mt-4 flex items-center justify-center py-3 px-4 bg-[#D4AF37] text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors text-md shadow-sm active:scale-95">
                    <PlusCircle className="w-5 h-5 mx-2" /> {t('orgDashboard.createEvent')}
                </button>
            </Card>
        </div>
    );
};

export default OrganizationDashboard;