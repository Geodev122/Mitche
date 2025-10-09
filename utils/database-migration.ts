// Database Migration Scripts for Enhanced Mitché Platform
// Seeds system settings, HBIM pillar achievements, and symbolic commendations.

import { db, admin } from '../services/firebase-admin';
import type {
  SystemSetting,
  Achievement,
} from '../types-master';
import { AchievementCategory, AchievementRarity } from '../types-master';


export class DatabaseMigration {
  async seedInitial(): Promise<void> {
    console.log('Seeding initial data...');
    await this.createInitialSystemSettings();
    await this.createInitialAchievements();
    console.log('Seeding complete.');
  }

  private async createInitialSystemSettings(): Promise<void> {
    console.log('Creating initial system settings...');
    const settings: Omit<SystemSetting, 'updatedAt' | 'lastModifiedBy'>[] = [
      { id: 'app_version', value: '2.1.0', type: 'string', description: 'Current application version', isPublic: true },
      { id: 'maintenance_mode', value: false, type: 'boolean', description: 'App maintenance mode', isPublic: true },
      { id: 'achievementsEnabled', value: true, type: 'boolean', description: 'Toggle achievements system', isPublic: false },
      { id: 'max_hope_points_per_day', value: 100, type: 'number', description: 'Max daily hope points', isPublic: false },
      { id: 'supported_languages', value: ['en', 'ar', 'fr'], type: 'array', description: 'Supported languages', isPublic: true },
      {
        id: 'feature_flags',
        value: { chatEnabled: false, tapestryEnabled: true, geolocationEnabled: true },
        type: 'object',
        description: 'Feature flags',
        isPublic: true,
      },
    ];

    const batch = db.batch();
    for (const s of settings) {
      const ref = db.collection('systemSettings').doc(s.id);
      batch.set(ref, { ...s, lastModifiedBy: 'system', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    await batch.commit();
    console.log(`Created ${settings.length} system settings.`);
  }

  private async createInitialAchievements(): Promise<void> {
    console.log('Creating initial achievements and commendations...');
    const achievements: Omit<Achievement, 'createdAt' | 'updatedAt'>[] = [
      // ===== HBIM Pillar Commendations =====
      {
        id: 'pillar_existential_anchoring',
        name: 'Bearer of Inner Light',
        description: 'For grounding others in faith, values, or meaning during adversity.',
        icon: '🕯️',
        criteria: { type: 'commendations', value: 1, subType: 'BearerOfInnerLight' },
        hopePointsReward: 50,
        category: AchievementCategory.Pillar,
        rarity: AchievementRarity.Epic,
        isActive: true,
        isHidden: false,
      },
      {
        id: 'pillar_narrative_bridging',
        name: 'Weaver of Wisdom',
        description: 'For transforming personal suffering into stories that guide and uplift.',
        icon: '🕸️',
        criteria: { type: 'commendations', value: 1, subType: 'WeaverOfWisdom' },
        hopePointsReward: 50,
        category: AchievementCategory.Pillar,
        rarity: AchievementRarity.Epic,
        isActive: true,
        isHidden: false,
      },
      {
        id: 'pillar_symbolic_activation',
        name: 'Keeper of Sacred Symbols',
        description: 'For creating rituals, gestures, or art that turn pain into communal meaning.',
        icon: '⚜️',
        criteria: { type: 'commendations', value: 1, subType: 'KeeperOfSacredSymbols' },
        hopePointsReward: 50,
        category: AchievementCategory.Pillar,
        rarity: AchievementRarity.Epic,
        isActive: true,
        isHidden: false,
      },
      {
        id: 'pillar_dialogical_positioning',
        name: 'Voice of Compassion',
        description: 'For nurturing healing through dialogue—with others, with God, or with self.',
        icon: '🕊️',
        criteria: { type: 'commendations', value: 1, subType: 'VoiceOfCompassion' },
        hopePointsReward: 50,
        category: AchievementCategory.Pillar,
        rarity: AchievementRarity.Epic,
        isActive: true,
        isHidden: false,
      },
      {
        id: 'pillar_transpersonal_resonance',
        name: 'Legacy of Light',
        description: 'For extending hope beyond the self—into families, communities, and time.',
        icon: '🌟',
        criteria: { type: 'commendations', value: 1, subType: 'LegacyOfLight' },
        hopePointsReward: 50,
        category: AchievementCategory.Pillar,
        rarity: AchievementRarity.Legendary,
        isActive: true,
        isHidden: false,
      },

      // ===== Additional Symbolic Commendations =====
      {
        id: 'symbolic_silent_hero',
        name: 'Silent Hero',
        description: 'For quiet acts of dignity that ripple without recognition.',
        icon: '🤫',
        criteria: { type: 'actions', value: 10, subType: 'silentHelp' },
        hopePointsReward: 30,
        category: AchievementCategory.Symbolic,
        rarity: AchievementRarity.Rare,
        isActive: true,
        isHidden: false,
      },
      {
        id: 'symbolic_community_builder',
        name: 'Community Builder',
        description: 'For constructing spaces/activities—physical or emotional—where others can heal.',
        icon: '🏗️',
        criteria: { type: 'events', value: 3, subType: 'organizer' },
        hopePointsReward: 40,
        category: AchievementCategory.Symbolic,
        rarity: AchievementRarity.Rare,
        isActive: true,
        isHidden: false,
      },
      {
        id: 'symbolic_lantern_of_continuity',
        name: 'Lantern of Continuity',
        description: 'For sustaining hope across generations, especially in posthumous or long-term impact, or laws submitted, reform achieved.',
        icon: '🏮',
        criteria: { type: 'impact', value: 1, subType: 'longTerm' },
        hopePointsReward: 100,
        category: AchievementCategory.Symbolic,
        rarity: AchievementRarity.Legendary,
        isActive: true,
        isHidden: true, // Awarded manually by admin
      },
      {
        id: 'symbolic_flower_of_testimony',
        name: 'Flower of Testimony',
        description: 'For offering one’s story as a seed of transformation for others.',
        icon: '🌸',
        criteria: { type: 'tapestry', value: 5 },
        hopePointsReward: 25,
        category: AchievementCategory.Symbolic,
        rarity: AchievementRarity.Rare,
        isActive: true,
        isHidden: false,
      },
    ];

    const batch = db.batch();
    for (const ach of achievements) {
      const ref = db.collection('achievements').doc(ach.id);
      batch.set(ref, { ...ach, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    await batch.commit();
    console.log(`Seeded ${achievements.length} achievements and commendations.`);
  }
}

export const databaseMigration = new DatabaseMigration();