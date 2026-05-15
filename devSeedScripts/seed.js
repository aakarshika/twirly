/**
 * Twirly dev seed — creates 6 loggable user personas, each with distinct behavior,
 * so you can sign in as different archetypes and exercise every flow.
 *
 * All personas share the same password: Seed1234!
 *
 *   alex@twirly.dev    — The Creator      (owns 3 sets, broad activity)
 *   jordan@twirly.dev  — The Power Voter  (votes on everything, owns 1)
 *   priya@twirly.dev   — The Commenter    (long comment threads, owns 2)
 *   marcus@twirly.dev  — The Reviewer     (detailed item reviews, owns 1)
 *   sam@twirly.dev     — The Newbie       (1 vote, no comparisons — empty-state testing)
 *   riley@twirly.dev   — The Contrarian   (always votes for the underdog, owns 1)
 *
 * Run from repo root: pnpm run seed
 *
 * Idempotent — wipes previous persona data before rebuilding, so re-running
 * always produces a clean, consistent state.
 *
 * Requires:
 *   - Postgres running (docker compose up -d)
 *   - API running (pnpm run dev:api)  — signup goes through Better Auth API
 *   - apps/api/.env populated
 */

import pg from 'pg';

const DB_URL = process.env.DATABASE_URL ?? 'postgresql://twirly:twirly@localhost:7432/twirly';
const API_BASE = process.env.BETTER_AUTH_URL ?? 'http://localhost:8734';

const pool = new pg.Pool({ connectionString: DB_URL });
const q = (text, params) => pool.query(text, params);

const SHARED_PASSWORD = 'Seed1234!';

// ────────────────────────────────────────────────────────────────────────────
// PERSONAS — the source of truth for who exists.
// ────────────────────────────────────────────────────────────────────────────

const PERSONAS = [
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

// ────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Tech & Gadgets',
  'Food & Drink',
  'Streaming & Entertainment',
  'Fitness & Health',
  'Fashion & Style',
  'Travel & Lifestyle',
];

// ────────────────────────────────────────────────────────────────────────────
// ITEMS — the things being compared
// ────────────────────────────────────────────────────────────────────────────

const ITEMS = [
  // Tech
  { name: 'iPhone 15 Pro',            category: 'Tech & Gadgets',            color: '#1C1C1E', description: "Apple's flagship smartphone with titanium design and A17 Pro chip." },
  { name: 'Samsung Galaxy S24 Ultra', category: 'Tech & Gadgets',            color: '#1A1A2E', description: "Samsung's powerhouse with S Pen, 200MP camera, and 7-year updates." },
  { name: 'AirPods Pro 2',            category: 'Tech & Gadgets',            color: '#FFFFFF', description: "Apple's best-in-class wireless earbuds with adaptive transparency." },
  { name: 'Sony WH-1000XM5',          category: 'Tech & Gadgets',            color: '#2C2C2C', description: "Sony's industry-leading over-ear headphones with 30h battery." },
  // Food & Drink
  { name: 'Starbucks',                category: 'Food & Drink',              color: '#00704A', description: "The world's most popular coffee chain — 33,000+ locations globally." },
  { name: "Dunkin'",                  category: 'Food & Drink',              color: '#FF671F', description: 'America runs on Dunkin — affordable coffee and breakfast on the go.' },
  { name: 'Coca-Cola',                category: 'Food & Drink',              color: '#F40009', description: "The world's most recognized soft drink since 1886." },
  { name: 'Pepsi',                    category: 'Food & Drink',              color: '#004B93', description: "Coca-Cola's biggest rival — sweeter taste, bold branding." },
  // Streaming
  { name: 'Netflix',                  category: 'Streaming & Entertainment', color: '#E50914', description: '270M subscribers, the streaming giant that started it all.' },
  { name: 'Disney+',                  category: 'Streaming & Entertainment', color: '#113CCF', description: 'Marvel, Star Wars, Pixar, and Disney classics under one roof.' },
  { name: 'Spotify',                  category: 'Streaming & Entertainment', color: '#1DB954', description: "600M users, 100M tracks — the world's most used music app." },
  { name: 'Apple Music',              category: 'Streaming & Entertainment', color: '#FC3C44', description: 'Hi-res lossless audio, spatial sound, and tight Apple ecosystem integration.' },
  // Fitness
  { name: 'Nike Air Max 270',         category: 'Fitness & Health',          color: '#111111', description: 'Iconic Air cushioning, lifestyle + sport crossover silhouette.' },
  { name: 'Adidas Ultraboost 23',     category: 'Fitness & Health',          color: '#ECEFF1', description: 'Energy-return Boost foam, OceanPlastic upper, runner favourite.' },
  // Fashion
  { name: 'Zara',                     category: 'Fashion & Style',           color: '#000000', description: 'Fast fashion giant — runway trends at high-street prices.' },
  { name: 'H&M',                      category: 'Fashion & Style',           color: '#E50010', description: 'Affordable, inclusive fashion with growing sustainability range.' },
];

// ────────────────────────────────────────────────────────────────────────────
// COMPARISONS — each owned by exactly one persona
// ────────────────────────────────────────────────────────────────────────────

const COMPARISONS = [
  {
    owner: 'alex',
    name: 'iPhone 15 Pro vs Galaxy S24 Ultra',
    category: 'Tech & Gadgets',
    items: ['iPhone 15 Pro', 'Samsung Galaxy S24 Ultra'],
    aspects: [
      { metric: 'Camera Quality', description: 'Photo & video capabilities in real-world conditions', weight: 3 },
      { metric: 'Battery Life',   description: 'All-day usability and fast-charging speed', weight: 2 },
      { metric: 'Performance',    description: 'Day-to-day speed and sustained performance under load', weight: 2 },
    ],
  },
  {
    owner: 'alex',
    name: 'AirPods Pro 2 vs Sony WH-1000XM5',
    category: 'Tech & Gadgets',
    items: ['AirPods Pro 2', 'Sony WH-1000XM5'],
    aspects: [
      { metric: 'Sound Quality',      description: 'Overall audio fidelity, bass, and clarity', weight: 3 },
      { metric: 'Noise Cancellation', description: 'How well it blocks out the world', weight: 3 },
      { metric: 'Comfort & Fit',      description: 'Wearability over long sessions', weight: 2 },
    ],
  },
  {
    owner: 'alex',
    name: 'Coca-Cola vs Pepsi — The Classic Debate',
    category: 'Food & Drink',
    items: ['Coca-Cola', 'Pepsi'],
    aspects: [
      { metric: 'Taste',         description: 'Blind taste preference — sweetness, fizz, finish', weight: 3 },
      { metric: 'Brand Loyalty', description: 'Emotional attachment and nostalgia factor', weight: 1 },
    ],
  },
  {
    owner: 'jordan',
    name: "Starbucks vs Dunkin'",
    category: 'Food & Drink',
    items: ['Starbucks', "Dunkin'"],
    aspects: [
      { metric: 'Coffee Quality',  description: 'Taste, consistency, and range of options', weight: 3 },
      { metric: 'Value for Money', description: 'Price vs portion vs quality equation', weight: 2 },
      { metric: 'Vibe & Ambiance', description: 'Experience of spending time in-store', weight: 1 },
    ],
  },
  {
    owner: 'priya',
    name: 'Netflix vs Disney+',
    category: 'Streaming & Entertainment',
    items: ['Netflix', 'Disney+'],
    aspects: [
      { metric: 'Content Library', description: 'Breadth and depth of available titles', weight: 3 },
      { metric: 'Original Shows',  description: 'Quality of exclusive productions', weight: 3 },
      { metric: 'Price & Value',   description: 'Cost vs content quantity and quality', weight: 2 },
    ],
  },
  {
    owner: 'priya',
    name: 'Spotify vs Apple Music',
    category: 'Streaming & Entertainment',
    items: ['Spotify', 'Apple Music'],
    aspects: [
      { metric: 'Music Discovery', description: 'Playlist curation, recommendations, and new finds', weight: 3 },
      { metric: 'Audio Quality',   description: 'Fidelity — lossless, spatial, and everyday listening', weight: 2 },
      { metric: 'UI & Experience', description: 'How easy and enjoyable is it to use daily', weight: 2 },
    ],
  },
  {
    owner: 'marcus',
    name: 'Nike Air Max 270 vs Adidas Ultraboost 23',
    category: 'Fitness & Health',
    items: ['Nike Air Max 270', 'Adidas Ultraboost 23'],
    aspects: [
      { metric: 'Comfort',    description: 'Cushioning, support, and all-day wearability', weight: 3 },
      { metric: 'Style',      description: 'Looks — does it work as streetwear and sportswear?', weight: 2 },
      { metric: 'Durability', description: 'How well it holds up over months of use', weight: 2 },
    ],
  },
  {
    owner: 'riley',
    name: 'Zara vs H&M — Fast Fashion Showdown',
    category: 'Fashion & Style',
    items: ['Zara', 'H&M'],
    aspects: [
      { metric: 'Style & Trend',  description: 'How closely each tracks the current runway trend cycle', weight: 3 },
      { metric: 'Build Quality',  description: 'Will it survive 10 washes?', weight: 2 },
      { metric: 'Sustainability', description: 'Visible effort on materials and supply chain', weight: 2 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// VOTES — one row per persona × comparison.
// Each set has a designed winner. Riley always picks the underdog.
// Sam votes only once (newbie). Others vary to make totals non-trivial.
// ────────────────────────────────────────────────────────────────────────────

const VOTES = [
  // 1. iPhone vs Samsung — iPhone wins 4-2
  { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', votes: [
    ['alex',   'iPhone 15 Pro'],
    ['jordan', 'Samsung Galaxy S24 Ultra'],
    ['priya',  'iPhone 15 Pro'],
    ['marcus', 'iPhone 15 Pro'],
    ['sam',    'iPhone 15 Pro'],
    ['riley',  'Samsung Galaxy S24 Ultra'],
  ] },
  // 2. AirPods vs Sony — Sony wins 3-2
  { set: 'AirPods Pro 2 vs Sony WH-1000XM5', votes: [
    ['alex',   'AirPods Pro 2'],
    ['jordan', 'Sony WH-1000XM5'],
    ['priya',  'Sony WH-1000XM5'],
    ['marcus', 'Sony WH-1000XM5'],
    ['riley',  'AirPods Pro 2'],
  ] },
  // 3. Coke vs Pepsi — Coke wins 3-2
  { set: 'Coca-Cola vs Pepsi — The Classic Debate', votes: [
    ['alex',   'Coca-Cola'],
    ['jordan', 'Pepsi'],
    ['priya',  'Coca-Cola'],
    ['marcus', 'Coca-Cola'],
    ['riley',  'Pepsi'],
  ] },
  // 4. Starbucks vs Dunkin' — TIE 2-2 (useful for testing tied-results UI)
  { set: "Starbucks vs Dunkin'", votes: [
    ['alex',   'Starbucks'],
    ['jordan', "Dunkin'"],
    ['marcus', 'Starbucks'],
    ['riley',  "Dunkin'"],
  ] },
  // 5. Netflix vs Disney+ — Netflix wins 3-2
  { set: 'Netflix vs Disney+', votes: [
    ['alex',   'Netflix'],
    ['jordan', 'Disney+'],
    ['priya',  'Netflix'],
    ['marcus', 'Netflix'],
    ['riley',  'Disney+'],
  ] },
  // 6. Spotify vs Apple Music — Spotify wins 3-2
  { set: 'Spotify vs Apple Music', votes: [
    ['alex',   'Spotify'],
    ['jordan', 'Apple Music'],
    ['priya',  'Spotify'],
    ['marcus', 'Spotify'],
    ['riley',  'Apple Music'],
  ] },
  // 7. Nike vs Adidas — Adidas wins 4-2
  { set: 'Nike Air Max 270 vs Adidas Ultraboost 23', votes: [
    ['alex',   'Adidas Ultraboost 23'],
    ['jordan', 'Nike Air Max 270'],
    ['priya',  'Adidas Ultraboost 23'],
    ['marcus', 'Adidas Ultraboost 23'],
    ['sam',    'Adidas Ultraboost 23'],
    ['riley',  'Nike Air Max 270'],
  ] },
  // 8. Zara vs H&M — TIE 2-2 (owner Riley picks underdog)
  { set: 'Zara vs H&M — Fast Fashion Showdown', votes: [
    ['alex',   'Zara'],
    ['jordan', 'H&M'],
    ['priya',  'Zara'],
    ['riley',  'H&M'],
  ] },
];

// ────────────────────────────────────────────────────────────────────────────
// COMMENTS — persona-flavored. Priya verbose; Jordan terse; Riley spicy.
// ────────────────────────────────────────────────────────────────────────────

const COMMENTS = [
  // iPhone vs Samsung
  { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', by: 'alex',   text: 'The titanium build on the 15 Pro is a game-changer — it genuinely feels more premium in hand.' },
  { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', by: 'jordan', text: "S24 Ultra's S Pen alone makes it irreplaceable for note-taking." },
  { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', by: 'priya',  text: 'I keep flipping. The iPhone "just works" but Samsung lets me actually customize my phone — depends what you value more on any given week.' },
  { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', by: 'riley',  text: 'Everyone defaults to iPhone because their friends have iMessage. That is not a quality argument.' },

  // AirPods vs Sony
  { set: 'AirPods Pro 2 vs Sony WH-1000XM5', by: 'priya',  text: 'For commuting on the tube the XM5 noise cancellation is in a different league. I tried both side by side for a week.' },
  { set: 'AirPods Pro 2 vs Sony WH-1000XM5', by: 'marcus', text: 'AirPods win on convenience for Apple users. Sony wins on raw audio quality. Different products, same category.' },

  // Starbucks vs Dunkin'
  { set: "Starbucks vs Dunkin'", by: 'priya',  text: "Dunkin cold brew is criminally underrated. Half the price, same caffeine hit. I'd rather spend the saved $3 on a pastry that actually tastes good." },
  { set: "Starbucks vs Dunkin'", by: 'alex',   text: 'Starbucks customisation is unmatched. 15 different ways to order the same latte — either a blessing or a curse depending on the line behind you.' },
  { set: "Starbucks vs Dunkin'", by: 'jordan', text: 'Vote based on which one is on your route to work. The rest is marketing.' },

  // Netflix vs Disney+
  { set: 'Netflix vs Disney+', by: 'alex',  text: 'Netflix might be losing ground but shows like The Bear and Beef keep me subscribed.' },
  { set: 'Netflix vs Disney+', by: 'priya', text: 'Disney+ has the deeper library if you count Marvel, Star Wars, Pixar, and the back catalog. Netflix has the better originals right now. Both is the only correct answer.' },
  { set: 'Netflix vs Disney+', by: 'riley', text: 'Netflix cancels everything I love after one season. Disney+ at least commits.' },

  // Spotify vs Apple Music
  { set: 'Spotify vs Apple Music', by: 'priya', text: 'Spotify Discover Weekly changed how I find music — still unbeaten for discovery algorithms. I have a 14-year listening history there that I cannot easily move.' },
  { set: 'Spotify vs Apple Music', by: 'alex',  text: 'Switched to Apple Music for spatial audio on my AirPods and never looked back. The lossless quality is real.' },

  // Nike vs Adidas
  { set: 'Nike Air Max 270 vs Adidas Ultraboost 23', by: 'priya',  text: 'Ultraboost for actual running. Air Max for the gym selfie. They are not the same use case, and pretending they are is silly.' },
  { set: 'Nike Air Max 270 vs Adidas Ultraboost 23', by: 'marcus', text: 'Half marathon distance: Ultraboost. Walking the dog: Air Max. Both have their place.' },

  // Zara vs H&M
  { set: 'Zara vs H&M — Fast Fashion Showdown', by: 'priya', text: "Zara turns runway looks around faster but H&M's basics last twice as long. Buy your statement pieces from Zara, your t-shirts from H&M." },
  { set: 'Zara vs H&M — Fast Fashion Showdown', by: 'riley', text: "Neither, honestly. But if I had to pick one, H&M's Conscious line is at least pretending to try." },
];

// ────────────────────────────────────────────────────────────────────────────
// REVIEWS — Marcus writes most; others contribute selectively.
// ────────────────────────────────────────────────────────────────────────────

const REVIEWS = [
  { item: 'iPhone 15 Pro',            by: 'alex',   likes: 12, text: 'The 15 Pro is the best iPhone yet. USB-C was overdue, titanium feels great, and the A17 Pro handles everything. Camera still leads the pack for video creators. Only downside: still no always-on when tilting the Dynamic Island.' },
  { item: 'iPhone 15 Pro',            by: 'marcus', likes: 7,  text: "Coming from Galaxy S23, the ecosystem switch was worth it. iMessage, Handoff, and Continuity Camera are things you don't realise you miss until you have them. The titanium edge is sharper than expected though." },
  { item: 'Samsung Galaxy S24 Ultra', by: 'marcus', likes: 9,  text: 'The S Pen integration is class-leading. Note-taking mid-call, quick sketches, magnifying small text — these are not gimmicks, I use them daily. Battery easily lasts 1.5 days for me.' },
  { item: 'Sony WH-1000XM5',          by: 'marcus', likes: 14, text: "Best ANC headphones I've ever owned. The Multipoint connection (two devices at once) is genuinely useful. Only issue: the folding mechanism feels less robust than the XM4." },
  { item: 'Spotify',                  by: 'priya',  likes: 6,  text: 'Spotify still wins on discovery. Their ML recommendations have put me onto artists I never would have found otherwise. The podcast integration is okay but feels bolted on, and the new home screen redesign is a step backwards.' },
  { item: 'Netflix',                  by: 'alex',   likes: 21, text: 'Content quality is still there but they need to stop cancelling things after one season. The recommendation algorithm has gotten worse — it shows me the same 10 things repeatedly.' },
  { item: 'Adidas Ultraboost 23',     by: 'riley',  likes: 8,  text: 'Ran a half marathon in these and my feet thanked me. The Boost foam returns energy in a way Air does not. Sizing runs half a size small, order up.' },
];

// ────────────────────────────────────────────────────────────────────────────
// DB helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Wipes all data owned by the persona emails so the seed is fully idempotent.
 * Also clears any stale user_preferences rows that claim a persona username,
 * so leftover test accounts (smoke@, seed@, etc.) don't cause conflicts.
 * Deletes in dependency order; the final DELETE on "user" cascades to
 * account, session, user_preferences, and user_notification_settings.
 */
async function wipePreviousPersonaData() {
  const emails = PERSONAS.map(p => p.email);
  const usernames = PERSONAS.map(p => p.username);

  // Clear conflicting username claims from ANY user (not just persona emails)
  const uPlaceholders = usernames.map((_, i) => `$${i + 1}`).join(', ');
  await q(`DELETE FROM user_preferences WHERE username IN (${uPlaceholders})`, usernames);

  // Get current user IDs for persona emails (if any)
  const ePlaceholders = emails.map((_, i) => `$${i + 1}`).join(', ');
  const { rows: existingUsers } = await q(
    `SELECT id FROM "user" WHERE email IN (${ePlaceholders})`,
    emails,
  );
  if (!existingUsers.length) {
    console.log('  no previous persona users found');
    return;
  }

  const ids = existingUsers.map(r => r.id);
  const idPlaceholders = ids.map((_, i) => `$${i + 1}`).join(', ');

  // Delete app data in dependency order before removing the user rows
  await q(`DELETE FROM votes                     WHERE user_id IN (${idPlaceholders})`, ids);
  await q(`DELETE FROM reviews                   WHERE user_id IN (${idPlaceholders})`, ids);
  await q(`DELETE FROM comparison_set_comments   WHERE user_id IN (${idPlaceholders})`, ids);
  await q(`DELETE FROM comparison_sets           WHERE user_id IN (${idPlaceholders})`, ids);
  await q(`DELETE FROM user_category_preferences WHERE user_id IN (${idPlaceholders})`, ids);
  await q(`DELETE FROM user_notification_settings WHERE user_id IN (${idPlaceholders})`, ids);

  // Deleting from "user" cascades to: account, session, user_preferences
  await q(`DELETE FROM "user" WHERE id IN (${idPlaceholders})`, ids);

  console.log(`  wiped ${ids.length} previous persona user(s)`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function createUserViaApi(persona) {
  await sleep(1200); // avoid Better Auth rate-limit on rapid consecutive sign-ups
  const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5734' },
    body: JSON.stringify({ email: persona.email, password: SHARED_PASSWORD, name: persona.name }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sign-up failed for ${persona.email} (${res.status}): ${body}`);
  }
  const data = await res.json();
  const userId = data?.user?.id;
  if (!userId) throw new Error(`Unexpected sign-up response for ${persona.email}: ${JSON.stringify(data)}`);
  console.log(`  created: ${persona.email}`);
  return userId;
}

async function insertUserPreferences(userId, persona) {
  await q(
    `INSERT INTO user_preferences (user_id, display_name, username, bio, created_at, updated_at)
     VALUES ($1, $2, $3, $4, now(), now())
     ON CONFLICT (user_id) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           username     = EXCLUDED.username,
           bio          = EXCLUDED.bio,
           updated_at   = now()`,
    [userId, persona.displayName, persona.username, persona.bio],
  );

  // user_notification_settings has no unique constraint on user_id — delete+insert.
  // created_at is set 1 hour in the past so created_at !== updated_at, which the
  // app uses to detect that the user has completed onboarding (they saved prefs).
  await q(`DELETE FROM user_notification_settings WHERE user_id = $1`, [userId]);
  await q(
    `INSERT INTO user_notification_settings
       (user_id, email_notifications, push_notifications, comment_notifications, marketing_emails,
        created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, now() - interval '1 hour', now())`,
    [userId, persona.notifications.email, persona.notifications.push,
     persona.notifications.comment, persona.notifications.marketing],
  );
}

async function applyCategoryPreferences(userId, persona, catIds) {
  for (const cat of persona.interests) {
    const catId = catIds[cat];
    if (!catId) continue;
    await q(
      `INSERT INTO user_category_preferences (user_id, category_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, catId],
    );
  }
}

async function seedCategories() {
  const ids = {};
  for (const name of CATEGORIES) {
    const ins = await q(
      `INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id`,
      [name],
    );
    ids[name] = ins.rows.length
      ? ins.rows[0].id
      : (await q(`SELECT id FROM categories WHERE name = $1`, [name])).rows[0].id;
  }
  return ids;
}

async function seedItems(catIds) {
  const ids = {};
  for (const item of ITEMS) {
    const catId = catIds[item.category] ?? null;
    const ins = await q(
      `INSERT INTO items (name, description, item_color_string, category_id)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id`,
      [item.name, item.description, item.color, catId],
    );
    ids[item.name] = ins.rows.length
      ? ins.rows[0].id
      : (await q(`SELECT id FROM items WHERE name = $1`, [item.name])).rows[0]?.id;
  }
  return ids;
}

async function seedComparisons(catIds, itemIds, userIds) {
  const setIds = {};
  for (const def of COMPARISONS) {
    const ownerId = userIds[def.owner];
    if (!ownerId) { console.warn(`  SKIP set — unknown owner: ${def.owner}`); continue; }
    const catId = catIds[def.category] ?? null;

    const ins = await q(
      `INSERT INTO comparison_sets (name, user_id, category_id, is_published, start_date, end_date)
       VALUES ($1, $2, $3, true, now(), now() + interval '30 days')
       ON CONFLICT DO NOTHING RETURNING id`,
      [def.name, ownerId, catId],
    );
    const setId = ins.rows.length
      ? ins.rows[0].id
      : (await q(`SELECT id FROM comparison_sets WHERE name = $1`, [def.name])).rows[0]?.id;
    if (!setId) { console.warn(`  SKIP set — no id: ${def.name}`); continue; }
    setIds[def.name] = setId;
    console.log(`  [${def.owner}] ${def.name}`);

    for (const itemName of def.items) {
      const itemId = itemIds[itemName];
      if (!itemId) { console.warn(`    SKIP item not found: ${itemName}`); continue; }
      await q(
        `INSERT INTO comparison_set_items (set_id, item_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [setId, itemId],
      );
    }

    for (const asp of def.aspects) {
      await q(
        `INSERT INTO comparison_set_aspects (set_id, metric_name, description, weight)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [setId, asp.metric, asp.description, asp.weight],
      );
    }
  }
  return setIds;
}

async function seedVotes(setIds, itemIds, userIds) {
  let inserted = 0;
  for (const { set, votes } of VOTES) {
    const setId = setIds[set];
    if (!setId) { console.warn(`  SKIP votes — no setId for: ${set}`); continue; }
    for (const [personaKey, itemName] of votes) {
      const userId = userIds[personaKey];
      const itemId = itemIds[itemName];
      if (!userId || !itemId) {
        console.warn(`  SKIP vote — missing ${!userId ? 'user' : 'item'} for ${personaKey}/${itemName}`);
        continue;
      }
      const exists = await q(
        `SELECT 1 FROM votes WHERE user_id = $1 AND set_id = $2`,
        [userId, setId],
      );
      if (exists.rows.length) continue;
      await q(
        `INSERT INTO votes (user_id, item_id, set_id) VALUES ($1, $2, $3)`,
        [userId, itemId, setId],
      );
      inserted++;
    }
  }
  console.log(`  inserted ${inserted} votes`);
}

async function seedComments(setIds, userIds) {
  let inserted = 0;
  for (const c of COMMENTS) {
    const setId = setIds[c.set];
    const userId = userIds[c.by];
    if (!setId || !userId) {
      console.warn(`  SKIP comment — missing ${!setId ? 'set' : 'user'}: ${c.set} / ${c.by}`);
      continue;
    }
    const exists = await q(
      `SELECT 1 FROM comparison_set_comments WHERE user_id = $1 AND set_id = $2 AND content = $3`,
      [userId, setId, c.text],
    );
    if (exists.rows.length) continue;
    await q(
      `INSERT INTO comparison_set_comments (set_id, user_id, content) VALUES ($1, $2, $3)`,
      [setId, userId, c.text],
    );
    inserted++;
  }
  console.log(`  inserted ${inserted} comments`);
}

async function seedReviews(itemIds, userIds) {
  let inserted = 0;
  for (const r of REVIEWS) {
    const itemId = itemIds[r.item];
    const userId = userIds[r.by];
    if (!itemId || !userId) {
      console.warn(`  SKIP review — missing ${!itemId ? 'item' : 'user'}: ${r.item} / ${r.by}`);
      continue;
    }
    const exists = await q(
      `SELECT 1 FROM reviews WHERE user_id = $1 AND item_id = $2 AND text = $3`,
      [userId, itemId, r.text],
    );
    if (exists.rows.length) continue;
    await q(
      `INSERT INTO reviews (user_id, item_id, text, likes) VALUES ($1, $2, $3, $4)`,
      [userId, itemId, r.text, r.likes],
    );
    inserted++;
  }
  console.log(`  inserted ${inserted} reviews`);
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Twirly seed starting…\n');

  console.log('0. Wiping previous persona data');
  await wipePreviousPersonaData();

  console.log('\n1. Personas (creating auth users via Better Auth API)');
  const userIds = {};
  for (const persona of PERSONAS) {
    userIds[persona.key] = await createUserViaApi(persona);
  }

  console.log('\n2. Categories');
  const catIds = await seedCategories();
  console.log(`  ${Object.keys(catIds).length} categories`);

  console.log('\n3. User preferences + notifications');
  for (const persona of PERSONAS) {
    await insertUserPreferences(userIds[persona.key], persona);
  }
  console.log(`  ${PERSONAS.length} persona preference rows written`);

  console.log('\n4. User category preferences');
  for (const persona of PERSONAS) {
    await applyCategoryPreferences(userIds[persona.key], persona, catIds);
  }

  console.log('\n5. Items');
  const itemIds = await seedItems(catIds);
  console.log(`  ${Object.keys(itemIds).length} items`);

  console.log('\n6. Comparisons (with items + aspects)');
  const setIds = await seedComparisons(catIds, itemIds, userIds);

  console.log('\n7. Votes');
  await seedVotes(setIds, itemIds, userIds);

  console.log('\n8. Comments');
  await seedComments(setIds, userIds);

  console.log('\n9. Reviews');
  await seedReviews(itemIds, userIds);

  await pool.end();

  console.log('\n✅  Seed complete!\n');
  console.log(`  Shared password: ${SHARED_PASSWORD}\n`);
  for (const p of PERSONAS) {
    console.log(`    ${p.email.padEnd(22)} — ${p.displayName}`);
  }
  console.log('\n  Frontend: http://localhost:5734\n');
}

main().catch(err => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
