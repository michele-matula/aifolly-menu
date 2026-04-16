'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toSlug } from '@/lib/slug-suggest';
import { completeGoogleSignup } from './actions';

type FieldErrors = Partial<Record<string, string>>;

export default function RestaurantForm() {
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleRestaurantNameChange(value: string) {
    setRestaurantName(value);
    if (!slugManuallyEdited) {
      const suggested = toSlug(value);
      setSlug(suggested);
      checkSlugAvailability(suggested);
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(value);
    checkSlugAvailability(value);
  }

  const checkSlugAvailability = useCallback((value: string) => {
    setSlugAvailable(null);
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);

    if (!value || value.length < 3) return;

    setSlugChecking(true);
    slugDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/signup/check-slug?slug=${encodeURIComponent(value)}`);
        if (res.status === 429) {
          setSlugChecking(false);
          return;
        }
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        // Network error
      } finally {
        setSlugChecking(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError('');
    setLoading(true);

    // On success the server action calls redirect('/admin') — no return value.
    // On validation/business error it returns { error }.
    const result = await completeGoogleSignup({ restaurantName, slug });

    setLoading(false);

    if (result?.error) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        setGlobalError(result.error);
      }
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #e0dcd4',
    borderRadius: 4,
    outline: 'none',
    color: '#1a1a18',
    background: '#fafaf8',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#6b6358',
    marginBottom: 6,
  };

  const fieldErrorStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#a04438',
    marginTop: 4,
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Restaurant name */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="restaurantName" style={labelStyle}>Nome del ristorante</label>
        <input
          id="restaurantName"
          type="text"
          required
          autoFocus
          value={restaurantName}
          onChange={e => handleRestaurantNameChange(e.target.value)}
          style={inputStyle}
          placeholder="Trattoria da Mario"
        />
        {fieldErrors.restaurantName && <p style={fieldErrorStyle}>{fieldErrors.restaurantName}</p>}
      </div>

      {/* Slug */}
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="slug" style={labelStyle}>Indirizzo del menu</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span
            style={{
              padding: '10px 8px 10px 12px',
              fontSize: 13,
              color: '#a19686',
              background: '#f0eeea',
              border: '1px solid #e0dcd4',
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              whiteSpace: 'nowrap',
            }}
          >
            aifolly-menu.vercel.app/
          </span>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={e => handleSlugChange(e.target.value.toLowerCase())}
            style={{
              ...inputStyle,
              borderRadius: '0 4px 4px 0',
              flex: 1,
            }}
            placeholder="trattoria-da-mario"
          />
        </div>
        {fieldErrors.slug && <p style={fieldErrorStyle}>{fieldErrors.slug}</p>}
        {!fieldErrors.slug && slug.length >= 3 && (
          <p style={{ fontSize: 12, marginTop: 4, color: slugChecking ? '#a19686' : slugAvailable === false ? '#a04438' : slugAvailable === true ? '#3a7d44' : '#a19686' }}>
            {slugChecking
              ? 'Verifica disponibilità...'
              : slugAvailable === false
                ? 'Questo indirizzo è già in uso'
                : slugAvailable === true
                  ? 'Disponibile'
                  : ''}
          </p>
        )}
      </div>

      {/* Global error */}
      {globalError && (
        <div
          role="alert"
          style={{
            fontSize: 13,
            color: '#a04438',
            background: '#fdf2f0',
            border: '1px solid #f5e1de',
            borderRadius: 4,
            padding: '10px 12px',
            marginBottom: 16,
          }}
        >
          {globalError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        style={{
          width: '100%',
          padding: '12px 24px',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: '#ffffff',
          background: '#c9b97a',
          border: 'none',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        {loading ? 'Creazione...' : 'Crea ristorante'}
      </button>
    </form>
  );
}
