import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { TempleTiming } from "../types";
import { handleFirestoreError, OperationType } from "../AuthContext";
import { Clock, Sun, Moon } from "lucide-react";

export default function Timings() {
  const [timings, setTimings] = useState<TempleTiming[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "timings"), orderBy("category", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TempleTiming[];
      setTimings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "timings");
    });

    return () => unsubscribe();
  }, []);

  const darshanTimings = timings.filter((t) => t.category === "darshan");
  const poojaTimings = timings.filter((t) => t.category === "pooja");

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-temple-maroon mb-4">Temple Timings</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Plan your spiritual journey with our detailed schedule for darshan and special poojas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Darshan Timings */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-xl shadow-gray-200/50 border border-temple-gold/10">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-16 h-16 bg-temple-cream rounded-2xl flex items-center justify-center text-temple-saffron">
              <Sun size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-temple-maroon">Darshan Schedule</h2>
          </div>
          
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"></div>)
            ) : darshanTimings.length === 0 ? (
              <p className="text-gray-400 italic">No timings listed yet.</p>
            ) : (
              darshanTimings.map((t) => (
                <div key={t.id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                  <span className="text-lg font-medium text-gray-700">{t.name}</span>
                  <span className="text-temple-maroon font-bold text-lg bg-temple-cream px-4 py-1 rounded-full">
                    {t.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pooja Timings */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-xl shadow-gray-200/50 border border-temple-gold/10">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-16 h-16 bg-temple-cream rounded-2xl flex items-center justify-center text-temple-maroon">
              <Moon size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-temple-maroon">Special Poojas</h2>
          </div>
          
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"></div>)
            ) : poojaTimings.length === 0 ? (
              <p className="text-gray-400 italic">No timings listed yet.</p>
            ) : (
              poojaTimings.map((t) => (
                <div key={t.id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                  <span className="text-lg font-medium text-gray-700">{t.name}</span>
                  <span className="text-temple-maroon font-bold text-lg bg-temple-cream px-4 py-1 rounded-full">
                    {t.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="mt-16 bg-temple-saffron/10 border border-temple-saffron/20 p-8 rounded-[2rem] flex items-start space-x-4">
        <Clock className="text-temple-saffron shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-temple-maroon mb-2">Important Note:</h4>
          <p className="text-gray-700">
            Timings may vary during festivals and special occasions. We recommend arriving at least 15 minutes before the scheduled pooja timings.
          </p>
        </div>
      </div>
    </div>
  );
}
