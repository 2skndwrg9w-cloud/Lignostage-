import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FolderPlus,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Edit2,
  Play,
  Film,
  ChevronLeft,
  ChevronRight,
  Star,
  Maximize2,
  X,
  ArrowUpDown,
  Layers,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Eye,
  Check,
  RotateCw,
} from 'lucide-react';
import { ProjectPhoto, ProjectVideo } from '../types';
import { ProjectGraphic } from './ProjectGraphic';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/firebaseAuth';
import {
  fetchLignostageMediaFromDrive,
  loadDriveImageBlob,
} from '../services/googleDriveService';
import { initialVideo } from '../data/companyData';
import { User } from 'firebase/auth';

interface ProjectsSectionProps {
  projects: ProjectPhoto[];
  onUpdateProjects: (projects: ProjectPhoto[]) => void;
  onSelectProjectForContact?: (projectTitle: string) => void;
  heroBackgroundTitle?: string;
  onSetHeroBackground?: (url: string, title: string) => void;
  isAdminMode?: boolean;
}

type MediaItem = 
  | { type: 'video'; data: ProjectVideo }
  | { type: 'photo'; data: ProjectPhoto };

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onUpdateProjects,
  onSelectProjectForContact,
  heroBackgroundTitle,
  onSetHeroBackground,
  isAdminMode = false,
}) => {
  // Project & Category Filters
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'buehne' | 'stage-design'>('all');
  const [sortBy, setSortBy] = useState<'project' | 'newest'>('project');

  // Format Switcher: Hochformat vs Querformat vs Quadrat
  const [aspectMode, setAspectMode] = useState<'querformat' | 'hochformat' | 'quadrat' | 'auto'>(() => {
    try {
      const stored = localStorage.getItem('lignostage_gallery_aspect_mode');
      if (stored === 'hochformat' || stored === 'querformat' || stored === 'quadrat' || stored === 'auto') {
        return stored;
      }
    } catch (e) {
      // fallback
    }
    return 'querformat';
  });

  const [fitMode, setFitMode] = useState<'cover' | 'contain'>(() => {
    try {
      const stored = localStorage.getItem('lignostage_gallery_fit_mode');
      if (stored === 'contain' || stored === 'cover') return stored;
    } catch (e) {
      // fallback
    }
    return 'cover';
  });

  // Upload state
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'buehne' | 'stage-design'>('buehne');
  const [uploadProjectName, setUploadProjectName] = useState('Firle Fanz Festival 2026');
  const [customTitle, setCustomTitle] = useState('photo_2026-09-22 09.08.32');
  const [uploadSizeVariant, setUploadSizeVariant] = useState<'large' | 'medium' | 'compact'>('large');
  const [uploadOrientation, setUploadOrientation] = useState<'querformat' | 'hochformat' | 'quadrat'>('querformat');

  // Lightbox modal state
  const [lightboxPhoto, setLightboxPhoto] = useState<ProjectPhoto | null>(null);

  // Editing single photo state
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProjectName, setEditProjectName] = useState('Firle Fanz Festival 2026');
  const [editCategory, setEditCategory] = useState<'buehne' | 'stage-design'>('buehne');
  const [editOrientation, setEditOrientation] = useState<'querformat' | 'hochformat' | 'quadrat'>('querformat');
  const [editRotation, setEditRotation] = useState<number>(0);
  const [editSourceUrl, setEditSourceUrl] = useState<string | null>(null);
  const editPhotoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Video state
  const [activeVideo, setActiveVideo] = useState<ProjectVideo>(() => {
    try {
      const saved = localStorage.getItem('lignostage_active_video');
      if (saved) {
        const parsed = JSON.parse(saved);
        const pName =
          parsed.projectName &&
          parsed.projectName !== 'Festival-Aufbau' &&
          parsed.projectName !== 'Festival vor Ort'
            ? parsed.projectName
            : 'Firle Fanz Festival 2026';
        return {
          id: parsed.id || 'lignostage-intro-video',
          projectName: pName,
          category: parsed.category === 'stage-design' ? 'stage-design' : 'buehne',
          title: parsed.title || 'Holzbühnenbau & Festival-Aufbau vor Ort',
          description: parsed.description || '',
          sourceUrl: parsed.sourceUrl,
          driveViewUrl: parsed.driveViewUrl,
        };
      }
    } catch (e) {
      // fallback
    }
    return initialVideo;
  });

  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [videoEditFestival, setVideoEditFestival] = useState('');
  const [videoEditCategory, setVideoEditCategory] = useState<'buehne' | 'stage-design'>('buehne');
  const [videoEditTitle, setVideoEditTitle] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isPlayingInlineVideo, setIsPlayingInlineVideo] = useState(false);

  // Google Drive & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);
  const [enhancedQuality, setEnhancedQuality] = useState(true);

  // Scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Save format preference to localStorage
  const handleSetAspectMode = (mode: 'querformat' | 'hochformat' | 'quadrat' | 'auto') => {
    setAspectMode(mode);
    try {
      localStorage.setItem('lignostage_gallery_aspect_mode', mode);
    } catch (e) {}
  };

  const handleSetFitMode = (mode: 'cover' | 'contain') => {
    setFitMode(mode);
    try {
      localStorage.setItem('lignostage_gallery_fit_mode', mode);
    } catch (e) {}
  };

  // Auto clean-up fictional placeholder IDs (p1-, p2-, p3-)
  useEffect(() => {
    const hasDummyProjects = projects.some((p) => p.id.startsWith('p1-') || p.id.startsWith('p2-') || p.id.startsWith('p3-'));
    if (hasDummyProjects) {
      const cleaned = projects.filter((p) => !(p.id.startsWith('p1-') || p.id.startsWith('p2-') || p.id.startsWith('p3-')));
      onUpdateProjects(cleaned);
    }
  }, [projects]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        syncFromDrive(token);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setDriveStatus('Google-Anmeldung wird gestartet...');
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        await syncFromDrive(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setDriveStatus('Anmeldung abgebrochen oder fehlgeschlagen.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setDriveStatus(null);
  };

  const syncFromDrive = async (token?: string) => {
    const accessToken = token || (await getAccessToken());
    if (!accessToken) {
      setDriveStatus('Bitte zuerst mit Google anmelden.');
      return;
    }

    setIsSyncingDrive(true);
    setDriveStatus('Suche Ordner «Lignostage» in Ihrem Google Drive...');

    try {
      const result = await fetchLignostageMediaFromDrive(accessToken);

      if (result.videos.length > 0) {
        const firstVideo = result.videos[0];
        const isDesign = firstVideo.name.toLowerCase().includes('design') || firstVideo.name.toLowerCase().includes('plan');
        const updatedVid: ProjectVideo = {
          id: firstVideo.id,
          projectName: 'Firle Fanz Festival 2026',
          category: isDesign ? 'stage-design' : 'buehne',
          title: firstVideo.name.replace(/\.[^/.]+$/, ''),
          description: 'Originalvideo aus Ihrem Google Drive Ordner Lignostage',
          driveViewUrl: `https://drive.google.com/file/d/${firstVideo.id}/preview`,
        };
        setActiveVideo(updatedVid);
        localStorage.setItem('lignostage_active_video', JSON.stringify(updatedVid));
      }

      if (result.photos.length === 0 && result.videos.length === 0) {
        setDriveStatus(
          `Ordner «${result.folderName}» durchsucht. Noch keine Bild-/Videodateien gefunden.`
        );
      } else {
        setDriveStatus(
          `${result.photos.length} Fotos und ${result.videos.length} Videos aus Ordner «${result.folderName}» geladen.`
        );

        const newDrivePhotos: ProjectPhoto[] = [];
        for (const photo of result.photos) {
          try {
            const blobUrl = await loadDriveImageBlob(photo.id, accessToken);
            const isStageDesign = photo.name.toLowerCase().includes('design') || photo.name.toLowerCase().includes('plan');
            const cleanName = photo.name.replace(/\.[^/.]+$/, '');
            const isTargetHeroPhoto = cleanName.includes('photo_2026-09-22') || cleanName.includes('09.08.32');
            const isLarge = isTargetHeroPhoto || (photo.size && parseInt(photo.size) > 1500000);

            const newPhoto: ProjectPhoto = {
              id: `drive-${photo.id}`,
              projectId: isStageDesign ? 'projekt-stage-design' : 'projekt-holzbuehne',
              projectName: 'Firle Fanz Festival 2026',
              title: cleanName,
              fileName: photo.name,
              category: isStageDesign ? 'stage-design' : 'buehne',
              description: '',
              sourceUrl: blobUrl,
              isCustom: true,
              qualityTier: isLarge ? 'hd' : 'standard',
              sizeVariant: isLarge ? 'large' : 'medium',
              orientation: 'querformat',
              isHeroBackground: isTargetHeroPhoto,
            };

            newDrivePhotos.push(newPhoto);

            if (isTargetHeroPhoto && onSetHeroBackground) {
              onSetHeroBackground(blobUrl, cleanName);
            }
          } catch (e) {
            console.error('Konnte Bild nicht als Blob laden:', e);
          }
        }

        if (newDrivePhotos.length > 0) {
          const combined = [...newDrivePhotos, ...projects.filter((p) => !p.id.startsWith('drive-'))];
          onUpdateProjects(combined);
        }
      }
    } catch (err: any) {
      console.error(err);
      setDriveStatus(`Fehler beim Synchronisieren: ${err.message}`);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const photoTitle = customTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
        const isTargetHero = photoTitle.includes('photo_2026-09-22') || photoTitle.includes('09.08.32');

        const newPhoto: ProjectPhoto = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          projectId: `proj-${Date.now()}`,
          projectName: uploadProjectName.trim() || 'Firle Fanz Festival 2026',
          title: photoTitle,
          fileName: file.name,
          category: uploadCategory,
          description: '',
          sourceUrl: url,
          isCustom: true,
          qualityTier: uploadSizeVariant === 'large' || isTargetHero ? 'hd' : 'standard',
          sizeVariant: uploadSizeVariant,
          orientation: uploadOrientation,
          isHeroBackground: isTargetHero,
        };

        const updated = [newPhoto, ...projects];
        onUpdateProjects(updated);

        if ((isTargetHero || uploadSizeVariant === 'large') && onSetHeroBackground) {
          onSetHeroBackground(url, photoTitle);
        }

        setShowUploadZone(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Local video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoBlobUrl = URL.createObjectURL(file);
      setCustomVideoUrl(videoBlobUrl);
      const updatedVid: ProjectVideo = {
        id: `local-vid-${Date.now()}`,
        projectName: uploadProjectName.trim() || 'Firle Fanz Festival 2026',
        category: activeVideo.category || 'buehne',
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: 'Direkt hochgeladenes Video vor Ort',
        sourceUrl: videoBlobUrl,
      };
      setActiveVideo(updatedVid);
      localStorage.setItem('lignostage_active_video', JSON.stringify(updatedVid));
      setIsPlayingInlineVideo(true);
    }
  };

  // Video label editing
  const handleStartEditVideo = () => {
    setIsEditingVideo(true);
    setVideoEditFestival(activeVideo.projectName ?? 'Firle Fanz Festival 2026');
    setVideoEditCategory(activeVideo.category ?? 'buehne');
    setVideoEditTitle(activeVideo.title ?? '');
  };

  const handleSaveVideoEdit = () => {
    const updated: ProjectVideo = {
      ...activeVideo,
      projectName: videoEditFestival.trim() || 'Firle Fanz Festival 2026',
      category: videoEditCategory,
      title: videoEditTitle.trim() || activeVideo.title,
    };
    setActiveVideo(updated);
    localStorage.setItem('lignostage_active_video', JSON.stringify(updated));
    setIsEditingVideo(false);
  };

  // Photo label and image editing
  const handleStartEdit = (photo: ProjectPhoto) => {
    setEditingPhotoId(photo.id);
    setEditTitle(photo.title ?? '');
    setEditProjectName(photo.projectName ?? 'Firle Fanz Festival 2026');
    setEditCategory(photo.category === 'stage-design' ? 'stage-design' : 'buehne');
    setEditOrientation(photo.orientation || 'querformat');
    setEditRotation(photo.rotation || 0);
    setEditSourceUrl(photo.sourceUrl || null);
  };

  const handleRotatePhoto = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = projects.map((p) => {
      if (p.id === photoId) {
        const nextRot = (((p.rotation || 0) + 90) % 360);
        const currentEff = getPhotoEffectiveOrientation(p);
        const nextOrientation: 'hochformat' | 'querformat' =
          currentEff === 'hochformat' ? 'querformat' : 'hochformat';
        return { ...p, rotation: nextRot, orientation: nextOrientation };
      }
      return p;
    });
    onUpdateProjects(updated);
    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto((prev) => {
        if (!prev) return null;
        const nextRot = (((prev.rotation || 0) + 90) % 360);
        const currentEff = getPhotoEffectiveOrientation(prev);
        const nextOrientation: 'hochformat' | 'querformat' =
          currentEff === 'hochformat' ? 'querformat' : 'hochformat';
        return { ...prev, rotation: nextRot, orientation: nextOrientation };
      });
    }
  };

  const handleEditPhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditSourceUrl(event.target?.result as string);
        if (!editTitle) {
          setEditTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (photoId: string) => {
    const updated = projects.map((p) => {
      if (p.id === photoId) {
        return {
          ...p,
          title: editTitle.trim() || p.title,
          projectName: editProjectName.trim() || p.projectName,
          category: editCategory,
          orientation: editOrientation,
          rotation: editRotation,
          sourceUrl: editSourceUrl || p.sourceUrl,
          isCustom: true,
        };
      }
      return p;
    });
    onUpdateProjects(updated);
    setEditingPhotoId(null);
  };

  const handleRemovePhoto = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    onUpdateProjects(updated);
  };

  const handleSetAsHero = (photo: ProjectPhoto) => {
    if (photo.sourceUrl && onSetHeroBackground) {
      onSetHeroBackground(photo.sourceUrl, photo.title);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = aspectMode === 'hochformat' ? -260 : -450;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = aspectMode === 'hochformat' ? 260 : 450;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Dynamic projects list
  const availableProjects = Array.from(
    new Set([
      ...(activeVideo.projectName ? [activeVideo.projectName] : []),
      ...projects.map((p) => p.projectName).filter(Boolean),
    ])
  );

  // Build unified media items list
  const videoMatchesFilter =
    (selectedProjectFilter === 'all' || activeVideo.projectName === selectedProjectFilter) &&
    (selectedCategoryFilter === 'all' || activeVideo.category === selectedCategoryFilter);

  const filteredPhotos = projects.filter((p) => {
    if (selectedProjectFilter !== 'all' && p.projectName !== selectedProjectFilter) return false;
    if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
    return true;
  });

  // Sorting
  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    if (sortBy === 'project') {
      const projA = a.projectName || '';
      const projB = b.projectName || '';
      if (projA !== projB) return projA.localeCompare(projB);
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Combine video and photos into a coherent media array
  const allMediaItems: MediaItem[] = [];
  if (videoMatchesFilter) {
    allMediaItems.push({ type: 'video', data: activeVideo });
  }
  sortedPhotos.forEach((photo) => {
    allMediaItems.push({ type: 'photo', data: photo });
  });

  // Construct 2-row horizontal pairs: [ [item0, item1], [item2, item3], ... ]
  const mediaColumns: MediaItem[][] = [];
  for (let i = 0; i < allMediaItems.length; i += 2) {
    mediaColumns.push(allMediaItems.slice(i, i + 2));
  }

  // Lightbox arrow navigation & auto-advance
  const currentPhotoIndex = lightboxPhoto
    ? sortedPhotos.findIndex((p) => p.id === lightboxPhoto.id)
    : -1;

  const handlePrevLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sortedPhotos.length === 0) return;
    const prevIdx =
      currentPhotoIndex <= 0 ? sortedPhotos.length - 1 : currentPhotoIndex - 1;
    setLightboxPhoto(sortedPhotos[prevIdx]);
  };

  const handleNextLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sortedPhotos.length === 0) return;
    const nextIdx =
      currentPhotoIndex === -1 || currentPhotoIndex >= sortedPhotos.length - 1
        ? 0
        : currentPhotoIndex + 1;
    setLightboxPhoto(sortedPhotos[nextIdx]);
  };

  useEffect(() => {
    if (!lightboxPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevLightbox();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto, sortedPhotos, currentPhotoIndex]);

  // Determines effective orientation taking into account rotation (90°/270° flips orientation)
  const getPhotoEffectiveOrientation = (photo: ProjectPhoto): 'hochformat' | 'querformat' | 'quadrat' => {
    if (photo.orientation === 'quadrat') return 'quadrat';
    const base: 'hochformat' | 'querformat' =
      photo.orientation === 'hochformat' || (aspectMode === 'hochformat' && !photo.orientation)
        ? 'hochformat'
        : 'querformat';
    const isFlipped = ((photo.rotation || 0) % 180 !== 0);
    if (!isFlipped) return base;
    return base === 'hochformat' ? 'querformat' : 'hochformat';
  };

  // Helper to determine aspect ratio class per image/mode
  const getImageAspectClass = (photo?: ProjectPhoto) => {
    if (!photo) {
      if (aspectMode === 'hochformat') return 'aspect-[3/4]';
      if (aspectMode === 'quadrat') return 'aspect-square';
      return 'aspect-[3/2]';
    }
    const effective = getPhotoEffectiveOrientation(photo);
    if (effective === 'hochformat') return 'aspect-[3/4]';
    if (effective === 'quadrat') return 'aspect-square';
    return 'aspect-[3/2]';
  };

  // Helper to compute precise transform & dimensions for rotated images without clipping or corner shifting
  const getImageTransformStyle = (
    photo: ProjectPhoto,
    enhanced: boolean = false
  ): React.CSSProperties => {
    const normRot = (((photo.rotation || 0) % 360) + 360) % 360;
    const isFlipped = normRot === 90 || normRot === 270;
    const effective = getPhotoEffectiveOrientation(photo);

    const baseStyle: React.CSSProperties = {
      imageRendering: enhanced ? '-webkit-optimize-contrast' : 'auto',
      filter: enhanced ? 'contrast(106%) saturate(104%)' : 'none',
    };

    if (!isFlipped) {
      return {
        ...baseStyle,
        width: '100%',
        height: '100%',
        transform: normRot !== 0 ? `rotate(${normRot}deg)` : undefined,
      };
    }

    // When rotated 90° or 270°, the card has effective aspect ratio (e.g. hochformat 3:4 or querformat 3:2).
    // To ensure the rotated element completely fills the frame without any gap or displacement:
    let widthPercent = '100%';
    let heightPercent = '100%';

    if (effective === 'hochformat') {
      // Card is 3:4 (width: W, height: 1.3333 W)
      // Unrotated element needs width = 1.3333 W and height = 0.75 H (= W)
      widthPercent = '133.333%';
      heightPercent = '75%';
    } else if (effective === 'querformat') {
      // Card is 3:2 (width: W, height: 0.6667 W)
      // Unrotated element needs width = 0.6667 W and height = 1.5 H (= W)
      widthPercent = '66.667%';
      heightPercent = '150%';
    } else {
      // 1:1
      widthPercent = '100%';
      heightPercent = '100%';
    }

    return {
      ...baseStyle,
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: widthPercent,
      height: heightPercent,
      transform: `translate(-50%, -50%) rotate(${normRot}deg)`,
    };
  };

  // Hochformat bleibt schlank (3:4); Querformat ist im Verhältnis (3:2) bei gleicher Bildhöhe entsprechend breit.
  // Skaliert dynamisch mit der Ausrichtung und Drehung der Fotos.
  const getColumnWidthClass = (column?: MediaItem[]) => {
    if (column && column.length > 0) {
      const orientations = column.map((item) => {
        if (item.type === 'video') return 'querformat';
        return getPhotoEffectiveOrientation(item.data);
      });
      const hasQuer = orientations.some((o) => o === 'querformat');
      const allHoch = orientations.every((o) => o === 'hochformat');
      const allQuadrat = orientations.every((o) => o === 'quadrat');

      if (hasQuer) {
        return 'w-[320px] sm:w-[380px] md:w-[450px] lg:w-[500px]';
      }
      if (allQuadrat) {
        return 'w-[230px] sm:w-[270px] md:w-[320px] lg:w-[360px]';
      }
      if (allHoch) {
        return 'w-[180px] sm:w-[220px] md:w-[260px] lg:w-[290px]';
      }
    }

    if (aspectMode === 'hochformat') return 'w-[180px] sm:w-[220px] md:w-[260px] lg:w-[290px]';
    if (aspectMode === 'quadrat') return 'w-[230px] sm:w-[270px] md:w-[320px] lg:w-[360px]';
    return 'w-[320px] sm:w-[380px] md:w-[450px] lg:w-[500px]';
  };

  return (
    <section id="projekte" className="py-16 md:py-24 bg-stone-50 text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2 font-mono">
              <span className="w-2.5 h-0.5 bg-emerald-600" />
              <span>Galerie & Vor-Ort-Eindrücke</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight [text-wrap:balance]">
              Echte Holzbühnen & Festival-Projekte
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
              Nach Projekten sortiert und als modernes Doppelzeilen-System seitlich scrollbar. Wählen Sie flexibel zwischen Hoch- und Querformat!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEnhancedQuality(!enhancedQuality)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                enhancedQuality
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs font-semibold'
                  : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title="Optimiert Kantenschärfe und Kontrast der Fotos"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{enhancedQuality ? 'HD-Kontrast: An' : 'HD-Kontrast: Aus'}</span>
            </button>

            {isAdminMode && (
              <>
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncFromDrive()}
                      disabled={isSyncingDrive}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 shadow-2xs transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                      <span>Google Drive sync</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-2.5 py-2 text-xs text-stone-500 hover:text-red-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                      title={`Angemeldet als ${currentUser.email || 'Google-User'}`}
                    >
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg border border-stone-200 shadow-2xs transition-all cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-stone-700" />
                    <span>{isLoggingIn ? 'Verbinde...' : 'Google Drive verbinden'}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowUploadZone(!showUploadZone)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Foto hochladen</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Drive Sync Status Alert */}
        {driveStatus && (
          <div className="mt-4 p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs text-stone-700 shadow-2xs">
            <span className="font-mono">{driveStatus}</span>
            <button
              onClick={() => setDriveStatus(null)}
              className="text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Local Photo Upload Drawer */}
        {showUploadZone && (
          <div className="mt-6 p-6 bg-white rounded-2xl border border-stone-300 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-950 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Neues Festival-Foto manuell hochladen</span>
              </h3>
              <button
                onClick={() => setShowUploadZone(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Festival / Projekt
                </label>
                <input
                  type="text"
                  value={uploadProjectName}
                  onChange={(e) => setUploadProjectName(e.target.value)}
                  placeholder="z.B. Firle Fanz Festival 2026"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Bildtitel / Dateiname
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="photo_2026-09-22 09.08.32"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Bereich
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                >
                  <option value="buehne">Holzbühne (Festival)</option>
                  <option value="stage-design">Stage-Design (Floor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Ausrichtung
                </label>
                <select
                  value={uploadOrientation}
                  onChange={(e) => setUploadOrientation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                >
                  <option value="querformat">Querformat (Standard)</option>
                  <option value="hochformat">Hochformat (Hohe Holzbögen)</option>
                  <option value="quadrat">Quadratisch (1:1)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                Lokal hinzugefügte Bilder bleiben im Browser erhalten.
              </span>
              <label className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap">
                <span>Bilddatei auswählen (JPG, PNG, WebP)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Master Gallery Controls Toolbar - Hell, modern & harmonisch */}
        <div className="mt-8 p-2.5 bg-white rounded-xl border border-stone-200 text-stone-700 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
          
          {/* Zone 1: Project Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedProjectFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedProjectFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 border border-stone-200'
              }`}
            >
              Alle Projekte ({allMediaItems.length})
            </button>
            {availableProjects.map((pName) => {
              const count =
                projects.filter((p) => p.projectName === pName).length +
                (activeVideo.projectName === pName ? 1 : 0);
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

          {/* Zone 2: Format Switcher (Hoch- vs Querformat) & Fitting */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Format Toggle Group */}
            <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
              <span className="text-[10px] font-mono text-stone-400 uppercase px-2 font-bold select-none">
                Format:
              </span>
              <button
                onClick={() => handleSetAspectMode('querformat')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  aspectMode === 'querformat'
                    ? 'bg-white text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Querformat (3:2) - Gleiche Höhe wie Hochformat, entsprechend breiter"
              >
                <RectangleHorizontal className="w-3.5 h-3.5" />
                <span>Quer</span>
              </button>

              <button
                onClick={() => handleSetAspectMode('hochformat')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  aspectMode === 'hochformat'
                    ? 'bg-white text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Hochformat (3:4) - Ideal für hohe Holzbögen & Turmbauten"
              >
                <RectangleVertical className="w-3.5 h-3.5" />
                <span>Hoch</span>
              </button>

              <button
                onClick={() => handleSetAspectMode('quadrat')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  aspectMode === 'quadrat'
                    ? 'bg-white text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Quadratisch (1:1)"
              >
                <Square className="w-3 h-3" />
                <span>1:1</span>
              </button>
            </div>

            {/* Object-Fit Toggle (Cover vs Contain) */}
            <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
              <button
                onClick={() => handleSetFitMode('cover')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  fitMode === 'cover' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Bild zuschneiden und Rahmen vollständig ausfüllen"
              >
                Cover
              </button>
              <button
                onClick={() => handleSetFitMode('contain')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  fitMode === 'contain' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Vollständiges Foto ohne Beschnitt anzeigen"
              >
                Vollbild
              </button>
            </div>

            {/* Sort switcher */}
            <button
              onClick={() => setSortBy(sortBy === 'project' ? 'newest' : 'project')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg border border-stone-200 shadow-2xs transition-colors cursor-pointer"
              title="Sortierung umschalten"
            >
              <ArrowUpDown className="w-3 h-3 text-stone-500" />
              <span>{sortBy === 'project' ? 'Projekt' : 'Neueste'}</span>
            </button>

            {/* Horizontal Chevrons */}
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

        {/* 2-Row Horizontal Scrollable Gallery Container (Hell, Weiß, perfekt abgestimmt) */}
        <div className="relative mt-4 p-2 sm:p-2.5 bg-stone-100/80 rounded-2xl border border-stone-200/90 shadow-inner">
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'thin' }}
          >
            {mediaColumns.length === 0 ? (
              <div className="w-full py-16 text-center text-stone-500 bg-white rounded-xl border border-dashed border-stone-300">
                <Film className="w-10 h-10 mx-auto text-stone-400 mb-2" />
                <p className="text-sm font-semibold">Keine Fotos für die gewählten Filter gefunden.</p>
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
              mediaColumns.map((column, colIdx) => (
                <div
                  key={`media-col-${colIdx}`}
                  className={`flex flex-col gap-2 sm:gap-2.5 shrink-0 ${getColumnWidthClass(column)} snap-start`}
                >
                  {column.map((item, itemIdx) => {
                    if (item.type === 'video') {
                      const vid = item.data;
                      return (
                        <div
                          key={vid.id || `video-${colIdx}-${itemIdx}`}
                          className={`group relative ${getImageAspectClass()} w-full bg-stone-900 rounded-xl border border-stone-200/90 hover:border-emerald-500 transition-all overflow-hidden shadow-xs hover:shadow-md select-none`}
                        >
                          {/* Video Box */}
                          {isPlayingInlineVideo && (vid.sourceUrl || customVideoUrl) ? (
                            <video
                              src={customVideoUrl || vid.sourceUrl}
                              controls
                              autoPlay
                              className="w-full h-full object-cover"
                            />
                          ) : vid.driveViewUrl ? (
                            <iframe
                              src={vid.driveViewUrl}
                              title={vid.title}
                              className="w-full h-full border-0"
                              allow="autoplay"
                            />
                          ) : (
                            <div
                              onClick={() => setIsPlayingInlineVideo(true)}
                              className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-white p-4 cursor-pointer relative"
                            >
                              <div className="p-3.5 bg-emerald-600 rounded-full group-hover:scale-110 transition-transform shadow-lg mb-2">
                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                              </div>
                              <span className="text-xs font-bold tracking-wide">Video abspielen</span>
                              <span className="text-[10px] text-stone-400 font-mono mt-0.5">{vid.projectName}</span>
                            </div>
                          )}

                          {/* Badges Top */}
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 pointer-events-none">
                            <span className="px-2 py-0.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono rounded-md border border-white/10 shadow-xs">
                              {vid.projectName}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono rounded-md font-bold flex items-center gap-0.5 shadow-xs">
                              <Film className="w-2.5 h-2.5" />
                              VIDEO
                            </span>
                          </div>

                          {/* Video Edit Button Top Right (nur im Inhaber-Modus) */}
                          {isAdminMode && (
                            <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                              <button
                                onClick={handleStartEditVideo}
                                className="p-1.5 bg-black/75 hover:bg-black/95 text-white rounded-md border border-white/20 shadow-xs transition-colors cursor-pointer backdrop-blur-md"
                                title="Video-Beschriftung bearbeiten"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <label className="text-white hover:text-emerald-300 cursor-pointer text-[10px] font-mono flex items-center gap-1 shrink-0 px-2.5 py-1 bg-black/75 hover:bg-black/95 rounded-md transition-colors border border-white/20 backdrop-blur-md">
                                <Upload className="w-3 h-3 text-stone-300" />
                                <span>Ersetzen</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm"
                                  onChange={handleVideoUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}

                          {/* Video Overlay Caption: Direkt im Video drübergelegt, kein Extra-Feld */}
                          <div className="absolute inset-x-0 bottom-0 z-10 pt-10 pb-2.5 px-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex items-end justify-between gap-2 pointer-events-none">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-white drop-shadow-sm truncate">
                                {vid.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-300 truncate mt-0.5">
                                <span className="truncate">{vid.projectName}</span>
                                <span className="text-stone-400">·</span>
                                <span className="text-emerald-300 font-medium shrink-0">Montage-Video</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Photo Card
                    const photo = item.data;
                    const isTargetHero =
                      heroBackgroundTitle === photo.title ||
                      photo.isHeroBackground ||
                      photo.title.includes('photo_2026-09-22') ||
                      photo.title.includes('09.08.32');

                    return (
                      <div
                        key={photo.id || `photo-${colIdx}-${itemIdx}`}
                        onClick={() => setLightboxPhoto(photo)}
                        className={`group relative ${getImageAspectClass(photo)} w-full bg-stone-900 rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all select-none cursor-pointer ${
                          isTargetHero
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'border-stone-200/90 hover:border-emerald-500'
                        }`}
                      >
                        {/* Photo Image (Mathematically exact, bug-free scaling & rotation) */}
                        {photo.sourceUrl ? (
                          <img
                            src={photo.sourceUrl}
                            alt={photo.title}
                            className={`transition-all duration-300 group-hover:scale-105 ${
                              fitMode === 'contain' ? 'object-contain p-1' : 'object-cover'
                            }`}
                            style={getImageTransformStyle(photo, enhancedQuality)}
                          />
                        ) : (
                          <ProjectGraphic
                            id={photo.id}
                            category={photo.category}
                            title={photo.title}
                            projectName={photo.projectName}
                            customUrl={photo.sourceUrl}
                          />
                        )}

                        {/* Top Overlay: Badges, Rotate & Edit Controls */}
                        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1 pointer-events-none">
                          {/* Top Left: Project Tag */}
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="px-2 py-0.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono rounded-md border border-white/10 shadow-xs truncate">
                              {photo.projectName}
                            </span>
                            {isTargetHero && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono rounded-md font-bold flex items-center gap-0.5 shadow-xs shrink-0">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                Startseite
                              </span>
                            )}
                          </div>

                          {/* Top Right: Badges & Buttons */}
                          <div className="flex items-center gap-1 shrink-0 pointer-events-auto">
                            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md shadow-xs border ${
                              photo.category === 'stage-design'
                                ? 'bg-amber-950/80 text-amber-200 border-amber-500/30 backdrop-blur-md'
                                : 'bg-emerald-950/80 text-emerald-200 border-emerald-500/30 backdrop-blur-md'
                            }`}>
                              {photo.category === 'stage-design' ? 'Stage' : 'Bühne'}
                            </span>

                            {/* Quick Rotate Button on Card */}
                            <button
                              onClick={(e) => handleRotatePhoto(photo.id, e)}
                              className="p-1.5 bg-black/75 hover:bg-black/95 text-white hover:text-emerald-400 rounded-md border border-white/20 shadow-xs transition-colors cursor-pointer backdrop-blur-md"
                              title="Foto 90° im Uhrzeigersinn drehen"
                            >
                              <RotateCw className="w-3 h-3" />
                            </button>

                            {isAdminMode && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(photo);
                                  }}
                                  className="p-1.5 bg-black/75 hover:bg-amber-500 text-white rounded-md border border-white/20 shadow-xs transition-colors cursor-pointer backdrop-blur-md"
                                  title="Foto bearbeiten"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                {photo.isCustom && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemovePhoto(photo.id);
                                    }}
                                    className="p-1.5 bg-black/75 hover:bg-red-600 text-white rounded-md border border-white/20 shadow-xs transition-colors cursor-pointer backdrop-blur-md"
                                    title="Foto löschen"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* BOTTOM OVERLAY: Direkt im Bild drübergelegt - Kein Extra-Feld mehr */}
                        <div className="absolute inset-x-0 bottom-0 z-10 pt-10 pb-2.5 px-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex items-end justify-between gap-2 pointer-events-none">
                          <div className="min-w-0 flex-1">
                            <h4
                              className="text-xs font-semibold text-white drop-shadow-sm truncate"
                              title={photo.title}
                            >
                              {photo.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-300 truncate mt-0.5">
                              <span className="truncate">{photo.projectName}</span>
                              <span className="text-stone-400">·</span>
                              <span className="text-emerald-300 font-medium shrink-0">
                                {photo.category === 'stage-design' ? 'Stage-Design' : 'Holzbühne'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
                            {isAdminMode && photo.sourceUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetAsHero(photo);
                                }}
                                className={`p-1 rounded text-[10px] transition-colors cursor-pointer ${
                                  isTargetHero
                                    ? 'text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40'
                                    : 'text-stone-300 hover:text-white bg-black/60 hover:bg-black/80 border border-white/10'
                                }`}
                                title="Als Startseiten-Hintergrundbild setzen"
                              >
                                <Star className={`w-3.5 h-3.5 ${isTargetHero ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                              </button>
                            )}

                            {onSelectProjectForContact && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectProjectForContact(`${photo.projectName} - ${photo.title}`);
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

      {/* Lightbox Modal with Arrow Navigation & Rotation */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          
          {/* Previous Arrow Button (Floating Left) */}
          {sortedPhotos.length > 1 && (
            <button
              onClick={handlePrevLightbox}
              className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-60 p-2 sm:p-3 bg-white/95 hover:bg-white text-stone-900 rounded-full shadow-2xl border border-stone-200 hover:scale-110 transition-all cursor-pointer focus:outline-hidden"
              title="Vorheriges Bild (Pfeiltaste links)"
              aria-label="Vorheriges Bild"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Next Arrow Button (Floating Right) */}
          {sortedPhotos.length > 1 && (
            <button
              onClick={handleNextLightbox}
              className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-60 p-2 sm:p-3 bg-white/95 hover:bg-white text-stone-900 rounded-full shadow-2xl border border-stone-200 hover:scale-110 transition-all cursor-pointer focus:outline-hidden"
              title="Nächstes Bild (Pfeiltaste rechts oder Bild anklicken)"
              aria-label="Nächstes Bild"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[94vh] overflow-y-auto flex flex-col relative z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="px-2.5 py-1 bg-stone-900 text-white text-xs font-mono font-medium rounded">
                  {lightboxPhoto.projectName}
                </span>
                <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                  lightboxPhoto.category === 'stage-design' ? 'bg-amber-600 text-white' : 'bg-emerald-700 text-white'
                }`}>
                  {lightboxPhoto.category === 'stage-design' ? 'Stage-Design' : 'Holzbühne'}
                </span>
                {sortedPhotos.length > 1 && currentPhotoIndex !== -1 && (
                  <span className="text-xs font-mono text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
                    Bild {currentPhotoIndex + 1} von {sortedPhotos.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* 90° Rotate Button inside Lightbox Header */}
                <button
                  onClick={() => handleRotatePhoto(lightboxPhoto.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  title="Bild 90° im Uhrzeigersinn drehen"
                >
                  <RotateCw className="w-3.5 h-3.5 text-stone-700" />
                  <span className="hidden sm:inline">Drehen</span>
                  {lightboxPhoto.rotation ? <span className="font-mono text-[10px]">({lightboxPhoto.rotation}°)</span> : null}
                </button>

                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Schließen (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image Display (Click to go to Next Image) */}
            <div
              onClick={handleNextLightbox}
              className="p-4 sm:p-6 bg-stone-100 flex items-center justify-center min-h-[340px] sm:min-h-[420px] cursor-pointer relative group select-none overflow-hidden"
              title="Klicken für nächstes Bild"
            >
              {lightboxPhoto.sourceUrl ? (
                <img
                  src={lightboxPhoto.sourceUrl}
                  alt={lightboxPhoto.title}
                  className="rounded-xl shadow-lg object-contain transition-all duration-300"
                  style={{
                    transform: lightboxPhoto.rotation ? `rotate(${lightboxPhoto.rotation}deg)` : undefined,
                    maxHeight: ((lightboxPhoto.rotation || 0) % 180 !== 0) ? 'min(75vw, 650px)' : 'min(560px, 70vh)',
                    maxWidth: ((lightboxPhoto.rotation || 0) % 180 !== 0) ? 'min(560px, 70vh)' : 'min(100%, 900px)',
                    imageRendering: enhancedQuality ? '-webkit-optimize-contrast' : 'auto',
                    filter: enhancedQuality ? 'contrast(106%) saturate(104%)' : 'none',
                  }}
                />
              ) : (
                <div className="w-full max-w-xl h-80 rounded-xl overflow-hidden shadow-lg border border-stone-300">
                  <ProjectGraphic
                    id={lightboxPhoto.id}
                    category={lightboxPhoto.category}
                    title={lightboxPhoto.title}
                    projectName={lightboxPhoto.projectName}
                  />
                </div>
              )}

              {/* Click-to-advance hint overlay on hover */}
              {sortedPhotos.length > 1 && (
                <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5 shadow-md">
                  <span>Klicken für nächstes Bild</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Details & Actions */}
            <div className="p-4 sm:p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-stone-200">
              <div className="max-w-xl">
                <h3 className="text-base sm:text-lg font-bold text-stone-950">{lightboxPhoto.title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-stone-600">
                  Festival-Projekt: <strong>{lightboxPhoto.projectName}</strong> // Bereich: <strong>{lightboxPhoto.category === 'stage-design' ? 'Stage-Design & Floor' : 'Holzbühne'}</strong>
                </p>
                {lightboxPhoto.fileName && (
                  <p className="text-xs text-stone-400 font-mono mt-1">
                    Dateiname: {lightboxPhoto.fileName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                {/* 90° Rotate Button inside Action Bar */}
                <button
                  onClick={() => handleRotatePhoto(lightboxPhoto.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors cursor-pointer"
                  title="Bild 90° drehen"
                >
                  <RotateCw className="w-3.5 h-3.5 text-stone-600" />
                  <span>Drehen{lightboxPhoto.rotation ? ` (${lightboxPhoto.rotation}°)` : ''}</span>
                </button>

                {lightboxPhoto.sourceUrl && (
                  <button
                    onClick={() => {
                      handleSetAsHero(lightboxPhoto);
                      setLightboxPhoto(null);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Als Startseite</span>
                  </button>
                )}

                {onSelectProjectForContact && (
                  <button
                    onClick={() => {
                      onSelectProjectForContact(`${lightboxPhoto.projectName} - ${lightboxPhoto.title}`);
                      setLightboxPhoto(null);
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    Anfragen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Metadata Modal */}
      {editingPhotoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="text-base font-bold text-stone-900">Foto-Angaben bearbeiten</h3>
              <button
                onClick={() => setEditingPhotoId(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo file replacement */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Foto-Datei ersetzen
                </label>
                <input
                  ref={editPhotoFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleEditPhotoFileSelect}
                  className="hidden"
                />
                {editSourceUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <img
                      src={editSourceUrl}
                      alt="Vorschau"
                      className="w-12 h-12 object-cover rounded-md border border-stone-200 shrink-0 transition-transform duration-300"
                      style={{ transform: editRotation ? `rotate(${editRotation}deg)` : undefined }}
                    />
                    <div className="flex-1 truncate text-xs text-stone-600">
                      <span className="font-semibold text-stone-900 block truncate">Eigenes Foto hinterlegt</span>
                      <button
                        type="button"
                        onClick={() => editPhotoFileInputRef.current?.click()}
                        className="text-amber-700 hover:underline font-medium cursor-pointer"
                      >
                        Anderes Bild wählen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editPhotoFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Neues Foto als Datei hochladen</span>
                  </button>
                )}
              </div>

              {/* Rotation in Edit Modal */}
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

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Festival / Projekt
                </label>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Bildtitel
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Bereich
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                  >
                    <option value="buehne">Holzbühne</option>
                    <option value="stage-design">Stage-Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Format
                  </label>
                  <select
                    value={editOrientation}
                    onChange={(e) => setEditOrientation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                  >
                    <option value="querformat">Querformat</option>
                    <option value="hochformat">Hochformat</option>
                    <option value="quadrat">Quadratisch</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingPhotoId(null)}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleSaveEdit(editingPhotoId)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Metadata Modal */}
      {isEditingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="text-base font-bold text-stone-900">Video-Angaben bearbeiten</h3>
              <button
                onClick={() => setIsEditingVideo(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Festival / Projekt
                </label>
                <input
                  type="text"
                  value={videoEditFestival}
                  onChange={(e) => setVideoEditFestival(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Video-Titel
                </label>
                <input
                  type="text"
                  value={videoEditTitle}
                  onChange={(e) => setVideoEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Bereich
                </label>
                <select
                  value={videoEditCategory}
                  onChange={(e) => setVideoEditCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:border-stone-900 cursor-pointer"
                >
                  <option value="buehne">Holzbühne</option>
                  <option value="stage-design">Stage-Design</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setIsEditingVideo(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveVideoEdit}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
