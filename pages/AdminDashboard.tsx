import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { Users, MessageSquare, Calendar, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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


const AdminDashboard: React.FC = () => {
    const { getAllUsers } = useAuth();
    const { requests, communityEvents, loading } = useData();
    const { t } = useTranslation();
    
    const totalUsers = getAllUsers().length;

    return (
        <div className="p-4">
            <header className="text-center my-6">
                <Shield className="w-12 h-12 mx-auto text-[#3A3A3A] mb-2"/>
                <h1 className="text-3xl font-bold text-gray-800">{t('admin.title')}</h1>
                <p className="text-md text-gray-500 mt-1">{t('admin.subtitle')}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <p>{t('admin.loading')}</p>
                ) : (
                    <>
                        <StatCard icon={Users} value={totalUsers} label={t('admin.totalUsers')} />
                        <StatCard icon={MessageSquare} value={requests.length} label={t('admin.totalRequests')} />
                        <StatCard icon={Calendar} value={communityEvents.length} label={t('admin.totalEvents')} />
                    </>
                )}
            </div>
            
            {/* Future sections for user management, content moderation, etc. can be added here */}

        </div>
    );
};

export default AdminDashboard;
