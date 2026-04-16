import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import RestaurantForm from './restaurant-form';

export default async function RestaurantOnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signup');
  }

  // If user already has a restaurant, skip onboarding
  const existing = await prisma.userRestaurant.findFirst({
    where: { userId: session.user.id },
  });

  if (existing) {
    redirect('/admin');
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#1a1a18',
            margin: '0 0 6px',
          }}
        >
          Crea il tuo ristorante
        </h1>
        <p style={{ fontSize: 13, color: '#6b6358', margin: 0 }}>
          Ultimo passaggio: scegli un nome e un indirizzo per il tuo menu
        </p>
      </div>
      <RestaurantForm />
    </>
  );
}
