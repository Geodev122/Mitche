// Enhanced types for Mitché Platform
// This file defines comprehensive TypeScript interfaces for all data structures

// === ENUMS ===

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

export enum RequestStatus {
  Open = 'Open',
  Pending = 'Pending',
  Fulfilled = 'Fulfilled',
  Closed = 'Closed',
  Expired = 'Expired',
}

export enum RequestUrgency {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum HopePointCategory {
  SilentHero = 'SilentHero',
  VoiceOfCompassion = 'VoiceOfCompassion',
  CommunityBuilder = 'CommunityBuilder',
  CommunityGift = 'CommunityGift',
}

export enum CommendationType {
  Kind = 'Kind',
  Punctual = 'Punctual',
  Respectful = 'Respectful',
}

export enum CommunityEventType {
  Volunteer = 'Volunteer',
  Event = 'Event',
  Workshop = 'Workshop',
  Fundraiser = 'Fundraiser',
  Awareness = 'Awareness',
}

export enum EventCategory {
  Health = 'Health',
  Education = 'Education',
  Environment = 'Environment',
  Social = 'Social',
  Emergency = 'Emergency',
}

export enum ResourceCategory {
  Food = 'Food',
  Health = 'Health',
  Legal = 'Legal',
  Education = 'Education',
  Shelter = 'Shelter',
  Employment = 'Employment',
  MentalHealth = 'Mental Health',
}

export enum ProviderType {
  NGO = 'NGO',
  Government = 'Government',
  Private = 'Private',
  Community = 'Community',
}

export enum CostType {
  Free = 'Free',
  LowCost = 'Low Cost',
  SlidingScale = 'Sliding Scale',
  ContactForInfo = 'Contact for Info',
}

export enum NotificationType {
  Request = 'Request',
  Offering = 'Offering',
  Event = 'Event',
  System = 'System',
  Achievement = 'Achievement',
  Reminder = 'Reminder',
  Moderation = 'Moderation',
}

export enum NotificationPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent',
}

export enum ConversationType {
  DirectMessage = 'DirectMessage',
  RequestChat = 'RequestChat',
  EventChat = 'EventChat',
  SupportTicket = 'SupportTicket',
}

export enum MessageType {
  Text = 'text',
  Image = 'image',
  Document = 'document',
  Location = 'location',
  System = 'system',
}

export enum TapestryThreadColor {
  Gold = 'Gold',
  Blue = 'Blue', 
  Amber = 'Amber',
  Silver = 'Silver',
}

export enum TapestryThreadPattern {
  Spirals = 'Spirals',
  Lines = 'Lines',
  Waves = 'Waves',
  Dots = 'Dots',
}

export enum ImpactLevel {
  Local = 'Local',
  Regional = 'Regional',
  Significant = 'Significant',
  Extraordinary = 'Extraordinary',
}

export enum ReportReason {
  Spam = 'Spam',
  Inappropriate = 'Inappropriate',
  Harassment = 'Harassment',
  Fake = 'Fake',
  Dangerous = 'Dangerous',
  Other = 'Other',
}

export enum ReportStatus {
  Open = 'Open',
  InReview = 'InReview',
  Resolved = 'Resolved',
  Dismissed = 'Dismissed',
}

export enum ActionTaken {
  Warning = 'Warning',
  ContentRemoval = 'ContentRemoval',
  UserSuspension = 'UserSuspension',
  NoAction = 'NoAction',
}

export enum AchievementCategory {
  Helper = 'Helper',
  Community = 'Community',
  Dedication = 'Dedication',
  Special = 'Special',
}

export enum AchievementRarity {
  Common = 'Common',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
}

// === TYPE DEFINITIONS ===

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected' | 'NotRequested';
export type Language = 'en' | 'ar' | 'fr';
export type EventStatus = 'Draft' | 'Published' | 'Cancelled' | 'Completed';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type OfferingStatus = 'Pending' | 'Accepted' | 'Declined' | 'Completed';
export type ContactMethod = 'In-App' | 'Phone' | 'Email';
export type DeliveryStatus = 'Pending' | 'Sent' | 'Failed';
export type DeliveryChannel = 'app' | 'email' | 'sms';

// === CORE INTERFACES ===

export interface Location {
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  venue?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export interface Schedule {
  hours: string;
  days: string[];
  specialNotes?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  types: string[];
}

export interface PrivacySettings {
  showProfile: boolean;
  allowDirectMessages: boolean;
  showHopePoints: boolean;
}

export interface PublicProfile {
  name: string;
  photo: string;
  story: string;
  achievements: string[];
}

export interface AgeRestriction {
  min?: number;
  max?: number;
}

export interface Attachment {
  type: 'image' | 'document' | 'audio';
  url: string;
  filename?: string;
  size?: number;
}

export interface Comment {
  userId: string;
  comment: string;
  timestamp: Date;
}

export interface Review {
  count: number;
  averageRating: number;
}

export interface ParticipantInfo {
  symbolicName: string;
  symbolicIcon: string;
  lastReadMessageId?: string;
  joinedAt: Date;
  leftAt?: Date;
}

export interface EventFeedback {
  rating: number;
  comments: string[];
}

export interface AchievementCriteria {
  type: 'hopePoints' | 'requests' | 'offerings' | 'events' | 'days' | 'combo';
  value: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime';
}

export interface DailyMetrics {
  activeUsers: number;
  newRegistrations: number;
  requestsCreated: number;
  offeringsGiven: number;
  eventsCreated: number;
  messagesExchanged: number;
  hopePointsAwarded: number;
}

// === MAIN INTERFACES ===

export interface User {
  // Core Profile
  id: string;
  email?: string;
  username: string;
  displayName?: string;
  symbolicName: string;
  symbolicIcon: string;
  role: Role;
  
  // Legacy field for backward compatibility
  password?: string;
  
  // Verification & Status
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationDocuments?: string[];
  
  // Profile Details
  bio?: string;
  location?: string;
  avatar?: string;
  phoneNumber?: string;
  preferredLanguage?: Language;
  
  // Hope Points & Gamification
  hopePoints: number;
  hopePointsBreakdown: {
    [key in HopePointCategory]?: number;
  };
  commendations?: {
    [key in CommendationType]?: number;
  };
  level?: number;
  badges?: string[];
  
  // Onboarding & Settings
  hasCompletedOnboarding?: boolean;
  onboardingStep?: number;
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;
  
  // Analytics & Tracking
  lastActive?: string;
  joinDate?: string;
  activityStreakDays?: number;
  totalRequestsCreated?: number;
  totalOfferingsGiven?: number;
  totalEventsOrganized?: number;
  
  // Reveal Protocol
  nominationStatus?: 'Nominated' | 'AcceptedReveal' | 'AcceptedAnonymous';
  realName?: string;
  photoUrl?: string;
  publicProfile?: PublicProfile;
  
  // Security & Moderation
  reportCount?: number;
  isSuspended?: boolean;
  suspensionReason?: string;
  suspensionExpiry?: Date;
  
  // Legacy fields for backward compatibility
  qrCodeUrl?: string;
  lastPointGivenTimestamp?: number;
  languagePreference?: string;
}

export interface Request {
  id: string;
  createdBy: string;
  
  // Request Details
  title: string;
  description: string;
  type: RequestType;
  urgency?: RequestUrgency;
  mode: RequestMode;
  
  // Location & Timing
  location: Location;
  deadline?: Date;
  
  // Status & Fulfillment
  status: RequestStatus;
  assignedHelper?: string;
  
  // Interaction Tracking
  views?: number;
  saves?: number;
  offeringsCount?: number;
  
  // Creator Info (for display)
  userSymbolicName?: string; // Legacy field
  userSymbolicIcon?: string; // Legacy field
  creatorSymbolicName: string;
  creatorSymbolicIcon: string;
  
  // Verification & Moderation
  isVerified?: boolean;
  flagCount?: number;
  isFlagged?: boolean;
  moderationNotes?: string;
  
  // Images & Attachments
  images?: string[];
  documents?: string[];
  
  // Completion & Feedback
  completionDate?: Date;
  satisfactionRating?: number;
  feedback?: string;
  
  // Analytics
  responseTime?: number;
  fulfillmentTime?: number;
  
  // Legacy fields
  userId?: string; // Mapped to createdBy
  userSymbolicName?: string; // Legacy
  userSymbolicIcon?: string; // Legacy
  timestamp?: Date; // Legacy, use createdAt
  region?: string; // Legacy, use location.region
  helperId?: string; // Legacy, use assignedHelper
  isConfirmedByRequester?: boolean;
  requesterCommended?: boolean;
  helperCommended?: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface Offering {
  id: string;
  requestId: string;
  offeredBy: string;
  
  // Offering Details
  type: 'Help' | 'Encouragement' | 'Resource' | 'Financial';
  message: string;
  amount?: number;
  resources?: string[];
  
  // Status & Tracking
  status?: OfferingStatus;
  isSelected?: boolean;
  
  // Communication
  chatRoomId?: string;
  contactMethod?: ContactMethod;
  
  // Timeline
  availableFrom?: Date;
  availableTo?: Date;
  
  // Feedback & Ratings
  rating?: number;
  feedback?: string;
  
  // Gamification
  pointsEarned: number;
  badgeEarned?: string;
  
  // Offerer Info (for display)
  offererSymbolicName?: string;
  offererSymbolicIcon?: string;
  offererIsVerified?: boolean;
  
  // Legacy fields
  userId?: string; // Mapped to offeredBy
  timestamp?: Date; // Use createdAt instead
  hopePointsEarned?: number; // Mapped to pointsEarned
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CommunityEvent {
  id: string;
  organizerId: string;
  
  // Event Details
  title: string;
  description: string;
  type: CommunityEventType;
  category?: EventCategory;
  
  // Schedule & Location
  startDate?: Date;
  endDate?: Date;
  location: Location;
  isVirtual?: boolean;
  virtualLink?: string;
  
  // Capacity & Registration
  maxParticipants?: number;
  currentParticipants?: number;
  registrationRequired?: boolean;
  registrationDeadline?: Date;
  participants?: string[];
  waitlist?: string[];
  
  // Requirements & Details
  requirements?: string[];
  ageRestriction?: AgeRestriction;
  tags?: string[];
  
  // Organizer Info
  organizerSymbolicName: string;
  organizerSymbolicIcon: string;
  organizerRole: Role;
  organizerIsVerified?: boolean;
  coOrganizers?: string[];
  
  // Status & Moderation
  status?: EventStatus;
  approvalStatus?: ApprovalStatus;
  
  // Engagement
  views?: number;
  saves?: number;
  shares?: number;
  
  // Media
  images?: string[];
  videos?: string[];
  documents?: string[];
  
  // Follow-up
  feedback?: EventFeedback;
  impactReport?: string;
  
  // Legacy fields
  timestamp?: Date; // Use startDate instead
  region?: string; // Use location.region instead
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface Resource {
  id: string;
  createdBy: string;
  
  // Resource Details
  title: string;
  description: string;
  category: ResourceCategory;
  subCategory?: string;
  
  // Provider Information
  providerName?: string;
  providerType?: ProviderType;
  contactInfo: ContactInfo;
  
  // Availability
  schedule: Schedule;
  isAlwaysAvailable?: boolean;
  capacity?: number;
  
  // Location
  location: Location;
  
  // Requirements & Eligibility
  eligibilityCriteria?: string[];
  documentsRequired?: string[];
  ageRestrictions?: AgeRestriction;
  cost?: CostType;
  costDetails?: string;
  
  // Language Support
  languagesSupported?: string[];
  
  // Quality & Trust
  verificationStatus?: VerificationStatus;
  lastVerifiedDate?: Date;
  reviews?: Review;
  
  // Usage Analytics
  views?: number;
  clicks?: number;
  saves?: number;
  reports?: number;
  
  // Creator Info
  organizerId?: string; // Legacy field, mapped to createdBy
  organizerSymbolicName?: string; // Legacy
  organizerSymbolicIcon?: string; // Legacy
  organizerIsVerified?: boolean; // Legacy
  creatorSymbolicName: string;
  creatorSymbolicIcon: string;
  creatorIsVerified: boolean;
  
  // Media
  images?: string[];
  brochures?: string[];
  
  // Legacy fields
  region?: string; // Use location.region instead
  timestamp?: Date; // Use createdAt instead
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastUpdated?: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  
  // Notification Content
  type: NotificationType;
  title?: string;
  message: string;
  
  // Internationalization
  messageKey?: string;
  messageOptions?: Record<string, any>;
  
  // Related Content
  relatedId?: string;
  relatedType?: 'Request' | 'Event' | 'Resource' | 'User';
  actionUrl?: string;
  
  // Status & Priority
  isRead: boolean;
  priority?: NotificationPriority;
  
  // Delivery
  channels?: DeliveryChannel[];
  deliveryStatus?: DeliveryStatus;
  
  // Scheduling
  scheduledFor?: Date;
  expiresAt?: Date;
  
  // Legacy fields
  userId?: string; // Mapped to recipientId
  requestId?: string; // Mapped to relatedId when relatedType is 'Request'
  timestamp?: Date; // Use createdAt instead
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  
  // Participants
  participants: string[];
  participantInfo: {
    [userId: string]: ParticipantInfo;
  };
  
  // Related Content
  relatedId?: string;
  relatedType?: 'Request' | 'Event' | 'Resource';
  
  // Status
  isActive: boolean;
  isArchived: boolean;
  lastActivity: Date;
  
  // Moderation
  isReported?: boolean;
  moderationFlags?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  
  // Message Content
  content: string;
  type: MessageType;
  
  // Media
  attachments?: Attachment[];
  
  // Status
  isDelivered?: boolean;
  readBy?: {
    [userId: string]: Date;
  };
  
  // Moderation
  isEdited?: boolean;
  editedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  
  // Reaction System
  reactions?: {
    [emoji: string]: string[];
  };
  
  // Reply System
  replyTo?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface TapestryThread {
  id: string;
  honoreeId: string;
  nominatedBy: string;
  
  // Thread Details
  story: string;
  category: HopePointCategory;
  impactLevel?: ImpactLevel;
  
  // Visual Properties
  color: TapestryThreadColor;
  pattern: TapestryThreadPattern;
  
  // Impact Metrics
  livesTouched?: number;
  hopePointsGenerated?: number;
  communityReach?: number;
  
  // Honoree Display Info
  honoreeUserId?: string; // Legacy field, mapped to honoreeId
  honoreeSymbolicName: string;
  honoreeSymbolicIcon: string;
  honoreeRealName?: string;
  honoreePhotoUrl?: string;
  isAnonymous: boolean;
  
  // Approval Process
  approvalStatus?: ApprovalStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Engagement
  views?: number;
  likes?: number;
  shares?: number;
  comments?: {
    count: number;
    recent: Comment[];
  };
  
  // Legacy fields
  rippleTag?: number; // Mapped to livesTouched
  echoes?: number; // Legacy
  timestamp?: Date; // Use createdAt instead
  
  // Timestamps
  createdAt: Date;
  approvedAt?: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  reportedBy: string;
  reportedContent: {
    type: 'User' | 'Request' | 'Message' | 'Event' | 'Resource';
    id: string;
    contentSnapshot?: string;
  };
  
  // Report Details
  reason: ReportReason;
  description: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Status & Resolution
  status: ReportStatus;
  assignedTo?: string;
  resolution?: string;
  actionTaken?: ActionTaken;
  
  // Timestamps
  createdAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;
}

export interface Analytics {
  id: string;
  type: 'daily' | 'event' | 'user_action';
  
  // Daily Analytics
  date?: string;
  metrics?: DailyMetrics;
  
  // Event Analytics
  eventType?: string;
  eventData?: Record<string, any>;
  userId?: string;
  
  // Geographic Distribution
  regionBreakdown?: {
    [region: string]: number;
  };
  
  // Timestamps
  createdAt: Date;
}

export interface SystemSetting {
  id: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isPublic: boolean;
  lastModifiedBy: string;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Requirements
  criteria: AchievementCriteria;
  
  // Rewards
  hopePointsReward: number;
  badgeUrl?: string;
  
  // Categories
  category: AchievementCategory;
  rarity: AchievementRarity;
  
  // Status
  isActive: boolean;
  isHidden: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string; // userId_achievementId
  userId: string;
  achievementId: string;
  
  // Progress
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  
  // Completion Details
  completedAt?: Date;
  notificationSent: boolean;
  
  // Metadata
  earnedContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

// === UTILITY TYPES ===

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchFilters {
  type?: RequestType[];
  urgency?: RequestUrgency[];
  region?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: RequestStatus[];
}

export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

// === FORM INTERFACES ===

export interface CreateRequestForm {
  title: string;
  description: string;
  type: RequestType;
  urgency: RequestUrgency;
  mode: RequestMode;
  region: string;
  deadline?: Date;
  images?: File[];
}

export interface CreateEventForm {
  title: string;
  description: string;
  type: CommunityEventType;
  category: EventCategory;
  startDate: Date;
  endDate?: Date;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  maxParticipants?: number;
  registrationRequired: boolean;
  requirements?: string[];
}

export interface CreateResourceForm {
  title: string;
  description: string;
  category: ResourceCategory;
  providerName: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  address: string;
  region: string;
  schedule: string;
  cost: CostType;
  eligibilityCriteria?: string[];
}