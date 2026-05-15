export const SHARED_PASSWORD = 'Seed1234!';

/**
 * Six loggable user personas covering distinct behavior archetypes:
 *   alex   — The Creator      (owns 3 sets, broad activity)
 *   jordan — The Power Voter  (votes on everything, owns 1)
 *   priya  — The Commenter    (long comment threads, owns 2)
 *   marcus — The Reviewer     (detailed item reviews, owns 1)
 *   sam    — The Newbie       (1 vote, no comparisons — empty-state testing)
 *   riley  — The Contrarian   (always votes for the underdog, owns 1)
 */
export const PERSONAS = [
  {
    key: 'alex',
    email: 'alex@twirly.dev',
    name: 'Alex Chen',
    username: 'alexchen',
    displayName: 'Alex Chen',
    bio: 'Comparing things since 2024. 📱 Tech • ☕ Coffee • 🎧 Music. Opinions are my own and they are correct.',
    interests: ['Tech & Gadgets', 'Streaming & Entertainment', 'Food & Drink'],
    notifications: { email: true, push: true, comment: true, marketing: false },
  },
  {
    key: 'jordan',
    email: 'jordan@twirly.dev',
    name: 'Jordan Lee',
    username: 'jordanlee',
    displayName: 'Jordan Lee',
    bio: 'Here for the takes. Will vote on anything.',
    interests: ['Food & Drink', 'Fashion & Style'],
    notifications: { email: false, push: true, comment: false, marketing: false },
  },
  {
    key: 'priya',
    email: 'priya@twirly.dev',
    name: 'Priya Sharma',
    username: 'priyasharma',
    displayName: 'Priya Sharma',
    bio: 'I have opinions about everything and will explain them at length. Streaming & music reviewer.',
    interests: ['Streaming & Entertainment', 'Travel & Lifestyle'],
    notifications: { email: true, push: true, comment: true, marketing: true },
  },
  {
    key: 'marcus',
    email: 'marcus@twirly.dev',
    name: 'Marcus Williams',
    username: 'marcusw',
    displayName: 'Marcus W.',
    bio: 'Product reviewer. Tech, audio, and running shoes specifically. Long-form reviews only.',
    interests: ['Tech & Gadgets', 'Fitness & Health'],
    notifications: { email: true, push: false, comment: true, marketing: false },
  },
  {
    key: 'sam',
    email: 'sam@twirly.dev',
    name: 'Sam Park',
    username: 'samp',
    displayName: 'Sam',
    bio: 'Just joined — figuring this out.',
    interests: ['Tech & Gadgets'],
    notifications: { email: true, push: true, comment: true, marketing: false },
  },
  {
    key: 'riley',
    email: 'riley@twirly.dev',
    name: 'Riley Foster',
    username: 'rileyf',
    displayName: 'Riley',
    bio: 'Underdogs and lost causes. The mainstream is usually wrong.',
    interests: ['Streaming & Entertainment', 'Fashion & Style'],
    notifications: { email: false, push: true, comment: true, marketing: false },
  },
];

export const CATEGORIES = [
  'Tech & Gadgets',
  'Food & Drink',
  'Streaming & Entertainment',
  'Fitness & Health',
  'Fashion & Style',
  'Travel & Lifestyle',
];
