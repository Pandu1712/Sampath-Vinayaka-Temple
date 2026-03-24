import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { GalleryItem } from "../../types";
import { handleFirestoreError, OperationType } from "../../AuthContext";
import { Trash2, Plus, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export default function ManageGallery() {
  const { canManageGallery, loading: authLoading } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<GalleryItem>>({
    type: "darshan",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "gallery");
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return null;
  if (!canManageGallery) return <Navigate to="/admin" />;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.imageUrl || !newItem.caption) return;
    
    try {
      await addDoc(collection(db, "gallery"), {
        ...newItem,
        date: new Date(newItem.date!).toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "gallery");
    }
    setIsAdding(false);
    setNewItem({ type: "darshan", date: new Date().toISOString().split("T")[0] });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteDoc(doc(db, "gallery", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-temple-maroon">Manage Gallery</h1>
          <p className="text-gray-600">Add or remove images from the temple gallery.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-temple-maroon text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 shadow-lg shadow-temple-maroon/20"
        >
          <Plus size={20} />
          <span>Add Image</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-temple-gold/5 group relative">
            <img src={item.imageUrl || undefined} alt={item.caption} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
            <div className="p-6">
              <h3 className="font-bold truncate">{item.caption}</h3>
              <p className="text-xs text-gray-400 mt-1 capitalize">{item.type}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id!)}
              className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-temple-maroon p-8 text-white flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">Add New Image</h2>
                <button onClick={() => setIsAdding(false)}><X /></button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                    placeholder="https://images.unsplash.com/..."
                    value={newItem.imageUrl || ""}
                    onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Caption</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                    placeholder="Daily Alankaram..."
                    value={newItem.caption || ""}
                    onChange={e => setNewItem({ ...newItem, caption: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                      value={newItem.date || ""}
                      onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                      value={newItem.type}
                      onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                    >
                      <option value="darshan">Darshan</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-temple-maroon text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-temple-maroon/20 hover:bg-temple-maroon/90 transition-all"
                >
                  Save Image
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
