/**
 * Marketing copy for the public Solar CRM page (/solar-crm).
 * Kept concise so cards stay compact on screen.
 */

export const SOLAR_CRM_CARDS = [
  {
    id: 'what',
    title: 'What is Solar CRM?',
    body:
      'One workspace for verified Infrio sellers: leads, customers, services, and tasks—less spreadsheet work, more installs.',
    bullets: ['Dashboard for enquiries & follow-ups', 'Customer records linked to your services', 'Built for solar, not generic CRM'],
    image: require('../images/solar/sol-maintenance.jpg'),
  },
  {
    id: 'how',
    title: 'How it works day to day',
    body:
      'Enquiries hit your pipeline; you assign staff, log visits, and track proposals. Buyers still see your services on Infrio while your team shares one source of truth.',
    bullets: ['Prioritise leads from Infrio traffic', 'Roles & handoffs stay clear', 'Services and notes stay in sync'],
    image: require('../images/solar/sol-commercial.jpg'),
  },
  {
    id: 'why',
    title: 'Why partners use it',
    body:
      'Faster replies and clear ownership build trust. Milestones follow real solar steps—survey through handover—so nothing slips.',
    bullets: ['Stages match solar projects', 'Less friction between sales & ops', 'Scales with crew & regions'],
    image: require('../images/solar/sol-residential.jpg'),
  },
];
