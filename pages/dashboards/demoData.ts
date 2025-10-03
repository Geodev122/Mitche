// Demo content for dashboards. Admin can remove these entries without affecting core app logic.
export const DEMO_REQUESTS = [
  {
    id: 'demo_req_1',
    userSymbolicName: 'Demo_Hope',
    userSymbolicIcon: 'Lantern',
    title: 'Need help with groceries',
    description: 'Looking for short-term food assistance for the week.',
    type: 'Food',
    mode: 'Loud',
    timestamp: new Date(),
    region: 'Demo City',
    status: 'Open'
  }
];

export const DEMO_EVENTS = [
  {
    id: 'demo_evt_1',
    organizerSymbolicName: 'Demo_NGO',
    organizerSymbolicIcon: 'Lantern',
    title: 'Community Clean-up (Demo)',
    description: 'Join us to clean the local park and share a meal.',
    timestamp: new Date(),
    region: 'Demo City',
    type: 'Volunteer'
  }
];

export const DEMO_RESOURCES = [
  {
    id: 'demo_res_1',
    organizerSymbolicName: 'Demo_Resource',
    organizerSymbolicIcon: 'Star',
    title: 'Free legal clinic (Demo)',
    description: 'Volunteer lawyers offering first-line advice every month.',
    category: 'Legal',
    region: 'Demo City',
    schedule: 'First Friday, 09:00 - 13:00',
    timestamp: new Date()
  }
];
