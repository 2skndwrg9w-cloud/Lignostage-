import React from 'react';
import { teamMembers } from '../data/companyData';
import { CompanyConfig } from '../types';
import { Hammer, Sparkles, MapPin, Check } from 'lucide-react';

interface AboutSectionProps {
  company: CompanyConfig;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ company }) => {
  return (
    <section id="ueber-uns" className="py-20 md:py-28 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2e7d47] mb-2 font-mono">
            <span className="w-2.5 h-0.5 bg-[#2e7d47]" />
            <span>Über Lignostage & Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight [text-wrap:balance]">
            Bauingenieurwesen, fundierte Stoff- und Textilgestaltung und gelebte Festivalpraxis.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed">
            Wir verbinden bautechnisches Know-how, fundierte Stoff- und Materialexpertise sowie jahrelange Baustellen- und Festivalerfahrung vor Ort.
          </p>
        </div>

        {/* Team Grid: Florian & Anna */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {teamMembers.map((member, idx) => {
            const isFlorian = idx === 0;

            return (
              <div
                key={idx}
                className="p-8 bg-stone-50/90 rounded-2xl border border-stone-200/90 flex flex-col justify-between shadow-2xs hover:border-stone-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 text-xs">
                    <span className="font-mono text-stone-500 uppercase tracking-wider">
                      {member.focus}
                    </span>
                    <span className="p-2 bg-white rounded-lg text-stone-800 border border-stone-200/60 shadow-2xs">
                      {isFlorian ? (
                        <Hammer className="w-4 h-4 text-[#d97706]" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#2e7d47]" />
                      )}
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl font-bold text-stone-900 tracking-tight">
                    {member.name}
                  </h3>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 mt-1 font-mono">
                    {member.role}
                  </div>

                  <div className="mt-6 pt-5 border-t border-stone-200/80">
                    <div className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                      Werdegang & Praxis
                    </div>
                    <ul className="space-y-2.5">
                      {member.background.map((bg, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isFlorian ? 'text-[#d97706]' : 'text-[#2e7d47]'
                            }`}
                          />
                          <span>{bg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Region Banner */}
        <div className="p-6 sm:p-8 bg-stone-100/80 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl text-stone-900 border border-stone-200 shadow-2xs">
              <MapPin className="w-5 h-5 text-[#d97706]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-stone-500 font-mono">
                Bürostandort & Einsatzgebiet
              </div>
              <div className="text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                Konkordienstraße 28, 01127 Dresden
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                Projekte primär im Raum Dresden · Leipzig · Halle
              </div>
            </div>
          </div>
          <div className="text-xs text-stone-600 max-w-sm sm:text-right leading-relaxed">
            Kurze Transportwege, direkte Vor-Ort-Koordination und termingerechte Logistik für Festivals in Mitteldeutschland.
          </div>
        </div>

      </div>
    </section>
  );
};
