import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

const IMAGES = [
  '/images/college.jpeg',
  '/images/college1.jpeg',
  '/images/college3.png',
  '/images/college4.png',
  '/images/college5.jpeg',
  '/images/bts.jpeg'
];

export function PhotosApp() {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    return (
        <div className="w-full h-full bg-apple-gray/80 overflow-y-auto no-scrollbar p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {IMAGES.map((src, i) => (
                    <motion.div
                        key={src}
                        layoutId={`photo-${i}`}
                        className="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
                        onClick={() => setSelectedIdx(i)}
                        data-clickable="true"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedIdx !== null && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-apple-gray/95 backdrop-blur-xl flex items-center justify-center p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            layoutId={`photo-${selectedIdx}`}
                            className="relative max-w-full max-h-full rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <img src={IMAGES[selectedIdx]} className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl" />
                            <button
                                onClick={() => setSelectedIdx(null)}
                                data-clickable="true"
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-md transition-colors"
                            >
                                <Minimize2 size={20} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
