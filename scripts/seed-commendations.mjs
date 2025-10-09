// scripts/seed-commendations.mjs
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase.js'; // Use .js extension for ESM

async function createInitialAchievements() {
  console.log('Creating initial achievements and commendations...');
  const achievements = [
    // ===== HBIM Pillar Commendations =====
    {
      id: 'pillar_existential_anchoring',
      name: 'Bearer of Inner Light',
      description: 'For grounding others in faith, values, or meaning during adversity.',
      icon: '🕯️',
      criteria: { type: 'commendations', value: 1, subType: 'BearerOfInnerLight' },
      hopePointsReward: 50,
      category: 'Pillar',
      rarity: 'Epic',
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
      category: 'Pillar',
      rarity: 'Epic',
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
      category: 'Pillar',
      rarity: 'Epic',
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
      category: 'Pillar',
      rarity: 'Epic',
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
      category: 'Pillar',
      rarity: 'Legendary',
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
      category: 'Symbolic',
      rarity: 'Rare',
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
      category: 'Symbolic',
      rarity: 'Rare',
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
      category: 'Symbolic',
      rarity: 'Legendary',
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
      category: 'Symbolic',
      rarity: 'Rare',
      isActive: true,
      isHidden: false,
    },
  ];

  const batch = writeBatch(db);
  for (const ach of achievements) {
    const ref = doc(db, 'achievements', ach.id);
    batch.set(ref, { ...ach, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  await batch.commit();
  console.log(`Seeded ${achievements.length} achievements and commendations.`);
}

async function seed() {
  console.log('Starting commendation seeding script...');
  try {
    await createInitialAchievements();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

seed();
