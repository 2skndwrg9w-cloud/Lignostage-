import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, RotateCcw, Check, Sliders, Image as ImageIcon, Sparkles } from 'lucide-react';
import { LignostageLogo } from './LignostageLogo';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export const LogoCustomizerModal: React.FC<LogoCustomizerModalProps> = ({
  isOpen,
  onClose,
  companyName,
}) => {
  const [logoSize, setLogoSize] = useState<number>(36);
  const [removeBg, setRemoveBg] = useState<boolean>(true);
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('lignostage_custom_logo_data');
        setHasCustomLogo(!!stored);
        const storedSize = localStorage.getItem('lignostage_custom_logo_size');
        if (storedSize) {
          setLogoSize(parseInt(storedSize, 10));
        } else {
          setLogoSize(36);
        }
      } catch (e) {
        // fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const naturalRatio = img.naturalWidth / img.naturalHeight;

        if (removeBg) {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Remove very light/white pixels (RGB > 230)
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              if (r > 230 && g > 230 && b > 230) {
                data[i + 3] = 0;
              }
            }

            ctx.putImageData(imgData, 0, 0);
            const transparentDataUrl = canvas.toDataURL('image/png');
            saveLogoData(transparentDataUrl, naturalRatio);
            return;
          }
        }

        // Standard save without background removal
        saveLogoData(event.target?.result as string, naturalRatio);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveLogoData = (dataUrl: string, ratio: number) => {
    try {
      localStorage.setItem('lignostage_custom_logo_data', dataUrl);
      localStorage.setItem('lignostage_custom_logo_ratio', ratio.toString());
      setHasCustomLogo(true);
      notifyLogoChange();
      setIsSuccessMessage('Firmenlogo erfolgreich aktualisiert!');
      setTimeout(() => setIsSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Konnte Logo nicht speichern:', err);
    }
  };

  const handleSizeChange = (newSize: number) => {
    setLogoSize(newSize);
    try {
      localStorage.setItem('lignostage_custom_logo_size', newSize.toString());
      notifyLogoChange();
    } catch (err) {
      console.error('Fehler beim Speichern der Größe:', err);
    }
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem('lignostage_custom_logo_data');
      localStorage.removeItem('lignostage_custom_logo_ratio');
      localStorage.removeItem('lignostage_custom_logo_size');
      setLogoSize(36);
      setHasCustomLogo(false);
      notifyLogoChange();
      setIsSuccessMessage('Standard-Logo wiederhergestellt.');
      setTimeout(() => setIsSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Fehler beim Zurücksetzen:', err);
    }
  };

  const notifyLogoChange = () => {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('lignostage_logo_changed'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-900 text-white rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Firmenlogo anpassen</h3>
              <p className="text-xs text-stone-500">Datei hochladen & Größe im Header justieren</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Live Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-xl border border-dashed border-stone-300">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-3">Live-Vorschau im Header</span>
            <div className="flex flex-col items-center justify-center py-2 px-6 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <LignostageLogo
                className="text-stone-950 transition-all shrink-0"
                height={logoSize}
                variant="dark"
                allowUpload={false}
              />
              <span className="text-sm font-bold tracking-tight text-stone-950 uppercase -mt-0.5">
                {companyName}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-3 text-center">
              Das Logo behält immer exakt seine originalen Proportionen und steht mittig über dem Namen.
            </p>
          </div>

          {isSuccessMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isSuccessMessage}</span>
            </div>
          )}

          {/* Upload Button Zone */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              1. Neues Logo als Datei hochladen
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
              id="modal-logo-file-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Logo-Datei auswählen (SVG, PNG, JPG, WebP)</span>
            </button>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remove-bg-toggle"
                checked={removeBg}
                onChange={(e) => setRemoveBg(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 h-4 w-4"
              />
              <label htmlFor="remove-bg-toggle" className="text-xs text-stone-600 select-none cursor-pointer flex items-center gap-1">
                <span>Weißen Hintergrund automatisch freistellen</span>
                <Sparkles className="w-3 h-3 text-amber-600" />
              </label>
            </div>
          </div>

          {/* Size Adjustment Slider */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                <span>2. Logo-Größe im Header anpassen</span>
              </label>
              <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                {logoSize} px
              </span>
            </div>
            <input
              type="range"
              min="24"
              max="64"
              step="2"
              value={logoSize}
              onChange={(e) => handleSizeChange(parseInt(e.target.value, 10))}
              className="w-full accent-stone-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>24px (Kompakt)</span>
              <span>36px (Standard)</span>
              <span>64px (Groß)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between">
          {hasCustomLogo ? (
            <button
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-red-700 hover:bg-stone-200/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Original-Logo wiederherstellen</span>
            </button>
          ) : (
            <span className="text-xs text-stone-400">Standard-Vektorlogo aktiv</span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
