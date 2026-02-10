
import React from 'react';
import { ProductImage } from '../types';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, Download, Trash2 } from 'lucide-react';

interface Props {
  image: ProductImage;
  onDownload: (url: string, name: string) => void;
  onReprocess: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ProcessingCard: React.FC<Props> = ({ image, onDownload, onReprocess, onRemove }) => {
  const isDone = image.status === 'completed';
  const isError = image.status === 'failed';
  const isProcessing = image.status === 'processing';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 luxury-shadow transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/10 flex flex-col group">
      <div className="relative aspect-square bg-stone-50 flex items-center justify-center overflow-hidden">
        {isDone ? (
          <img 
            src={image.processedUrl} 
            alt={image.name} 
            className="w-full h-full object-cover transition-opacity duration-700 opacity-100"
          />
        ) : (
          <img 
            src={image.originalUrl} 
            alt={image.name} 
            className={`w-full h-full object-cover transition-all duration-500 ${isProcessing ? 'blur-sm opacity-50' : 'opacity-80 grayscale-[20%]'}`}
          />
        )}

        {/* Overlay Controls for Finished Images */}
        {isDone && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
            <button 
              onClick={() => onReprocess(image.id)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-800 hover:bg-[#D4AF37] hover:text-white transition-all shadow-lg"
              title="Try Different Background/Logo"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={() => onDownload(image.processedUrl!, image.name)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-800 hover:bg-[#D4AF37] hover:text-white transition-all shadow-lg"
              title="Download Result"
            >
              <Download size={20} />
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[3px]">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-white animate-spin mb-2" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Pâtisserie AI Studio</span>
            <div className="w-24 h-1 bg-white/30 rounded-full mt-4 overflow-hidden border border-white/10">
              <div 
                className="h-full gold-gradient transition-all duration-300" 
                style={{ width: `${image.progress}%` }}
              />
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 text-red-600 p-6 text-center">
            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-xs font-bold uppercase tracking-wider">Session Error</p>
            <p className="text-[10px] mt-2 opacity-80 leading-relaxed">{image.error}</p>
            <button 
               onClick={() => onReprocess(image.id)}
               className="mt-4 px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full hover:bg-red-700 transition-all uppercase tracking-widest"
            >
              Retry Shot
            </button>
          </div>
        )}

        {isDone && (
          <div className="absolute top-3 right-3">
            <div className="bg-white rounded-full p-1 shadow-md border border-[#D4AF37]/20">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        )}

        <button 
          onClick={() => onRemove(image.id)}
          className="absolute top-3 left-3 w-8 h-8 bg-white/80 backdrop-blur-sm text-stone-400 rounded-full shadow-sm flex items-center justify-center hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 bg-white">
        <h3 className="text-stone-800 font-bold truncate text-xs uppercase tracking-wider">{image.name}</h3>
        <p className="text-[10px] text-stone-400 mt-1 uppercase font-medium tracking-tighter">
          {image.status === 'pending' ? 'Ready for Studio' : 
           image.status === 'processing' ? 'Editorial Magic in Progress' : 
           image.status === 'completed' ? 'High-End Masterpiece' : 'Requires Attention'}
        </p>
      </div>
    </div>
  );
};
