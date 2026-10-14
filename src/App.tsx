/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initialCompanyConfig, servicesData, initialProjects } from './data/companyData';
import { ProjectPhoto } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { PrinciplesSection } from './components/PrinciplesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { PlanningAndToolsSection } from './components/PlanningAndToolsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

export default function App() {
  const company = initialCompanyConfig;
  const [activeSection, setActiveSection] = useState('start');

  // Load custom projects without any fictional placeholders
  const [projects, setProjects] = useState<ProjectPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('lignostage_custom_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old placeholder items (p1-1, p1-2, etc.)
          const realPhotos = parsed.filter(
            (p: ProjectPhoto) => !p.id.startsWith('p1-') && !p.id.startsWith('p2-') && !p.id.startsWith('p3-')
          );
          if (realPhotos.length > 0) {
            return realPhotos;
          }
        }
      }
    } catch (e) {
      // fallback
    }
    return initialProjects;
  });

  // Track the designated hero background photo (default: photo_2026-09-22 09.08.32)
  const [heroBackgroundTitle, setHeroBackgroundTitle] = useState<string>(() => {
    return localStorage.getItem('lignostage_hero_photo_title') || 'photo_2026-09-22 09.08.32';
  });

  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState<string>(() => {
    return localStorage.getItem('lignostage_hero_photo_url') || '';
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedProjectName, setSelectedProjectName] = useState<string | undefined>(undefined);

  // Live Visitor Mode (Public/Locked) vs. Owner Edit Mode
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('lignostage_admin_mode');
      if (stored !== null) return stored === 'true';
    } catch (e) {}
    return true; // Default to admin mode in development so owner can easily edit; toggling locks it for visitors
  });

  const handleToggleAdminMode = () => {
    setIsAdminMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lignostage_admin_mode', String(next));
      } catch (e) {}
      return next;
    });
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectServiceForInquiry = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedProjectName(undefined);
    handleNavigate('kontakt');
  };

  const handleSelectProjectForContact = (projectName: string) => {
    setSelectedProjectName(projectName);
    handleNavigate('kontakt');
  };

  const handleSetHeroBackground = (url: string, title: string) => {
    setHeroBackgroundUrl(url);
    setHeroBackgroundTitle(title);
    try {
      localStorage.setItem('lignostage_hero_photo_url', url);
      localStorage.setItem('lignostage_hero_photo_title', title);
    } catch (e) {
      // storage fallback
    }
  };

  const handleUpdateProjects = (updatedList: ProjectPhoto[]) => {
    // Keep only authentic photos
    const cleaned = updatedList.filter(
      (p) => !p.id.startsWith('p1-') && !p.id.startsWith('p2-') && !p.id.startsWith('p3-')
    );
    setProjects(cleaned);
    try {
      localStorage.setItem('lignostage_custom_photos', JSON.stringify(cleaned));
    } catch (e) {
      // storage fallback
    }
  };

  // Automatically bind heroBackgroundUrl when matching photo (e.g. photo_2026-09-22 09.08.32) appears
  useEffect(() => {
    const matchingPhoto = projects.find(
      (p) =>
        p.title === heroBackgroundTitle ||
        p.fileName === heroBackgroundTitle ||
        p.title.includes('photo_2026-09-22') ||
        p.title.includes('09.08.32')
    );
    if (matchingPhoto?.sourceUrl && matchingPhoto.sourceUrl !== heroBackgroundUrl) {
      setHeroBackgroundUrl(matchingPhoto.sourceUrl);
      setHeroBackgroundTitle(matchingPhoto.title);
      try {
        localStorage.setItem('lignostage_hero_photo_url', matchingPhoto.sourceUrl);
        localStorage.setItem('lignostage_hero_photo_title', matchingPhoto.title);
      } catch (e) {}
    } else if (!heroBackgroundUrl && projects.length > 0 && projects[0].sourceUrl) {
      // If none explicitly matched, take the first real photo
      setHeroBackgroundUrl(projects[0].sourceUrl);
      setHeroBackgroundTitle(projects[0].title);
    }
  }, [projects, heroBackgroundTitle, heroBackgroundUrl]);

  useEffect(() => {
    const sectionIds = ['start', 'dienstleistungen', 'grundsaetze', 'projekte', 'planung-tools', 'ueber-uns', 'kontakt'];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white flex flex-col">
      {/* 3-Zone Header */}
      <Header
        company={company}
        onNavigate={handleNavigate}
        activeSection={activeSection}
        isAdminMode={isAdminMode}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero with atmospheric wooden stage background (supports photo_2026-09-22 09.08.32) */}
        <Hero
          company={company}
          onNavigate={handleNavigate}
          backgroundPhotoUrl={heroBackgroundUrl}
          backgroundPhotoTitle={heroBackgroundTitle}
          isAdminMode={isAdminMode}
        />

        {/* 2. Dienstleistungen (Light grey with green tones & rigging-kompatibel) */}
        <ServicesSection
          services={servicesData}
          onSelectServiceForInquiry={handleSelectServiceForInquiry}
        />

        {/* 3. Unsere Grundsätze (Direkt vor der Galerie) */}
        <PrinciplesSection
          onNavigateToGallery={() => handleNavigate('projekte')}
        />

        {/* 4. Bisherige Projekte, Fotos & Inline Video (Seitlich scrollbar & variable Kachelgrößen) */}
        <ProjectsSection
          projects={projects}
          onUpdateProjects={handleUpdateProjects}
          onSelectProjectForContact={handleSelectProjectForContact}
          heroBackgroundTitle={heroBackgroundTitle}
          onSetHeroBackground={handleSetHeroBackground}
          isAdminMode={isAdminMode}
        />

        {/* 5. Planungsexpertise & moderne Tools (3D-Visualisierungen & technische Zeichnungen) */}
        <PlanningAndToolsSection
          onSelectPlanForInquiry={handleSelectProjectForContact}
          isAdminMode={isAdminMode}
        />

        {/* 6. Über uns & Team (Florian & Anna) */}
        <AboutSection company={company} />

        {/* 7. Direkter Kontakt & Anfrage */}
        <ContactSection
          company={company}
          services={servicesData}
          preselectedServiceId={selectedServiceId}
          preselectedProjectName={selectedProjectName}
        />
      </main>

      {/* Floating Owner Mode Indicator (Quick toggle to lock or preview visitor view) */}
      {isAdminMode && (
        <aside aria-label="Inhaber-Bearbeitungsmodus" className="fixed bottom-4 right-4 z-40 bg-stone-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-xl border border-stone-700 flex items-center gap-2.5 text-xs animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-stone-200">Inhaber-Modus aktiv</span>
          <button
            onClick={handleToggleAdminMode}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer border border-stone-600 ml-1"
          >
            Für Besucher sperren
          </button>
        </aside>
      )}

      {/* Footer */}
      <Footer
        company={company}
        onNavigate={handleNavigate}
        isAdminMode={isAdminMode}
        onToggleAdminMode={handleToggleAdminMode}
      />
    </div>
  );
}
