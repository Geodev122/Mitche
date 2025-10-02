// Firestore Database Structure for Mitché Platform
// This file documents the database collections and structure

/*
COLLECTIONS STRUCTURE:

1. users/
   - Document ID: user.id
   - Fields:
     * username: string
     * symbolicName: string
     * symbolicIcon: string
     * role: string (Citizen, NGO, PublicWorker, Admin)
     * hopePoints: number
     * hopePointsBreakdown: object
     * hasCompletedOnboarding: boolean
     * isVerified: boolean
     * verificationStatus: string
     * commendations: object
     * createdAt: timestamp
     * updatedAt: timestamp

2. requests/
   - Document ID: auto-generated
   - Fields:
     * userId: string (reference to users)
     * userSymbolicName: string
     * userSymbolicIcon: string
     * title: string
     * description: string
     * type: string (Food, Shelter, Medical, etc.)
     * mode: string (Silent, Loud)
     * region: string
     * status: string (Open, Pending, Fulfilled, Closed)
     * createdAt: timestamp
     * updatedAt: timestamp

3. offerings/
   - Document ID: auto-generated
   - Fields:
     * userId: string (reference to users)
     * requestId: string (reference to requests)
     * type: string (Help, Encouragement, Resource)
     * message: string
     * pointsEarned: number
     * createdAt: timestamp

4. communityEvents/
   - Document ID: auto-generated
   - Fields:
     * organizerId: string (reference to users)
     * organizerSymbolicName: string
     * organizerSymbolicIcon: string
     * organizerRole: string
     * title: string
     * description: string
     * region: string
     * type: string (Volunteer, Event)
     * organizerIsVerified: boolean
     * createdAt: timestamp

5. resources/
   - Document ID: auto-generated
   - Fields:
     * organizerId: string (reference to users)
     * organizerSymbolicName: string
     * organizerSymbolicIcon: string
     * organizerIsVerified: boolean
     * title: string
     * description: string
     * category: string (Food, Health, Legal, etc.)
     * region: string
     * schedule: string
     * contactInfo: string
     * createdAt: timestamp

6. notifications/
   - Document ID: auto-generated
   - Fields:
     * userId: string (reference to users)
     * requestId: string (optional)
     * message: string
     * type: string (Generic, Nomination)
     * isRead: boolean
     * messageKey: string (for i18n)
     * messageOptions: object (for i18n)
     * createdAt: timestamp

SECURITY RULES:
- Users can only read/write their own user document
- Users can read all requests but only create their own
- Only verified NGOs/PublicWorkers can create events and resources
- Admins have full access to user verification
*/