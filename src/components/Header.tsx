import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { CompanyConfig } from '../types';
import { LignostageLogo } from './LignostageLogo';
import { LogoCustomizerModal } from './LogoCustomizerModal';

interface HeaderProps {
  company: CompanyConfig;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  isAdminMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  onNavigate,
  activeSection,
  isAdminMode = false,
}) => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const navLinks = [
    { id: 'dienstleistungen', label: 'Dienstleistungen' },
    { id: 'grundsaetze', label: 'Grundsätze' },
    { id: 'projekte', label: 'Fotos' },
    { id: 'planung-tools', label: 'Tools' },
    { id: 'ueber-uns', label: 'Über uns' },
    { id: 'kontakt', label: 'Kontakt' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 py-2 sm:py-0">
          
          {/* Mobile top bar (Logo left, Button right) / Desktop left zone */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 shrink-0">
            {/* Zone 1: Firmenlogo direkt ÜBER Lignostage + Datei-Upload Trigger (nur im Inhaber-Modus) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => handleLinkClick('start')}
                className="flex flex-col items-center justify-center shrink-0 group cursor-pointer focus:outline-hidden"
                title="Lignostage Startseite"
              >
                <LignostageLogo
                  className="text-stone-950 group-hover:text-amber-700 transition-colors"
                  variant="dark"
                  allowUpload={false}
                />
                <span className="text-sm sm:text-base font-bold tracking-tight text-stone-950 uppercase -mt-0.5 group-hover:text-stone-700 transition-colors">
                  {company.name}
                </span>
              </button>

              {isAdminMode && (
                <button
                  onClick={() => setIsLogoModalOpen(true)}
                  className="p-1 sm:p-1.5 text-stone-400 hover:text-stone-950 hover:bg-stone-100 rounded-md transition-colors cursor-pointer group"
                  title="Firmenlogo als Datei hochladen & im Header anpassen"
                  aria-label="Firmenlogo hochladen & anpassen"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                </button>
              )}
            </div>

            {/* Button "Anfrage stellen" on mobile */}
            <button
              onClick={() => handleLinkClick('kontakt')}
              className="sm:hidden px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              Anfrage stellen
            </button>
          </div>

        {/* Zone 2: Navigation links ALWAYS side-by-side without horizontal overflow */}
        <nav className="flex items-center gap-1.5 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto max-w-full no-scrollbar py-1 text-xs sm:text-sm font-medium text-stone-600">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-950 cursor-pointer relative py-1 px-1 sm:px-1.5 ${
                  isActive ? 'text-stone-950 font-bold' : 'text-stone-600'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-stone-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action button on desktop & tablet (sm and above) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleLinkClick('kontakt')}
            className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            Anfrage stellen
          </button>
        </div>
      </div>
    </header>

      <LogoCustomizerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        companyName={company.name}
      />
    </>
  );
};
