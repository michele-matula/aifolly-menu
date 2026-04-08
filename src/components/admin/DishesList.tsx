'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  deleteDish,
  reorderDishes,
  toggleDishField,
} from '@/app/admin/(dashboard)/restaurants/[id]/dishes/actions';

// ── Types ───────────────────────────────────────────────────

interface DishItem {
  id: string;
  name: string;
  price: number | null;
  categoryId: string;
  categoryName: string;
  isChefChoice: boolean;
  isVisible: boolean;
  isAvailable: boolean;
  variantsSummary: string | null;
}

interface Props {
  restaurantId: string;
  dishes: DishItem[];
  filterCategoryId: string | null;
  grouped: boolean; // true = vista "tutte", raggruppata per categoria
  categoryGroups?: { id: string; name: string }[];
}

// ── Sortable Row ────────────────────────────────────────────

function SortableDishRow({ dish, restaurantId, draggable, onDelete }: {
  dish: DishItem;
  restaurantId: string;
  draggable: boolean;
  onDelete: (d: DishItem) => void;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dish.id,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  const priceDisplay = dish.variantsSummary
    ? dish.variantsSummary
    : dish.price != null
      ? `€${dish.price}`
      : '—';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white border border-[#e7e5e4] rounded-md px-3 py-3 mb-2 ${
        isDragging ? 'shadow-lg' : 'hover:border-[#d6d3d1]'
      } transition-colors`}
    >
      {/* Drag handle */}
      {draggable && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#a8a29e] hover:text-[#78716c] touch-none p-1 shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[#1c1917] truncate">{dish.name}</span>
          {dish.isChefChoice && (
            <span className="text-[10px] text-[#c9b97a] border border-[#c9b97a]/40 rounded px-1.5 py-0.5">Chef</span>
          )}
          {!dish.isVisible && (
            <span className="text-[10px] text-[#a8a29e] border border-[#e7e5e4] rounded px-1.5 py-0.5">Nascosto</span>
          )}
          {!dish.isAvailable && (
            <span className="text-[10px] text-orange-500 border border-orange-200 rounded px-1.5 py-0.5">Non disp.</span>
          )}
        </div>
      </div>

      {/* Price */}
      <span className="text-sm text-[#78716c] shrink-0 tabular-nums">{priceDisplay}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={async () => {
            await toggleDishField(restaurantId, dish.id, 'isChefChoice');
            router.refresh();
          }}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            dish.isChefChoice ? 'text-[#c9b97a]' : 'text-[#d6d3d1] hover:text-[#c9b97a]'
          }`}
          title={dish.isChefChoice ? 'Rimuovi proposta chef' : 'Proposta dello chef'}
        >
          ★
        </button>
        <Link
          href={`/admin/restaurants/${restaurantId}/dishes/${dish.id}/edit`}
          className="p-1.5 text-[#a8a29e] hover:text-[#c9b97a] rounded transition-colors"
          title="Modifica"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(dish)}
          className="p-1.5 text-[#a8a29e] hover:text-red-500 rounded transition-colors cursor-pointer"
          title="Elimina"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function DishesList({ restaurantId, dishes: initialDishes, filterCategoryId, grouped, categoryGroups }: Props) {
  const router = useRouter();
  const [dishes, setDishes] = useState(initialDishes);
  const [deleteTarget, setDeleteTarget] = useState<DishItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { setDishes(initialDishes); }, [initialDishes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !filterCategoryId) return;

    const oldIndex = dishes.findIndex(d => d.id === active.id);
    const newIndex = dishes.findIndex(d => d.id === over.id);
    const reordered = arrayMove(dishes, oldIndex, newIndex);
    setDishes(reordered);

    const result = await reorderDishes(restaurantId, filterCategoryId, reordered.map(d => d.id));
    if (!result.success) {
      setDishes(initialDishes);
      showToast(result.error ?? 'Errore nel riordino.', 'error');
    } else {
      showToast('Ordine aggiornato.', 'success');
    }
  }, [dishes, initialDishes, restaurantId, filterCategoryId, showToast]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await deleteDish(restaurantId, deleteTarget.id);
    if (result.success) {
      showToast('Piatto eliminato.', 'success');
      router.refresh();
    } else {
      showToast(result.error ?? 'Errore.', 'error');
    }
    setDeleteTarget(null);
  }, [deleteTarget, restaurantId, router, showToast]);

  const draggable = !!filterCategoryId;

  // Render content
  const renderList = (items: DishItem[]) => (
    items.map(dish => (
      <SortableDishRow
        key={dish.id}
        dish={dish}
        restaurantId={restaurantId}
        draggable={draggable}
        onDelete={setDeleteTarget}
      />
    ))
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-md text-[13px] ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {dishes.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#e7e5e4] rounded-lg">
          <p className="text-[#78716c] text-sm">
            {filterCategoryId ? 'Nessun piatto in questa categoria.' : 'Nessun piatto ancora. Inizia creando il primo.'}
          </p>
        </div>
      )}

      {dishes.length > 0 && (
        grouped && categoryGroups ? (
          // Vista raggruppata per categoria — no drag
          <div className="space-y-6">
            {categoryGroups.map(cat => {
              const catDishes = dishes.filter(d => d.categoryId === cat.id);
              if (catDishes.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h3 className="text-sm font-semibold text-[#44403c] mb-2">{cat.name}</h3>
                  {renderList(catDishes)}
                </div>
              );
            })}
          </div>
        ) : (
          // Vista filtrata per categoria — con drag
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={dishes.map(d => d.id)} strategy={verticalListSortingStrategy}>
              {renderList(dishes)}
            </SortableContext>
          </DndContext>
        )
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-[#1c1917] mb-2">Elimina piatto</h3>
            <p className="text-sm text-[#78716c] mb-6">
              Sei sicuro di voler eliminare <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-[13px] text-[#78716c] cursor-pointer">Annulla</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 text-[13px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors cursor-pointer">Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
