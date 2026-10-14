import React from 'react';
import { aboutPrinciples } from '../data/companyData';
import { Leaf, Award, Layers, ArrowDown } from 'lucide-react';

interface PrinciplesSectionProps {
  onNavigateToGallery?: () => void;
}

export const PrinciplesSection: React.FC<PrinciplesSectionProps> = ({
  onNavigateToGallery,
}) => {
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Leaf className="w-5 h-5 text-[#2e7d47]" />;
      case 1:
        return <Award className="w-5 h-5 text-[#c67d26]" />;
      default:
        return <Layers className="w-5 h-5 text-stone-700" />;
    }
  };

  return (
    <section id="grundsaetze" className="py-16 md:py-24 bg-stone-100/80 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2e7d47] mb-2 font-mono">
              <span className="w-2.5 h-0.5 bg-[#2e7d47]" />
              <span>Unsere Haltung & Werte</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight [text-wrap:balance]">
              Unsere Grundsätze für jeden Festivalaufbau
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              Bauliche Expertise, sichere Statik und durchdachtes Bühnenbild mit Konzept – die Grundlage, bevor das erste Holzmodul vor Ort montiert wird.
            </p>
          </div>

          {onNavigateToGallery && (
            <button
              onClick={onNavigateToGallery}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-800 hover:text-stone-950 transition-colors cursor-pointer self-start md:self-end pb-1 border-b border-stone-400 hover:border-stone-900"
            >
              <span>Direkt zu den Projekten & Fotos</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3 Principles Cards (Slightly more intense warm timber & forest green) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {aboutPrinciples.map((val, idx) => {
            const isGreen = idx === 0;
            const isOchre = idx === 1;

            return (
              <div
                key={val.number}
                className="bg-white rounded-2xl p-7 sm:p-8 border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-start pb-4 border-b border-stone-100 mb-5">
                    <div className={`p-2.5 rounded-xl ${isGreen ? 'bg-[#2e7d47]/10' : isOchre ? 'bg-[#c67d26]/10' : 'bg-stone-100'}`}>
                      {getIcon(idx)}
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                    {val.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isGreen
                        ? 'bg-[#2e7d47]'
                        : isOchre
                        ? 'bg-[#c67d26]'
                        : 'bg-stone-600'
                    }`}
                  />
                  <span className="text-[11px] font-mono text-stone-600">
                    {isGreen
                      ? 'CO2-optimiert & kreislauffähig'
                      : isOchre
                      ? 'Statik & Entwurf nach Kundenwunsch'
                      : 'Kreativkonzept & Bauleitung vor Ort'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
