export enum Role {
  Citizen = 'Citizen',
  NGO = 'NGO',
  PublicWorker = 'PublicWorker',
  Admin = 'Admin',
}

export enum RequestType {
  Food = 'Food',
  Shelter = 'Shelter',
  Medical = 'Medical',
  Emotional = 'Emotional',
  Legal = 'Legal',
  Employment = 'Employment',
}

export enum RequestMode {
  Silent = 'Silent',
  Loud = 'Loud',
}

export enum HopePointCategory {
  SilentHero = 'SilentHero',
  VoiceOfCompassion = 'VoiceOfCompassion',
  CommunityBuilder = 'CommunityBuilder',
  CommunityGift = 'CommunityGift',
}

export enum RequestStatus {
  Open = 'Open',
  Pending = 'Pending',
  Fulfilled = 'Fulfilled',
  Closed = 'Closed',
}

export enum CommendationType {
  Kind = 'Kind',
  Punctual = 'Punctual',
  Respectful = 'Respectful',
}

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected' | 'NotRequested';

export interface User {
  id: string;
  username: string; // Login username for authentication
  password: string; // In a real app, this would be a hash
  symbolicName: string; // Chosen identity name displayed across the platform
  symbolicIcon: string; // Chosen symbolic icon for identity representation
  role: Role;
  hopePoints: number;
  hopePointsBreakdown: {
    [key in HopePointCategory]?: number;
  };
  // New fields for Reveal Protocol
  nominationStatus?: 'Nominated' | 'AcceptedReveal' | 'AcceptedAnonymous';
  realName?: string;
  photoUrl?: string; // a URL to an uploaded image
  // New profile fields
  bio?: string;
  location?: string;
  qrCodeUrl?: string;
  lastPointGivenTimestamp?: number;
  hasCompletedOnboarding?: boolean;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  commendations?: {
    [key in CommendationType]?: number;
  };
}

export interface Request {
  id: string;
  userId: string;
  userSymbolicName: string; // Creator's chosen symbolic identity name
  userSymbolicIcon: string; // Creator's chosen symbolic icon
  title: string;
  description: string;
  type: RequestType;
  mode: RequestMode;
  timestamp: Date;
  region: string;
  status: RequestStatus;
  helperId?: string;
  isConfirmedByRequester?: boolean;
  requesterCommended?: boolean;
  helperCommended?: boolean;
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
  id:string;
  userId: string;
  requestId?: string; // Optional for non-request-specific notifications
  message: string;
  timestamp: Date;
  isRead: boolean;
  type?: 'Generic' | 'Nomination'; // For Reveal Protocol
  messageKey?: string; // For i18n
  messageOptions?: Record<string, any>; // For i18n interpolation
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

export enum CommunityEventType {
  Volunteer = 'Volunteer',
  Event = 'Event',
}

export interface CommunityEvent {
  id: string;
  organizerId: string;
  organizerSymbolicName: string;
  organizerSymbolicIcon: string;
  organizerRole: Role;
  title: string;
  description: string;
  timestamp: Date;
  region: string;
  type: CommunityEventType;
  organizerIsVerified?: boolean;
}

// New Interfaces for Resource Hub
export enum ResourceCategory {
  Food = 'Food',
  Health = 'Health',
  Legal = 'Legal',
  Education = 'Education',
  Shelter = 'Shelter',
}

export interface Resource {
  id: string;
  organizerId: string;
  organizerSymbolicName: string;
  organizerSymbolicIcon: string;
  organizerIsVerified?: boolean;
  title: string;
  description: string;
  category: ResourceCategory;
  region: string;
  schedule: string;
  contactInfo?: string;
  timestamp: Date;
}