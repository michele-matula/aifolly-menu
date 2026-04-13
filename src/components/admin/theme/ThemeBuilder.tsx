'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CoverTheme, MenuTheme, DishTheme } from '@/lib/validators/theme';
import { updateThemeDraft } from '@/app/admin/(dashboard)/restaurants/[id]/theme/actions';
import type { PresetData } from './PresetPicker';
import ThemeActionsHeader from './ThemeActionsHeader';
import PresetPicker from './PresetPicker';
import CoverControls from './CoverControls';
import MenuControls from './MenuControls';
import DishControls from './DishControls';
import ThemePreviewFrame from './ThemePreviewFrame';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  restaurantId: string;
  slug: string;
  initialTheme: { cover: CoverTheme; menu: MenuTheme; dish: DishTheme };
  hasDraft: boolean;
  presets: PresetData[];
};

export default function ThemeBuilder({
  restaurantId,
  slug,
  initialTheme,
  hasDraft: initialHasDraft,
  presets,
}: Props) {
  const [cover, setCover] = useState<CoverTheme>(initialTheme.cover);
  const [menu, setMenu] = useState<MenuTheme>(initialTheme.menu);
  const [dish, setDish] = useState<DishTheme>(initialTheme.dish);
  const [activeTab, setActiveTab] = useState<'cover' | 'menu'>('cover');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [iframeKey, setIframeKey] = useState(0);
  const [hasDraft, setHasDraft] = useState(initialHasDraft);
  const [mounted, setMounted] = useState(false);

  // Debounce timers per scope
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    // Pattern hydration Next: il flag `mounted` evita FOUC/mismatch
    // tra render server e client per elementi che dipendono da
    // state client-only (iframe key, scroll, ecc.). La regola
    // set-state-in-effect ha qui un falso positivo: questo e'
    // esattamente l'uso legittimo di useEffect per sincronizzare
    // lo stato React con l'ambiente (client montato).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => {
      Object.values(timerRef.current).forEach(clearTimeout);
    };
  }, []);

  const debouncedSave = useCallback(
    (scope: 'cover' | 'menu' | 'dish', data: unknown) => {
      if (timerRef.current[scope]) clearTimeout(timerRef.current[scope]);

      timerRef.current[scope] = setTimeout(async () => {
        setSaveStatus('saving');
        const result = await updateThemeDraft(restaurantId, scope, data);
        if (result.success) {
          setSaveStatus('saved');
          setHasDraft(true);
          setIframeKey(k => k + 1);
          setTimeout(() => setSaveStatus(prev => (prev === 'saved' ? 'idle' : prev)), 2000);
        } else {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(prev => (prev === 'error' ? 'idle' : prev)), 3000);
        }
      }, 800);
    },
    [restaurantId],
  );

  const cancelPendingDebounce = useCallback(() => {
    Object.values(timerRef.current).forEach(clearTimeout);
    timerRef.current = {};
  }, []);

  // Handlers per cambio campo
  const handleCoverChange = useCallback(
    <K extends keyof CoverTheme>(field: K, value: CoverTheme[K]) => {
      setCover(prev => {
        const next = { ...prev, [field]: value };
        debouncedSave('cover', next);
        return next;
      });
    },
    [debouncedSave],
  );

  const handleMenuChange = useCallback(
    <K extends keyof MenuTheme>(field: K, value: MenuTheme[K]) => {
      setMenu(prev => {
        const next = { ...prev, [field]: value };
        debouncedSave('menu', next);
        return next;
      });
    },
    [debouncedSave],
  );

  const handleDishChange = useCallback(
    <K extends keyof DishTheme>(field: K, value: DishTheme[K]) => {
      setDish(prev => {
        const next = { ...prev, [field]: value };
        debouncedSave('dish', next);
        return next;
      });
    },
    [debouncedSave],
  );

  const handlePresetApplied = useCallback(
    (theme: { cover: CoverTheme; menu: MenuTheme; dish: DishTheme }) => {
      cancelPendingDebounce();
      setCover(theme.cover);
      setMenu(theme.menu);
      setDish(theme.dish);
      setHasDraft(true);
      setIframeKey(k => k + 1);
    },
    [cancelPendingDebounce],
  );

  const handlePublished = useCallback(() => {
    setHasDraft(true);
    setIframeKey(k => k + 1);
  }, []);

  const handleDiscarded = useCallback(
    (live: { cover: CoverTheme; menu: MenuTheme; dish: DishTheme }) => {
      cancelPendingDebounce();
      setCover(live.cover);
      setMenu(live.menu);
      setDish(live.dish);
      setHasDraft(false);
      setIframeKey(k => k + 1);
    },
    [cancelPendingDebounce],
  );

  // Loading skeleton
  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-[#e7e5e4] rounded w-48" />
        <div className="h-4 bg-[#e7e5e4] rounded w-96" />
        <div className="flex gap-6 mt-6">
          <div className="flex-[4] space-y-4">
            <div className="h-10 bg-[#e7e5e4] rounded" />
            <div className="h-32 bg-[#e7e5e4] rounded" />
            <div className="h-32 bg-[#e7e5e4] rounded" />
          </div>
          <div className="flex-[6] h-[600px] bg-[#e7e5e4] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <ThemeActionsHeader
        restaurantId={restaurantId}
        saveStatus={saveStatus}
        hasDraft={hasDraft}
        onPublished={handlePublished}
        onDiscarded={handleDiscarded}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pannello controlli */}
        <div className="w-full lg:w-[40%] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:pr-2">
          {/* Preset */}
          <PresetPicker
            restaurantId={restaurantId}
            presets={presets}
            onPresetApplied={handlePresetApplied}
          />

          {/* Tabs */}
          <div className="flex gap-1 mt-5 mb-4 border-b border-[#e7e5e4]">
            <button
              type="button"
              onClick={() => setActiveTab('cover')}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'cover'
                  ? 'border-[#c9b97a] text-[#1c1917]'
                  : 'border-transparent text-[#a8a29e] hover:text-[#78716c]'
              }`}
            >
              Copertina
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'menu'
                  ? 'border-[#c9b97a] text-[#1c1917]'
                  : 'border-transparent text-[#a8a29e] hover:text-[#78716c]'
              }`}
            >
              Menu
            </button>
          </div>

          {/* Controlli tab attiva */}
          {activeTab === 'cover' && (
            <CoverControls value={cover} onChange={handleCoverChange} />
          )}

          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-[14px] font-semibold text-[#1c1917] mb-4">Generale</h3>
                <MenuControls value={menu} onChange={handleMenuChange} />
              </div>

              <div className="border-t border-[#e7e5e4] pt-6">
                <h3 className="text-[14px] font-semibold text-[#1c1917] mb-4">Piatti</h3>
                <DishControls
                  value={dish}
                  onChange={handleDishChange}
                  cardBgColor={menu.cardBackgroundColor}
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="w-full lg:w-[60%] lg:sticky lg:top-4 h-[500px] lg:h-[calc(100vh-160px)]">
          <ThemePreviewFrame
            slug={slug}
            activeTab={activeTab}
            iframeKey={iframeKey}
          />
        </div>
      </div>
    </div>
  );
}
