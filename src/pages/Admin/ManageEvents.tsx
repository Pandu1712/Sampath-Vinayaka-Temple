import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { TempleEvent } from "../../types";
import { handleFirestoreError, OperationType } from "../../AuthContext";
import { Trash2, Plus, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../AuthContext";

import { Navigate } from "react-router-dom";

export default function ManageEvents() {
  const { user, canManageEvents, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<TempleEvent>>({
    date: new Date().toISOString().split("T")[0],
    location: "Temple Premises",
  });

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TempleEvent)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "events");
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return null;
  if (!canManageEvents) return <Navigate to="/admin" />;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description) return;
    
    try {
      await addDoc(collection(db, "events"), {
        ...newEvent,
        date: new Date(newEvent.date!).toISOString(),
        createdBy: user?.uid,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "events");
    }
    setIsAdding(false);
    setNewEvent({ date: new Date().toISOString().split("T")[0], location: "Temple Premises" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-temple-maroon">Manage Events</h1>
          <p className="text-gray-600">Schedule festivals and special occasions.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-temple-maroon text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 shadow-lg shadow-temple-maroon/20"
        >
          <Plus size={20} />
          <span>Add Event</span>
        </button>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-6 rounded-3xl shadow-lg border border-temple-gold/5 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-temple-cream rounded-2xl flex items-center justify-center text-temple-saffron">
                <Calendar size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-gray-500 text-sm">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(event.id!)}
              className="text-red-600 p-3 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={20} />
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
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-temple-maroon p-8 text-white flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">Add New Event</h2>
                <button onClick={() => setIsAdding(false)}><X /></button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                      value={newEvent.title || ""}
                      onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                      value={newEvent.description || ""}
                      onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                      value={newEvent.date || ""}
                      onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                      value={newEvent.location || ""}
                      onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple-gold outline-none"
                      value={newEvent.imageUrl || ""}
                      onChange={e => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-temple-maroon text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-temple-maroon/20 hover:bg-temple-maroon/90 transition-all"
                >
                  Schedule Event
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
