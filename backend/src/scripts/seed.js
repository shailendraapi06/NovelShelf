require('dotenv').config();
const { Users, Books, Categories, Contributions, ActivityLogs } = require('../services/store');

const DEFAULT_CATEGORIES = [
  { name: 'Fiction', slug: 'fiction', icon: 'auto_stories', description: 'Literary narratives, magical realism & timeless prose.' },
  { name: 'Mystery & Detective', slug: 'mystery', icon: 'search_insights', description: 'Gothic enigmas, whodunits & psychological tension.' },
  { name: 'Fantasy', slug: 'fantasy', icon: 'castle', description: 'Mythic realms, epics & deep folkloric worldbuilding.' },
  { name: 'Sci-Fi & Speculative', slug: 'scifi', icon: 'rocket_launch', description: 'Speculative futures, cyberpunk & deep cosmos.' },
  { name: 'Personal Growth', slug: 'growth', icon: 'psychology', description: 'Habits, focus, human psychology & mental mastery.' },
  { name: 'Philosophy', slug: 'philosophy', icon: 'account_balance', description: 'Stoicism, existentialism & inquiries into reality.' },
  { name: 'Poetry', slug: 'poetry', icon: 'ink_pen', description: 'Classical meters, modern stanza & evocative verse.' },
  { name: 'Biography', slug: 'biography', icon: 'history_edu', description: 'Historical lives, private letters & documented journeys.' }
];

const INITIAL_BOOKS = [
  {
    title: 'The Shadow of the Wind',
    slug: 'shadow-of-the-wind',
    subtitle: 'The Cemetery of Forgotten Books, Volume I',
    author: 'Carlos Ruiz Zafón',
    translator: 'Lucia Graves',
    genre: 'Mystery & Gothic',
    category: 'Mystery & Detective',
    era: '20th Century',
    year: 2001,
    pages: 512,
    rating: 4.9,
    reviewsCount: 1420,
    readingLogs: 8912,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-jzOWV2sTeXnrY9UI-Rs0MGukXc8Krw91_AvsvL413QDKodUeUKw58Hv7rpspQyx3YhahsWmL7f0qqTVBg3SGFqJ_NVuAQt7kenBRP6pVEvEyZud29LQWmZlpGTU5GbSyLuZP-ZfX4rTPlwmY0djlvvqZ3yXvuP-33E3j5I7fv4tnV8PB0m6aUefRz7KpJzVgD7H91u8vNp316U9nrhMxjTW_K925PFWKuVL_-K4',
    spineGradient: 'from-primary via-primary-container to-primary',
    spineText: 'SHADOW OF WIND',
    tags: ['First Published 2001', 'Barcelona Setting', 'Gothic Mystery', 'Literary Noir', 'Ex-Libris Verified'],
    synopsis: "Hidden in the heart of the old city of Barcelona is the 'Cemetery of Forgotten Books', a labyrinthine library of obscure and abandoned titles in the care of the antiquarian book trade.",
    synopsisExtended: "Daniel is allowed to choose one book from the shelves and pulls out La Sombra del Viento by Julián Carax. But as Daniel grows, his efforts to discover the author's destiny reveal that someone has been systematically hunting down and burning every last copy of Carax's published works.",
    quote: 'Every book, every volume you see here, has a soul. The soul of the person who wrote it and of those who read it and lived and dreamed with it.',
    quoteAuthor: 'Señor Sempere to Daniel',
    status: 'published',
    isFeatured: true,
    isStaffPick: true,
    badge: 'Canonical Masterwork'
  },
  {
    title: 'Invisible Cities',
    slug: 'invisible-cities',
    subtitle: 'Cities & Memory, Reflections on Empire',
    author: 'Italo Calvino',
    translator: 'William Weaver',
    genre: 'Speculative Classic',
    category: 'Sci-Fi & Speculative',
    era: '20th Century',
    year: 1972,
    pages: 165,
    rating: 4.8,
    reviewsCount: 980,
    readingLogs: 6420,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfsPmdIYRmJfCtVRub-SZQVKykor-wKi_QxQwUMge89c8mx_IlUnN0K1UOPvOgWrZBJJHWfX9Uc-nQa89f-khXkRuI4fOkm-H09Uew39aKUY03W4TnNr7Di4FgJn6Rea_ij8InzvN60xjgwWOOLIBUI0WNaY0YYkyoHhncWZj2Rov7ByvCpEI1ddmAeWZXnXyrqPHqfsaImDaOsTTUskB8gD4Ix8IiEBAxM09i2AE',
    spineGradient: 'from-secondary to-[#5b4315]',
    spineText: 'FICCIONES • CALVINO',
    tags: ['Philosophical Fiction', 'Venice', 'Metaphorical Architecture', 'Rare Archival'],
    synopsis: 'Marco Polo describes to Kublai Khan the cities that cannot exist on normal charts, constructed from memory, desire, signs, and regret in poetic dialogues.',
    synopsisExtended: 'In a garden in the evening, the aging Emperor Kublai Khan listens as Venetian traveler Marco Polo describes cities in the distant corners of his vast empire.',
    quote: "Memory's images, once they are fixed in words, are erased. Perhaps I am afraid of losing Venice all at once, if I speak of it.",
    quoteAuthor: 'Marco Polo',
    status: 'published',
    isFeatured: true,
    isStaffPick: true,
    badge: 'Rare Archival'
  },
  {
    title: 'Piranesi',
    slug: 'piranesi',
    subtitle: 'The Beauty of the House is Immeasurable',
    author: 'Susanna Clarke',
    genre: 'Fantasy • Mystery',
    category: 'Fiction',
    era: 'Contemporary (2000+)',
    year: 2020,
    pages: 245,
    rating: 4.9,
    reviewsCount: 2150,
    readingLogs: 12400,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiQQ2YFXGl8u3FLP2ZDEy71GaOWcF3pb58oWHHeL_OG4qeoX9sEI5_DBF8CuvwfriGL6-ziNCUWsKT_aqF2GX5Yryzy3S1ldxB-iwePKaNCbbPdJZx6rG-6k4kmkyazdnZRMepXoZwE2QfSMYXyiOOSkIub-hRxcT_ys8HocL6Qm0xRxUcko2STsSbAH9z9JI6H2oRtMzJnasK2O0vlAJLpKjOHUZ1opW9TBCDUp4',
    spineGradient: 'from-tertiary-container via-primary-container to-tertiary',
    spineText: 'PIRANESI',
    tags: ['Infinite Labyrinth', 'Oceanic Tides', 'Marble Halls', 'Verified Digital Edition'],
    synopsis: "Piranesi’s house is no ordinary building: its rooms are infinite, its corridors endless, its walls lined with thousands upon thousands of statues.",
    synopsisExtended: 'Within the labyrinth of halls an ocean is imprisoned; waves rush up staircases, rooms are flooded in an instant.',
    quote: 'The Beauty of the House is immeasurable; its Kindness infinite.',
    quoteAuthor: 'Piranesi',
    status: 'published',
    isFeatured: true,
    badge: 'Curator Selection'
  },
  {
    title: 'Klara and the Sun',
    slug: 'klara-and-the-sun',
    subtitle: 'A Novel on Love, Mortality & Machine Empathy',
    author: 'Kazuo Ishiguro',
    genre: 'Dystopian & Speculative',
    category: 'Sci-Fi & Speculative',
    era: 'Contemporary (2000+)',
    year: 2021,
    pages: 320,
    rating: 4.7,
    reviewsCount: 1640,
    readingLogs: 7920,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFXW69300H28j4o-B-vU8eL4f3o6F4l9l17j0Zk2L3B24FjLw3-6hV-10B-38A24b7E8V-9oG_1aF7Kq41n0x9QY70eB1B62z8T-20J0W5Q7x3aV7M',
    synopsis: 'Klara, an Artificial Friend with outstanding observational qualities, watches carefully the behavior of those who come in to browse.',
    status: 'published',
    isFeatured: true
  },
  {
    title: 'Meditations',
    slug: 'meditations-marcus-aurelius',
    subtitle: 'Private Notebooks of an Emperor-Philosopher',
    author: 'Marcus Aurelius',
    genre: 'Stoic Philosophy',
    category: 'Philosophy',
    era: 'Antiquity & Classical',
    year: 180,
    pages: 256,
    rating: 4.9,
    reviewsCount: 3820,
    readingLogs: 19400,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    synopsis: 'A collection of personal writings by Roman Emperor Marcus Aurelius recording private notes to himself on Stoic philosophy.',
    status: 'published',
    isFeatured: true
  }
];

async function seedDatabase() {
  console.log('[Seed] Starting NovelShelf database initialization...');

  // 1. Seed or Verify Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@novelshelf.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Archivist Prime';

  let admin = await Users.findOne({ email: adminEmail });
  if (!admin) {
    admin = await Users.create({
      name: adminName,
      email: adminEmail,
      password: adminPass,
      role: 'admin',
      status: 'active',
      bio: 'Head Curator & Master Archivist of NovelShelf Sanctuary'
    });
    console.log(`[Seed] Created Master Administrator: ${adminEmail} (password: ${adminPass})`);
  } else {
    console.log(`[Seed] Master Administrator exists: ${adminEmail}`);
  }

  // Also seed a demo reader patron
  const readerEmail = 'patron@novelshelf.com';
  let reader = await Users.findOne({ email: readerEmail });
  if (!reader) {
    reader = await Users.create({
      name: 'Elena Rostova',
      email: readerEmail,
      password: 'User@123456',
      role: 'user',
      status: 'active',
      bio: 'Lifelong reader of magical realism and early European manuscripts'
    });
    console.log(`[Seed] Created Demo Patron: ${readerEmail} (password: User@123456)`);
  }

  // 2. Seed Categories
  const existingCategories = await Categories.find();
  if (existingCategories.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await Categories.create(cat);
    }
    console.log(`[Seed] Seeded ${DEFAULT_CATEGORIES.length} library categories.`);
  }

  // 3. Seed Books
  const existingBooks = await Books.find();
  if (existingBooks.length === 0) {
    for (const book of INITIAL_BOOKS) {
      await Books.create(book);
    }
    console.log(`[Seed] Seeded ${INITIAL_BOOKS.length} archival canonical books.`);
  }

  // 4. Seed Initial User Contributions (quarantine review items)
  const existingContributions = await Contributions.find();
  if (existingContributions.length === 0) {
    await Contributions.create({
      contributor: reader._id || reader.id,
      contributorName: reader.name,
      contributorEmail: reader.email,
      title: 'The Aleph and Other Stories',
      author: 'Jorge Luis Borges',
      genre: 'Fiction',
      year: 1949,
      pages: 210,
      edition: 'Emecé Editores 1952 (High-Res Folio Scan)',
      license: 'Public Domain (Universal Archival)',
      rightsConfirmed: true,
      synopsis: 'A canonical Argentine masterwork exploring infinity, labyrinths, and literary enigmas through concise philosophical fables.',
      pdfFile: {
        originalName: 'Borges_The_Aleph_1952_Archive.pdf',
        filename: 'quarantine_Borges_The_Aleph_1952_demo.pdf',
        filePath: 'uploads/quarantine/quarantine_Borges_The_Aleph_1952_demo.pdf',
        fileSize: 14.8 * 1024 * 1024,
        mimeType: 'application/pdf',
        isQuarantined: true
      },
      status: 'under_review'
    });
    console.log('[Seed] Seeded demo quarantined contribution.');
  }

  // 5. Seed Activity Log
  const existingLogs = await ActivityLogs.find();
  if (existingLogs.length === 0) {
    await ActivityLogs.create({
      actorId: admin._id || admin.id,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: 'admin',
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'system',
      entityId: 'sys-0',
      entityTitle: 'NovelShelf Digital Archive',
      details: { version: '2.0.0', environment: 'production' }
    });
  }

  console.log('[Seed] Database initialization complete!');
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;

