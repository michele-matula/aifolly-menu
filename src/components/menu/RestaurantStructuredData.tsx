// Server component: emette JSON-LD Schema.org (Restaurant + Menu) nel
// DOM della pagina menu pubblica. Serve a Google per i rich snippet
// (nome, indirizzo, piatti) nei risultati di ricerca.
//
// Solo sulla pagina /{slug}/menu — duplicare sulla cover farebbe
// emergere 2 grafici Restaurant concorrenti per lo stesso locale.
//
// Spec §14.2.

type RestaurantData = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
};

type Dish = {
  name: string;
  description: string | null;
  price: number | null;
  priceLabel: string | null;
  imageUrl: string | null;
};

type Category = {
  name: string;
  dishes: Dish[];
};

type Props = {
  restaurant: RestaurantData;
  categories: Category[];
  baseUrl: string;
};

export default function RestaurantStructuredData({
  restaurant,
  categories,
  baseUrl,
}: Props) {
  const restaurantUrl = `${baseUrl}/${restaurant.slug}`;
  const menuUrl = `${baseUrl}/${restaurant.slug}/menu`;

  // Address: PostalAddress richiede streetAddress OR addressLocality per
  // essere utile a Google. Se mancano entrambi, omettiamo l'address.
  const hasAddress = !!(restaurant.address || restaurant.city);
  const address = hasAddress
    ? {
        "@type": "PostalAddress",
        ...(restaurant.address ? { streetAddress: restaurant.address } : {}),
        ...(restaurant.city ? { addressLocality: restaurant.city } : {}),
        ...(restaurant.province ? { addressRegion: restaurant.province } : {}),
        addressCountry: restaurant.country,
      }
    : undefined;

  const image = restaurant.coverUrl || restaurant.logoUrl || undefined;

  const hasMenuSection = categories
    .filter((cat) => cat.dishes.length > 0)
    .map((cat) => ({
      "@type": "MenuSection",
      name: cat.name,
      hasMenuItem: cat.dishes.map((dish) => ({
        "@type": "MenuItem",
        name: dish.name,
        ...(dish.description ? { description: dish.description } : {}),
        ...(dish.imageUrl ? { image: dish.imageUrl } : {}),
        // offers solo se abbiamo un prezzo numerico; priceLabel ("Su
        // richiesta", "A peso") non è mappabile su un prezzo Schema.org.
        ...(dish.price !== null
          ? {
              offers: {
                "@type": "Offer",
                price: dish.price.toFixed(2),
                priceCurrency: "EUR",
              },
            }
          : {}),
      })),
    }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    ...(restaurant.tagline ? { slogan: restaurant.tagline } : {}),
    ...(restaurant.description ? { description: restaurant.description } : {}),
    url: restaurantUrl,
    ...(image ? { image } : {}),
    ...(address ? { address } : {}),
    ...(restaurant.phone ? { telephone: restaurant.phone } : {}),
    ...(restaurant.email ? { email: restaurant.email } : {}),
    ...(restaurant.website
      ? { sameAs: [restaurant.website] }
      : {}),
    servesCuisine: "Italian",
    hasMenu: {
      "@type": "Menu",
      name: `Menu di ${restaurant.name}`,
      url: menuUrl,
      hasMenuSection,
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify è sicuro per serializzare JSON-LD: non emette </ raw
      // se i valori passano per stringhe "normali"; per ulteriore safety
      // rimpiazziamo < in caso di description/name con HTML-like content.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
