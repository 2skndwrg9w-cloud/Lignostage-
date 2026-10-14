import React from 'react';
import { Lock, Edit2, ShieldCheck } from 'lucide-react';
import { CompanyConfig } from '../types';
import { LignostageLogo } from './LignostageLogo';

interface FooterProps {
  company: CompanyConfig;
  onNavigate: (sectionId: string) => void;
  isAdminMode?: boolean;
  onToggleAdminMode?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  company,
  onNavigate,
  isAdminMode = false,
  onToggleAdminMode,
}) => {
  return (
    <footer className="bg-white border-t border-stone-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-100">
          <div>
            {/* Firmenlogo direkt mittig ÜBER Lignostage */}
            <div className="inline-flex flex-col items-center mb-2">
              <LignostageLogo className="h-7 w-auto mb-1 text-stone-950" variant="dark" allowUpload={isAdminMode} />
              <div className="text-lg font-bold tracking-tight text-stone-900 text-center">
                {company.name}
              </div>
            </div>
            <p className="text-xs text-stone-500">
              {company.tagline}
            </p>
            <p className="text-xs text-stone-500 mt-1 font-mono">
              {company.street} · {company.postalCode} {company.city} · {company.email} · {company.phone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-stone-600">
            <button
              onClick={() => onNavigate('start')}
              className="hover:text-stone-950 cursor-pointer"
            >
              Startseite
            </button>
            <button
              onClick={() => onNavigate('dienstleistungen')}
              className="hover:text-stone-950 cursor-pointer"
            >
              Dienstleistungen
            </button>
            <button
              onClick={() => onNavigate('grundsaetze')}
              className="hover:text-stone-950 cursor-pointer"
            >
              Grundsätze
            </button>
            <button
              onClick={() => onNavigate('projekte')}
              className="hover:text-stone-950 cursor-pointer"
            >
              Projekte & Galerie
            </button>
            <button
              onClick={() => onNavigate('planung-tools')}
              className="hover:text-stone-950 cursor-pointer font-medium text-stone-800"
            >
              Planungsexpertise & Tools
            </button>
            <button
              onClick={() => onNavigate('ueber-uns')}
              className="hover:text-stone-950 cursor-pointer"
            >
              Über uns
            </button>
            <button
              onClick={() => onNavigate('kontakt')}
              className="hover:text-stone-950 cursor-pointer"
            >
              Kontakt
            </button>
          </div>
        </div>

        {/* Website Publishing & Security Status Strip */}
        <div className="my-6 p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isAdminMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {isAdminMode ? <Edit2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  {isAdminMode ? 'Inhaber-Bearbeitungsmodus aktiv' : 'Öffentliche Besucheransicht (Gesperrt)'}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isAdminMode ? 'bg-amber-200/80 text-amber-900' : 'bg-emerald-200/80 text-emerald-900'
                }`}>
                  {isAdminMode ? 'BEARBEITEN MÖGLICH' : 'GESCHÜTZT'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {isAdminMode
                  ? 'Sie können Logos, Pläne, Bilder & Beschriftungen bearbeiten. Schalten Sie auf Besucheransicht, um die fertige Seite zu sperren.'
                  : 'Seitenbesucher sehen die Website schreibgeschützt – keine Upload-Buttons, Bearbeitungsstifte oder Löschfunktionen sichtbar.'}
              </p>
            </div>
          </div>

          {onToggleAdminMode && (
            <button
              onClick={onToggleAdminMode}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0 ${
                isAdminMode
                  ? 'bg-stone-900 hover:bg-stone-800 text-white'
                  : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-300'
              }`}
            >
              {isAdminMode ? '👁️ Ansicht sperren (Besucher-Modus)' : '✏️ Inhaber-Zugang (Bearbeiten)'}
            </button>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2">
          <p>© {new Date().getFullYear()} {company.name}. Modulare Holzbühnen & Festival Stage-Planung.</p>
          <p className="text-stone-400 font-mono text-[11px]">
            Dresden · Leipzig · Halle
          </p>
        </div>
      </div>
    </footer>
  );
};
