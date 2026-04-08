interface MenuHeaderProps {
  name: string;
  tagline: string | null;
  city: string | null;
}

export default function MenuHeader({ name, tagline, city }: MenuHeaderProps) {
  return (
    <div
      className="menu-hero-enter"
      style={{
        textAlign: 'center',
        padding: '52px 32px 36px',
        position: 'relative',
      }}
    >
      {/* Top ornament */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ width: 32, height: 1, background: 'var(--menu-nav-active)' }} />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            border: '1px solid var(--menu-nav-active)',
          }}
        />
        <div style={{ width: 32, height: 1, background: 'var(--menu-nav-active)' }} />
      </div>

      {/* City */}
      {city && (
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            fontFamily: 'var(--menu-nav-font)',
            fontWeight: 300,
            color: 'var(--menu-nav-active)',
            marginBottom: 14,
          }}
        >
          {city}
        </div>
      )}

      {/* Restaurant name */}
      <h1
        style={{
          fontFamily: 'var(--menu-section-font)',
          fontSize: 40,
          fontWeight: 'var(--menu-section-weight)',
          fontStyle: 'var(--menu-section-style)',
          color: 'var(--menu-section-color)',
          margin: '0 0 6px',
          lineHeight: 1.1,
          letterSpacing: '0.01em',
        }}
      >
        {name}
      </h1>

      {/* Tagline */}
      {tagline && (
        <div
          style={{
            fontFamily: 'var(--menu-nav-font)',
            fontSize: 12.5,
            color: 'var(--menu-nav-color)',
            fontWeight: 300,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {tagline}
        </div>
      )}

      {/* Bottom ornament */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginTop: 24,
        }}
      >
        <div
          style={{
            width: 60,
            height: 1,
            background: `linear-gradient(90deg, transparent, var(--menu-nav-active))`,
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--menu-nav-active)' }}>✦</span>
        <div
          style={{
            width: 60,
            height: 1,
            background: `linear-gradient(90deg, var(--menu-nav-active), transparent)`,
          }}
        />
      </div>
    </div>
  );
}
