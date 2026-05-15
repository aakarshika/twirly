/**
 * Votes, comments, and reviews.
 * - VOTES: one vote per persona per comparison. Riley always picks the underdog.
 * - COMMENTS: persona-flavored — Priya verbose, Jordan terse, Riley spicy.
 * - REVIEWS: Marcus writes most; others contribute selectively.
 */

// ── Votes ─────────────────────────────────────────────────────────────────────
export const VOTES = [
  // Best Flagship — iPhone wins 3 votes (of 6 total)
  { set: 'Best Flagship Smartphone 2024', votes: [
    ['alex',   'iPhone 15 Pro'],
    ['jordan', 'Samsung Galaxy S24 Ultra'],
    ['priya',  'iPhone 15 Pro'],
    ['marcus', 'iPhone 15 Pro'],
    ['sam',    'Google Pixel 8 Pro'],
    ['riley',  'OnePlus 12'],           // always the underdog pick
  ] },

  // Best Headphones — Sony wins 3 votes
  { set: 'Best Wireless Headphones 2024', votes: [
    ['alex',   'AirPods Pro 2'],
    ['jordan', 'Sony WH-1000XM5'],
    ['priya',  'Sony WH-1000XM5'],
    ['marcus', 'Sony WH-1000XM5'],
    ['riley',  'Bose QuietComfort 45'], // underdog vs Sony/Apple
  ] },

  // Cola Wars — Coke wins 3, Dr Pepper gets the contrarian vote
  { set: 'Cola Wars — The Definitive Ranking', votes: [
    ['alex',   'Coca-Cola'],
    ['jordan', 'Pepsi'],
    ['priya',  'Coca-Cola'],
    ['marcus', 'Coca-Cola'],
    ['riley',  'Dr Pepper'],            // underdog
  ] },

  // Best Coffee Chain — Starbucks edges Dunkin' 2-1-1
  { set: 'Best Coffee Chain', votes: [
    ['alex',   'Starbucks'],
    ['jordan', "Dunkin'"],
    ['marcus', 'Starbucks'],
    ['riley',  "Peet's Coffee"],        // underdog
  ] },

  // Best Video Streaming — Netflix leads, one each for the others
  { set: 'Best Video Streaming Service', votes: [
    ['alex',   'Netflix'],
    ['jordan', 'Disney+'],
    ['priya',  'Netflix'],
    ['marcus', 'Max (HBO)'],
    ['riley',  'Hulu'],                 // underdog
  ] },

  // Best Music Streaming — Spotify wins 3 votes
  { set: 'Best Music Streaming Service', votes: [
    ['alex',   'Spotify'],
    ['jordan', 'Apple Music'],
    ['priya',  'Spotify'],
    ['marcus', 'Spotify'],
    ['riley',  'Tidal'],                // underdog
  ] },

  // Best Running Shoe — split result, New Balance gets underdog love
  { set: 'Best Daily Running Shoe', votes: [
    ['alex',   'Adidas Ultraboost 23'],
    ['jordan', 'Nike Air Max 270'],
    ['priya',  'Adidas Ultraboost 23'],
    ['marcus', 'ASICS Gel-Nimbus 25'],
    ['sam',    'New Balance Fresh Foam X 1080'],
    ['riley',  'New Balance Fresh Foam X 1080'], // underdog over Nike/Adidas
  ] },

  // Fast Fashion — Uniqlo wins on quality (Riley's contrarian pick)
  { set: 'Fast Fashion Showdown', votes: [
    ['alex',   'Zara'],
    ['jordan', 'Uniqlo'],
    ['priya',  'H&M'],
    ['riley',  'Uniqlo'],               // Uniqlo as the quality underdog
  ] },
];

// ── Comments ──────────────────────────────────────────────────────────────────
export const COMMENTS = [
  // Best Flagship Smartphone
  { set: 'Best Flagship Smartphone 2024', by: 'alex',   text: "The titanium build on the 15 Pro is a game-changer — it genuinely feels more premium in hand than any phone I've owned." },
  { set: 'Best Flagship Smartphone 2024', by: 'jordan', text: "S24 Ultra's S Pen alone makes it irreplaceable for note-taking. Nothing else even comes close." },
  { set: 'Best Flagship Smartphone 2024', by: 'priya',  text: 'I keep flipping. The iPhone "just works" but Samsung lets me actually customise my phone. Pixel is the dark horse — pure Android with the best camera software bar none.' },
  { set: 'Best Flagship Smartphone 2024', by: 'riley',  text: "Everyone defaults to iPhone because their friends have iMessage. That is not a quality argument, that is a network effects argument. OnePlus 12 does 90% of the same for half the price." },

  // Best Wireless Headphones
  { set: 'Best Wireless Headphones 2024', by: 'priya',  text: 'For commuting on the tube the XM5 noise cancellation is in a different league. I tried Sony and Bose side by side for a week and Sony wins by a meaningful margin.' },
  { set: 'Best Wireless Headphones 2024', by: 'marcus', text: "AirPods win on ecosystem convenience. Sony wins on raw audio. Bose wins on comfort for 8-hour sessions. They are different products serving different users — context matters." },
  { set: 'Best Wireless Headphones 2024', by: 'alex',   text: "Switched from Sony to AirPods Pro and the spatial audio on lossless Apple Music is genuinely different. If you're in the Apple ecosystem the Pro 2s are hard to beat." },

  // Cola Wars
  { set: 'Cola Wars — The Definitive Ranking', by: 'alex',   text: 'Coke in a glass bottle, ice cold, is one of the best things on earth. Nothing else even competes in that specific form factor.' },
  { set: 'Cola Wars — The Definitive Ranking', by: 'riley',  text: 'Everyone sleeping on Dr Pepper. It has been the same recipe since 1885. That is staying power.' },
  { set: 'Cola Wars — The Definitive Ranking', by: 'jordan', text: 'Pepsi is objectively sweeter on a taste test. Coke wins on brand nostalgia, not flavour.' },

  // Best Coffee Chain
  { set: 'Best Coffee Chain', by: 'priya',  text: "Dunkin' cold brew is criminally underrated. Half the price, same caffeine hit. I'd rather spend the saved $3 on a pastry that actually tastes good." },
  { set: 'Best Coffee Chain', by: 'alex',   text: "Starbucks customisation is unmatched. 15 different ways to order the same latte — either a blessing or a curse depending on the line behind you." },
  { set: 'Best Coffee Chain', by: 'jordan', text: 'Vote based on which one is on your route to work. The rest is marketing.' },
  { set: 'Best Coffee Chain', by: 'riley',  text: "Peet's roasts darker and cares more. It's not even close on quality. The other three are convenience brands, not coffee brands." },

  // Best Video Streaming
  { set: 'Best Video Streaming Service', by: 'alex',  text: 'Netflix might be losing ground but The Bear, Beef, and Ripley keep me subscribed. Their drama output is still class-leading.' },
  { set: 'Best Video Streaming Service', by: 'priya', text: 'Disney+ has the deeper library if you count Marvel, Star Wars, Pixar, and the back catalogue. Max has the prestige. Netflix has the originals. Hulu has the day-after TV. The correct answer is all four.' },
  { set: 'Best Video Streaming Service', by: 'riley', text: 'Netflix cancels everything I love after one season. Disney+ at least commits to its IPs. Max is the only one consistently putting out adult prestige drama.' },

  // Best Music Streaming
  { set: 'Best Music Streaming Service', by: 'priya', text: "Spotify Discover Weekly changed how I find music — still unbeaten 10 years in. I have a 14-year listening history there that I cannot move without losing my identity." },
  { set: 'Best Music Streaming Service', by: 'alex',  text: 'Switched to Apple Music for spatial audio on AirPods and never looked back. The lossless quality difference is real when your headphones support it.' },
  { set: 'Best Music Streaming Service', by: 'riley', text: "Tidal pays artists better and has genuine hi-fi audio. The catalogue is the same. The only reason people don't use it is brand inertia." },

  // Best Running Shoe
  { set: 'Best Daily Running Shoe', by: 'priya',  text: 'Ultraboost for actual running. Air Max for the gym selfie. They are not the same use case and pretending they are does a disservice to both products.' },
  { set: 'Best Daily Running Shoe', by: 'marcus', text: "Half marathon: ASICS Gel-Nimbus. Walking the dog: Air Max. Track day: Ultraboost. Each has its place. The Fresh Foam 1080 is the true all-rounder nobody talks about." },
  { set: 'Best Daily Running Shoe', by: 'riley',  text: 'New Balance has been making serious running shoes since 1906. The fact that Nike and Adidas get more votes is entirely a marketing budget story.' },

  // Fast Fashion
  { set: 'Fast Fashion Showdown', by: 'priya', text: "Zara turns runway looks around in 2 weeks but H&M's basics last twice as long. Buy your statement pieces at Zara, your t-shirts at H&M. Shein is a different category entirely — disposable clothing." },
  { set: 'Fast Fashion Showdown', by: 'riley', text: "None of the above, honestly. But Uniqlo's Heattech and AIRism are genuinely technical garments at a price point nobody else touches. Buy less, buy better." },
];

// ── Reviews ───────────────────────────────────────────────────────────────────
export const REVIEWS = [
  { item: 'iPhone 15 Pro',            by: 'alex',   likes: 12, text: "The 15 Pro is the best iPhone yet. USB-C was overdue, titanium feels great, and the A17 Pro handles everything. Camera still leads the pack for video creators. Only downside: still no always-on when tilting the Dynamic Island." },
  { item: 'iPhone 15 Pro',            by: 'marcus', likes: 7,  text: "Coming from Galaxy S23, the ecosystem switch was worth it. iMessage, Handoff, and Continuity Camera are things you don't realise you miss until you have them. The titanium edge is sharper than expected though." },
  { item: 'Samsung Galaxy S24 Ultra', by: 'marcus', likes: 9,  text: "The S Pen integration is class-leading. Note-taking mid-call, quick sketches, magnifying small text — these are not gimmicks, I use them daily. Battery easily lasts 1.5 days for me." },
  { item: 'Sony WH-1000XM5',          by: 'marcus', likes: 14, text: "Best ANC headphones I've owned. The Multipoint connection (two devices at once) is genuinely useful. Only issue: the folding mechanism feels less robust than the XM4." },
  { item: 'Bose QuietComfort 45',     by: 'riley',  likes: 5,  text: "Underrated vs the Sony hype machine. The QC45 comfort over 8-hour sessions is unmatched — foam earcups that feel like nothing. ANC is slightly behind Sony but the difference is marginal after the first 10 minutes." },
  { item: 'Spotify',                  by: 'priya',  likes: 6,  text: "Still wins on discovery. Their ML recommendations have put me onto artists I never would have found otherwise. The podcast integration is okay but feels bolted on, and the new home screen redesign is a step backwards." },
  { item: 'Netflix',                  by: 'alex',   likes: 21, text: "Content quality is still there but they need to stop cancelling things after one season. The recommendation algorithm has gotten worse — it shows me the same 10 things repeatedly." },
  { item: 'Max (HBO)',                by: 'priya',  likes: 8,  text: "The Last of Us, Succession, White Lotus, True Detective — Max has the best prestige drama catalogue on any platform. The app is a disaster but the content makes up for it." },
  { item: 'Adidas Ultraboost 23',     by: 'riley',  likes: 8,  text: "Ran a half marathon in these and my feet thanked me. The Boost foam returns energy in a way Air does not. Sizing runs half a size small — order up." },
  { item: 'New Balance Fresh Foam X 1080', by: 'marcus', likes: 11, text: "The 1080 is what I recommend to every runner who asks. Enough cushion for daily 10ks, light enough that you don't feel bogged down, and it lasts 600+ miles. The Fresh Foam X update over the v12 is a genuine upgrade." },
  { item: 'Uniqlo',                   by: 'riley',  likes: 9,  text: "Heattech, AIRism, Ultra Light Down — three products that outperform anything at 5x the price. Uniqlo is the only fast fashion brand I'd defend without embarrassment. The basics are genuinely exceptional." },
];
