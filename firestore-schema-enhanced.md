# Enhanced Firestore Database Schema for Mitché Platform

## Overview
This document outlines a comprehensive Firestore database schema designed to support all current features and proposed enhancements for the Mitché platform. The schema follows NoSQL best practices and is optimized for real-time updates and scalability.

## Core Collections

### 1. users/
**Document ID**: Firebase Auth UID
```typescript
{
  // Core Profile
  id: string;
  email: string;
  username: string;
  displayName?: string; // From Google Auth
  symbolicName: string;
  symbolicIcon: string;
  role: 'Citizen' | 'NGO' | 'PublicWorker' | 'Admin';
  
  // Verification & Status
  isVerified: boolean;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected' | 'NotRequested';
  verificationDocuments?: string[]; // URLs to uploaded docs
  
  // Profile Details
  bio?: string;
  location: string;
  avatar?: string; // Profile photo URL
  phoneNumber?: string;
  preferredLanguage: 'en' | 'ar' | 'fr';
  
  // Hope Points & Gamification
  hopePoints: number;
  hopePointsBreakdown: {
    SilentHero?: number;
    VoiceOfCompassion?: number;
    CommunityBuilder?: number;
    CommunityGift?: number;
  };
  commendations: {
    Kind: number;
    Punctual: number;
    Respectful: number;
  };
  level: number; // User level based on hope points
  badges: string[]; // Achievement badges
  
  // Onboarding & Settings
  hasCompletedOnboarding: boolean;
  onboardingStep?: number;
  notificationSettings: {
    email: boolean;
    push: boolean;
    types: string[]; // Which notification types user wants
  };
  privacySettings: {
    showProfile: boolean;
    allowDirectMessages: boolean;
    showHopePoints: boolean;
  };
  
  // Analytics & Tracking
  lastActive: Date;
  joinDate: Date;
  activityStreakDays: number;
  totalRequestsCreated: number;
  totalOfferingsGiven: number;
  totalEventsOrganized: number;
  
  // Reveal Protocol
  nominationStatus?: 'Nominated' | 'AcceptedReveal' | 'AcceptedAnonymous';
  realName?: string;
  publicProfile?: {
    name: string;
    photo: string;
    story: string;
    achievements: string[];
  };
  
  // Security & Moderation
  reportCount: number;
  isSuspended: boolean;
  suspensionReason?: string;
  suspensionExpiry?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. requests/ (Echoes)
**Document ID**: Auto-generated
```typescript
{
  id: string;
  createdBy: string; // User ID
  
  // Request Details
  title: string;
  description: string;
  type: 'Food' | 'Shelter' | 'Medical' | 'Emotional' | 'Legal' | 'Employment';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  mode: 'Silent' | 'Loud';
  
  // Location & Timing
  location: {
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
  deadline?: Date;
  
  // Status & Fulfillment
  status: 'Open' | 'Pending' | 'Fulfilled' | 'Closed' | 'Expired';
  assignedHelper?: string; // User ID of helper
  
  // Interaction Tracking
  views: number;
  saves: number; // Users who bookmarked
  offeringsCount: number;
  
  // Creator Info (for display)
  creatorSymbolicName: string;
  creatorSymbolicIcon: string;
  
  // Verification & Moderation
  isVerified: boolean; // Admin verified
  flagCount: number;
  isFlagged: boolean;
  moderationNotes?: string;
  
  // Images & Attachments
  images?: string[]; // URLs to uploaded images
  documents?: string[]; // URLs to documents
  
  // Completion & Feedback
  completionDate?: Date;
  satisfactionRating?: number; // 1-5 rating
  feedback?: string;
  
  // Analytics
  responseTime?: number; // Time to first response in hours
  fulfillmentTime?: number; // Time to fulfillment in hours
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
```

### 3. offerings/
**Document ID**: Auto-generated
```typescript
{
  id: string;
  requestId: string;
  offeredBy: string; // User ID
  
  // Offering Details
  type: 'Help' | 'Encouragement' | 'Resource' | 'Financial';
  message: string;
  amount?: number; // For financial offerings
  resources?: string[]; // List of resources offered
  
  // Status & Tracking
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
  isSelected: boolean; // Whether this offering was chosen
  
  // Communication
  chatRoomId?: string; // Reference to chat room
  contactMethod: 'In-App' | 'Phone' | 'Email';
  
  // Timeline
  availableFrom: Date;
  availableTo?: Date;
  
  // Feedback & Ratings
  rating?: number; // Rating from requester
  feedback?: string;
  
  // Gamification
  hopePointsEarned: number;
  badgeEarned?: string;
  
  // Offerer Info (for display)
  offererSymbolicName: string;
  offererSymbolicIcon: string;
  offererIsVerified: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### 4. communityEvents/
**Document ID**: Auto-generated
```typescript
{
  id: string;
  organizerId: string; // User ID
  
  // Event Details
  title: string;
  description: string;
  type: 'Volunteer' | 'Event' | 'Workshop' | 'Fundraiser' | 'Awareness';
  category: 'Health' | 'Education' | 'Environment' | 'Social' | 'Emergency';
  
  // Schedule & Location
  startDate: Date;
  endDate: Date;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    venue?: string;
  };
  isVirtual: boolean;
  virtualLink?: string;
  
  // Capacity & Registration
  maxParticipants?: number;
  currentParticipants: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  participants: string[]; // Array of user IDs
  waitlist: string[]; // Array of user IDs on waitlist
  
  // Requirements & Details
  requirements?: string[]; // Skills, materials needed
  ageRestriction?: {
    min: number;
    max?: number;
  };
  tags: string[]; // Searchable tags
  
  // Organizer Info
  organizerSymbolicName: string;
  organizerSymbolicIcon: string;
  organizerRole: 'NGO' | 'PublicWorker' | 'Admin';
  organizerIsVerified: boolean;
  coOrganizers?: string[]; // Additional organizer user IDs
  
  // Status & Moderation
  status: 'Draft' | 'Published' | 'Cancelled' | 'Completed';
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  
  // Engagement
  views: number;
  saves: number;
  shares: number;
  
  // Media
  images?: string[];
  videos?: string[];
  documents?: string[];
  
  // Follow-up
  feedback?: {
    rating: number;
    comments: string[];
  };
  impactReport?: string; // Post-event impact summary
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

### 5. resources/
**Document ID**: Auto-generated
```typescript
{
  id: string;
  createdBy: string; // User ID
  
  // Resource Details
  title: string;
  description: string;
  category: 'Food' | 'Health' | 'Legal' | 'Education' | 'Shelter' | 'Employment' | 'Mental Health';
  subCategory?: string; // More specific categorization
  
  // Provider Information
  providerName: string;
  providerType: 'NGO' | 'Government' | 'Private' | 'Community';
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  
  // Availability
  schedule: {
    hours: string;
    days: string[];
    specialNotes?: string;
  };
  isAlwaysAvailable: boolean;
  capacity?: number; // How many people can be served
  
  // Location
  location: {
    region: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Requirements & Eligibility
  eligibilityCriteria?: string[];
  documentsRequired?: string[];
  ageRestrictions?: {
    min?: number;
    max?: number;
  };
  cost: 'Free' | 'Low Cost' | 'Sliding Scale' | 'Contact for Info';
  costDetails?: string;
  
  // Language Support
  languagesSupported: string[];
  
  // Quality & Trust
  verificationStatus: 'Verified' | 'Pending' | 'Not Verified';
  lastVerifiedDate?: Date;
  reviews: {
    count: number;
    averageRating: number;
  };
  
  // Usage Analytics
  views: number;
  clicks: number;
  saves: number;
  reports: number;
  
  // Creator Info
  creatorSymbolicName: string;
  creatorSymbolicIcon: string;
  creatorIsVerified: boolean;
  
  // Media
  images?: string[];
  brochures?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastUpdated: Date;
}
```

## Enhanced Collections

### 6. notifications/
**Document ID**: Auto-generated
```typescript
{
  id: string;
  recipientId: string; // User ID
  
  // Notification Content
  type: 'Request' | 'Offering' | 'Event' | 'System' | 'Achievement' | 'Reminder' | 'Moderation';
  title: string;
  message: string;
  
  // Internationalization
  messageKey?: string; // For i18n
  messageOptions?: Record<string, any>; // For i18n interpolation
  
  // Related Content
  relatedId?: string; // ID of related request, event, etc.
  relatedType?: 'Request' | 'Event' | 'Resource' | 'User';
  actionUrl?: string; // Deep link to relevant page
  
  // Status & Priority
  isRead: boolean;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  
  // Delivery
  channels: ('app' | 'email' | 'sms')[]; // How it was/will be sent
  deliveryStatus: 'Pending' | 'Sent' | 'Failed';
  
  // Scheduling
  scheduledFor?: Date; // For scheduled notifications
  expiresAt?: Date; // When notification becomes irrelevant
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
}
```

### 7. conversations/
**Document ID**: Auto-generated
```typescript
{
  id: string;
  type: 'DirectMessage' | 'RequestChat' | 'EventChat' | 'SupportTicket';
  
  // Participants
  participants: string[]; // Array of user IDs
  participantInfo: {
    [userId: string]: {
      symbolicName: string;
      symbolicIcon: string;
      lastReadMessageId?: string;
      joinedAt: Date;
      leftAt?: Date;
    };
  };
  
  // Related Content
  relatedId?: string; // Related request, event, etc.
  relatedType?: 'Request' | 'Event' | 'Resource';
  
  // Status
  isActive: boolean;
  isArchived: boolean;
  lastActivity: Date;
  
  // Moderation
  isReported: boolean;
  moderationFlags?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 8. messages/
**Document ID**: Auto-generated
**Parent Collection**: conversations/{conversationId}/messages
```typescript
{
  id: string;
  senderId: string; // User ID
  conversationId: string;
  
  // Message Content
  content: string;
  type: 'text' | 'image' | 'document' | 'location' | 'system';
  
  // Media
  attachments?: {
    type: 'image' | 'document' | 'audio';
    url: string;
    filename?: string;
    size?: number;
  }[];
  
  // Status
  isDelivered: boolean;
  readBy: {
    [userId: string]: Date;
  };
  
  // Moderation
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  
  // Reaction System
  reactions?: {
    [emoji: string]: string[]; // Array of user IDs who reacted
  };
  
  // Reply System
  replyTo?: string; // Message ID being replied to
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 9. tapestryThreads/
**Document ID**: Auto-generated
```typescript
{
  id: string;
  honoreeId: string; // User ID being honored
  nominatedBy: string; // User ID who nominated
  
  // Thread Details
  story: string;
  category: 'SilentHero' | 'VoiceOfCompassion' | 'CommunityBuilder' | 'CommunityGift';
  impactLevel: 'Local' | 'Regional' | 'Significant' | 'Extraordinary';
  
  // Visual Properties
  color: 'Gold' | 'Blue' | 'Amber' | 'Silver';
  pattern: 'Spirals' | 'Lines' | 'Waves' | 'Dots';
  
  // Impact Metrics
  livesTouched: number;
  hopePointsGenerated: number;
  communityReach: number;
  
  // Honoree Display Info
  honoreeSymbolicName: string;
  honoreeSymbolicIcon: string;
  honoreeRealName?: string; // If revealed
  honoreePhotoUrl?: string; // If revealed
  isAnonymous: boolean;
  
  // Approval Process
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string; // Admin user ID
  reviewNotes?: string;
  
  // Engagement
  views: number;
  likes: number;
  shares: number;
  comments: {
    count: number;
    recent: {
      userId: string;
      comment: string;
      timestamp: Date;
    }[];
  };
  
  // Timestamps
  createdAt: Date;
  approvedAt?: Date;
  updatedAt: Date;
}
```

### 10. reports/
**Document ID**: Auto-generated
```typescript
{
  id: string;
  reportedBy: string; // User ID
  reportedContent: {
    type: 'User' | 'Request' | 'Message' | 'Event' | 'Resource';
    id: string;
    contentSnapshot?: string; // Snapshot of reported content
  };
  
  // Report Details
  reason: 'Spam' | 'Inappropriate' | 'Harassment' | 'Fake' | 'Dangerous' | 'Other';
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Status & Resolution
  status: 'Open' | 'InReview' | 'Resolved' | 'Dismissed';
  assignedTo?: string; // Moderator user ID
  resolution?: string;
  actionTaken?: 'Warning' | 'ContentRemoval' | 'UserSuspension' | 'NoAction';
  
  // Timestamps
  createdAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;
}
```

## Analytics & System Collections

### 11. analytics/
**Document ID**: Date (YYYY-MM-DD) or event-specific ID
```typescript
{
  id: string;
  type: 'daily' | 'event' | 'user_action';
  
  // Daily Analytics
  date?: string; // YYYY-MM-DD
  metrics?: {
    activeUsers: number;
    newRegistrations: number;
    requestsCreated: number;
    offeringsGiven: number;
    eventsCreated: number;
    messagesExchanged: number;
    hopePointsAwarded: number;
  };
  
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
```

### 12. systemSettings/
**Document ID**: Setting name
```typescript
{
  id: string; // Setting name
  value: any; // Setting value
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isPublic: boolean; // Whether setting is visible to users
  lastModifiedBy: string; // Admin user ID
  updatedAt: Date;
}
```

### 13. achievements/
**Document ID**: Achievement ID
```typescript
{
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Requirements
  criteria: {
    type: 'hopePoints' | 'requests' | 'offerings' | 'events' | 'days' | 'combo';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  };
  
  // Rewards
  hopePointsReward: number;
  badgeUrl?: string;
  
  // Categories
  category: 'Helper' | 'Community' | 'Dedication' | 'Special';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  
  // Status
  isActive: boolean;
  isHidden: boolean; // Secret achievements
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 14. userAchievements/
**Document ID**: Composite (userId_achievementId)
```typescript
{
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
  earnedContext?: string; // What action triggered completion
  createdAt: Date;
  updatedAt: Date;
}
```

## Proposed Feature Enhancements

### 1. Enhanced Chat & Communication System
- **Real-time messaging** between users
- **File sharing** capabilities
- **Voice messages** for better emotional connection
- **Translation services** for multilingual communication
- **Conversation encryption** for sensitive discussions

### 2. Advanced Geolocation Features
- **Location-based request discovery**
- **Proximity alerts** for nearby help opportunities
- **Safe meetup locations** database
- **Route optimization** for helpers
- **Emergency location sharing**

### 3. Comprehensive Rating & Review System
- **Bidirectional ratings** (helper ↔ requester)
- **Detailed review categories** (punctuality, kindness, effectiveness)
- **Anonymous feedback system**
- **Trust score calculation**
- **Quality assurance for resources**

### 4. Advanced Analytics & Insights
- **Community impact dashboards**
- **Personal contribution analytics**
- **Regional needs analysis**
- **Trend identification**
- **Predictive modeling** for resource allocation

### 5. Enhanced Gamification
- **Achievement system** with progressive unlocks
- **Seasonal challenges** and community goals
- **Leaderboards** with privacy controls
- **Virtual rewards** and recognition ceremonies
- **Mentorship programs** for new users

### 6. AI-Powered Features
- **Smart request categorization**
- **Automated matching** of requests with helpers
- **Content moderation** using AI
- **Sentiment analysis** for community health
- **Predictive text** for better communication

### 7. Integration Capabilities
- **Social media sharing** (with privacy controls)
- **Calendar integration** for events
- **Payment gateway** for donations
- **Third-party service integration** (maps, translation)
- **API for partner organizations**

### 8. Safety & Security Enhancements
- **Identity verification** system
- **Background check integration** for sensitive requests
- **Emergency contacts** system
- **Safe word protocols**
- **Automated threat detection**

### 9. Accessibility & Inclusion
- **Screen reader compatibility**
- **Voice command interface**
- **High contrast themes**
- **Multi-language support** expansion
- **Cultural adaptation** features

### 10. Community Building Features
- **Local community groups**
- **Skill-sharing networks**
- **Mentorship matching**
- **Volunteer coordination**
- **Community impact stories**

## Implementation Priority

### Phase 1: Core Enhancements (Immediate)
1. Enhanced chat system
2. Improved rating/review system
3. Basic analytics dashboard
4. Achievement system
5. Better geolocation features

### Phase 2: Advanced Features (Short-term)
1. AI-powered matching
2. Advanced gamification
3. Payment integration
4. Enhanced safety features
5. Mobile app optimizations

### Phase 3: Innovation Features (Long-term)
1. Predictive analytics
2. Voice interface
3. AR/VR integration
4. Blockchain for trust
5. Advanced AI moderation

This comprehensive schema provides a robust foundation for scaling the Mitché platform while maintaining its core values of anonymity, compassion, and community support.