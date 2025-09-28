export enum Role {
  Citizen = 'Citizen',
  NGO = 'NGO',
  PublicWorker = 'PublicWorker',
  Admin = 'Admin',
}

export enum RequestType {
  Food = 'طعام',
  Shelter = 'مأوى',
  Medical = 'دعم طبي',
  Emotional = 'دعم نفسي',
  Legal = 'مساعدة قانونية',
  Employment = 'فرصة عمل',
}

export enum RequestMode {
  Silent = 'Silent',
  Loud = 'Loud',
}

export enum HopePointCategory {
  SilentHero = 'بطل صامت',
  VoiceOfCompassion = 'صوت التعاطف',
  CommunityBuilder = 'باني المجتمع',
}

export enum RequestStatus {
  Open = 'مفتوح',
  Pending = 'قيد المراجعة',
  Fulfilled = 'تمت المساعدة',
  Closed = 'مغلق',
}

export interface User {
  id: string;
  symbolicName: string;
  symbolicIcon: string;
  role: Role;
  hopePoints: number;
  hopePointsBreakdown: {
    [key in HopePointCategory]?: number;
  };
  // New fields for Reveal Protocol
  nominationStatus?: 'Nominated' | 'AcceptedReveal' | 'AcceptedAnonymous';
  realName?: string;
  photoUrl?: string; // a URL to an uploaded image
}

export interface Request {
  id: string;
  userId: string;
  userSymbolicName: string;
  userSymbolicIcon: string;
  title: string;
  description: string;
  type: RequestType;
  mode: RequestMode;
  timestamp: Date;
  region: string;
  status: RequestStatus;
  helperId?: string;
  isConfirmedByRequester?: boolean;
}

export interface Offering {
  id: string;
  userId: string;
  requestId: string;
  type: 'Help' | 'Encouragement' | 'Resource';
  message: string;
  timestamp: Date;
  pointsEarned: number;
}

export interface Notification {
  id: string;
  userId: string;
  requestId?: string; // Optional for non-request-specific notifications
  message: string;
  timestamp: Date;
  isRead: boolean;
  type?: 'Generic' | 'Nomination'; // For Reveal Protocol
}

// New interface for Hope Tapestry
export enum TapestryThreadColor {
  Gold = 'Gold', // CommunityBuilder
  Blue = 'Blue', // SilentHero
  Amber = 'Amber', // VoiceOfCompassion
}

export enum TapestryThreadPattern {
  Spirals = 'Spirals', // Emotional
  Lines = 'Lines',     // Shelter, Medical, Food
  Waves = 'Waves',     // Legal, Employment
}

export interface TapestryThread {
  id: string;
  honoreeUserId: string;
  honoreeSymbolicName: string;
  honoreeSymbolicIcon: string;
  honoreeRealName?: string; // if revealed
  honoreePhotoUrl?: string; // if revealed
  isAnonymous: boolean;
  story: string;
  color: TapestryThreadColor;
  pattern: TapestryThreadPattern;
  rippleTag: number; // lives touched
  echoes: number;
  timestamp: Date;
}