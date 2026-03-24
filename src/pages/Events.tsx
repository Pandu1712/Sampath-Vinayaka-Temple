import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { TempleEvent } from "../types";
import { handleFirestoreError, OperationType } from "../AuthContext";
import { motion } from "motion/react";
import { formatDate } from "../lib/utils";
import { MapPin, Calendar as CalendarIcon } from "lucide-react";

export default function Events() {
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TempleEvent[];
      setEvents(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "events");
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-temple-maroon mb-4">Upcoming Events</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join us in celebrating the various festivals and special occasions at Sampath Vinayaka Temple.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-temple-gold/10">
          <CalendarIcon className="mx-auto text-temple-gold/30 mb-4" size={64} />
          <h3 className="text-2xl font-serif font-bold text-gray-400">No upcoming events scheduled</h3>
        </div>
      ) : (
        <div className="space-y-12">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-temple-gold/5 flex flex-col lg:flex-row"
            >
              <div className="lg:w-2/5 h-64 lg:h-auto relative">
                <img
                  src={event.imageUrl || "https://picsum.photos/seed/event/800/600"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 bg-temple-saffron text-white px-4 py-2 rounded-2xl font-bold shadow-lg">
                  {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
              <div className="lg:w-3/5 p-10 lg:p-16 flex flex-col justify-center">
                <h2 className="text-4xl font-serif font-bold text-temple-maroon mb-6">{event.title}</h2>
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CalendarIcon size={20} className="text-temple-gold" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin size={20} className="text-temple-gold" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {event.description}
                </p>
                <button className="self-start text-temple-maroon font-bold border-b-2 border-temple-gold hover:border-temple-maroon transition-all pb-1">
                  Learn More
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
