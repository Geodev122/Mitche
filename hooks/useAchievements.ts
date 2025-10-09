import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Achievement, AchievementRarity, AchievementCategory } from '../types-master';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const achievementsCollection = collection(db, 'achievements');
        const q = query(achievementsCollection, where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        const achievementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
        
        // Custom sort for rarity and category as Firestore order is alphabetical
        achievementsData.sort((a, b) => {
          const rarityOrder: AchievementRarity[] = [AchievementRarity.Common, AchievementRarity.Rare, AchievementRarity.Epic, AchievementRarity.Legendary];
          const categoryOrder: AchievementCategory[] = [AchievementCategory.Pillar, AchievementCategory.Symbolic, AchievementCategory.Helper, AchievementCategory.Community, AchievementCategory.Dedication, AchievementCategory.Special];
          
          const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
          if (rarityDiff !== 0) return rarityDiff;
          
          return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        });

        setAchievements(achievementsData);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching achievements: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return { achievements, loading, error };
};
