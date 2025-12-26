import { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Check, X, Sparkles, Activity } from 'lucide-react';
import Image from 'next/image';
import { useImageOptimizer } from '@/src/shared/hooks/useImageOptimizer';
import { toast } from '@/src/shared/services/toast.service';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImageUploaderProps {
    onImageUpload: (file: File | null) => void;
    currentImageUrl?: string;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
}

interface OptimizationResult {
    original: {
        name: string;
        type: string;
        size: number;
        sizeFormatted: string;
    };
    optimized: {
        name: string;
        type: string;
        size: number;
        sizeFormatted: string;
    };
    reduction: string;
    reductionPercentage: number;
}

export default function ProductImageUploader({
    onImageUpload,
    currentImageUrl,
    label = 'Imagen del producto',
    accept = 'image/*',
    maxSizeMB = 5,
}: ProductImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [dragOver, setDragOver] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

    const { optimize } = useImageOptimizer();

    useEffect(() => {
        if (currentImageUrl) {
            setPreviewUrl(currentImageUrl);
        }
    }, [currentImageUrl]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setOptimizationResult(null);

        if (!file.type.startsWith('image/')) {
            setError('Selecciona un archivo de imagen válido');
            toast.error('Error', {
                description: 'El archivo debe ser una imagen',
            });
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`La imagen no debe superar los ${maxSizeMB}MB`);
            toast.error('Error', {
                description: `Imagen demasiado grande (Máx: ${maxSizeMB}MB)`,
            });
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            setOptimizing(true);

            const optimizedFile = await optimize(file, {
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.85,
                format: 'webp',
            });

            if (optimizedFile) {
                const reduction = ((file.size - optimizedFile.size) / file.size) * 100;
                setOptimizationResult({
                    original: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        sizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    },
                    optimized: {
                        name: optimizedFile.name,
                        type: optimizedFile.type,
                        size: optimizedFile.size,
                        sizeFormatted: `${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
                    },
                    reduction: `${reduction.toFixed(1)}%`,
                    reductionPercentage: reduction,
                });

                onImageUpload(optimizedFile);
                toast.success('¡Imagen Optimizada!', {
                    description: `Ahorraste un ${reduction.toFixed(1)}% de espacio`,
                });
            } else {
                onImageUpload(file);
            }
        } catch (error) {
            console.error('Error optimizando imagen:', error);
            setError('Error al procesar la imagen');
            onImageUpload(file);
        } finally {
            setOptimizing(false);
        }
    };

    const handleClearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setOptimizationResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onImageUpload(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5 text-orange-500" />
                    {label}
                </label>
            </div>

            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative group h-72 rounded-[2.5rem] overflow-hidden border-2 border-dashed transition-all duration-500 cursor-pointer
                    ${dragOver ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-slate-50/50 hover:border-orange-200 hover:bg-orange-50/30'}
                    ${optimizing ? 'cursor-wait opacity-80' : ''}`}
                onClick={() => !optimizing && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && fileInputRef.current) {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        fileInputRef.current.files = dt.files;
                        handleFileChange({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {optimizing ? (
                        <motion.div
                            key="optimizing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 blur-2xl bg-orange-500/20 rounded-full" />
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 relative z-10" />
                            </div>
                            <p className="mt-8 text-xs font-black text-slate-900 uppercase tracking-widest animate-pulse">
                                Aplicando Magia Digital...
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 font-bold">Optimizando para Alto Rendimiento</p>
                        </motion.div>
                    ) : previewUrl ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={previewUrl}
                                alt="Vista previa"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                unoptimized={previewUrl.startsWith('blob:')}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Overlay Controls */}
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button
                                    onClick={handleClearImage}
                                    className="h-10 w-10 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all duration-300 shadow-xl"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-500/20 backdrop-blur-xl border border-green-500/50 rounded-xl flex items-center justify-center text-green-400">
                                        <Check size={20} />
                                    </div>
                                    <div className="text-left text-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Estado Premium</p>
                                        <p className="text-[10px] font-bold text-white/60">Lista para publicar</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors"
                                >
                                    Cambiar Imagen
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:bg-orange-500 transition-colors duration-500 mb-6">
                                <Upload className="h-8 w-8 text-orange-500 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase mb-1">Galería de Sabores</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrastra tu fotografía aquí</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Elite Stats Info */}
            <AnimatePresence>
                {optimizationResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 text-white rounded-[1.5rem] p-6 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-20 w-20 -mr-6 -mt-6 text-orange-500" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                    <Activity className="h-6 w-6 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">IA Engine Active</p>
                                    <p className="text-xl font-black text-orange-500 tracking-tighter">
                                        -{optimizationResult.reduction} <span className="text-[10px] text-white/60 tracking-normal inline-block ml-1">optimizado</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right border-l border-white/10 pl-6">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Resultado Final</p>
                                <p className="text-xs font-black tracking-tight text-white/80">{optimizationResult.optimized.sizeFormatted}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-red-500/20"
                >
                    <X className="h-5 w-5 bg-white/20 rounded-lg p-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </motion.div>
            )}
        </div>
    );
}