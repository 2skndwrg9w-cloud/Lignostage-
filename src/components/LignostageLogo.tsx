import React, { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';

export interface LignostageLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  variant?: 'dark' | 'light' | 'amber' | 'white' | 'inherit';
  dropShadow?: boolean;
  title?: string;
  allowUpload?: boolean;
}

/**
 * Lignostage Official Brand Logo
 * - Strictly preserves original logo geometry and aspect ratio (680 : 430)
 * - Zero distortion / warping
 * - Always centered directly above the brand name
 * - Automatic background removal & high-contrast coloring
 */
export const LignostageLogo: React.FC<LignostageLogoProps> = ({
  className = 'h-8 w-auto',
  width,
  height,
  variant = 'inherit',
  dropShadow = false,
  title = 'Lignostage Firmenlogo',
  allowUpload = false,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [customRatio, setCustomRatio] = useState<number | null>(null);
  const [storedHeight, setStoredHeight] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load custom logo and custom size from localStorage on mount and listen to changes
  useEffect(() => {
    const loadStoredLogo = () => {
      try {
        const stored = localStorage.getItem('lignostage_custom_logo_data');
        const storedRatio = localStorage.getItem('lignostage_custom_logo_ratio');
        const storedSize = localStorage.getItem('lignostage_custom_logo_size');
        if (stored) {
          setCustomLogoUrl(stored);
          if (storedRatio) setCustomRatio(parseFloat(storedRatio));
        } else {
          setCustomLogoUrl(null);
          setCustomRatio(null);
        }
        if (storedSize) {
          setStoredHeight(parseInt(storedSize, 10));
        } else {
          setStoredHeight(null);
        }
      } catch (e) {
        // storage fallback
      }
    };

    loadStoredLogo();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'lignostage_custom_logo_data' ||
        e.key === 'lignostage_custom_logo_size' ||
        e.key === 'lignostage_custom_logo_ratio'
      ) {
        loadStoredLogo();
      }
    };

    const handleCustomEvent = () => {
      loadStoredLogo();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('lignostage_logo_changed', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lignostage_logo_changed', handleCustomEvent);
    };
  }, []);

  // Handle direct file upload with background removal while preserving 100% exact proportions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Natural aspect ratio to guarantee zero distortion
        const naturalRatio = img.naturalWidth / img.naturalHeight;
        setCustomRatio(naturalRatio);

        // Process canvas to isolate transparent background
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Remove light/white background pixels (RGB > 225)
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r > 225 && g > 225 && b > 225) {
              data[i + 3] = 0;
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const transparentDataUrl = canvas.toDataURL('image/png');

          setCustomLogoUrl(transparentDataUrl);
          try {
            localStorage.setItem('lignostage_custom_logo_data', transparentDataUrl);
            localStorage.setItem('lignostage_custom_logo_ratio', naturalRatio.toString());
            window.dispatchEvent(new Event('storage'));
          } catch (err) {
            console.error('Konnte Logo nicht speichern:', err);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getImageFilter = () => {
    if (variant === 'light' || variant === 'white') {
      return 'brightness(0) invert(1)';
    }
    if (variant === 'amber') {
      return 'brightness(0) invert(0.8) sepia(1) saturate(5) hue-rotate(5deg)';
    }
    if (variant === 'dark') {
      return 'brightness(0)';
    }
    return 'none';
  };

  const getSvgStrokeColor = () => {
    if (variant === 'light' || variant === 'white') return '#ffffff';
    if (variant === 'amber') return '#f59e0b';
    if (variant === 'dark') return '#1c1917';
    return 'currentColor';
  };

  const shadowClass = dropShadow ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]' : '';

  return (
    <div className="relative inline-flex items-center justify-center group select-none shrink-0">
      {customLogoUrl ? (
        /* Original User Logo rendered with 100% strictly preserved proportions */
        <img
          src={customLogoUrl}
          alt={title}
          className={`${className} ${shadowClass} object-contain transition-all shrink-0`}
          style={{
            height: height || (storedHeight ? `${storedHeight}px` : undefined),
            width: width || 'auto',
            aspectRatio: customRatio ? `${customRatio}` : undefined,
            filter: getImageFilter(),
          }}
        />
      ) : (
        /* Geometrically exact, unwarped festival stage arch logo (viewBox 60 90 680 430, aspect ratio 1.58 : 1) */
        <svg
          viewBox="60 90 680 430"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${className} ${shadowClass} shrink-0 transition-colors duration-200`}
          style={{
            aspectRatio: '680 / 430',
            height: height || (storedHeight ? `${storedHeight}px` : undefined),
            width: width || 'auto',
          }}
          preserveAspectRatio="xMidYMid meet"
          aria-label={title}
          role="img"
        >
          <g
            stroke={getSvgStrokeColor()}
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {/* 1. Center vertical kingpost strut */}
            <line x1="400" y1="120" x2="400" y2="356" />

            {/* 2. Symmetrical intermediate struts */}
            <line x1="260" y1="205" x2="272" y2="362" />
            <line x1="540" y1="205" x2="528" y2="362" />

            {/* 3. Outer struts */}
            <line x1="155" y1="305" x2="168" y2="400" />
            <line x1="645" y1="305" x2="632" y2="400" />

            {/* 4. Top scalloped roof contour with exact authentic curvature */}
            <path
              d="
                M 85 490
                C 120 440, 135 370, 155 305
                C 185 330, 225 305, 260 205
                C 300 240, 360 215, 400 120
                C 440 215, 500 240, 540 205
                C 575 305, 615 330, 645 305
                C 665 370, 680 440, 715 490
              "
            />

            {/* 5. Left & right bottom claw feet */}
            <path d="M 85 490 C 115 445, 140 415, 168 400" />
            <path d="M 715 490 C 685 445, 660 415, 632 400" />

            {/* 6. Arched bottom chord connecting foundation supports */}
            <path
              d="
                M 168 400
                L 272 362
                L 400 356
                L 528 362
                L 632 400
              "
            />
          </g>
        </svg>
      )}

      {/* Hidden file input for uploading the user's exact logo file */}
      {allowUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
            id="lignostage-logo-file-input"
          />
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-2 p-1 bg-stone-900/90 hover:bg-stone-950 text-white rounded-full shadow-xs cursor-pointer z-20"
            title="Originales Logo-Bild hochladen / ersetzen"
            aria-label="Logo ändern"
          >
            <Upload className="w-2.5 h-2.5" />
          </span>
        </>
      )}
    </div>
  );
};
