import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Achievement } from '../../types-master';
import { useAchievements } from '../../hooks/useAchievements';
import Card from './Card';

const AchievementsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { achievements, loading, error } = useAchievements();

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'text-purple-500';
      case 'epic':
        return 'text-orange-500';
      case 'rare':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return <Card><p>{t('loadingAchievements', 'Loading achievements...')}</p></Card>;
  }

  if (error) {
    return <Card><p className="text-red-500">{t('errorLoadingAchievements', 'Error loading achievements.')}</p></Card>;
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3">{t('achievements', 'Achievements')}</h3>
      {achievements.length === 0 ? (
        <p className="text-sm text-gray-500">{t('noAchievementsYet', 'No achievements yet.')}</p>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement: Achievement) => (
            <div key={achievement.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-4xl flex-shrink-0 w-12 h-12 flex items-center justify-center bg-amber-100 rounded-full">
                {achievement.icon}
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-md text-gray-800">{t(achievement.name, achievement.name)}</h4>
                <p className="text-sm text-gray-600 mt-1">{t(achievement.description, achievement.description)}</p>
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                  <span className="font-medium">{t('rarity', 'Rarity')}: <span className={`font-bold ${getRarityColor(achievement.rarity)}`}>{t(achievement.rarity, achievement.rarity)}</span></span>
                  <span className="font-medium">{t('category', 'Category')}: <span className="font-semibold">{t(achievement.category, achievement.category)}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AchievementsPanel;
