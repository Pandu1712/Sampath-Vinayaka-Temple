import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { Image, Calendar, Clock, Users, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const { profile, canManageEvents, canManageGallery, canManageTimings, isSuperAdmin, isAdmin } = useAuth();

  const adminCards = [
    {
      title: "Manage Gallery",
      desc: "Upload daily darshan and temple photos.",
      icon: <Image className="text-white" size={24} />,
      link: "/admin/gallery",
      color: "bg-blue-600",
      show: canManageGallery,
    },
    {
      title: "Manage Events",
      desc: "Create and update temple festivals and events.",
      icon: <Calendar className="text-white" size={24} />,
      link: "/admin/events",
      color: "bg-purple-600",
      show: canManageEvents,
    },
    {
      title: "Manage Timings",
      desc: "Update darshan and pooja schedules.",
      icon: <Clock className="text-white" size={24} />,
      link: "/admin/timings",
      color: "bg-orange-600",
      show: canManageTimings,
    },
    {
      title: "User Management",
      desc: "Manage admin and sub-admin roles.",
      icon: <Users className="text-white" size={24} />,
      link: "/admin/users",
      color: "bg-red-600",
      show: isAdmin,
    },
  ];

  const filteredCards = adminCards.filter(card => card.show);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-temple-maroon mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.displayName}. Manage your temple's digital presence.</p>
        </div>
        <div className="flex items-center space-x-2 bg-temple-gold/10 px-4 py-2 rounded-full border border-temple-gold/20">
          <ShieldCheck className="text-temple-gold" size={20} />
          <span className="font-bold text-temple-maroon capitalize">{profile?.role} Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredCards.map((card, i) => (
          <motion.div
            key={card.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={card.link}
              className="group bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-temple-gold/5 hover:border-temple-gold/20 transition-all flex flex-col h-full"
            >
              <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200 transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm mb-6 flex-grow">{card.desc}</p>
              <div className="flex items-center text-temple-maroon font-bold text-sm group-hover:translate-x-1 transition-transform">
                <span>Manage</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
