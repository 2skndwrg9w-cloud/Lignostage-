import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Maximize2,
  X,
  FileText,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  RotateCw,
} from 'lucide-react';
import { PlanningMediaItem } from '../types';
import { initialPlanningMedia } from '../data/companyData';

interface PlanningAndToolsSectionProps {
  onSelectPlanForInquiry?: (planTitle: string) => void;
  isAdminMode?: boolean;
}

export const PlanningAndToolsSection: React.FC<PlanningAndToolsSectionProps> = ({
  onSelectPlanForInquiry,
  isAdminMode = false,
}) => {
  // Load planning items from localStorage or defaults
  const [plans, setPlans] = useState<PlanningMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('lignostage_custom_plans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return initialPlanningMedia;
  });

  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'visualisierung' | 'zeichnung'>('all');
  const [sortBy, setSortBy] = useState<'project' | 'title'>('project');
  const [selectedPlan, setSelectedPlan] = useState<PlanningMediaItem | null>(null);

  // Upload modal state (Create new plan)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProjectName, setUploadProjectName] = useState('Firle Fanz Festival 2026');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'visualisierung' | 'zeichnung'>('visualisierung');
  const [uploadFormat, setUploadFormat] = useState<PlanningMediaItem['format']>('3D-Modell');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFilePreview, setUploadFilePreview] = useState<string | null>(null);
  const [uploadIsPdf, setUploadIsPdf] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');

  // Edit modal state (Edit existing plan & replace file/image/PDF)
  const [editingPlan, setEditingPlan] = useState<PlanningMediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProjectName, setEditProjectName] = useState('Firle Fanz Festival 2026');
  const [editCategory, setEditCategory] = useState<'visualisierung' | 'zeichnung'>('visualisierung');
  const [editFormat, setEditFormat] = useState('3D-Modell');
  const [editDescription, setEditDescription] = useState('');
  const [editRotation, setEditRotation] = useState<number>(0);
  const [editFilePreview, setEditFilePreview] = useState<string | null>(null);
  const [editIsPdf, setEditIsPdf] = useState(false);
  const [editFileName, setEditFileName] = useState('');
  const [editFileSize, setEditFileSize] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Rotate plan by 90 degrees
  const handleRotatePlan = (planId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = plans.map((p) => {
      if (p.id === planId) {
        const nextRot = (((p.rotation || 0) + 90) % 360);
        return { ...p, rotation: nextRot };
      }
      return p;
    });
    setPlans(updated);
    try {
      localStorage.setItem('lignostage_custom_plans', JSON.stringify(updated));
    } catch (err) {}
    if (selectedPlan && selectedPlan.id === planId) {
      setSelectedPlan((prev) =>
        prev ? { ...prev, rotation: (((prev.rotation || 0) + 90) % 360) } : null
      );
    }
  };

  // Extract unique available projects
  const availableProjects = Array.from(
    new Set(plans.map((p) => p.projectName).filter(Boolean))
  );

  // Filter plans
  const filteredPlans = plans.filter((item) => {
    if (selectedProjectFilter !== 'all' && item.projectName !== selectedProjectFilter) return false;
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) return false;
    return true;
  });

  // Sort plans
  filteredPlans.sort((a, b) => {
    if (sortBy === 'project') {
      const projA = a.projectName || '';
      const projB = b.projectName || '';
      if (projA !== projB) return projA.localeCompare(projB);
      return a.title.localeCompare(b.title);
    }
    return a.title.localeCompare(b.title);
  });

  // Construct 2-row horizontal pairs: [ [item0, item1], [item2, item3], ... ]
  const planColumns: PlanningMediaItem[][] = [];
  for (let i = 0; i < filteredPlans.length; i += 2) {
    planColumns.push(filteredPlans.slice(i, i + 2));
  }

  // Dynamic column width matching orientation/rotation (Hochformat: schlank; Querformat: im Verhältnis breiter)
  const getPlanColumnWidthClass = (column: PlanningMediaItem[]) => {
    const allHoch = column.length > 0 && column.every((item) => ((item.rotation || 0) % 180 !== 0));
    if (allHoch) {
      return 'w-[180px] sm:w-[220px] md:w-[260px] lg:w-[290px]';
    }
    return 'w-[320px] sm:w-[380px] md:w-[450px] lg:w-[500px]';
  };

  // Lightbox arrow navigation & auto-advance for plans
  const currentPlanIndex = selectedPlan
    ? filteredPlans.findIndex((p) => p.id === selectedPlan.id)
    : -1;

  const handlePrevPlan = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (filteredPlans.length === 0) return;
    const prevIdx =
      currentPlanIndex <= 0 ? filteredPlans.length - 1 : currentPlanIndex - 1;
    setSelectedPlan(filteredPlans[prevIdx]);
  };

  const handleNextPlan = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (filteredPlans.length === 0) return;
    const nextIdx =
      currentPlanIndex === -1 || currentPlanIndex >= filteredPlans.length - 1
        ? 0
        : currentPlanIndex + 1;
    setSelectedPlan(filteredPlans[nextIdx]);
  };

  useEffect(() => {
    if (!selectedPlan) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPlan();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPlan();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedPlan(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlan, filteredPlans, currentPlanIndex]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -450, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 450, behavior: 'smooth' });
    }
  };

  // Handle file select for new plan
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadFileSize(`${sizeInMB} MB`);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setUploadIsPdf(isPdf);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (!uploadTitle) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(baseName);
    }
  };

  // Handle file replacement for editing existing plan
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setEditFileSize(`${sizeInMB} MB`);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setEditIsPdf(isPdf);

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = () => {
    if (!uploadTitle.trim() || !uploadFilePreview) return;

    const newPlanItem: PlanningMediaItem = {
      id: `custom-plan-${Date.now()}`,
      projectName: uploadProjectName.trim() || 'Festival Projekt',
      title: uploadTitle.trim(),
      category: uploadCategory,
      description: uploadDescription.trim() || 'Individueller Plan / Visualisierung für Festival-Konstruktion.',
      format: uploadFormat,
      sourceUrl: uploadFilePreview,
      isCustom: true,
      fileType: uploadIsPdf ? 'pdf' : 'image',
      fileName: uploadFileName,
      fileSize: uploadFileSize,
    };

    const updated = [newPlanItem, ...plans];
    setPlans(updated);
    try {
      localStorage.setItem('lignostage_custom_plans', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage limit reached for media storage');
    }

    // Reset upload modal
    setShowUploadModal(false);
    setUploadTitle('');
    setUploadDescription('');
    setUploadFilePreview(null);
    setUploadIsPdf(false);
    setUploadFileName('');
    setUploadFileSize('');
  };

  // Open Edit modal for a plan
  const handleStartEditPlan = (plan: PlanningMediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPlan(plan);
    setEditTitle(plan.title || '');
    setEditProjectName(plan.projectName || 'Firle Fanz Festival 2026');
    setEditCategory(plan.category === 'visualisierung' ? 'visualisierung' : 'zeichnung');
    setEditFormat(plan.format || (plan.category === 'visualisierung' ? '3D-Modell' : 'CAD-Plan'));
    setEditDescription(plan.description || '');
    setEditRotation(plan.rotation || 0);
    setEditFilePreview(plan.sourceUrl || null);
    const isPdf = plan.fileType === 'pdf' || plan.sourceUrl?.startsWith('data:application/pdf') || plan.sourceUrl?.endsWith('.pdf');
    setEditIsPdf(!!isPdf);
    setEditFileName(plan.fileName || '');
    setEditFileSize(plan.fileSize || '');
  };

  // Save changes to edited plan
  const handleSavePlanEdit = () => {
    if (!editingPlan) return;

    const updated = plans.map((p) => {
      if (p.id === editingPlan.id) {
        return {
          ...p,
          title: editTitle.trim() || p.title,
          projectName: editProjectName.trim() || p.projectName,
          category: editCategory,
          format: editFormat.trim() || p.format,
          description: editDescription.trim(),
          rotation: editRotation,
          sourceUrl: editFilePreview || p.sourceUrl,
          isCustom: true,
          fileType: editIsPdf ? 'pdf' : (editFilePreview ? 'image' : p.fileType),
          fileName: editFileName || p.fileName,
          fileSize: editFileSize || p.fileSize,
        };
      }
      return p;
    });

    setPlans(updated);
    try {
      localStorage.setItem('lignostage_custom_plans', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage limit reached');
    }

    // Keep selectedPlan synced if currently open in lightbox
    if (selectedPlan?.id === editingPlan.id) {
      const matched = updated.find((p) => p.id === editingPlan.id);
      if (matched) setSelectedPlan(matched);
    }

    setEditingPlan(null);
  };

  const handleDeletePlan = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    try {
      localStorage.setItem('lignostage_custom_plans', JSON.stringify(updated));
    } catch (err) {
      // ignore
    }
    if (selectedPlan?.id === id) {
      setSelectedPlan(null);
    }
    if (editingPlan?.id === id) {
      setEditingPlan(null);
    }
  };

  // Render Plan Graphics: PDF Card, Custom Image, or Clean Blueprint Vector
  const renderPlanGraphic = (plan: PlanningMediaItem) => {
    const isPdf = plan.fileType === 'pdf' || plan.sourceUrl?.startsWith('data:application/pdf') || plan.sourceUrl?.endsWith('.pdf');

    if (isPdf) {
      return (
        <div className="w-full h-full relative bg-stone-100 flex flex-col items-center justify-center p-4 border border-stone-200 text-stone-800 select-none">
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:12px_12px]" />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-[85%]">
            <div className="w-12 h-14 bg-white rounded-lg shadow-sm border border-stone-300 flex flex-col items-center justify-between p-1.5 mb-2 group-hover:scale-105 transition-transform">
              <div className="w-full flex justify-end">
                <span className="text-[9px] font-bold font-mono text-red-600 bg-red-50 px-1 rounded">PDF</span>
              </div>
              <FileText className="w-6 h-6 text-stone-600" />
              <div className="w-full h-1 bg-amber-500 rounded-full" />
            </div>

            <span className="text-xs font-bold text-stone-900 truncate max-w-full">
              {plan.fileName || plan.title}
            </span>
            <span className="text-[10px] text-stone-500 font-mono mt-0.5">
              {plan.fileSize || 'PDF Dokument // CAD Plan'}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 z-10">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/90 text-stone-700 text-[10px] font-semibold rounded border border-stone-300 shadow-2xs">
              <FileText className="w-3 h-3 text-red-600" />
              PDF-Plan
            </span>
          </div>
        </div>
      );
    }

    if (plan.sourceUrl) {
      const normRot = (((plan.rotation || 0) % 360) + 360) % 360;
      const isFlipped = normRot === 90 || normRot === 270;
      return (
        <img
          src={plan.sourceUrl}
          alt={plan.title}
          className={`transition-all duration-300 group-hover:scale-105 object-cover ${
            isFlipped
              ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              : 'w-full h-full'
          }`}
          style={{
            width: isFlipped ? '133.333%' : '100%',
            height: isFlipped ? '75%' : '100%',
            transform: normRot !== 0
              ? isFlipped
                ? `translate(-50%, -50%) rotate(${normRot}deg)`
                : `rotate(${normRot}deg)`
              : undefined,
            imageRendering: '-webkit-optimize-contrast',
          }}
        />
      );
    }

    // Bespoke technical architectural vector blueprints
    if (plan.id === 'plan-3d-buehne') {
      return (
        <div className="w-full h-full relative bg-[#1c1917] flex items-center justify-center p-3 select-none">
          <svg viewBox="0 0 400 240" className="w-full h-full opacity-90" fill="none" stroke="currentColor">
            <line x1="20" y1="200" x2="380" y2="200" stroke="#78350f" strokeWidth="2" />
            <line x1="40" y1="200" x2="160" y2="145" stroke="#451a03" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="120" y1="200" x2="180" y2="145" stroke="#451a03" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="280" y1="200" x2="220" y2="145" stroke="#451a03" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="360" y1="200" x2="240" y2="145" stroke="#451a03" strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="50,180 350,180 310,155 90,155" fill="#5c3a21" stroke="#d97706" strokeWidth="1.5" />
            <rect x="50" y="180" width="300" height="18" fill="#3b2010" stroke="#b45309" strokeWidth="1" />
            <path d="M 60 155 Q 200 55 340 155" stroke="#f59e0b" strokeWidth="3" fill="none" />
            <path d="M 80 155 Q 200 75 320 155" stroke="#d97706" strokeWidth="2" fill="none" />
            <line x1="120" y1="122" x2="120" y2="165" stroke="#b45309" strokeWidth="2" />
            <line x1="200" y1="70" x2="200" y2="160" stroke="#f59e0b" strokeWidth="3" />
            <line x1="280" y1="122" x2="280" y2="165" stroke="#b45309" strokeWidth="2" />
            <line x1="120" y1="122" x2="200" y2="70" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="280" y1="122" x2="200" y2="70" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="270" y="225" fill="#f59e0b" fontSize="9" fontFamily="monospace">3D RENDER // 150 m²</text>
          </svg>
        </div>
      );
    }

    if (plan.id === 'plan-statik-cad') {
      return (
        <div className="w-full h-full relative bg-[#0f172a] flex items-center justify-center p-3 select-none">
          <svg viewBox="0 0 400 240" className="w-full h-full opacity-90" fill="none" stroke="currentColor">
            <line x1="10" y1="40" x2="390" y2="40" stroke="#1e293b" strokeWidth="1" />
            <line x1="10" y1="80" x2="390" y2="80" stroke="#1e293b" strokeWidth="1" />
            <line x1="10" y1="120" x2="390" y2="120" stroke="#1e293b" strokeWidth="1" />
            <line x1="10" y1="160" x2="390" y2="160" stroke="#1e293b" strokeWidth="1" />
            <line x1="10" y1="200" x2="390" y2="200" stroke="#1e293b" strokeWidth="1" />
            <line x1="60" y1="10" x2="60" y2="230" stroke="#1e293b" strokeWidth="1" />
            <line x1="140" y1="10" x2="140" y2="230" stroke="#1e293b" strokeWidth="1" />
            <line x1="220" y1="10" x2="220" y2="230" stroke="#1e293b" strokeWidth="1" />
            <line x1="300" y1="10" x2="300" y2="230" stroke="#1e293b" strokeWidth="1" />
            <line x1="40" y1="190" x2="360" y2="190" stroke="#38bdf8" strokeWidth="2" />
            <line x1="70" y1="190" x2="70" y2="90" stroke="#38bdf8" strokeWidth="3" />
            <line x1="330" y1="190" x2="330" y2="90" stroke="#38bdf8" strokeWidth="3" />
            <path d="M 70 90 Q 200 30 330 90" stroke="#38bdf8" strokeWidth="3" fill="none" />
            <line x1="70" y1="190" x2="140" y2="90" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="140" y1="190" x2="200" y2="55" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="260" y1="190" x2="200" y2="55" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="330" y1="190" x2="260" y2="90" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="25" y="25" fill="#38bdf8" fontSize="9" fontFamily="monospace">STATIK-BERECHNUNG // LASTFALL Q_W</text>
          </svg>
        </div>
      );
    }

    if (plan.id === 'plan-3d-floor-wald') {
      return (
        <div className="w-full h-full relative bg-[#142319] flex items-center justify-center p-3 select-none">
          <svg viewBox="0 0 400 240" className="w-full h-full opacity-90" fill="none" stroke="currentColor">
            <path d="M 30 180 Q 200 160 370 190" stroke="#22543d" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 60 170 C 90 90, 130 80, 180 90 C 230 80, 270 90, 300 170" stroke="#48bb78" strokeWidth="2.5" fill="none" />
            <path d="M 90 170 C 110 110, 140 100, 180 105 C 220 100, 250 110, 270 170" stroke="#38a169" strokeWidth="1.5" fill="none" />
            <rect x="70" y="170" width="220" height="12" rx="2" fill="#2d3748" stroke="#48bb78" strokeWidth="1.5" />
            <circle cx="180" cy="100" r="3" fill="#f6e05e" />
            <circle cx="130" cy="120" r="2.5" fill="#f6e05e" />
            <circle cx="230" cy="120" r="2.5" fill="#f6e05e" />
            <text x="25" y="30" fill="#68d391" fontSize="9" fontFamily="monospace">WALDFLOOR // 3D MODELL</text>
          </svg>
        </div>
      );
    }

    if (plan.id === 'plan-licht-cad') {
      return (
        <div className="w-full h-full relative bg-[#181824] flex items-center justify-center p-3 select-none">
          <svg viewBox="0 0 400 240" className="w-full h-full opacity-90" fill="none" stroke="currentColor">
            <path d="M 50 180 Q 200 60 350 180" stroke="#818cf8" strokeWidth="3" fill="none" />
            <line x1="80" y1="70" x2="50" y2="85" stroke="#38bdf8" strokeWidth="1" />
            <line x1="200" y1="50" x2="200" y2="80" stroke="#fbbf24" strokeWidth="1" />
            <line x1="320" y1="70" x2="350" y2="85" stroke="#38bdf8" strokeWidth="1" />
            <rect x="70" y="85" width="20" height="15" fill="#fbbf24" stroke="#f59e0b" rx="2" />
            <polygon points="70,100 60,175 100,175 90,100" fill="#fbbf24" fillOpacity="0.2" />
            <rect x="190" y="85" width="20" height="15" fill="#38bdf8" stroke="#0284c7" rx="2" />
            <polygon points="190,100 175,185 225,185 210,100" fill="#38bdf8" fillOpacity="0.2" />
            <rect x="310" y="85" width="20" height="15" fill="#fbbf24" stroke="#f59e0b" rx="2" />
            <polygon points="310,100 300,175 340,175 330,100" fill="#fbbf24" fillOpacity="0.2" />
            <text x="25" y="30" fill="#818cf8" fontSize="9" fontFamily="monospace">RIGGING & LICHTPLAN // DMX 512</text>
          </svg>
        </div>
      );
    }

    if (plan.id === 'plan-raster-podest') {
      return (
        <div className="w-full h-full relative bg-[#0b1324] flex items-center justify-center p-3 select-none">
          <svg viewBox="0 0 400 240" className="w-full h-full opacity-90" fill="none" stroke="currentColor">
            <path d="M 20 180 Q 150 195 240 175 T 380 185" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="80" y1="120" x2="80" y2="185" stroke="#60a5fa" strokeWidth="4" />
            <line x1="160" y1="120" x2="160" y2="192" stroke="#60a5fa" strokeWidth="4" />
            <line x1="240" y1="120" x2="240" y2="175" stroke="#60a5fa" strokeWidth="4" />
            <line x1="320" y1="120" x2="320" y2="182" stroke="#60a5fa" strokeWidth="4" />
            <line x1="70" y1="120" x2="70" y2="185" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="25" y="155" fill="#f59e0b" fontSize="8" fontFamily="monospace">max 1.50m</text>
            <rect x="50" y="105" width="300" height="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="25" y="30" fill="#60a5fa" fontSize="9" fontFamily="monospace">BÜHTECS PODESTSCHNITT // HÖHENAUSGLEICH</text>
          </svg>
        </div>
      );
    }

    // Default CAD Blueprint Vector Drawing
    return (
      <div className="w-full h-full relative bg-[#0f172a] flex items-center justify-center p-3 select-none">
        <svg viewBox="0 0 400 240" className="w-full h-full opacity-90" fill="none" stroke="currentColor">
          <line x1="10" y1="50" x2="390" y2="50" stroke="#1e293b" strokeWidth="1" />
          <line x1="10" y1="100" x2="390" y2="100" stroke="#1e293b" strokeWidth="1" />
          <line x1="10" y1="150" x2="390" y2="150" stroke="#1e293b" strokeWidth="1" />
          <line x1="100" y1="10" x2="100" y2="230" stroke="#1e293b" strokeWidth="1" />
          <line x1="200" y1="10" x2="200" y2="230" stroke="#1e293b" strokeWidth="1" />
          <line x1="300" y1="10" x2="300" y2="230" stroke="#1e293b" strokeWidth="1" />
          <line x1="50" y1="210" x2="350" y2="210" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="50" y1="205" x2="50" y2="215" stroke="#38bdf8" strokeWidth="2" />
          <line x1="350" y1="205" x2="350" y2="215" stroke="#38bdf8" strokeWidth="2" />
          <text x="180" y="225" fill="#38bdf8" fontSize="9" fontFamily="monospace">12.50 m</text>
          <rect x="50" y="175" width="300" height="18" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="2" />
          <path d="M 60 175 Q 200 65 340 175" stroke="#34d399" strokeWidth="2.5" fill="none" />
          <circle cx="200" cy="80" r="4" fill="#38bdf8" />
          <circle cx="140" cy="115" r="3" fill="#38bdf8" />
          <circle cx="260" cy="115" r="3" fill="#38bdf8" />
          <text x="25" y="30" fill="#34d399" fontSize="9" fontFamily="monospace">CAD ZEICHNUNG // M 1:50</text>
        </svg>
      </div>
    );
  };

  return (
    <section id="planung-tools" className="py-16 md:py-24 bg-white text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2 font-mono">
              <span className="w-2.5 h-0.5 bg-amber-600" />
              <span>Planungsexpertise & moderne Tools</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight [text-wrap:balance]">
              Präzise 3D-Visualisierungen & technische CAD-Zeichnungen
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
              Vom räumlichen Bühnenbild bis zum durchdachten Statik- und Montageplan: Nach Projekten sortiert und als modernes Doppelzeilen-System seitlich scrollbar.
            </p>
          </div>

          {/* Admin Mode Upload Button */}
          {isAdminMode && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-white" />
                <span>Plan / PDF / 3D hinzufügen</span>
              </button>
            </div>
          )}
        </div>

        {/* 3 Competence Highlights: Visualisierung, Technische Zeichnungen, Lichtkonzept (Kompakte Stichpunkte) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Box 1: Visualisierung */}
          <div className="bg-stone-50/90 rounded-2xl p-5 sm:p-6 border border-stone-200 hover:border-stone-300 transition-colors flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200 font-mono">
                <span className="font-bold text-sm text-[#d97706]">01.</span>
                <span className="text-stone-600 font-medium">3D-Modell & Renderings</span>
              </div>

              <h3 className="mt-3 text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Visualisierung
              </h3>

              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                Räumliche Vorschau des gesamten Bühnenbilds vor Baubeginn.
              </p>

              <div className="mt-3.5 pt-3.5 border-t border-stone-200/80">
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>3D-Bühnenmodellierung</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Texturen & Holzoptik</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Gelände-Einpassung</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Fotorealistische Renderings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Box 2: Technische Zeichnungen */}
          <div className="bg-stone-50/90 rounded-2xl p-5 sm:p-6 border border-stone-200 hover:border-stone-300 transition-colors flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200 font-mono">
                <span className="font-bold text-sm text-[#2e7d47]">02.</span>
                <span className="text-stone-600 font-medium">Ausführung & Statik</span>
              </div>

              <h3 className="mt-3 text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Technische Zeichnungen
              </h3>

              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                Präzise Pläne für reibungslose Montage und verlässliche Statik.
              </p>

              <div className="mt-3.5 pt-3.5 border-t border-stone-200/80">
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Werk- & Schnittpläne (CAD)</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Statik & Lastabtragung</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Maßgenaue Holzraster</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Detaillierte Stücklisten</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Box 3: Lichtkonzept */}
          <div className="bg-stone-50/90 rounded-2xl p-5 sm:p-6 border border-stone-200 hover:border-stone-300 transition-colors flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200 font-mono">
                <span className="font-bold text-sm text-[#d97706]">03.</span>
                <span className="text-stone-600 font-medium">Rigging & Beleuchtung</span>
              </div>

              <h3 className="mt-3 text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Lichtkonzept
              </h3>

              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                Vorausschauende Integration der Beleuchtung direkt im CAD-Modell.
              </p>

              <div className="mt-3.5 pt-3.5 border-t border-stone-200/80">
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Lichtachsen & Traversen</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Hängepunkte & Lastgrenzen</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Unsichtbare Kabelwege</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="p-0.5 bg-[#2e7d47]/12 text-[#2e7d47] rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Gewerke-Koordination</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Project Filter & Controls Toolbar - Hell, modern & harmonisch */}
        <div className="mt-8 p-2.5 bg-white rounded-xl border border-stone-200 text-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          {/* Project Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedProjectFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedProjectFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 border border-stone-200'
              }`}
            >
              Alle Projekte ({plans.length})
            </button>
            {availableProjects.map((pName) => {
              const count = plans.filter((p) => p.projectName === pName).length;
              const isActive = selectedProjectFilter === pName;
              return (
                <button
                  key={pName}
                  onClick={() => setSelectedProjectFilter(pName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 border border-stone-200'
                  }`}
                >
                  {pName} ({count})
                </button>
              );
            })}
          </div>

          {/* Subcategory & Sort */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Category filter */}
            <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategoryFilter === 'all' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Alle Formate
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('visualisierung')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategoryFilter === 'visualisierung' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3D-Renders
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('zeichnung')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategoryFilter === 'zeichnung' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                CAD / PDF
              </button>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'project' ? 'title' : 'project')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg border border-stone-200 shadow-2xs transition-colors cursor-pointer"
              title="Sortierung umschalten"
            >
              <ArrowUpDown className="w-3 h-3 text-stone-500" />
              <span>{sortBy === 'project' ? 'Projekt' : 'Titel'}</span>
            </button>

            {/* Horizontal Scroll Chevrons */}
            <div className="flex items-center gap-1 pl-1 border-l border-stone-200">
              <button
                onClick={scrollLeft}
                className="p-1.5 bg-white hover:bg-stone-50 text-stone-700 rounded-lg border border-stone-200 shadow-2xs transition-colors cursor-pointer"
                title="Nach links scrollen"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="p-1.5 bg-white hover:bg-stone-50 text-stone-700 rounded-lg border border-stone-200 shadow-2xs transition-colors cursor-pointer"
                title="Nach rechts scrollen"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Row Horizontal Scrollable Gallery Container (Hell, Weiß, gleiche Höhe, entsprechend breit) */}
        <div className="relative mt-4 p-2 sm:p-2.5 bg-stone-100/80 rounded-2xl border border-stone-200/90 shadow-inner">
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'thin' }}
          >
            {planColumns.length === 0 ? (
              <div className="w-full py-16 text-center text-stone-500 bg-white rounded-xl border border-dashed border-stone-300">
                <FileText className="w-10 h-10 mx-auto text-stone-400 mb-2" />
                <p className="text-sm font-semibold">Keine Pläne für die ausgewählten Filter gefunden.</p>
                <button
                  onClick={() => {
                    setSelectedProjectFilter('all');
                    setSelectedCategoryFilter('all');
                  }}
                  className="mt-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Filter zurücksetzen
                </button>
              </div>
            ) : (
              planColumns.map((column, colIdx) => (
                <div
                  key={`col-${colIdx}`}
                  className={`flex flex-col gap-2 sm:gap-2.5 shrink-0 ${getPlanColumnWidthClass(column)} snap-start`}
                >
                  {column.map((item) => {
                    const isPdf = item.fileType === 'pdf' || item.sourceUrl?.startsWith('data:application/pdf') || item.sourceUrl?.endsWith('.pdf');
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPlan(item)}
                        className={`group relative ${((item.rotation || 0) % 180 !== 0) ? 'aspect-[3/4]' : 'aspect-[3/2]'} w-full bg-stone-900 rounded-xl border border-stone-200/90 hover:border-amber-500 transition-all cursor-pointer select-none overflow-hidden shadow-xs hover:shadow-md`}
                      >
                        {/* Plan Visual / SVG / PDF Preview */}
                        <div className="w-full h-full relative overflow-hidden bg-stone-900">
                          {renderPlanGraphic(item)}
                        </div>

                        {/* Top Badges & Controls Overlay */}
                        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1 pointer-events-none">
                          {/* Project Tag Top Left */}
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="px-2 py-0.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono rounded-md border border-white/10 shadow-xs truncate">
                              {item.projectName}
                            </span>
                            {item.isCustom && (
                              <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-mono rounded-md font-bold shadow-xs shrink-0">
                                Upload
                              </span>
                            )}
                          </div>

                          {/* Format Badge & Quick Rotate / Edit Buttons Top Right */}
                          <div className="flex items-center gap-1 shrink-0 pointer-events-auto">
                            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md shadow-xs border ${
                              isPdf
                                ? 'bg-red-950/80 text-red-200 border-red-500/30 backdrop-blur-md'
                                : item.category === 'visualisierung'
                                ? 'bg-amber-950/80 text-amber-200 border-amber-500/30 backdrop-blur-md'
                                : 'bg-sky-950/80 text-sky-200 border-sky-500/30 backdrop-blur-md'
                            }`}>
                              {item.format}
                            </span>

                            {/* Quick rotate button */}
                            {item.sourceUrl && !isPdf && (
                              <button
                                onClick={(e) => handleRotatePlan(item.id, e)}
                                className="p-1.5 bg-black/75 hover:bg-black/95 text-white hover:text-amber-400 rounded-md border border-white/20 shadow-xs transition-colors cursor-pointer backdrop-blur-md"
                                title="Plan um 90° drehen"
                              >
                                <RotateCw className="w-3 h-3" />
                              </button>
                            )}

                            {/* Only show edit/delete controls in Admin Mode */}
                            {isAdminMode && (
                              <>
                                <button
                                  onClick={(e) => handleStartEditPlan(item, e)}
                                  className="p-1.5 bg-black/75 hover:bg-amber-500 text-white rounded-md border border-white/20 shadow-xs transition-colors cursor-pointer backdrop-blur-md"
                                  title="Plan & Bild bearbeiten"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeletePlan(item.id, e)}
                                  className="p-1.5 bg-black/75 hover:bg-red-600 text-white rounded-md border border-white/20 shadow-xs transition-colors cursor-pointer backdrop-blur-md"
                                  title="Plan entfernen"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* BOTTOM OVERLAY: Direkt im Plan drübergelegt, kein Extra-Feld */}
                        <div className="absolute inset-x-0 bottom-0 z-10 pt-10 pb-2.5 px-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex items-end justify-between gap-2 pointer-events-none">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-white drop-shadow-sm truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-300 truncate mt-0.5">
                              <span className="truncate">{item.projectName}</span>
                              <span className="text-stone-400">·</span>
                              <span className="text-amber-300 font-medium shrink-0">{item.format}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
                            {onSelectPlanForInquiry && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectPlanForInquiry(`${item.projectName} - ${item.title}`);
                                }}
                                className="px-2 py-0.5 bg-white/20 hover:bg-white text-white hover:text-stone-900 backdrop-blur-xs text-[10px] font-mono rounded-md transition-colors cursor-pointer border border-white/20"
                              >
                                Anfragen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Detail Modal */}
      {/* Lightbox / Detail Modal with Arrow Navigation & Rotation */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          
          {/* Previous Arrow Button (Floating Left) */}
          {filteredPlans.length > 1 && (
            <button
              onClick={handlePrevPlan}
              className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-60 p-2 sm:p-3 bg-white/95 hover:bg-white text-stone-900 rounded-full shadow-2xl border border-stone-200 hover:scale-110 transition-all cursor-pointer focus:outline-hidden"
              title="Vorheriger Plan (Pfeiltaste links)"
              aria-label="Vorheriger Plan"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Next Arrow Button (Floating Right) */}
          {filteredPlans.length > 1 && (
            <button
              onClick={handleNextPlan}
              className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-60 p-2 sm:p-3 bg-white/95 hover:bg-white text-stone-900 rounded-full shadow-2xl border border-stone-200 hover:scale-110 transition-all cursor-pointer focus:outline-hidden"
              title="Nächster Plan (Pfeiltaste rechts oder Bild anklicken)"
              aria-label="Nächster Plan"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[94vh] overflow-y-auto flex flex-col relative z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="px-2.5 py-1 bg-stone-900 text-white text-xs font-mono font-medium rounded">
                  {selectedPlan.projectName}
                </span>
                <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                  selectedPlan.fileType === 'pdf' || selectedPlan.sourceUrl?.startsWith('data:application/pdf')
                    ? 'bg-red-600 text-white'
                    : selectedPlan.category === 'visualisierung'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-sky-600 text-white'
                }`}>
                  {selectedPlan.format}
                </span>
                {filteredPlans.length > 1 && currentPlanIndex !== -1 && (
                  <span className="text-xs font-mono text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
                    Plan {currentPlanIndex + 1} von {filteredPlans.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* 90° Rotate Button inside Lightbox Header for images */}
                {selectedPlan.sourceUrl && !selectedPlan.sourceUrl.startsWith('data:application/pdf') && selectedPlan.fileType !== 'pdf' && (
                  <button
                    onClick={() => handleRotatePlan(selectedPlan.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    title="Plan 90° im Uhrzeigersinn drehen"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-stone-700" />
                    <span className="hidden sm:inline">Drehen</span>
                    {selectedPlan.rotation ? <span className="font-mono text-[10px]">({selectedPlan.rotation}°)</span> : null}
                  </button>
                )}

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Schließen (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Preview */}
            <div
              onClick={() => {
                const isPdf = selectedPlan.fileType === 'pdf' || selectedPlan.sourceUrl?.startsWith('data:application/pdf') || selectedPlan.sourceUrl?.endsWith('.pdf');
                if (!isPdf) handleNextPlan();
              }}
              className={`p-4 sm:p-6 bg-stone-100 flex items-center justify-center overflow-hidden min-h-[340px] relative group select-none ${
                selectedPlan.fileType !== 'pdf' && !selectedPlan.sourceUrl?.startsWith('data:application/pdf') ? 'cursor-pointer' : ''
              }`}
              title={selectedPlan.fileType !== 'pdf' ? 'Klicken für nächsten Plan' : undefined}
            >
              {selectedPlan.fileType === 'pdf' || selectedPlan.sourceUrl?.startsWith('data:application/pdf') || selectedPlan.sourceUrl?.endsWith('.pdf') ? (
                <div className="w-full flex flex-col items-center">
                  <iframe
                    src={selectedPlan.sourceUrl}
                    title={selectedPlan.title}
                    className="w-full h-[540px] rounded-xl border border-stone-300 shadow-md bg-white"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    {selectedPlan.sourceUrl && (
                      <a
                        href={selectedPlan.sourceUrl}
                        download={selectedPlan.fileName || `${selectedPlan.title}.pdf`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF herunterladen ({selectedPlan.fileSize || 'Dokument'})</span>
                      </a>
                    )}
                    {selectedPlan.sourceUrl && (
                      <a
                        href={selectedPlan.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>In neuem Tab öffnen</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : selectedPlan.sourceUrl ? (
                <img
                  src={selectedPlan.sourceUrl}
                  alt={selectedPlan.title}
                  className="rounded-xl shadow-lg object-contain transition-all duration-300"
                  style={{
                    transform: selectedPlan.rotation ? `rotate(${selectedPlan.rotation}deg)` : undefined,
                    maxHeight: ((selectedPlan.rotation || 0) % 180 !== 0) ? 'min(75vw, 650px)' : 'min(560px, 70vh)',
                    maxWidth: ((selectedPlan.rotation || 0) % 180 !== 0) ? 'min(560px, 70vh)' : 'min(100%, 900px)',
                  }}
                />
              ) : (
                <div className="w-full max-w-xl h-80 rounded-xl overflow-hidden shadow-lg border border-stone-300">
                  {renderPlanGraphic(selectedPlan)}
                </div>
              )}

              {/* Click-to-advance hint on hover for images */}
              {filteredPlans.length > 1 && selectedPlan.fileType !== 'pdf' && !selectedPlan.sourceUrl?.startsWith('data:application/pdf') && (
                <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5 shadow-md">
                  <span>Klicken für nächsten Plan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Plan Details & Actions */}
            <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-stone-200">
              <div className="max-w-xl">
                <h3 className="text-lg font-bold text-stone-950">{selectedPlan.title}</h3>
                <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                  {selectedPlan.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-500 font-mono">
                  <span>Projekt: <strong>{selectedPlan.projectName}</strong></span>
                  <span>Kategorie: <strong>{selectedPlan.category === 'visualisierung' ? 'Visualisierung' : 'Technische Zeichnung'}</strong></span>
                  {selectedPlan.fileName && <span>Datei: <strong>{selectedPlan.fileName}</strong></span>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                {/* Admin Mode Edit Button inside Lightbox */}
                {isAdminMode && (
                  <button
                    onClick={() => {
                      handleStartEditPlan(selectedPlan);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Plan / Datei bearbeiten</span>
                  </button>
                )}

                {onSelectPlanForInquiry && (
                  <button
                    onClick={() => {
                      onSelectPlanForInquiry(`${selectedPlan.projectName} - ${selectedPlan.title}`);
                      setSelectedPlan(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    Dieses Konzept anfragen
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal (Allows replacing the plan image/PDF & modifying titles/descriptions) */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-600 text-white rounded-lg">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-950">Plan bearbeiten & Datei austauschen</h3>
                  <p className="text-xs text-stone-500">Titel, Beschreibung oder Bild/PDF anpassen</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* File Swap Zone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Plan-Datei / Bild austauschen
                </label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="application/pdf,.pdf,image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleEditFileSelect}
                  className="hidden"
                />

                {editFilePreview ? (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      {editIsPdf ? (
                        <div className="p-2.5 bg-red-100 text-red-600 rounded-lg shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      ) : (
                        <img
                          src={editFilePreview}
                          alt="Vorschau"
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0 transition-transform duration-300"
                          style={{ transform: editRotation ? `rotate(${editRotation}deg)` : undefined }}
                        />
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          {editFileName || 'Eigene Datei hinterlegt'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {editIsPdf ? 'PDF-Dokument' : 'Bild'} {editFileSize ? `// ${editFileSize}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title="Andere Datei wählen"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Ersetzen</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditFilePreview(null);
                          setEditIsPdf(false);
                          setEditFileName('');
                          setEditFileSize('');
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                        title="Benutzerdefinierte Datei entfernen (zurück zur CAD-Vektorgrafik)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center p-5 border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl bg-stone-50/50 hover:bg-amber-50/20 transition-all cursor-pointer group"
                  >
                    <div className="p-2.5 bg-white rounded-full shadow-2xs group-hover:scale-110 transition-transform mb-2">
                      <Upload className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      Neues Bild oder PDF hochladen (Datei ersetzen)
                    </span>
                    <span className="text-[11px] text-stone-500 mt-0.5">
                      Unterstützt echte Fotos, CAD-Exporte, Renders & PDF-Pläne
                    </span>
                  </button>
                )}
              </div>

              {/* Rotation for image plans */}
              {editFilePreview && !editIsPdf && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Ausrichtung / Drehung
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditRotation((prev) => (prev + 90) % 360)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors cursor-pointer flex-1"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-stone-600" />
                      <span>90° drehen ({editRotation}°)</span>
                    </button>
                    {editRotation !== 0 && (
                      <button
                        type="button"
                        onClick={() => setEditRotation(0)}
                        className="px-2.5 py-2 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer"
                      >
                        Zurücksetzen
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Titel / Beschriftung *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="z.B. 3D-Visualisierung Festivalbühne 150 m²"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Projekt / Festival *
                </label>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  placeholder="z.B. Firle Fanz Festival 2026"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              {/* Category & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Kategorie
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                  >
                    <option value="visualisierung">Visualisierung (3D)</option>
                    <option value="zeichnung">Technische Zeichnung / PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Format-Bezeichnung
                  </label>
                  <input
                    type="text"
                    value={editFormat}
                    onChange={(e) => setEditFormat(e.target.value)}
                    placeholder="z.B. 3D-Modell, Statik-Plan, CAD-Schnitt"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Beschreibung / Notizen
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Ergänzende Angaben zu Maßen, Statik, Materialien, DMX oder Aufbau..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => handleDeletePlan(editingPlan.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Plan löschen</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSavePlanEdit}
                  disabled={!editTitle.trim()}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Änderungen speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (Add new plan/PDF) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-900 text-white rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-950">Plan oder PDF hochladen</h3>
                  <p className="text-xs text-stone-500">3D-Visualisierung, Statikbericht oder CAD-Schnitt</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* File selector zone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Datei auswählen (PDF oder Bild) *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf,image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {uploadFilePreview ? (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      {uploadIsPdf ? (
                        <div className="p-2.5 bg-red-100 text-red-600 rounded-lg shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      ) : (
                        <img
                          src={uploadFilePreview}
                          alt="Vorschau"
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          {uploadFileName}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {uploadIsPdf ? 'PDF-Dokument' : 'Bild'} // {uploadFileSize}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadFilePreview(null);
                        setUploadIsPdf(false);
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                      title="Datei entfernen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl bg-stone-50/50 hover:bg-amber-50/20 transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-white rounded-full shadow-2xs group-hover:scale-110 transition-transform mb-2">
                      <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      PDF-Datei oder Bild auswählen
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1">
                      Unterstützt PDF (z.B. Statikberichte, CAD-Pläne) sowie PNG, JPG, WebP
                    </span>
                  </button>
                )}
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Projekt / Festival *
                </label>
                <input
                  type="text"
                  value={uploadProjectName}
                  onChange={(e) => setUploadProjectName(e.target.value)}
                  placeholder="z.B. Firle Fanz Festival 2026 oder Waldklang"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Titel des Plans *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="z.B. Bühnenstatik & Tragwerksbericht oder 3D-Bühnenschnitt"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              {/* Category & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Kategorie
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                  >
                    <option value="visualisierung">Visualisierung (3D)</option>
                    <option value="zeichnung">Technische Zeichnung / PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Format-Bezeichnung
                  </label>
                  <select
                    value={uploadFormat}
                    onChange={(e) => setUploadFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                  >
                    <option value="Statik-Plan">Statik-Plan (PDF / CAD)</option>
                    <option value="3D-Modell">3D-Modell / Render</option>
                    <option value="CAD-Schnitt">CAD-Schnitt</option>
                    <option value="Rasterplan">Rasterplan / Podest</option>
                    <option value="Lichtkonzept">Lichtkonzept / Rigging</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Beschreibung (optional)
                </label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Ergänzende Notizen zu Maßen, Statik, Materialien oder Rigging-Punkten..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveUpload}
                disabled={!uploadTitle.trim() || !uploadFilePreview}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Plan speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
