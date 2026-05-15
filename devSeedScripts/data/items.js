/**
 * Global items that comparisons are built from.
 * Images use picsum.photos with named seeds — deterministic, no auth needed.
 * Add new items here; no other file needs to change unless a comparison uses them.
 */
export const ITEMS = [
  // ── Tech & Gadgets ─────────────────────────────────────────────────────────
  {
    name: 'iPhone 15 Pro',
    category: 'Tech & Gadgets',
    color: '#1C1C1E',
    image: 'https://picsum.photos/seed/iphone15pro/400/400',
    description: "Apple's flagship smartphone with titanium design and A17 Pro chip.",
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Tech & Gadgets',
    color: '#1A1A2E',
    image: 'https://picsum.photos/seed/galaxys24ultra/400/400',
    description: "Samsung's powerhouse with S Pen, 200MP camera, and 7-year updates.",
  },
  {
    name: 'Google Pixel 8 Pro',
    category: 'Tech & Gadgets',
    color: '#4285F4',
    image: 'https://picsum.photos/seed/googlepixel8pro/400/400',
    description: "Google's AI-first flagship with best-in-class computational photography and 7-year updates.",
  },
  {
    name: 'OnePlus 12',
    category: 'Tech & Gadgets',
    color: '#F5010C',
    image: 'https://picsum.photos/seed/oneplus12phone/400/400',
    description: 'OnePlus flagship with Hasselblad-tuned cameras, 100W charging, and near-stock Android.',
  },
  {
    name: 'AirPods Pro 2',
    category: 'Tech & Gadgets',
    color: '#F5F5F0',
    image: 'https://picsum.photos/seed/airpodspro2/400/400',
    description: "Apple's best-in-class wireless earbuds with adaptive transparency and H2 chip.",
  },
  {
    name: 'Sony WH-1000XM5',
    category: 'Tech & Gadgets',
    color: '#2C2C2C',
    image: 'https://picsum.photos/seed/sonywh1000xm5/400/400',
    description: "Sony's industry-leading over-ear headphones with 30-hour battery and multipoint.",
  },
  {
    name: 'Bose QuietComfort 45',
    category: 'Tech & Gadgets',
    color: '#C5A880',
    image: 'https://picsum.photos/seed/bosequietcomfort45/400/400',
    description: "Bose's flagship ANC headphones — supremely comfortable for long listening sessions.",
  },
  {
    name: 'Beats Studio Pro',
    category: 'Tech & Gadgets',
    color: '#FF3A30',
    image: 'https://picsum.photos/seed/beatsstudiopro/400/400',
    description: 'Apple-owned premium headphones with Personalized Spatial Audio and USB-C.',
  },

  // ── Food & Drink ───────────────────────────────────────────────────────────
  {
    name: 'Starbucks',
    category: 'Food & Drink',
    color: '#00704A',
    image: 'https://picsum.photos/seed/starbucks/400/400',
    description: "The world's most popular coffee chain — 33,000+ locations globally.",
  },
  {
    name: "Dunkin'",
    category: 'Food & Drink',
    color: '#FF671F',
    image: 'https://picsum.photos/seed/dunkin/400/400',
    description: 'America runs on Dunkin — affordable coffee and breakfast on the go.',
  },
  {
    name: "Peet's Coffee",
    category: 'Food & Drink',
    color: '#4A2C17',
    image: 'https://picsum.photos/seed/peetscoffee/400/400',
    description: 'The original premium coffee chain, beloved for deep, dark roasts since 1966.',
  },
  {
    name: 'Tim Hortons',
    category: 'Food & Drink',
    color: '#C8102E',
    image: 'https://picsum.photos/seed/timhortons/400/400',
    description: "Canada's most iconic coffee chain — double-double culture runs deep.",
  },
  {
    name: 'Coca-Cola',
    category: 'Food & Drink',
    color: '#F40009',
    image: 'https://picsum.photos/seed/cocacola/400/400',
    description: "The world's most recognized soft drink since 1886.",
  },
  {
    name: 'Pepsi',
    category: 'Food & Drink',
    color: '#004B93',
    image: 'https://picsum.photos/seed/pepsi/400/400',
    description: "Coca-Cola's biggest rival — sweeter taste, bold branding.",
  },
  {
    name: 'Dr Pepper',
    category: 'Food & Drink',
    color: '#6B0E0E',
    image: 'https://picsum.photos/seed/drpepper/400/400',
    description: 'The uniquely flavored soft drink with 23 flavors — a loyal cult following.',
  },
  {
    name: '7-Up',
    category: 'Food & Drink',
    color: '#00A550',
    image: 'https://picsum.photos/seed/sevenup/400/400',
    description: 'The crisp, clean lemon-lime soda — the uncola since 1929.',
  },

  // ── Streaming & Entertainment ──────────────────────────────────────────────
  {
    name: 'Netflix',
    category: 'Streaming & Entertainment',
    color: '#E50914',
    image: 'https://picsum.photos/seed/netflix/400/400',
    description: '270M subscribers, the streaming giant that started it all.',
  },
  {
    name: 'Disney+',
    category: 'Streaming & Entertainment',
    color: '#113CCF',
    image: 'https://picsum.photos/seed/disneyplus/400/400',
    description: 'Marvel, Star Wars, Pixar, and Disney classics under one roof.',
  },
  {
    name: 'Max (HBO)',
    category: 'Streaming & Entertainment',
    color: '#002BE7',
    image: 'https://picsum.photos/seed/hbomax/400/400',
    description: "HBO's prestige content plus Warner Bros films — home of Game of Thrones and The Last of Us.",
  },
  {
    name: 'Hulu',
    category: 'Streaming & Entertainment',
    color: '#1CE783',
    image: 'https://picsum.photos/seed/hulu/400/400',
    description: 'Next-day TV episodes plus Originals and a live TV option — the hybrid streamer.',
  },
  {
    name: 'Spotify',
    category: 'Streaming & Entertainment',
    color: '#1DB954',
    image: 'https://picsum.photos/seed/spotify/400/400',
    description: "600M users, 100M tracks — the world's most used music streaming app.",
  },
  {
    name: 'Apple Music',
    category: 'Streaming & Entertainment',
    color: '#FC3C44',
    image: 'https://picsum.photos/seed/applemusic/400/400',
    description: 'Hi-res lossless audio, Spatial Audio, and tight Apple ecosystem integration.',
  },
  {
    name: 'YouTube Music',
    category: 'Streaming & Entertainment',
    color: '#FF0000',
    image: 'https://picsum.photos/seed/youtubemusic/400/400',
    description: "Google's music service — backed by the world's largest music video library.",
  },
  {
    name: 'Tidal',
    category: 'Streaming & Entertainment',
    color: '#00CFFF',
    image: 'https://picsum.photos/seed/tidalmusic/400/400',
    description: 'Artist-owned streaming with Hi-Fi Plus lossless and exclusive drops.',
  },

  // ── Fitness & Health ───────────────────────────────────────────────────────
  {
    name: 'Nike Air Max 270',
    category: 'Fitness & Health',
    color: '#111111',
    image: 'https://picsum.photos/seed/nikeairmax270/400/400',
    description: 'Iconic Air cushioning — lifestyle and sport crossover silhouette.',
  },
  {
    name: 'Adidas Ultraboost 23',
    category: 'Fitness & Health',
    color: '#ECEFF1',
    image: 'https://picsum.photos/seed/adidasultraboost23/400/400',
    description: 'Energy-return Boost foam, OceanPlastic upper — runner favourite.',
  },
  {
    name: 'New Balance Fresh Foam X 1080',
    category: 'Fitness & Health',
    color: '#CF4520',
    image: 'https://picsum.photos/seed/newbalancefreshfoam/400/400',
    description: 'Premium daily trainer with ultra-plush Fresh Foam X midsole — a marathon staple.',
  },
  {
    name: 'ASICS Gel-Nimbus 25',
    category: 'Fitness & Health',
    color: '#4B6CB7',
    image: 'https://picsum.photos/seed/asicsgelnimbus25/400/400',
    description: "ASICS' flagship daily trainer — the original long-run companion, now with PureGEL.",
  },

  // ── Fashion & Style ────────────────────────────────────────────────────────
  {
    name: 'Zara',
    category: 'Fashion & Style',
    color: '#1A1A1A',
    image: 'https://picsum.photos/seed/zarafashion/400/400',
    description: 'Fast fashion giant — runway trends at high-street prices.',
  },
  {
    name: 'H&M',
    category: 'Fashion & Style',
    color: '#E50010',
    image: 'https://picsum.photos/seed/handmfashion/400/400',
    description: 'Affordable, inclusive fashion with a growing sustainability range.',
  },
  {
    name: 'Shein',
    category: 'Fashion & Style',
    color: '#A8D0E6',
    image: 'https://picsum.photos/seed/sheinfashion/400/400',
    description: 'Ultra-fast fashion with thousands of new styles daily at rock-bottom prices.',
  },
  {
    name: 'Uniqlo',
    category: 'Fashion & Style',
    color: '#FF0000',
    image: 'https://picsum.photos/seed/uniqlofashion/400/400',
    description: 'Japanese LifeWear brand — exceptional basics with a quality-to-price ratio that shames everyone.',
  },
];
