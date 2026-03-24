import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { GalleryItem } from "../types";
import { handleFirestoreError, OperationType } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { formatDate } from "../lib/utils";
import { X } from "lucide-react";

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "darshan" | "general">("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryItem[];
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "gallery");
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-temple-maroon mb-4">Temple Gallery</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore the divine beauty of Sampath Vinayaka Temple through our curated collection of daily darshans and temple events.
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-center space-x-4 mb-12">
        {["all", "darshan", "general"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-8 py-2 rounded-full font-bold transition-all capitalize ${
              filter === f
                ? "bg-temple-maroon text-white shadow-lg shadow-temple-maroon/20"
                : "bg-white text-gray-600 hover:bg-temple-gold/10 border border-temple-gold/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-xl cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.imageUrl || undefined}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                  <p className="text-white font-serif text-xl mb-1">{item.caption}</p>
                  <p className="text-temple-gold text-sm">{formatDate(item.date)}</p>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-temple-saffron text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {item.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-8 right-8 text-white hover:text-temple-gold transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.imageUrl || undefined}
                alt={selectedImage.caption}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-6 text-center">
                <h2 className="text-3xl font-serif font-bold text-white mb-2">{selectedImage.caption}</h2>
                <p className="text-temple-gold text-lg">{formatDate(selectedImage.date)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
