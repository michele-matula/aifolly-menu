import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyLayout><ErrorState message="Link non valido." /></VerifyLayout>;
  }

  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      emailVerificationTokenExpiresAt: true,
    },
  });

  if (!user) {
    return (
      <VerifyLayout>
        <ErrorState message="Token non valido o già utilizzato." />
      </VerifyLayout>
    );
  }

  if (user.emailVerified) {
    return (
      <VerifyLayout>
        <SuccessState email={user.email} alreadyVerified />
      </VerifyLayout>
    );
  }

  if (
    user.emailVerificationTokenExpiresAt &&
    user.emailVerificationTokenExpiresAt < new Date()
  ) {
    return (
      <VerifyLayout>
        <ExpiredState email={user.email} />
      </VerifyLayout>
    );
  }

  // Token valid — verify the email
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    },
  });

  return (
    <VerifyLayout>
      <SuccessState email={user.email} />
    </VerifyLayout>
  );
}

function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f3',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 8,
          padding: '40px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SuccessState({ email, alreadyVerified }: { email: string; alreadyVerified?: boolean }) {
  return (
    <>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#f0f9f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}
        aria-hidden="true"
      >
        &#10003;
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1a1a18', margin: '0 0 8px' }}>
        {alreadyVerified ? 'Email già verificata' : 'Email verificata!'}
      </h1>
      <p style={{ fontSize: 14, color: '#6b6358', margin: '0 0 24px', lineHeight: 1.5 }}>
        {alreadyVerified
          ? 'Il tuo indirizzo email è già stato verificato. Puoi accedere al pannello.'
          : 'Il tuo account è stato attivato. Ora puoi accedere al pannello di gestione.'}
      </p>
      <Link
        href={`/admin/login?email=${encodeURIComponent(email)}`}
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: '#ffffff',
          background: '#c9b97a',
          border: 'none',
          borderRadius: 4,
          textDecoration: 'none',
        }}
      >
        Accedi al pannello
      </Link>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#fdf2f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}
        aria-hidden="true"
      >
        &#10007;
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1a1a18', margin: '0 0 8px' }}>
        Verifica non riuscita
      </h1>
      <p style={{ fontSize: 14, color: '#6b6358', margin: '0 0 24px' }}>
        {message}
      </p>
      <Link
        href="/signup"
        style={{ color: '#c9b97a', textDecoration: 'none', fontSize: 13 }}
      >
        Torna alla registrazione
      </Link>
    </>
  );
}

function ExpiredState({ email }: { email: string }) {
  return (
    <>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#fdf2f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}
        aria-hidden="true"
      >
        &#9200;
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1a1a18', margin: '0 0 8px' }}>
        Link scaduto
      </h1>
      <p style={{ fontSize: 14, color: '#6b6358', margin: '0 0 24px', lineHeight: 1.5 }}>
        Il link di verifica è scaduto. Richiedi un nuovo link dalla pagina di attesa.
      </p>
      <Link
        href={`/signup/pending?email=${encodeURIComponent(email)}`}
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: '#ffffff',
          background: '#c9b97a',
          border: 'none',
          borderRadius: 4,
          textDecoration: 'none',
        }}
      >
        Reinvia email
      </Link>
    </>
  );
}
