
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  Image as ImageIcon, 
  Settings, 
  Download, 
  Trash2, 
  RefreshCw,
  Layout,
  Flower2,
  Square,
  Coffee,
  Palette,
  Sun,
  Wand2,
  CheckCircle2,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { ProductImage, BrandingConfig, Preset, BrandLogo } from './types';
import { LaParisLogo } from './components/Logo';
import { ProcessingCard } from './components/ProcessingCard';
import { processBakeryImage } from './services/geminiService';

const PRESETS: Preset[] = [
  { id: 'avenue-montaigne', label: 'Avenue Montaigne', description: 'Classic Marble & Gold', icon: 'Layout' },
  { id: 'jardin-palais', label: 'Jardin du Palais', description: 'Dreamy Garden Floral', icon: 'Flower2' },
  { id: 'solid-chic', label: 'Solid Chic', description: 'Premium Texture Catalog', icon: 'Square' },
  { id: 'artisanal-atelier', label: 'Artisanal Atelier', description: 'Warm Limestone Craft', icon: 'Coffee' },
  { id: 'champagne-soiree', label: 'Champagne Soirée', description: 'Festive Silk & Bokeh', icon: 'Palette' },
  { id: 'saint-germain', label: 'Saint-Germain Chic', description: 'Modern Minimal Pastel', icon: 'Sun' },
  { id: 'ai-magic', label: 'AI Magic', description: 'Creative Exploration', icon: 'Wand2' },
];

const LUXE_COLORS = [
  { name: 'Ivory Cream', value: '#FAF9F6' },
  { name: 'Rose Quartz', value: '#FDF0F0' },
  { name: 'Sage Leaf', value: '#E9F0E9' },
  { name: 'Noir Slate', value: '#2A2A2A' },
  { name: 'French Navy', value: '#1A2A3A' },
  { name: 'Sandstone', value: '#E5D3B3' },
];

const App: React.FC = () => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [branding, setBranding] = useState<BrandingConfig>({
    logoVisible: false,
    logoPosition: 'bottom-right',
    logoOpacity: 0.85,
    upscale: true,
    activePreset: 'avenue-montaigne',
    selectedLogoId: 'default',
    selectedColor: 'Ivory Cream'
  });

  const [logos, setLogos] = useState<BrandLogo[]>([
    { id: 'default', name: 'La Paris Gold', url: 'https://images.unsplash.com/photo-1549488344-cbb6c34ce08b?q=80&w=200&h=200&auto=format&fit=crop' } 
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ProductImage[] = Array.from(files).map((file: File) => ({
      id: Math.random().toString(36).substring(7),
      originalUrl: URL.createObjectURL(file),
      status: 'pending',
      name: file.name.split('.')[0],
      progress: 0
    }));

    setImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

  const processImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, status: 'processing', progress: 10 } : img
    ));

    try {
      let logoBase64: string | undefined = undefined;
      if (branding.logoVisible && branding.selectedLogoId) {
        const selectedLogo = logos.find(l => l.id === branding.selectedLogoId);
        if (selectedLogo) {
          logoBase64 = await getBase64(selectedLogo.url);
        }
      }

      const productBase64 = await getBase64(image.originalUrl);
      const resultUrl = await processBakeryImage(
        productBase64, 
        image.name, 
        branding.activePreset, 
        logoBase64,
        branding.selectedColor
      );

      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, status: 'completed', processedUrl: resultUrl, progress: 100 } : img
      ));
    } catch (error: any) {
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, status: 'failed', error: error.message } : img
      ));
    }
  };

  const processAll = () => {
    images.forEach(img => {
      if (img.status === 'pending' || img.status === 'failed') {
        processImage(img.id);
      }
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `LaParis_Studio_${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPresetIcon = (id: string) => {
    const props = { size: 18 };
    switch (id) {
      case 'avenue-montaigne': return <Layout {...props} />;
      case 'jardin-palais': return <Flower2 {...props} />;
      case 'solid-chic': return <Square {...props} />;
      case 'artisanal-atelier': return <Coffee {...props} />;
      case 'champagne-soiree': return <Palette {...props} />;
      case 'saint-germain': return <Sun {...props} />;
      case 'ai-magic': return <Wand2 {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] overflow-hidden w-full">
      {/* Sidebar Settings */}
      <aside className="w-80 bg-white border-r border-stone-100 flex flex-col shadow-xl z-20 overflow-y-auto no-scrollbar">
        <div className="p-8 border-b border-stone-50">
          <LaParisLogo />
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-4">AI Editorial Studio</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Preset Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
              <ImageIcon size={14} /> Style Presets
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setBranding(prev => ({ ...prev, activePreset: p.id }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                    branding.activePreset === p.id 
                    ? 'border-[#D4AF37] bg-stone-50 text-[#D4AF37]' 
                    : 'border-transparent hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    branding.activePreset === p.id ? 'gold-gradient text-white shadow-md' : 'bg-stone-100 text-stone-400 group-hover:bg-white'
                  }`}>
                    {renderPresetIcon(p.id)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">{p.label}</p>
                    <p className="text-[9px] opacity-60 font-medium leading-tight">{p.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Color Section (Visible only if Solid Chic is selected) */}
          {branding.activePreset === 'solid-chic' && (
            <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Surface Palette</h3>
              <div className="grid grid-cols-3 gap-2">
                {LUXE_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setBranding(prev => ({ ...prev, selectedColor: c.name }))}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${
                      branding.selectedColor === c.name ? 'border-[#D4AF37] bg-white shadow-sm' : 'border-transparent hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full shadow-inner border border-stone-100" style={{ backgroundColor: c.value }} />
                    <span className="text-[8px] font-bold text-stone-400 uppercase truncate w-full text-center">{c.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Branding Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <Palette size={14} /> Brand Identity
              </h3>
              <button 
                onClick={() => setBranding(prev => ({ ...prev, logoVisible: !prev.logoVisible }))}
                className="text-stone-300 hover:text-[#D4AF37] transition-colors"
              >
                {branding.logoVisible ? <ToggleRight size={32} className="text-[#D4AF37]" /> : <ToggleLeft size={32} />}
              </button>
            </div>

            {branding.logoVisible && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {logos.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setBranding(prev => ({ ...prev, selectedLogoId: l.id }))}
                      className={`w-12 h-12 rounded-lg border-2 flex-shrink-0 flex items-center justify-center p-2 bg-white transition-all ${
                        branding.selectedLogoId === l.id ? 'border-[#D4AF37] shadow-md' : 'border-stone-50 opacity-40 hover:opacity-100'
                      }`}
                    >
                      <img src={l.url} className="w-full h-full object-contain" />
                    </button>
                  ))}
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="w-12 h-12 rounded-lg border-2 border-dashed border-stone-200 flex-shrink-0 flex items-center justify-center text-stone-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          <button 
            onClick={processAll}
            disabled={images.length === 0 || images.every(i => i.status === 'processing')}
            className="w-full gold-gradient text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gold-500/20 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Sparkles size={16} /> Render Gallery
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6]">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <h2 className="brand-font text-xl font-bold">Workspace</h2>
            <div className="h-4 w-px bg-stone-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">{images.length} Assets Loaded</span>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-stone-900 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} /> Import Photos
          </button>
        </header>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center luxury-shadow animate-in zoom-in duration-500">
                <ImageIcon className="text-stone-200" size={40} />
              </div>
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                <h3 className="brand-font text-2xl font-bold">Your Studio is Empty</h3>
                <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">Import photos of your latest Pâtisserie creations to begin</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-[#D4AF37] pb-1 hover:opacity-70 transition-opacity"
                >
                  Browse Gallery
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map(image => (
                <ProcessingCard 
                  key={image.id}
                  image={image}
                  onDownload={downloadImage}
                  onReprocess={processImage}
                  onRemove={removeImage}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload} 
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={logoInputRef} 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          const newLogo: BrandLogo = { id: Math.random().toString(), name: file.name, url };
          setLogos(prev => [newLogo, ...prev]);
          setBranding(prev => ({ ...prev, selectedLogoId: newLogo.id, logoVisible: true }));
        }}
      />
    </div>
  );
};

export default App;
