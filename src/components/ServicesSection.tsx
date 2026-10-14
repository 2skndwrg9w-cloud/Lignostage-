import React from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectServiceForInquiry: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForInquiry,
}) => {
  return (
    <section id="dienstleistungen" className="py-20 md:py-28 bg-[#faf9f8] border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5e7c65] mb-2 font-mono">
            <span className="w-2.5 h-0.5 bg-[#2e7d47]" />
            <span>Dienstleistungen & Spezifikationen</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight [text-wrap:balance]">
            Leistungen im Überblick
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            Ob einzelne Holzbühnen-Miete oder die komplette bühnenseitige Festivalleitung – abgestimmt auf Ihre Anforderungen.
          </p>
        </div>

        {/* Technical Specs Strip: Technische Eckdaten des Modularen Systems */}
        <div className="mb-12 p-6 sm:p-8 bg-stone-100/90 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
              Technische Eckdaten des Modularen Systems
            </span>
            <span className="text-xs font-semibold text-[#2e7d47] bg-[#2e7d47]/10 px-2.5 py-0.5 rounded-full border border-[#2e7d47]/20">
              Nachhaltig & Rigging-Kompatibel
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-1">
            <div className="p-4 bg-white/90 rounded-xl border border-stone-200/80">
              <div className="text-xs font-medium text-stone-500 mb-1">Bühnenfläche</div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">Bis 150 m²</div>
              <div className="text-[11px] text-[#2e7d47] mt-1 font-semibold">Modular anpassbar</div>
            </div>

            <div className="p-4 bg-white/90 rounded-xl border border-stone-200/80">
              <div className="text-xs font-medium text-stone-500 mb-1">Bauhöhe</div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">Bis 5 m</div>
              <div className="text-[11px] text-[#2e7d47] mt-1 font-semibold">Lichte Dachhöhe</div>
            </div>

            <div className="p-4 bg-white/90 rounded-xl border border-stone-200/80">
              <div className="text-xs font-medium text-stone-500 mb-1">Bühnenboden</div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">Bis 1,5 m</div>
              <div className="text-[11px] text-[#2e7d47] mt-1 font-semibold">Aus Bühtecs</div>
            </div>

            <div className="p-4 bg-white/90 rounded-xl border border-stone-200/80">
              <div className="text-xs font-medium text-stone-500 mb-1">Umgebung</div>
              <div className="text-xl sm:text-2xl font-bold text-stone-900">Anpassbar</div>
              <div className="text-[11px] text-[#2e7d47] mt-1 font-semibold">Gelände & Wald</div>
            </div>
          </div>
        </div>

        {/* 2 Main Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="bg-stone-50/90 rounded-2xl p-7 sm:p-9 border border-stone-200 hover:border-stone-300 transition-colors flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 pb-3 border-b border-stone-200 font-mono">
                  <span className={`font-bold text-sm ${idx === 0 ? 'text-[#d97706]' : 'text-[#2e7d47]'}`}>
                    {service.number}.
                  </span>
                  <span className="text-stone-600 font-medium">{service.subtitle}</span>
                </div>

                <h3 className="mt-4 text-2xl font-bold text-stone-900 tracking-tight">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-6 pt-5 border-t border-stone-200/80">
                  <ul className="space-y-2.5">
                    {service.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                        <span className="mt-0.5 p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => onSelectServiceForInquiry(service.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{service.title} anfragen</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
