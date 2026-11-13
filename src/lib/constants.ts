export const APP_NAME = 'Clutch Arena'
export const APP_TAGLINE = 'Play quick. Beat everyone. Climb the ranks.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const GAMES = [
  {
    id: 'color-snap',
    slug: 'color-snap',
    name: 'Color Snap',
    description: 'Test your reflexes! Tap the matching color as fast as you can. Speed and accuracy determine your score.',
    category: 'reaction' as const,
    difficulty: 'medium' as const,
    duration: 45,
    instructions: [
      'A target color appears at the top',
      'Tap the matching color from the grid below',
      'Be fast — speed gives bonus points',
      'Build combos for multiplied scores',
      'Wrong taps reset your combo',
    ],
    gradient: 'from-purple-500 to-pink-500',
    icon: '🎯',
  },
  {
    id: 'memory-matrix',
    slug: 'memory-matrix',
    name: 'Memory Matrix',
    description: 'Watch the pattern, then repeat it. How far can your memory take you?',
    category: 'memory' as const,
    difficulty: 'medium' as const,
    duration: 120,
    instructions: [
      'Watch the tiles light up in sequence',
      'Repeat the sequence by tapping tiles in order',
      'Each level adds more tiles to remember',
      'The grid grows as you advance',
      'You have 3 lives — use them wisely',
    ],
    gradient: 'from-blue-500 to-cyan-500',
    icon: '🧠',
  },
  {
    id: 'typeclash',
    slug: 'typeclash',
    name: 'TypeClash',
    description: 'How fast can you type? Race against the clock to type sentences as quickly and accurately as possible.',
    category: 'typing' as const,
    difficulty: 'easy' as const,
    duration: 60,
    instructions: [
      'Type the displayed sentence as fast as you can',
      'Accuracy matters — typos reduce your score',
      'Complete sentences to get new ones',
      'Build speed for bonus multipliers',
      'Perfect sentences earn bonus points',
    ],
    gradient: 'from-green-500 to-emerald-500',
    icon: '⌨️',
  },
  {
    id: 'ludo',
    slug: 'ludo',
    name: 'Ludo',
    description: 'The classic board game of strategy and luck! Roll the dice, race your tokens home, and capture opponents along the way.',
    category: 'strategy' as const,
    difficulty: 'medium' as const,
    duration: 300,
    instructions: [
      'Roll a 6 to bring tokens out of base',
      'Move tokens clockwise around the board',
      'Land on opponent tokens to send them back',
      'Get all 4 tokens to the finish to win',
      'Rolling a 6 gives you an extra turn',
    ],
    gradient: 'from-red-500 to-yellow-500',
    icon: '🎲',
  },
] as const

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/games', label: 'Games', icon: 'Gamepad2' },
  { href: '/ranked', label: 'Ranked', icon: 'Trophy' },
  { href: '/daily-challenge', label: 'Daily Challenge', icon: 'Calendar' },
  { href: '/friends', label: 'Friends', icon: 'Users' },
  { href: '/profile', label: 'Profile', icon: 'User' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
  { href: '/premium', label: 'Premium', icon: 'Crown' },
] as const
