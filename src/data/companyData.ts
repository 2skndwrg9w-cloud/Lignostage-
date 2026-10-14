import { CompanyConfig, ServiceItem, ProjectPhoto, TeamMember, ProjectVideo, PlanningMediaItem } from '../types';

export const initialCompanyConfig: CompanyConfig = {
  name: 'Lignostage',
  tagline: 'Modulare Holzbühnen & Stage-Design für Festivals',
  description: 'Vermietung modularer Holzbühnensysteme und ganzheitliche Bühnenkoordinierung für Festivals in Mitteldeutschland.',
  email: 'lignostage@gmx.de',
  phone: '0157 56660270',
  street: 'Konkordienstraße 28',
  postalCode: '01127',
  city: 'Dresden',
  region: 'Leipzig · Halle · Dresden',
};

export const servicesData: ServiceItem[] = [
  {
    id: 'holzbuehnen',
    number: '01',
    title: 'Vermietung modularer Holzbühnen',
    subtitle: 'Wiederverwendbar, robust & wetterfest',
    description: 'Modulare Bühnenkonstruktionen aus Holz für Festivals, Open-Airs und Kulturveranstaltungen. Flexibel skalierbar, umgebungsschonend und passgenau auf das jeweilige Gelände zugeschnitten.',
    specs: [
      { label: 'Bühnenfläche', value: 'Bis zu 150 m²' },
      { label: 'Bauhöhe', value: 'Bis zu 5 m' },
      { label: 'Bühnenboden', value: 'Bis zu 1,5 m (Bühtecs)' },
      { label: 'Gelände', value: 'Anpassbar an Umgebung' },
    ],
    points: [
      'Bühnenboden mit bis zu 1,5 m Höhe aus Bühtecs',
      'Flexible Rastermaße bis 150 m² Gesamtfläche',
      'Wetterfeste Überdachung & kompatibel mit Rigging-Systemen',
      'Anpassbar an Umgebung (Gelände, Wald & unebene Flächen)',
      'Schonender Auf- und Rückbau ohne schwere Bodeneingriffe',
    ],
  },
  {
    id: 'stage-planung',
    number: '02',
    title: 'Stage-Design & Festival-Planung',
    subtitle: 'Konzeption, Kalkulation & Aufbauleitung',
    description: 'Ganzheitliche Koordination Ihrer Festivalbühnen und Floors. Beide Bereiche greifen bei uns nahtlos ineinander, sodass Konstruktion und Ablauf perfekt harmonieren.',
    points: [
      'Erarbeiten eines Konzepts und Bühnenbilds nach Ihren Vorstellungen',
      'Konzeptionierung von ganzen Floors & visuelles Raumdesign',
      'Statik, Mengen- und Budgetkalkulation',
      'Bauleitung und Sicherheitskoordination vor Ort',
      'Logistische Transport- und Zeitplanung',
    ],
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: 'Florian Maximilian Fischer',
    role: 'Konstruktion, Statik & Bauleitung',
    focus: 'Bauingenieurwesen & Handwerk',
    background: [
      'Studium Bauingenieurwesen (BIW) an der TU Dresden',
      'Selbstständig im Handwerk',
      'Festivalaufbau & Baustellenpraxis seit 3 Jahren',
    ],
  },
  {
    name: 'Anna Porstendorfer',
    role: 'Gestaltung, Stoff- & Textilgestaltung, Bühnendesign',
    focus: 'Stoff-, Textil- & Materialgestaltung (Innenarchitektur)',
    background: [
      'Ausbildung zur Raumausstatterin mit Schwerpunkt Textil- und Stoffverarbeitung',
      'Fundierte Stoff- und Materialexpertise für atmosphärische Bühnendesigns',
      'Studium Innenarchitektur an der Burg Giebichenstein Halle',
      'Theater-, Bühnen- und Festivalerfahrung seit 2 Jahren',
    ],
  },
];

export const initialProjects: ProjectPhoto[] = [
  {
    id: 'proj-firlefanz-01',
    projectId: 'firle-fanz-2026',
    projectName: 'Firle Fanz Festival 2026',
    title: 'Holzbogen-Bühnenkonstruktion 150 m²',
    category: 'buehne',
    description: 'Modulare Hauptbühne aus Konstruktionsvollholz mit wetterfestem Rundbogen-Dach und Bühtecs-Boden bis 1,5 m.',
    qualityTier: 'hd',
    sizeVariant: 'large',
    isHeroBackground: true,
  },
  {
    id: 'proj-firlefanz-02',
    projectId: 'firle-fanz-2026',
    projectName: 'Firle Fanz Festival 2026',
    title: 'Mainfloor & Textil-Baldachin',
    category: 'stage-design',
    description: 'Ganzheitliches Floor-Konzept mit gespannten Naturfaser-Stoffen und integrierter Lichtarchitektur.',
    qualityTier: 'standard',
    sizeVariant: 'medium',
  },
  {
    id: 'proj-waldklang-01',
    projectId: 'waldklang-2026',
    projectName: 'Waldklang Open Air',
    title: 'Waldbühne mit Baumkronen-Integration',
    category: 'stage-design',
    description: 'Organische Holzkörper und stoffliche Bespannung, harmonisch eingepasst in den alten Baumbestand.',
    qualityTier: 'hd',
    sizeVariant: 'large',
  },
  {
    id: 'proj-waldklang-02',
    projectId: 'waldklang-2026',
    projectName: 'Waldklang Open Air',
    title: 'Bühtecs-Podestaufbau 1,2 m Hangausgleich',
    category: 'buehne',
    description: 'Bodenschonende Gründung mit stufenlosem Niveauausgleich für unebenes Wald- und Wiesengelände.',
    qualityTier: 'standard',
    sizeVariant: 'medium',
  },
  {
    id: 'proj-tour-01',
    projectId: 'tour-2026',
    projectName: 'Mitteldeutschland Tournee',
    title: 'Modulare Holzbühne mit Rigging-System',
    category: 'buehne',
    description: 'Standardisiertes Rastersystem für schnellen Auf- und Abbau an wechselnden Festivalstandorten.',
    qualityTier: 'standard',
    sizeVariant: 'medium',
  },
  {
    id: 'proj-tour-02',
    projectId: 'tour-2026',
    projectName: 'Mitteldeutschland Tournee',
    title: 'Stage-Design & Akustik-Holzlamellen',
    category: 'stage-design',
    description: 'Fein abgestimmte Akustikelemente aus regionalem Holz zur gezielten Schalllenkung und warmen Raumwirkung.',
    qualityTier: 'standard',
    sizeVariant: 'medium',
  },
];

export const initialVideo: ProjectVideo = {
  id: 'lignostage-intro-video',
  projectName: 'Firle Fanz Festival 2026',
  category: 'buehne',
  title: 'Holzbühnenbau & Festival-Aufbau vor Ort',
  description: 'Eindrücke vom Aufbau, der Konstruktion und der fertigen Bühne im Live-Einsatz.',
};

export const aboutPrinciples = [
  {
    number: '01',
    title: 'Nachhaltigkeit & Rezyklierbarkeit',
    description: 'CO2-Fußabdruck mitdenken: Wiederverwendbare Holzmodule, langlebige Verbindungen und sortenreine Rezyklierbarkeit.',
  },
  {
    number: '02',
    title: 'Bauliche Expertise & sichere Statik',
    description: 'Bauliche Expertise, sichere Statik und durchdachtes Bühnenbild mit Konzept: Wir kümmern uns um fundierte Planung und kreative Umsetzung – das Design wird genau nach den Vorstellungen der Kund:innen realisiert.',
  },
  {
    number: '03',
    title: 'Konzept, Umsetzung & Leitung vor Ort',
    description: 'Kreative Umsetzung und bühnenspezifische Ablaufkoordination: Ein verlässlicher Ansprechpartner für Konstruktion, Materiallogistik und die praktische Bauleitung auf dem Festival.',
  },
];

export const initialPlanningMedia: PlanningMediaItem[] = [
  {
    id: 'plan-3d-buehne',
    projectName: 'Firle Fanz Festival 2026',
    title: '3D-Visualisierung Festivalbühne 150 m²',
    category: 'visualisierung',
    format: '3D-Modell',
    description: 'Räumliche Visualisierung mit Holzbögen, Bühnenboden aus Bühtecs bis 1,5 m und abgestimmter Lichtintegration an den Bühnenelementen.',
  },
  {
    id: 'plan-statik-cad',
    projectName: 'Firle Fanz Festival 2026',
    title: 'Statik- und Konstruktionsplan Holztragwerk',
    category: 'zeichnung',
    format: 'Statik-Plan',
    description: 'Statische Berechnung, sichere Lastabtragung, Windlasten und Geländeanpassung für unebene Festivalböden.',
  },
  {
    id: 'plan-3d-floor-wald',
    projectName: 'Waldklang Open Air',
    title: '3D-Gesamtkonzept Waldbühne & Floor-Einbettung',
    category: 'visualisierung',
    format: '3D-Modell',
    description: 'Konzeptionierung des gesamten Dancefloors zwischen altem Baumbestand mit organischen Holzstrukturen.',
  },
  {
    id: 'plan-licht-cad',
    projectName: 'Waldklang Open Air',
    title: 'Licht- & Rigging-Integrationsplan',
    category: 'zeichnung',
    format: 'Lichtkonzept',
    description: 'Vorplanung der Scheinwerfer-Befestigungspunkte, Kabelwege und statischer Zusatzlasten an den Holzbögen.',
  },
  {
    id: 'plan-raster-podest',
    projectName: 'Mitteldeutschland Tournee',
    title: 'Modulares Rastermaß & Bühtecs-Geländeschnitt',
    category: 'zeichnung',
    format: 'CAD-Schnitt',
    description: 'Detaillierter Schnittplan für das modulare Holzpodest zur schnellen und bodenschonenden Montage.',
  },
  {
    id: 'plan-3d-mainstage',
    projectName: 'Mitteldeutschland Tournee',
    title: '3D-Renderings Material- & Oberflächenvarianten',
    category: 'visualisierung',
    format: '3D-Modell',
    description: 'Variantenvergleich mit Naturholzlasuren und wetterfesten Membranen für verschiedene Festivalstandorte.',
  },
];
