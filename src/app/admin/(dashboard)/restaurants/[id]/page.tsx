import { requireOwnership } from '@/lib/auth-helpers';
import InfoForm from './info-form';

type Props = { params: Promise<{ id: string }> };

export default async function RestaurantInfoPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await requireOwnership(id);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1c1917] mb-1">
        Informazioni ristorante
      </h2>
      <p className="text-sm text-[#78716c] mb-6">
        Dati generali visibili nel menu pubblico.
      </p>

      <InfoForm
        restaurantId={restaurant.id}
        defaultValues={{
          name: restaurant.name,
          slug: restaurant.slug,
          tagline: restaurant.tagline ?? '',
          description: restaurant.description ?? '',
          city: restaurant.city ?? '',
          province: restaurant.province ?? '',
          address: restaurant.address ?? '',
          phone: restaurant.phone ?? '',
          email: restaurant.email ?? '',
          website: restaurant.website ?? '',
        }}
      />
    </div>
  );
}
