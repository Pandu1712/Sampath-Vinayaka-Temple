import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { TempleTiming } from "../../types";
import { handleFirestoreError, OperationType } from "../../AuthContext";
import { Trash2, Plus, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export default function ManageTimings() {
  const { canManageTimings, loading: authLoading } = useAuth();
  const [timings, setTimings] = useState<TempleTiming[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTiming, setNewTiming] = useState<Partial<TempleTiming>>({
    category: "darshan",
  });

  useEffect(() => {
    const q = query(collection(db, "timings"), orderBy("category", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTimings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TempleTiming)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "timings");
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return null;
  if (!canManageTimings) return <Navigate to="/admin" />;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTiming.name || !newTiming.time) return;
    
    try {
      await addDoc(collection(db, "timings"), newTiming);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "timings");
    }
    setIsAdding(false);
    setNewTiming({ category: "darshan" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this timing?")) {
      try {
        await deleteDoc(doc(db, "timings", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `timings/${id}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-temple-maroon">Manage Timings</h1>
          <p className="text-gray-600">Update darshan and pooja schedules.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-temple-maroon text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 shadow-lg shadow-temple-maroon/20"
        >
          <Plus size={20} />
          <span>Add Timing</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {["darshan", "pooja"].map((cat) => (
          <div key={cat} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-temple-gold/10">
            <h2 className="text-2xl font-serif font-bold text-temple-maroon mb-6 capitalize">{cat} Timings</h2>
            <div className="space-y-4">
              {timings.filter(t => t.category === cat).map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-temple-cream/30 rounded-2xl">
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-temple-maroon text-sm">{t.time}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id!)}
                    className="text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
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
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-temple-maroon p-8 text-white flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">Add Timing</h2>
                <button onClick={() => setIsAdding(false)}><X /></button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                    placeholder="Morning Darshan"
                    value={newTiming.name || ""}
                    onChange={e => setNewTiming({ ...newTiming, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time Range</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                    placeholder="6:00 AM - 12:00 PM"
                    value={newTiming.time || ""}
                    onChange={e => setNewTiming({ ...newTiming, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                    value={newTiming.category}
                    onChange={e => setNewTiming({ ...newTiming, category: e.target.value as any })}
                  >
                    <option value="darshan">Darshan</option>
                    <option value="pooja">Pooja</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-temple-maroon text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-temple-maroon/20 hover:bg-temple-maroon/90 transition-all"
                >
                  Save Timing
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
