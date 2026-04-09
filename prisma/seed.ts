import { PrismaClient, DishTag, Allergen } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { seedPresets, ELEGANTE_CONFIG } from './seed-presets';

const prisma = new PrismaClient();

interface DishSeed {
  name: string;
  description: string;
  price: number | null;
  tags: DishTag[];
  allergens: Allergen[];
  isChefChoice: boolean;
  imageUrl: string | null;
  variants?: { label: string; price: number }[];
}

const MENU_DATA: Record<string, { name: string; slug: string; icon: string; dishes: DishSeed[] }> = {
  antipasti: {
    name: 'Antipasti', slug: 'antipasti', icon: '🐟',
    dishes: [
      {
        name: 'Crudo di Mare',
        description: 'Tartare di tonno rosso, gambero viola di Gallipoli, ricci e ostrica su letto di agrumi',
        price: 18,
        tags: [DishTag.KM_ZERO],
        allergens: [Allergen.PESCE, Allergen.CROSTACEI, Allergen.MOLLUSCHI],
        isChefChoice: true,
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80',
      },
      {
        name: 'Polpo alla Brace',
        description: 'Polpo verace su crema di patate al limone e capperi di Pantelleria',
        price: 14,
        tags: [DishTag.KM_ZERO],
        allergens: [Allergen.MOLLUSCHI],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
      },
      {
        name: 'Burrata Pugliese',
        description: 'Burrata di Andria con pomodorini Fiaschetto, pesto di basilico e crumble di taralli',
        price: 12,
        tags: [DishTag.VEGETARIANO, DishTag.KM_ZERO],
        allergens: [Allergen.LATTE, Allergen.GLUTINE, Allergen.FRUTTA_A_GUSCIO],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&q=80',
      },
      {
        name: 'Insalata di Mare Tiepida',
        description: 'Moscardini, calamari e cozze con sedano croccante e vinaigrette agli agrumi',
        price: 15,
        tags: [DishTag.SENZA_GLUTINE],
        allergens: [Allergen.PESCE, Allergen.CROSTACEI, Allergen.MOLLUSCHI, Allergen.SEDANO],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&q=80',
      },
      {
        name: 'Caprese di Bufala',
        description: 'Mozzarella di bufala campana, cuore di bue e riduzione di aceto balsamico di Modena',
        price: 11,
        tags: [DishTag.VEGETARIANO, DishTag.SENZA_GLUTINE, DishTag.BIOLOGICO],
        allergens: [Allergen.LATTE],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80',
      },
    ],
  },

  primi: {
    name: 'Primi', slug: 'primi', icon: '🍝',
    dishes: [
      {
        name: 'Orecchiette ai Ricci',
        description: 'Pasta fatta a mano con ricci di mare, aglio dolce e prezzemolo croccante',
        price: 16,
        tags: [DishTag.KM_ZERO],
        allergens: [Allergen.GLUTINE, Allergen.PESCE, Allergen.UOVA],
        isChefChoice: true,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80',
      },
      {
        name: 'Spaghettone allo Scoglio',
        description: 'Spaghettone di Gragnano con cozze, vongole, gamberi e pomodorino del Piennolo',
        price: 18,
        tags: [],
        allergens: [Allergen.GLUTINE, Allergen.PESCE, Allergen.CROSTACEI, Allergen.MOLLUSCHI],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80',
      },
      {
        name: 'Risotto al Nero di Seppia',
        description: 'Carnaroli mantecato al nero, seppioline croccanti e polvere di lime',
        price: 17,
        tags: [DishTag.SENZA_GLUTINE],
        allergens: [Allergen.PESCE, Allergen.MOLLUSCHI, Allergen.LATTE],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&q=80',
      },
      {
        name: 'Ravioli di Cernia',
        description: 'Ravioli ripieni di cernia su bisque di crostacei, basilico fritto e olio al peperoncino',
        price: 19,
        tags: [DishTag.PICCANTE],
        allergens: [Allergen.GLUTINE, Allergen.PESCE, Allergen.CROSTACEI, Allergen.UOVA],
        isChefChoice: true,
        imageUrl: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=500&q=80',
      },
      {
        name: 'Linguine Cacio e Pepe di Mare',
        description: 'Linguine al pecorino romano con tartare di gambero rosso di Mazara',
        price: 17,
        tags: [],
        allergens: [Allergen.GLUTINE, Allergen.LATTE, Allergen.CROSTACEI],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80',
      },
    ],
  },

  secondi: {
    name: 'Secondi', slug: 'secondi', icon: '🥩',
    dishes: [
      {
        name: 'Orata in Crosta di Sale',
        description: 'Orata del nostro mare cotta in crosta con erbette selvatiche del Salento',
        price: 22,
        tags: [DishTag.SENZA_GLUTINE, DishTag.KM_ZERO],
        allergens: [Allergen.PESCE],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500&q=80',
      },
      {
        name: 'Grigliata Mista',
        description: 'Gamberi, calamari, spada e tonno alla griglia con salmoriglio e verdure',
        price: 25,
        tags: [DishTag.SENZA_GLUTINE, DishTag.KM_ZERO],
        allergens: [Allergen.PESCE, Allergen.CROSTACEI, Allergen.MOLLUSCHI],
        isChefChoice: true,
        imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80',
      },
      {
        name: 'Baccalà in Umido',
        description: 'Baccalà con pomodorini, olive Cellina e capperi su polenta cremosa',
        price: 20,
        tags: [],
        allergens: [Allergen.PESCE],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80',
      },
      {
        name: 'Tagliata di Tonno',
        description: 'Tonno rosso in crosta di sesamo, misticanza e riduzione di soia e miele',
        price: 24,
        tags: [DishTag.SENZA_GLUTINE],
        allergens: [Allergen.PESCE, Allergen.SOIA, Allergen.SESAMO],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80',
      },
    ],
  },

  contorni: {
    name: 'Contorni', slug: 'contorni', icon: '🥗',
    dishes: [
      {
        name: 'Patate al Forno',
        description: 'Con rosmarino selvatico e aglio',
        price: 5,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.BIOLOGICO],
        allergens: [],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80',
      },
      {
        name: 'Verdure Grigliate',
        description: 'Selezione di stagione con olio EVO del Salento',
        price: 6,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.BIOLOGICO, DishTag.KM_ZERO],
        allergens: [],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500&q=80',
      },
      {
        name: 'Cicoria Ripassata',
        description: 'Cicoria pugliese con aglio e peperoncino',
        price: 5,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.KM_ZERO, DishTag.PICCANTE],
        allergens: [],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=500&q=80',
      },
      {
        name: 'Puré di Fave',
        description: 'Fave secche con cicoria selvatica e crostini dorati',
        price: 7,
        tags: [DishTag.VEGETARIANO, DishTag.KM_ZERO],
        allergens: [Allergen.GLUTINE, Allergen.LUPINI],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1543339308-d595c4f5f5ab?w=500&q=80',
      },
    ],
  },

  dolci: {
    name: 'Dolci', slug: 'dolci', icon: '🍰',
    dishes: [
      {
        name: 'Pasticciotto Leccese',
        description: 'Pasta frolla ripiena di crema pasticcera, servito tiepido con polvere di cannella',
        price: 7,
        tags: [DishTag.VEGETARIANO, DishTag.KM_ZERO],
        allergens: [Allergen.GLUTINE, Allergen.LATTE, Allergen.UOVA],
        isChefChoice: true,
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80',
      },
      {
        name: 'Semifreddo alle Mandorle',
        description: 'Con coulis di fichi e miele del Salento',
        price: 8,
        tags: [DishTag.VEGETARIANO, DishTag.SENZA_GLUTINE],
        allergens: [Allergen.FRUTTA_A_GUSCIO, Allergen.LATTE, Allergen.UOVA],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
      },
      {
        name: 'Sorbetto al Limone',
        description: 'Limoni di Femminello, servito nel limone scavato',
        price: 6,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.BIOLOGICO],
        allergens: [],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=500&q=80',
      },
      {
        name: 'Tortino al Cioccolato',
        description: 'Cuore fondente 70% con gelato alla vaniglia di Madagascar',
        price: 9,
        tags: [DishTag.VEGETARIANO],
        allergens: [Allergen.GLUTINE, Allergen.LATTE, Allergen.UOVA, Allergen.SOIA],
        isChefChoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
      },
    ],
  },

  bevande: {
    name: 'Bevande', slug: 'bevande', icon: '🍷',
    dishes: [
      {
        name: 'Acqua Minerale',
        description: 'Naturale o frizzante · 75cl',
        price: 3,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE],
        allergens: [],
        isChefChoice: false,
        imageUrl: null,
      },
      {
        name: 'Primitivo di Manduria DOC',
        description: 'Rosso strutturato, note di frutta scura',
        price: null,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.KM_ZERO, DishTag.BIOLOGICO],
        allergens: [Allergen.ANIDRIDE_SOLFOROSA],
        isChefChoice: false,
        imageUrl: null,
        variants: [
          { label: 'Calice', price: 7 },
          { label: 'Bottiglia', price: 25 },
        ],
      },
      {
        name: 'Negroamaro del Salento IGT',
        description: 'Rosso morbido, sentori di spezie',
        price: null,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.KM_ZERO],
        allergens: [Allergen.ANIDRIDE_SOLFOROSA],
        isChefChoice: false,
        imageUrl: null,
        variants: [
          { label: 'Calice', price: 6 },
          { label: 'Bottiglia', price: 22 },
        ],
      },
      {
        name: 'Verdeca Valle d\'Itria',
        description: 'Bianco fresco, note floreali',
        price: null,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.KM_ZERO],
        allergens: [Allergen.ANIDRIDE_SOLFOROSA],
        isChefChoice: false,
        imageUrl: null,
        variants: [
          { label: 'Calice', price: 6 },
          { label: 'Bottiglia', price: 20 },
        ],
      },
      {
        name: 'Birra Artigianale Pugliese',
        description: '33cl — Bionda o Ambrata',
        price: 5,
        tags: [DishTag.VEGANO, DishTag.KM_ZERO],
        allergens: [Allergen.GLUTINE],
        isChefChoice: false,
        imageUrl: null,
      },
      {
        name: 'Limoncello della Casa',
        description: 'Fatto in casa con limoni del Salento',
        price: 4,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE, DishTag.KM_ZERO],
        allergens: [],
        isChefChoice: false,
        imageUrl: null,
      },
      {
        name: 'Caffè Espresso',
        description: 'Miscela napoletana, tostatura media',
        price: 1.5,
        tags: [DishTag.VEGANO, DishTag.SENZA_GLUTINE],
        allergens: [],
        isChefChoice: false,
        imageUrl: null,
      },
    ],
  },
};

async function main() {
  console.log('Seeding database...\n');

  // 1. Seed theme presets
  await seedPresets(prisma);

  // 2. Create demo restaurant
  console.log('Creating demo restaurant...');
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'osteria-del-porto' },
    update: {
      name: 'Osteria del Porto',
      tagline: 'Cucina di mare',
      description: 'Pesce fresco ogni giorno dal porto di Brindisi, ricette tradizionali del Salento e ingredienti del territorio dal 1987.',
      city: 'Brindisi',
      province: 'BR',
      country: 'IT',
      phone: '+39 0831 123 456',
      coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
      coverCharge: 2.50,
      allergenNote: 'Si prega di informare il personale di eventuali allergie o intolleranze',
      themeCover: ELEGANTE_CONFIG.cover as any,
      themeMenu: ELEGANTE_CONFIG.menu as any,
      themeDish: ELEGANTE_CONFIG.dish as any,
      themePreset: 'elegante',
      isPublished: true,
      isActive: true,
    },
    create: {
      name: 'Osteria del Porto',
      slug: 'osteria-del-porto',
      tagline: 'Cucina di mare',
      description: 'Pesce fresco ogni giorno dal porto di Brindisi, ricette tradizionali del Salento e ingredienti del territorio dal 1987.',
      city: 'Brindisi',
      province: 'BR',
      country: 'IT',
      phone: '+39 0831 123 456',
      coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
      coverCharge: 2.50,
      allergenNote: 'Si prega di informare il personale di eventuali allergie o intolleranze',
      themeCover: ELEGANTE_CONFIG.cover as any,
      themeMenu: ELEGANTE_CONFIG.menu as any,
      themeDish: ELEGANTE_CONFIG.dish as any,
      themePreset: 'elegante',
      isPublished: true,
      isActive: true,
    },
  });
  console.log(`  + ${restaurant.name} (${restaurant.slug})\n`);

  // 3. Create demo owner and link to restaurant
  console.log('Creating demo owner...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@aifolly.local' },
    update: {
      name: 'Demo Owner',
      passwordHash: hashSync('demo1234', 10),
    },
    create: {
      email: 'demo@aifolly.local',
      name: 'Demo Owner',
      passwordHash: hashSync('demo1234', 10),
    },
  });
  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { ownerId: demoUser.id },
  });
  console.log(`  + ${demoUser.name} (${demoUser.email}) → ${restaurant.slug}\n`);

  // 4. Create categories and dishes
  console.log('Creating categories and dishes...');
  const categoryKeys = Object.keys(MENU_DATA);

  for (let catIdx = 0; catIdx < categoryKeys.length; catIdx++) {
    const catKey = categoryKeys[catIdx];
    const catData = MENU_DATA[catKey];

    // Delete existing category for this restaurant+slug to allow re-seeding
    await prisma.category.deleteMany({
      where: { restaurantId: restaurant.id, slug: catData.slug },
    });

    const category = await prisma.category.create({
      data: {
        name: catData.name,
        slug: catData.slug,
        icon: catData.icon,
        sortOrder: catIdx,
        restaurantId: restaurant.id,
      },
    });

    for (let dishIdx = 0; dishIdx < catData.dishes.length; dishIdx++) {
      const d = catData.dishes[dishIdx];

      await prisma.dish.create({
        data: {
          name: d.name,
          description: d.description,
          price: d.price,
          imageUrl: d.imageUrl,
          tags: d.tags,
          allergens: d.allergens,
          isChefChoice: d.isChefChoice,
          sortOrder: dishIdx,
          categoryId: category.id,
          ...(d.variants && d.variants.length > 0
            ? {
                variants: {
                  create: d.variants.map((v, vIdx) => ({
                    label: v.label,
                    price: v.price,
                    sortOrder: vIdx,
                  })),
                },
              }
            : {}),
        },
      });
    }

    console.log(`  + ${catData.name}: ${catData.dishes.length} piatti`);
  }

  const totalDishes = Object.values(MENU_DATA).reduce((sum, cat) => sum + cat.dishes.length, 0);
  console.log(`\nSeed complete: ${categoryKeys.length} categories, ${totalDishes} dishes\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
