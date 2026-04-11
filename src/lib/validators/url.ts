import { z } from 'zod';

// L'URL dell'immagine deve provenire dal Supabase Storage del progetto.
// Fail-closed: se NEXT_PUBLIC_SUPABASE_URL manca o l'URL e' malformato,
// rifiuta. Usata da:
// - theme.ts / backgroundImageUrl (Step 1.3.d)
// - dish.ts / imageUrl (Step 6.3.b)
// Motivazione comune: impedire che un owner punti l'URL immagine a un
// dominio terzo che farebbe tracking dei visitatori del menu pubblico,
// e (dopo Step 6.3.c) evitare che next/image servi-proxi risorse esterne.
export const SupabaseImageUrlSchema = z
  .string()
  .url()
  .refine(
    val => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) return false;
        const allowedHost = new URL(supabaseUrl).host;
        return new URL(val).host === allowedHost;
      } catch {
        return false;
      }
    },
    { message: "L'URL immagine deve provenire da Supabase Storage" },
  );
