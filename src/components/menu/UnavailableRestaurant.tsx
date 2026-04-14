type Props = {
  name: string;
};

export default function UnavailableRestaurant({ name }: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-stone-900 mb-3">
          {name}
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Il menu di questo ristorante non è al momento disponibile.
          Ti invitiamo a contattare direttamente il locale per maggiori informazioni.
        </p>
      </div>
    </main>
  );
}
