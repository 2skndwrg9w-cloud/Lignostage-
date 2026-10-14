import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { CompanyConfig } from '../types';
import { LignostageLogo } from './LignostageLogo';

interface HeroProps {
  company: CompanyConfig;
  onNavigate: (sectionId: string) => void;
  backgroundPhotoUrl?: string;
  backgroundPhotoTitle?: string;
  isAdminMode?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  company,
  onNavigate,
  backgroundPhotoUrl,
  isAdminMode = false,
}) => {
  return (
    <section id="start" className="relative pt-6 sm:pt-8 md:pt-10 pb-16 md:pb-28 overflow-hidden border-b border-stone-200 bg-stone-950 text-white">
      {/* Wooden Festival Stage Background (100% undistorted, crisp upscaled rendering) */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none">
        {backgroundPhotoUrl ? (
          <img
            src={backgroundPhotoUrl}
            alt="Lignostage Holzbühne"
            className="w-full h-full object-cover object-center transition-all duration-700"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.04) brightness(0.98) saturate(1.02)',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          /* High-impact architectural wooden stage structure with warm ambient lighting */
          <div className="relative w-full h-full bg-gradient-to-br from-[#1c1917] via-[#24201e] to-[#0c0a09]">
            {/* Ambient warm stage glow */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[450px] bg-[#d97706]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-10 w-[500px] h-[350px] bg-[#2e7d47]/12 rounded-full blur-3xl pointer-events-none" />

            {/* Architectural wooden stage blueprint truss lines & silhouette */}
            <svg
              className="absolute right-0 bottom-0 w-full lg:w-3/5 h-full opacity-35 pointer-events-none"
              viewBox="0 0 800 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMaxYMax meet"
            >
              <rect x="50" y="440" width="700" height="24" rx="3" fill="#5c3a21" stroke="#9a632b" strokeWidth="2" />
              <line x1="120" y1="464" x2="120" y2="560" stroke="#875122" strokeWidth="6" />
              <line x1="260" y1="464" x2="260" y2="560" stroke="#875122" strokeWidth="6" />
              <line x1="400" y1="464" x2="400" y2="560" stroke="#875122" strokeWidth="6" />
              <line x1="540" y1="464" x2="540" y2="560" stroke="#875122" strokeWidth="6" />
              <line x1="680" y1="464" x2="680" y2="560" stroke="#875122" strokeWidth="6" />
              
              <line x1="120" y1="560" x2="260" y2="464" stroke="#5c3a21" strokeWidth="3" strokeDasharray="6 6" />
              <line x1="260" y1="560" x2="400" y2="464" stroke="#5c3a21" strokeWidth="3" strokeDasharray="6 6" />
              <line x1="400" y1="560" x2="540" y2="464" stroke="#5c3a21" strokeWidth="3" strokeDasharray="6 6" />
              <line x1="540" y1="560" x2="680" y2="464" stroke="#5c3a21" strokeWidth="3" strokeDasharray="6 6" />

              <path d="M 80 440 Q 400 120 720 440" stroke="#c67d26" strokeWidth="4" fill="none" />
              <path d="M 120 440 Q 400 160 680 440" stroke="#9a632b" strokeWidth="2.5" fill="none" />
              <line x1="200" y1="360" x2="200" y2="440" stroke="#875122" strokeWidth="3" />
              <line x1="300" y1="280" x2="300" y2="440" stroke="#875122" strokeWidth="3" />
              <line x1="400" y1="230" x2="400" y2="440" stroke="#c67d26" strokeWidth="4" />
              <line x1="500" y1="280" x2="500" y2="440" stroke="#875122" strokeWidth="3" />
              <line x1="600" y1="360" x2="600" y2="440" stroke="#875122" strokeWidth="3" />

              <circle cx="400" cy="230" r="7" fill="#d97706" />
              <circle cx="300" cy="280" r="5" fill="#c67d26" />
              <circle cx="500" cy="280" r="5" fill="#c67d26" />
            </svg>
          </div>
        )}

        {/* Measured dark gradient scrim for 100% WCAG AA text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/45" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo ALWAYS positioned centered directly above Lignostage */}
        <div className="inline-flex flex-col items-center mb-5 sm:mb-6">
          <LignostageLogo
            className="h-22 sm:h-28 md:h-36 w-auto"
            variant="white"
            dropShadow={true}
            allowUpload={isAdminMode}
          />
          <span className="text-sm sm:text-base font-mono font-bold tracking-widest uppercase text-white text-center -mt-2 sm:-mt-2.5 leading-none">
            {company.name}
          </span>
        </div>

        {/* Kicker */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-5 font-mono">
          <span className="text-stone-300">Dresden · Leipzig · Halle</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span className="text-[#d97706] font-bold">Modulare Holzbühnen</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span className="text-[#388e53] font-bold">Stage-Design</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] max-w-4xl [text-wrap:balance]">
          Modulare Holzbühnen & Stage-Design.
        </h1>

        {/* 2 Core Branches (Direkt unter der Headline, ohne Wiederholungen) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          <div className="p-6 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl shadow-sm">
            <span className="text-xs font-mono font-bold text-[#d97706] block mb-1">01. BÜHNENVERMIETUNG</span>
            <h2 className="text-lg font-bold text-white">Modulare Holzbühnen</h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
              Bis zu 150 m² Fläche, wetterfest, rigging-kompatibel und flexibel anpassbar an jedes Festivalgelände. Bühnenboden mit bis zu 1,5 m Höhe aus Bühtecs.
            </p>
          </div>

          <div className="p-6 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl shadow-sm">
            <span className="text-xs font-mono font-bold text-[#388e53] block mb-1">02. STAGE-DESIGN</span>
            <h2 className="text-lg font-bold text-white">Stage-Design & Floor-Konzeption</h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
              Konzeptionierung von ganzen Floors sowie Erarbeiten eines individuellen Konzepts und Bühnenbilds nach Ihren Vorstellungen – inklusive Statik und praktischer Aufbauleitung vor Ort.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onNavigate('kontakt')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-stone-950 bg-white hover:bg-stone-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <span>Bühne anfragen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onNavigate('grundsaetze')}
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-white hover:bg-white/10 border border-stone-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Grundsätze & Projekte
          </button>

          <button
            onClick={() => onNavigate('planung-tools')}
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-white hover:bg-white/10 border border-stone-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Planungsexpertise & Tools
          </button>

          <a
            href={`tel:${company.phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Phone className="w-4 h-4 text-[#388e53]" />
            <span>{company.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
