import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import Button from '../../design-system/Button';
import { ArrowRight, MessageSquare, Shield, Calendar, PlusCircle } from 'lucide-react';
import { Request, RequestMode, RequestStatus } from '../../types';
import { timeSince } from '../../utils/time';
import PageContainer from '../../components/layout/PageContainer';

const StatCard: React.FC<{ value: number, label: string, icon: React.ElementType }> = ({ value, label, icon: Icon }) => (
    <Card className="flex flex-col items-center justify-center text-center p-4">
        <div className="p-3 bg-amber-50 rounded-full mb-2">
            <Icon className="w-8 h-8 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
    </Card>
);

const ListItem: React.FC<{ title: string, subtitle: string, onClick: () => void }> = ({ title, subtitle, onClick }) => (
    <div onClick={onClick} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
        <div>
            <p className="font-semibold text-sm text-gray-800 line-clamp-1">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </div>
);

const OrganizationDashboard: React.FC = () => {
    const { user } = useAuth();
    const { requests, communityEvents } = useData();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.hasCompletedOnboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    const openRequests = requests.filter(r => r.status === RequestStatus.Open);
    const silentRequests = openRequests.filter(r => r.mode === RequestMode.Silent);
    const loudRequests = openRequests.filter(r => r.mode === RequestMode.Loud);
    const orgEvents = communityEvents.filter(e => e.organizerId === user.id);

    return (
        <PageContainer>
            <div className="p-4 md:p-6">
                <header className="text-center my-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {t('sanctuary.welcome', { name: user?.symbolicName || 'Organization' })}
                    </h1>
                    <p className="text-md text-gray-500 mt-2 max-w-2xl mx-auto">{t('orgDashboard.subtitle')}</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard value={loudRequests.length} label={t('orgDashboard.metrics.openRequests')} icon={MessageSquare} />
                    <StatCard value={silentRequests.length} label={t('orgDashboard.metrics.silentRequests')} icon={Shield} />
                    <StatCard value={orgEvents.length} label={t('orgDashboard.metrics.eventsOrganized')} icon={Calendar} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-bold text-gray-800">{t('orgDashboard.silentWhispers.title')}</h2>
                            <Button variant="link" onClick={() => navigate('/echoes')}>{t('orgDashboard.viewAll')}</Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{t('orgDashboard.silentWhispers.subtitle')}</p>
                        <div className="space-y-2 flex-grow">
                            {silentRequests.slice(0, 3).map(req => (
                                <ListItem key={req.id} title={req.title} subtitle={`${req.region} - ${timeSince(req.timestamp, t)}`} onClick={() => navigate(`/echoes/${req.id}`)} />
                            ))}
                            {silentRequests.length === 0 && <div className="flex items-center justify-center h-full text-center text-sm text-gray-400 py-4">{t('orgDashboard.silentWhispers.empty')}</div>}
                        </div>
                    </Card>

                    <Card className="flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-bold text-gray-800">{t('orgDashboard.echoes.title')}</h2>
                            <Button variant="link" onClick={() => navigate('/echoes')}>{t('orgDashboard.viewAll')}</Button>
                        </div>
                        <div className="space-y-2 flex-grow">
                            {loudRequests.slice(0, 3).map(req => (
                                <ListItem key={req.id} title={req.title} subtitle={`${req.region} - ${timeSince(req.timestamp, t)}`} onClick={() => navigate(`/echoes/${req.id}`)} />
                            ))}
                            {loudRequests.length === 0 && <div className="flex items-center justify-center h-full text-center text-sm text-gray-400 py-4">{t('echoes.emptyTitle')}</div>}
                        </div>
                    </Card>
                </div>

                <div className="mt-6">
                    <Card>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-bold text-gray-800">{t('orgDashboard.events.title')}</h2>
                            <Button variant="link" onClick={() => navigate('/events')}>{t('orgDashboard.viewAll')}</Button>
                        </div>
                        <div className="space-y-2">
                            {orgEvents.slice(0, 3).map(event => (
                                <ListItem key={event.id} title={event.title} subtitle={`${event.region} - ${timeSince(event.timestamp, t)}`} onClick={() => navigate(`/events/${event.id}`)} />
                            ))}
                            {orgEvents.length === 0 && <p className="text-center text-sm text-gray-400 py-4">{t('constellation.noEvents')}</p>}
                        </div>
                        <Button onClick={() => navigate('/events/new')} className="w-full mt-4">
                            <PlusCircle className="w-5 h-5 mr-2" /> {t('orgDashboard.createEvent')}
                        </Button>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default OrganizationDashboard;