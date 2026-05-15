/**
 * Comparison sets — all use 4 items (Twirly's default).
 * Each is owned by exactly one persona key.
 * Items must exist in data/items.js by the same name.
 */
export const COMPARISONS = [
  // ── Alex: Tech Creator ─────────────────────────────────────────────────────
  {
    owner: 'alex',
    name: 'Best Flagship Smartphone 2024',
    category: 'Tech & Gadgets',
    items: ['iPhone 15 Pro', 'Samsung Galaxy S24 Ultra', 'Google Pixel 8 Pro', 'OnePlus 12'],
    aspects: [
      { metric: 'Camera Quality',  description: 'Photo & video capabilities in real-world conditions', weight: 3 },
      { metric: 'Battery Life',    description: 'All-day usability and fast-charging speed', weight: 2 },
      { metric: 'Performance',     description: 'Day-to-day speed and sustained load performance', weight: 2 },
      { metric: 'Value for Money', description: 'What you actually get for the asking price', weight: 1 },
    ],
  },
  {
    owner: 'alex',
    name: 'Best Wireless Headphones 2024',
    category: 'Tech & Gadgets',
    items: ['AirPods Pro 2', 'Sony WH-1000XM5', 'Bose QuietComfort 45', 'Beats Studio Pro'],
    aspects: [
      { metric: 'Sound Quality',      description: 'Overall audio fidelity, bass, and clarity', weight: 3 },
      { metric: 'Noise Cancellation', description: 'How well it blocks out the world', weight: 3 },
      { metric: 'Comfort & Fit',      description: 'Wearability over long sessions', weight: 2 },
      { metric: 'Battery Life',       description: 'Hours per charge and speed to recharge', weight: 1 },
    ],
  },
  {
    owner: 'alex',
    name: 'Cola Wars — The Definitive Ranking',
    category: 'Food & Drink',
    items: ['Coca-Cola', 'Pepsi', 'Dr Pepper', '7-Up'],
    aspects: [
      { metric: 'Taste',         description: 'Blind taste preference — sweetness, fizz, finish', weight: 3 },
      { metric: 'Versatility',   description: 'Works as a mixer and as a standalone drink', weight: 2 },
      { metric: 'Brand Loyalty', description: 'Emotional attachment and nostalgia factor', weight: 1 },
    ],
  },

  // ── Jordan: Power Voter ────────────────────────────────────────────────────
  {
    owner: 'jordan',
    name: 'Best Coffee Chain',
    category: 'Food & Drink',
    items: ['Starbucks', "Dunkin'", "Peet's Coffee", 'Tim Hortons'],
    aspects: [
      { metric: 'Coffee Quality',   description: 'Taste, consistency, and range of options', weight: 3 },
      { metric: 'Value for Money',  description: 'Price vs portion vs quality equation', weight: 2 },
      { metric: 'Vibe & Ambiance',  description: 'Experience of spending time in-store', weight: 1 },
      { metric: 'Speed of Service', description: 'How fast you get your drink', weight: 1 },
    ],
  },

  // ── Priya: Commenter ───────────────────────────────────────────────────────
  {
    owner: 'priya',
    name: 'Best Video Streaming Service',
    category: 'Streaming & Entertainment',
    items: ['Netflix', 'Disney+', 'Max (HBO)', 'Hulu'],
    aspects: [
      { metric: 'Content Library', description: 'Breadth and depth of available titles', weight: 3 },
      { metric: 'Original Shows',  description: 'Quality of exclusive productions', weight: 3 },
      { metric: 'Price & Value',   description: 'Cost vs content quantity and quality', weight: 2 },
      { metric: 'UI & Experience', description: 'How easy and enjoyable is the app to use', weight: 1 },
    ],
  },
  {
    owner: 'priya',
    name: 'Best Music Streaming Service',
    category: 'Streaming & Entertainment',
    items: ['Spotify', 'Apple Music', 'YouTube Music', 'Tidal'],
    aspects: [
      { metric: 'Music Discovery', description: 'Playlist curation, recommendations, and new finds', weight: 3 },
      { metric: 'Audio Quality',   description: 'Fidelity — lossless, spatial, and everyday listening', weight: 2 },
      { metric: 'UI & Experience', description: 'How easy and enjoyable is it to use daily', weight: 2 },
      { metric: 'Catalogue Size',  description: 'Total tracks and exclusives available', weight: 1 },
    ],
  },

  // ── Marcus: Reviewer ───────────────────────────────────────────────────────
  {
    owner: 'marcus',
    name: 'Best Daily Running Shoe',
    category: 'Fitness & Health',
    items: ['Nike Air Max 270', 'Adidas Ultraboost 23', 'New Balance Fresh Foam X 1080', 'ASICS Gel-Nimbus 25'],
    aspects: [
      { metric: 'Comfort',    description: 'Cushioning, support, and all-day wearability', weight: 3 },
      { metric: 'Style',      description: 'Looks — works as streetwear and sportswear?', weight: 2 },
      { metric: 'Durability', description: 'How well it holds up over months of use', weight: 2 },
      { metric: 'Price',      description: 'Value for the quality you get', weight: 1 },
    ],
  },

  // ── Riley: Contrarian ──────────────────────────────────────────────────────
  {
    owner: 'riley',
    name: 'Fast Fashion Showdown',
    category: 'Fashion & Style',
    items: ['Zara', 'H&M', 'Shein', 'Uniqlo'],
    aspects: [
      { metric: 'Style & Trend',  description: 'How closely each tracks the current runway trend cycle', weight: 3 },
      { metric: 'Build Quality',  description: 'Will it survive 10 washes?', weight: 2 },
      { metric: 'Sustainability', description: 'Visible effort on materials and supply chain', weight: 2 },
      { metric: 'Price',          description: 'Absolute affordability per item', weight: 1 },
    ],
  },
];
