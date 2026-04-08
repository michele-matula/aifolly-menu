'use client';

import { useState, useCallback, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  type CategoryActionState,
} from '@/app/admin/(dashboard)/restaurants/[id]/categories/actions';

// ── Types ───────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isVisible: boolean;
  dishCount: number;
}

interface Props {
  restaurantId: string;
  initialCategories: CategoryItem[];
}

// ── Toast ───────────────────────────────────────────────────

function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`mb-4 px-4 py-3 rounded-md text-[13px] ${
      type === 'success'
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {message}
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-[#1c1917] mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ── Category Form (used inside modal) ───────────────────────

function CategoryForm({
  restaurantId,
  category,
  onSuccess,
}: {
  restaurantId: string;
  category?: CategoryItem;
  onSuccess: () => void;
}) {
  const isEdit = !!category;

  const boundCreate = createCategory.bind(null, restaurantId);
  const boundUpdate = category
    ? updateCategory.bind(null, restaurantId, category.id)
    : boundCreate;

  const action = isEdit ? boundUpdate : boundCreate;

  const [state, formAction, isPending] = useActionState<CategoryActionState, FormData>(
    action,
    { success: false },
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const inputClass = 'w-full px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors';

  return (
    <form action={formAction}>
      {state.error && !state.success && (
        <div className="mb-4 px-3 py-2 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="cat-name" className="block text-[13px] font-medium text-[#44403c] mb-1">
            Nome <span className="text-[#c9b97a]">*</span>
          </label>
          <input id="cat-name" name="name" required defaultValue={category?.name ?? ''} className={inputClass} />
          {state.fieldErrors?.name && <p className="mt-1 text-[12px] text-red-600">{state.fieldErrors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor="cat-desc" className="block text-[13px] font-medium text-[#44403c] mb-1">Descrizione</label>
          <input id="cat-desc" name="description" defaultValue={category?.description ?? ''} className={inputClass} />
        </div>

        <div>
          <label htmlFor="cat-icon" className="block text-[13px] font-medium text-[#44403c] mb-1">Icona (emoji)</label>
          <input id="cat-icon" name="icon" defaultValue={category?.icon ?? ''} className={inputClass} maxLength={10} style={{ width: 80 }} />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="cat-visible"
            name="isVisible"
            type="checkbox"
            defaultChecked={category?.isVisible ?? true}
            className="accent-[#c9b97a]"
          />
          <label htmlFor="cat-visible" className="text-[13px] text-[#44403c]">Visibile nel menu pubblico</label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-[13px] font-medium text-white bg-[#c9b97a] rounded-md hover:bg-[#b5a468] disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isPending ? 'Salvataggio...' : isEdit ? 'Salva' : 'Crea categoria'}
        </button>
      </div>
    </form>
  );
}

// ── Sortable Row ────────────────────────────────────────────

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  const hasDishes = category.dishCount > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white border border-[#e7e5e4] rounded-md px-3 py-3 mb-2 ${
        isDragging ? 'shadow-lg' : 'hover:border-[#d6d3d1]'
      } transition-colors`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#a8a29e] hover:text-[#78716c] touch-none p-1 shrink-0"
        aria-label="Trascina per riordinare"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Icon */}
      {category.icon && <span className="text-lg shrink-0">{category.icon}</span>}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#1c1917] truncate">{category.name}</span>
          {!category.isVisible && (
            <span className="text-[10px] text-[#a8a29e] border border-[#e7e5e4] rounded px-1.5 py-0.5">Nascosta</span>
          )}
        </div>
        {category.description && (
          <p className="text-[12px] text-[#a8a29e] truncate mt-0.5">{category.description}</p>
        )}
      </div>

      {/* Dish count */}
      <span className="text-[12px] text-[#a8a29e] shrink-0">
        {category.dishCount} piatt{category.dishCount === 1 ? 'o' : 'i'}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 text-[#a8a29e] hover:text-[#c9b97a] rounded transition-colors cursor-pointer"
          title="Modifica"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          disabled={hasDishes}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            hasDishes
              ? 'text-[#d6d3d1] cursor-not-allowed'
              : 'text-[#a8a29e] hover:text-red-500'
          }`}
          title={hasDishes ? `Contiene ${category.dishCount} piatti — eliminali prima` : 'Elimina'}
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

export default function CategoriesManager({ restaurantId, initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync with server data on re-render
  useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);

    // Aggiornamento ottimistico
    setCategories(reordered);

    const result = await reorderCategories(restaurantId, reordered.map(c => c.id));
    if (!result.success) {
      setCategories(initialCategories); // Revert
      showToast(result.error ?? 'Errore nel riordino.', 'error');
    } else {
      showToast('Ordine aggiornato.', 'success');
    }
  }, [categories, initialCategories, restaurantId, showToast]);

  const handleFormSuccess = useCallback((message: string) => {
    setModalMode(null);
    setEditingCategory(null);
    showToast(message, 'success');
    router.refresh();
  }, [router, showToast]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await deleteCategory(restaurantId, deleteTarget.id);
    if (result.success) {
      setDeleteTarget(null);
      showToast('Categoria eliminata.', 'success');
      router.refresh();
    } else {
      setDeleteTarget(null);
      showToast(result.error ?? 'Errore nell\'eliminazione.', 'error');
    }
  }, [deleteTarget, restaurantId, router, showToast]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1c1917]">Categorie</h2>
          <p className="text-sm text-[#78716c] mt-0.5">
            {categories.length === 0
              ? 'Nessuna categoria ancora.'
              : `${categories.length} categorie. Trascina per riordinare.`}
          </p>
        </div>
        <button
          onClick={() => { setModalMode('create'); setEditingCategory(null); }}
          className="shrink-0 px-4 py-2 text-[13px] font-medium text-white bg-[#c9b97a] rounded-md hover:bg-[#b5a468] transition-colors cursor-pointer"
        >
          + Nuova categoria
        </button>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#e7e5e4] rounded-lg">
          <p className="text-[#78716c] text-sm">
            Nessuna categoria ancora. Inizia creando la prima.
          </p>
        </div>
      )}

      {/* Drag & drop list */}
      {categories.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {categories.map(cat => (
              <SortableCategoryRow
                key={cat.id}
                category={cat}
                onEdit={() => { setEditingCategory(cat); setModalMode('edit'); }}
                onDelete={() => setDeleteTarget(cat)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit modal */}
      {modalMode && (
        <Modal
          title={modalMode === 'create' ? 'Nuova categoria' : 'Modifica categoria'}
          onClose={() => { setModalMode(null); setEditingCategory(null); }}
        >
          <CategoryForm
            restaurantId={restaurantId}
            category={modalMode === 'edit' ? editingCategory ?? undefined : undefined}
            onSuccess={() => handleFormSuccess(
              modalMode === 'create' ? 'Categoria creata.' : 'Categoria aggiornata.'
            )}
          />
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal title="Elimina categoria" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[#78716c] mb-6">
            Sei sicuro di voler eliminare <strong>{deleteTarget.name}</strong>? Questa azione non può essere annullata.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-[13px] text-[#78716c] hover:text-[#1c1917] transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-[13px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
            >
              Elimina
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
