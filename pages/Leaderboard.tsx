import React, { FC } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import Card from '../components/ui/Card';
import { Trophy, Crown, ShieldCheck } from 'lucide-react';

const getPodiumClass = (rank: number) => {
    switch (rank) {
        case 1:
            return 'border-yellow-400 bg-yellow-50';
        case 2:
            return 'border-gray-300 bg-gray-50';
        case 3:
            return 'border-amber-500 bg-amber-50';
        default:
            return '';
    }
};

const PodiumCard: FC<{ user: User; rank: number; isCurrentUser: boolean }> = ({ user, rank, isCurrentUser }) => {
    const { t } = useTranslation();
    const highlightClass = isCurrentUser ? 'ring-2 ring-offset-2 ring-[#D4AF37]' : '';
    return (
        <div className={`text-center p-4 rounded-xl border-2 ${getPodiumClass(rank)} ${highlightClass}`}>
            {rank === 1 && <Crown className="w-8 h-8 mx-auto text-yellow-500 -mt-8 mb-2" />}
            {rank === 2 && <Trophy className="w-6 h-6 mx-auto text-gray-400 -mt-7 mb-1" />}
            {rank === 3 && <Trophy className="w-6 h-6 mx-auto text-amber-500 -mt-7 mb-1" />}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 border-2 ${getPodiumClass(rank)} bg-white`}>
                <SymbolIcon name={user.symbolicIcon} className="w-8 h-8 text-gray-700" />
            </div>
            <div className="flex items-center justify-center gap-1">
                <p className="font-bold text-gray-800 truncate">{user.symbolicName}</p>
                {user.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" title={t('verifiedOrg') as string} />}
            </div>
            <p className="text-sm font-bold text-[#D4AF37]">{user.hopePoints} pts</p>
        </div>
    );
};

const Leaderboard: FC = () => {
    const { getAllUsers, user: currentUser } = useAuth();
    const { t } = useTranslation();

    if (!currentUser) return null;

    const users = getAllUsers().sort((a, b) => b.hopePoints - a.hopePoints);
    const topThree = users.slice(0, 3);
    const restOfUsers = users.slice(3);

    const currentUserRank = users.findIndex(u => u.id === currentUser.id) + 1;
    const isCurrentUserInTop3 = currentUserRank > 0 && currentUserRank <= 3;

    return (
        <div className="p-4 pb-24">
            <header className="text-center my-6">
                <Trophy className="w-12 h-12 mx-auto text-[#D4AF37] mb-2" />
                <h1 className="text-3xl font-bold text-gray-800">{t('leaderboard.title')}</h1>
                <p className="text-md text-gray-500 mt-1">{t('leaderboard.subtitle')}</p>
            </header>

            {/* Top 3 Podium */}
            {topThree.length > 0 && (
                 <Card className="mb-6">
                    <div className="grid grid-cols-3 gap-2 items-end">
                        {/* 2nd Place */}
                        <div className="mt-4">
                            {topThree[1] && <PodiumCard user={topThree[1]} rank={2} isCurrentUser={topThree[1].id === currentUser.id} />}
                        </div>
                         {/* 1st Place */}
                        <div>
                             {topThree[0] && <PodiumCard user={topThree[0]} rank={1} isCurrentUser={topThree[0].id === currentUser.id} />}
                        </div>
                         {/* 3rd Place */}
                        <div className="mt-4">
                            {topThree[2] && <PodiumCard user={topThree[2]} rank={3} isCurrentUser={topThree[2].id === currentUser.id} />}
                        </div>
                    </div>
                </Card>
            )}

            {/* Rest of the list */}
            <div className="space-y-2">
                 <div className="flex items-center text-xs font-bold text-gray-500 px-4 py-2">
                    <div className="w-1/6 text-left">#</div>
                    <div className="w-3/6">{t('leaderboard.bearer')}</div>
                    <div className="w-2/6 text-right">{t('leaderboard.points')}</div>
                </div>
                {restOfUsers.map((user, index) => {
                    const rank = index + 4;
                    const isCurrentUser = user.id === currentUser.id;
                    return (
                        <div key={user.id} className={`flex items-center p-3 rounded-lg ${isCurrentUser ? 'bg-[#D4AF37]/20 border border-[#D4AF37]' : 'bg-white'}`}>
                            <div className="w-1/6 font-bold text-gray-700">{rank}</div>
                            <div className="w-3/6 flex items-center space-x-3 rtl:space-x-reverse">
                                <SymbolIcon name={user.symbolicIcon} className="w-6 h-6 text-gray-500" />
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-800 truncate">{user.symbolicName}</span>
                                    {user.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" title={t('verifiedOrg') as string} />}
                                </div>
                            </div>
                            <div className="w-2/6 text-right font-bold text-[#3A3A3A]">{user.hopePoints}</div>
                        </div>
                    );
                })}
            </div>

            {/* Current User's Rank */}
            {currentUserRank > 0 && !isCurrentUserInTop3 && (
                <div className="fixed bottom-20 left-4 right-4 z-10">
                     <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-[#D4AF37] flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="font-bold text-lg text-gray-700 mr-4 rtl:mr-0 rtl:ml-4">#{currentUserRank}</span>
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <SymbolIcon name={currentUser.symbolicIcon} className="w-8 h-8 text-gray-600" />
                                <div>
                                    <p className="font-bold text-gray-800">{currentUser.symbolicName}</p>
                                    <p className="text-xs text-gray-500">{t('leaderboard.yourPosition')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right rtl:text-left">
                           <p className="font-bold text-lg text-[#D4AF37]">{currentUser.hopePoints}</p>
                           <p className="text-xs text-gray-500">{t('leaderboard.points')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;