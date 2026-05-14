/**
 * Seed script — creates realistic local dev data.
 *
 * Run: node --env-file=.env scripts/seed.js   (from server/)
 *
 * Idempotent: safe to re-run; existing data is skipped via ON CONFLICT.
 *
 * Seed login: seed@twirly.dev / SeedUser123!
 */

import pg from 'pg';
import { randomUUID } from 'node:crypto';

const DB_URL = process.env.DATABASE_URL ?? 'postgresql://twirly:twirly@localhost:5432/twirly';
const API_BASE = process.env.BETTER_AUTH_URL ?? 'http://localhost:4000';

const pool = new pg.Pool({ connectionString: DB_URL });
const q = (text, params) => pool.query(text, params);

// ─── 1. Auth: create seed user via Better Auth API ──────────────────────────

async function ensureSeedUser() {
  const SEED_EMAIL = 'seed@twirly.dev';
  const SEED_PASS  = 'SeedUser123!';
  const SEED_NAME  = 'Alex Chen';

  // Check if already exists
  const { rows } = await q(`SELECT id FROM "user" WHERE email = $1`, [SEED_EMAIL]);
  if (rows.length) {
    console.log(`  seed user already exists: ${rows[0].id}`);
    return rows[0].id;
  }

  const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify({ email: SEED_EMAIL, password: SEED_PASS, name: SEED_NAME }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sign-up failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const userId = data?.user?.id;
  if (!userId) throw new Error(`Unexpected sign-up response: ${JSON.stringify(data)}`);
  console.log(`  created seed user: ${userId}`);
  return userId;
}

// ─── 2. Bot users (realistic vote / comment variety) ─────────────────────────

const BOT_USERS = [
  { id: 'bot-user-1111-1111-1111-111111111111', name: 'Jordan Lee',    email: 'jordan@twirly.dev',  handle: 'jordanlee',   display: 'Jordan Lee' },
  { id: 'bot-user-2222-2222-2222-222222222222', name: 'Priya Sharma',  email: 'priya@twirly.dev',   handle: 'priyasharma', display: 'Priya Sharma' },
  { id: 'bot-user-3333-3333-3333-333333333333', name: 'Marcus Williams',email: 'marcus@twirly.dev',  handle: 'marcusw',     display: 'Marcus W.' },
];

async function ensureBotUsers() {
  for (const u of BOT_USERS) {
    await q(
      `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
       VALUES ($1,$2,$3,true,now(),now())
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.name, u.email],
    );
    await q(
      `INSERT INTO user_preferences (user_id, display_name, username, created_at, updated_at)
       VALUES ($1,$2,$3,now(),now())
       ON CONFLICT (user_id) DO NOTHING`,
      [u.id, u.display, u.handle],
    );
    console.log(`  bot user: ${u.email}`);
  }
}

// ─── 3. Categories ────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Tech & Gadgets',
  'Food & Drink',
  'Streaming & Entertainment',
  'Fitness & Health',
  'Fashion & Style',
  'Travel & Lifestyle',
];

async function seedCategories() {
  const ids = {};
  for (const name of CATEGORIES) {
    const { rows } = await q(
      `INSERT INTO categories (name) VALUES ($1)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [name],
    );
    if (rows.length) {
      ids[name] = rows[0].id;
    } else {
      const r = await q(`SELECT id FROM categories WHERE name = $1`, [name]);
      ids[name] = r.rows[0].id;
    }
    console.log(`  category [${ids[name]}]: ${name}`);
  }
  return ids;
}

// ─── 4. Items ────────────────────────────────────────────────────────────────

function buildItems(catIds) {
  return [
    // Tech
    { name: 'iPhone 15 Pro',           category: 'Tech & Gadgets',           color: '#1C1C1E', description: "Apple's flagship smartphone with titanium design and A17 Pro chip." },
    { name: 'Samsung Galaxy S24 Ultra', category: 'Tech & Gadgets',           color: '#1A1A2E', description: "Samsung's powerhouse with S Pen, 200MP camera, and 7-year updates." },
    { name: 'AirPods Pro 2',            category: 'Tech & Gadgets',           color: '#FFFFFF', description: "Apple's best-in-class wireless earbuds with adaptive transparency." },
    { name: 'Sony WH-1000XM5',          category: 'Tech & Gadgets',           color: '#2C2C2C', description: "Sony's industry-leading over-ear headphones with 30h battery." },
    // Food & Drink
    { name: 'Starbucks',               category: 'Food & Drink',             color: '#00704A', description: "The world's most popular coffee chain — 33,000+ locations globally." },
    { name: "Dunkin'",                 category: 'Food & Drink',             color: '#FF671F', description: 'America runs on Dunkin — affordable coffee and breakfast on the go.' },
    { name: 'Coca-Cola',              category: 'Food & Drink',             color: '#F40009', description: "The world's most recognized soft drink since 1886." },
    { name: 'Pepsi',                   category: 'Food & Drink',             color: '#004B93', description: "Coca-Cola's biggest rival — sweeter taste, bold branding." },
    // Streaming
    { name: 'Netflix',                 category: 'Streaming & Entertainment', color: '#E50914', description: '270M subscribers, the streaming giant that started it all.' },
    { name: 'Disney+',                 category: 'Streaming & Entertainment', color: '#113CCF', description: 'Marvel, Star Wars, Pixar, and Disney classics under one roof.' },
    { name: 'Spotify',                 category: 'Streaming & Entertainment', color: '#1DB954', description: "600M users, 100M tracks — the world's most used music app." },
    { name: 'Apple Music',             category: 'Streaming & Entertainment', color: '#FC3C44', description: 'Hi-res lossless audio, spatial sound, and tight Apple ecosystem integration.' },
    // Fitness
    { name: 'Nike Air Max 270',        category: 'Fitness & Health',         color: '#111111', description: 'Iconic Air cushioning, lifestyle + sport crossover silhouette.' },
    { name: 'Adidas Ultraboost 23',    category: 'Fitness & Health',         color: '#ECEFF1', description: 'Energy-return Boost foam, OceanPlastic upper, runner favourite.' },
    // Fashion
    { name: 'Zara',                    category: 'Fashion & Style',          color: '#000000', description: 'Fast fashion giant — runway trends at high-street prices.' },
    { name: 'H&M',                     category: 'Fashion & Style',          color: '#E50010', description: 'Affordable, inclusive fashion with growing sustainability range.' },
  ];
}

async function seedItems(catIds) {
  const ids = {};
  for (const item of buildItems(catIds)) {
    const catId = catIds[item.category] ?? null;
    const { rows } = await q(
      `INSERT INTO items (name, description, item_color_string, category_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [item.name, item.description, item.color, catId],
    );
    if (rows.length) {
      ids[item.name] = rows[0].id;
    } else {
      const r = await q(`SELECT id FROM items WHERE name = $1`, [item.name]);
      ids[item.name] = r.rows[0]?.id;
    }
    console.log(`  item [${ids[item.name]}]: ${item.name}`);
  }
  return ids;
}

// ─── 5. Comparison sets + items + aspects ────────────────────────────────────

function buildSets(catIds, itemIds, userId) {
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days out

  return [
    {
      name: 'iPhone 15 Pro vs Galaxy S24 Ultra',
      category: 'Tech & Gadgets',
      items: ['iPhone 15 Pro', 'Samsung Galaxy S24 Ultra'],
      aspects: [
        { metric: 'Camera Quality',  description: 'Photo & video capabilities in real-world conditions', weight: 3 },
        { metric: 'Battery Life',    description: 'All-day usability and fast-charging speed', weight: 2 },
        { metric: 'Performance',     description: 'Day-to-day speed and sustained performance under load', weight: 2 },
      ],
    },
    {
      name: 'AirPods Pro 2 vs Sony WH-1000XM5',
      category: 'Tech & Gadgets',
      items: ['AirPods Pro 2', 'Sony WH-1000XM5'],
      aspects: [
        { metric: 'Sound Quality',       description: 'Overall audio fidelity, bass, and clarity', weight: 3 },
        { metric: 'Noise Cancellation',  description: 'How well it blocks out the world', weight: 3 },
        { metric: 'Comfort & Fit',       description: 'Wearability over long sessions', weight: 2 },
      ],
    },
    {
      name: 'Starbucks vs Dunkin\'',
      category: 'Food & Drink',
      items: ['Starbucks', "Dunkin'"],
      aspects: [
        { metric: 'Coffee Quality',  description: 'Taste, consistency, and range of options', weight: 3 },
        { metric: 'Value for Money', description: 'Price vs portion vs quality equation', weight: 2 },
        { metric: 'Vibe & Ambiance', description: 'Experience of spending time in-store', weight: 1 },
      ],
    },
    {
      name: 'Coca-Cola vs Pepsi — The Classic Debate',
      category: 'Food & Drink',
      items: ['Coca-Cola', 'Pepsi'],
      aspects: [
        { metric: 'Taste',         description: 'Blind taste preference — sweetness, fizz, finish', weight: 3 },
        { metric: 'Brand Loyalty', description: 'Emotional attachment and nostalgia factor', weight: 1 },
      ],
    },
    {
      name: 'Netflix vs Disney+',
      category: 'Streaming & Entertainment',
      items: ['Netflix', 'Disney+'],
      aspects: [
        { metric: 'Content Library',    description: 'Breadth and depth of available titles', weight: 3 },
        { metric: 'Original Shows',     description: 'Quality of exclusive productions', weight: 3 },
        { metric: 'Price & Value',      description: 'Cost vs content quantity and quality', weight: 2 },
      ],
    },
    {
      name: 'Spotify vs Apple Music',
      category: 'Streaming & Entertainment',
      items: ['Spotify', 'Apple Music'],
      aspects: [
        { metric: 'Music Discovery',  description: 'Playlist curation, recommendations, and new finds', weight: 3 },
        { metric: 'Audio Quality',    description: 'Fidelity — lossless, spatial, and everyday listening', weight: 2 },
        { metric: 'UI & Experience',  description: 'How easy and enjoyable is it to use daily', weight: 2 },
      ],
    },
    {
      name: 'Nike Air Max 270 vs Adidas Ultraboost 23',
      category: 'Fitness & Health',
      items: ['Nike Air Max 270', 'Adidas Ultraboost 23'],
      aspects: [
        { metric: 'Comfort',    description: 'Cushioning, support, and all-day wearability', weight: 3 },
        { metric: 'Style',      description: 'Looks — does it work as streetwear and sportswear?', weight: 2 },
        { metric: 'Durability', description: 'How well it holds up over months of use', weight: 2 },
      ],
    },
  ];
}

async function seedSets(catIds, itemIds, userId) {
  const setIds = {};
  const aspectIds = {};

  for (const def of buildSets(catIds, itemIds, userId)) {
    // Insert comparison set
    const { rows: setRows } = await q(
      `INSERT INTO comparison_sets (name, user_id, category_id, is_published, start_date, end_date)
       VALUES ($1, $2, $3, true, now(), now() + interval '30 days')
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [def.name, userId, catIds[def.category] ?? null],
    );

    let setId;
    if (setRows.length) {
      setId = setRows[0].id;
    } else {
      const r = await q(`SELECT id FROM comparison_sets WHERE name = $1`, [def.name]);
      setId = r.rows[0]?.id;
    }
    if (!setId) { console.warn(`  SKIP set (no id): ${def.name}`); continue; }
    setIds[def.name] = setId;
    console.log(`  set [${setId}]: ${def.name}`);

    // Link items to set
    for (const itemName of def.items) {
      const itemId = itemIds[itemName];
      if (!itemId) { console.warn(`    SKIP item not found: ${itemName}`); continue; }
      await q(
        `INSERT INTO comparison_set_items (set_id, item_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [setId, itemId],
      );
    }

    // Insert aspects
    aspectIds[def.name] = [];
    for (const asp of def.aspects) {
      const { rows: aspRows } = await q(
        `INSERT INTO comparison_set_aspects (set_id, metric_name, description, weight)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [setId, asp.metric, asp.description, asp.weight],
      );
      let aspId;
      if (aspRows.length) {
        aspId = aspRows[0].id;
      } else {
        const r = await q(
          `SELECT id FROM comparison_set_aspects WHERE set_id = $1 AND metric_name = $2`,
          [setId, asp.metric],
        );
        aspId = r.rows[0]?.id;
      }
      if (aspId) aspectIds[def.name].push({ id: aspId, ...asp });
      console.log(`    aspect [${aspId}]: ${asp.metric}`);
    }
  }

  return { setIds, aspectIds };
}

// ─── 6. Votes ────────────────────────────────────────────────────────────────

async function seedVotes(setIds, itemIds, seedUserId) {
  // Each comparison: (set_name, winner_item, runner_item, vote_distribution)
  // vote_distribution: how many each user group votes for winner vs runner
  const plan = [
    { set: 'iPhone 15 Pro vs Galaxy S24 Ultra',       winner: 'iPhone 15 Pro',           runner: 'Samsung Galaxy S24 Ultra', votes: [
      { userId: seedUserId,                              item: 'iPhone 15 Pro' },
      { userId: BOT_USERS[0].id,                         item: 'Samsung Galaxy S24 Ultra' },
      { userId: BOT_USERS[1].id,                         item: 'iPhone 15 Pro' },
      { userId: BOT_USERS[2].id,                         item: 'iPhone 15 Pro' },
    ]},
    { set: 'AirPods Pro 2 vs Sony WH-1000XM5',        winner: 'Sony WH-1000XM5',         runner: 'AirPods Pro 2',           votes: [
      { userId: seedUserId,                              item: 'AirPods Pro 2' },
      { userId: BOT_USERS[0].id,                         item: 'Sony WH-1000XM5' },
      { userId: BOT_USERS[1].id,                         item: 'Sony WH-1000XM5' },
      { userId: BOT_USERS[2].id,                         item: 'AirPods Pro 2' },
    ]},
    { set: "Starbucks vs Dunkin'",                     winner: 'Starbucks',               runner: "Dunkin'",                 votes: [
      { userId: seedUserId,                              item: 'Starbucks' },
      { userId: BOT_USERS[0].id,                         item: 'Starbucks' },
      { userId: BOT_USERS[1].id,                         item: "Dunkin'" },
      { userId: BOT_USERS[2].id,                         item: 'Starbucks' },
    ]},
    { set: 'Coca-Cola vs Pepsi — The Classic Debate',  winner: 'Coca-Cola',               runner: 'Pepsi',                   votes: [
      { userId: seedUserId,                              item: 'Coca-Cola' },
      { userId: BOT_USERS[0].id,                         item: 'Pepsi' },
      { userId: BOT_USERS[1].id,                         item: 'Coca-Cola' },
      { userId: BOT_USERS[2].id,                         item: 'Pepsi' },
    ]},
    { set: 'Netflix vs Disney+',                       winner: 'Netflix',                 runner: 'Disney+',                 votes: [
      { userId: seedUserId,                              item: 'Netflix' },
      { userId: BOT_USERS[0].id,                         item: 'Netflix' },
      { userId: BOT_USERS[1].id,                         item: 'Disney+' },
      { userId: BOT_USERS[2].id,                         item: 'Netflix' },
    ]},
    { set: 'Spotify vs Apple Music',                   winner: 'Spotify',                 runner: 'Apple Music',             votes: [
      { userId: seedUserId,                              item: 'Spotify' },
      { userId: BOT_USERS[0].id,                         item: 'Apple Music' },
      { userId: BOT_USERS[1].id,                         item: 'Spotify' },
      { userId: BOT_USERS[2].id,                         item: 'Spotify' },
    ]},
    { set: 'Nike Air Max 270 vs Adidas Ultraboost 23', winner: 'Adidas Ultraboost 23',    runner: 'Nike Air Max 270',        votes: [
      { userId: seedUserId,                              item: 'Adidas Ultraboost 23' },
      { userId: BOT_USERS[0].id,                         item: 'Adidas Ultraboost 23' },
      { userId: BOT_USERS[1].id,                         item: 'Nike Air Max 270' },
      { userId: BOT_USERS[2].id,                         item: 'Adidas Ultraboost 23' },
    ]},
  ];

  for (const { set, votes } of plan) {
    const setId = setIds[set];
    if (!setId) { console.warn(`  SKIP votes — no setId for: ${set}`); continue; }
    for (const { userId, item } of votes) {
      const itemId = itemIds[item];
      if (!itemId) { console.warn(`  SKIP vote — no itemId for: ${item}`); continue; }
      await q(
        `INSERT INTO votes (user_id, item_id, set_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [userId, itemId, setId],
      );
    }
    console.log(`  votes seeded for: ${set}`);
  }
}

// ─── 7. Comments ─────────────────────────────────────────────────────────────

async function seedComments(setIds, seedUserId) {
  const comments = [
    { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', userId: seedUserId,       text: 'The titanium build on the 15 Pro is a game-changer — it genuinely feels more premium in hand.' },
    { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', userId: BOT_USERS[0].id,  text: "S24 Ultra's S Pen alone makes it irreplaceable for note-taking. Nothing else comes close." },
    { set: 'iPhone 15 Pro vs Galaxy S24 Ultra', userId: BOT_USERS[1].id,  text: 'Switched from Android to iPhone this year and honestly the ecosystem lock-in is real — but so is the quality.' },
    { set: "Starbucks vs Dunkin'",             userId: BOT_USERS[2].id,  text: 'Dunkin cold brew is criminally underrated. Half the price, same caffeine hit.' },
    { set: "Starbucks vs Dunkin'",             userId: seedUserId,       text: 'Starbucks customisation is unmatched. 15 different ways to order the same latte is either a blessing or a curse.' },
    { set: 'Spotify vs Apple Music',           userId: BOT_USERS[1].id,  text: 'Spotify Discover Weekly changed how I find music — still unbeaten for discovery algorithms.' },
    { set: 'Spotify vs Apple Music',           userId: BOT_USERS[0].id,  text: 'Switched to Apple Music for spatial audio on my AirPods and never looked back. The lossless quality is real.' },
    { set: 'Netflix vs Disney+',               userId: seedUserId,       text: 'Netflix might be losing ground on content but shows like The Bear and Beef keep me subscribed.' },
    { set: 'Nike Air Max 270 vs Adidas Ultraboost 23', userId: BOT_USERS[2].id, text: 'Ultraboost for running 100%. Air Max 270 for style. Simple as.' },
    { set: 'Coca-Cola vs Pepsi — The Classic Debate', userId: BOT_USERS[0].id, text: 'Pepsi in a blind taste test, Coke at a BBQ. These are the rules.' },
  ];

  for (const c of comments) {
    const setId = setIds[c.set];
    if (!setId) { console.warn(`  SKIP comment — no setId for: ${c.set}`); continue; }
    await q(
      `INSERT INTO comparison_set_comments (set_id, user_id, content)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [setId, c.userId, c.text],
    );
  }
  console.log(`  ${comments.length} comments seeded`);
}

// ─── 8. Reviews ──────────────────────────────────────────────────────────────

async function seedReviews(itemIds, seedUserId) {
  const reviews = [
    { item: 'iPhone 15 Pro',           userId: seedUserId,      text: 'The 15 Pro is the best iPhone yet. USB-C was overdue, titanium feels great, and the A17 Pro handles everything. Camera still leads the pack for video creators. Only downside: still no always-on when tilting the Dynamic Island.', likes: 12 },
    { item: 'iPhone 15 Pro',           userId: BOT_USERS[0].id, text: "Coming from Galaxy S23, the ecosystem switch was worth it. iMessage, Handoff, and Continuity Camera are things you don't realise you miss until you have them.", likes: 7 },
    { item: 'Samsung Galaxy S24 Ultra',userId: BOT_USERS[1].id, text: 'The S Pen integration is class-leading. Note-taking mid-call, quick sketches, magnifying small text — these aren\'t gimmicks, I use them daily. Battery easily lasts 1.5 days for me.', likes: 9 },
    { item: 'Sony WH-1000XM5',         userId: BOT_USERS[2].id, text: 'Best ANC headphones I\'ve ever owned. The Multipoint connection (two devices at once) is genuinely useful. Only issue: the folding mechanism feels less robust than the XM4.', likes: 14 },
    { item: 'Spotify',                 userId: seedUserId,      text: 'Spotify still wins on discovery. Their ML recommendations have put me onto artists I never would have found otherwise. The podcast integration is okay but feels bolted on.', likes: 6 },
    { item: 'Netflix',                 userId: BOT_USERS[0].id, text: 'Content quality is still there but they need to stop cancelling things after one season. The recommendation algorithm has gotten worse — it shows me the same 10 things repeatedly.', likes: 21 },
    { item: 'Adidas Ultraboost 23',    userId: BOT_USERS[1].id, text: 'Ran a half marathon in these and my feet thanked me. The Boost foam returns energy in a way Air doesn\'t. Sizing runs half a size small, order up.', likes: 8 },
  ];

  for (const r of reviews) {
    const itemId = itemIds[r.item];
    if (!itemId) { console.warn(`  SKIP review — no itemId for: ${r.item}`); continue; }
    await q(
      `INSERT INTO reviews (user_id, item_id, text, likes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [r.userId, itemId, r.text, r.likes],
    );
  }
  console.log(`  ${reviews.length} reviews seeded`);
}

// ─── 9. User preferences for seed user ───────────────────────────────────────

async function ensureSeedUserPreferences(userId) {
  await q(
    `INSERT INTO user_preferences (user_id, display_name, username, bio, created_at, updated_at)
     VALUES ($1, $2, $3, $4, now(), now())
     ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, username = EXCLUDED.username, bio = EXCLUDED.bio`,
    [userId, 'Alex Chen', 'alexchen', 'Comparing things since 2024. 📱 Tech • ☕ Coffee • 🎧 Music. Opinions are my own and they are correct.'],
  );
  // Notification settings with updated_at != created_at so onboarding completion check passes
  await q(
    `INSERT INTO user_notification_settings (user_id, email_notifications, push_notifications, comment_notifications, marketing_emails, created_at, updated_at)
     VALUES ($1, true, true, true, false, now() - interval '1 hour', now())
     ON CONFLICT DO NOTHING`,
    [userId],
  );
  console.log(`  seed user preferences set`);
}

// ─── 10. User category preferences ───────────────────────────────────────────

async function seedCategoryPreferences(userId, catIds) {
  const preferred = ['Tech & Gadgets', 'Streaming & Entertainment', 'Food & Drink'];
  for (const cat of preferred) {
    const catId = catIds[cat];
    if (!catId) continue;
    await q(
      `INSERT INTO user_category_preferences (user_id, category_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, catId],
    );
  }
  console.log(`  seed user category prefs: ${preferred.join(', ')}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Twirly seed script starting…\n');

  console.log('1. Seed user');
  const seedUserId = await ensureSeedUser();

  console.log('\n2. Bot users');
  await ensureBotUsers();

  console.log('\n3. Seed user preferences');
  await ensureSeedUserPreferences(seedUserId);

  console.log('\n4. Categories');
  const catIds = await seedCategories();

  console.log('\n5. Category preferences');
  await seedCategoryPreferences(seedUserId, catIds);

  console.log('\n6. Items');
  const itemIds = await seedItems(catIds);

  console.log('\n7. Comparison sets + aspects');
  const { setIds, aspectIds } = await seedSets(catIds, itemIds, seedUserId);

  console.log('\n8. Votes');
  await seedVotes(setIds, itemIds, seedUserId);

  console.log('\n9. Comments');
  await seedComments(setIds, seedUserId);

  console.log('\n10. Reviews');
  await seedReviews(itemIds, seedUserId);

  await pool.end();
  console.log('\n✅  Seed complete!\n');
  console.log('  Login: seed@twirly.dev / SeedUser123!');
  console.log('  Frontend: http://localhost:3000\n');
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
