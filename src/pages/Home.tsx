import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Image as ImageIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/temple/1920/1080"
            alt="Temple Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-temple-cream"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 leading-tight">
              Sampath Vinayaka <br />
              <span className="text-temple-gold italic">Devotional</span>
            </h1>
            <p className="text-xl md:text-2xl text-temple-cream/90 mb-10 max-w-2xl mx-auto font-light tracking-wide">
              Experience the divine grace and timeless wisdom of Lord Ganesha in the heart of Visakhapatnam.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/gallery"
                className="bg-temple-saffron text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-temple-saffron/90 transition-all shadow-xl shadow-temple-saffron/30 flex items-center space-x-2"
              >
                <span>Daily Darshan</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/timings"
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
              >
                Temple Timings
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Daily Darshan",
              desc: "View the latest divine images of Lord Ganesha from today's rituals.",
              icon: <ImageIcon className="text-temple-saffron" size={32} />,
              link: "/gallery",
            },
            {
              title: "Upcoming Events",
              desc: "Stay updated with festivals, special poojas, and temple celebrations.",
              icon: <Calendar className="text-temple-saffron" size={32} />,
              link: "/events",
            },
            {
              title: "Pooja Timings",
              desc: "Plan your visit with accurate timings for darshan and special sevas.",
              icon: <Clock className="text-temple-saffron" size={32} />,
              link: "/timings",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-temple-gold/5 hover:border-temple-gold/20 transition-all group"
            >
              <div className="w-16 h-16 bg-temple-cream rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{feature.desc}</p>
              <Link
                to={feature.link}
                className="text-temple-maroon font-bold flex items-center space-x-2 hover:space-x-3 transition-all"
              >
                <span>Explore</span>
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* History Section */}
      <section className="bg-temple-maroon text-temple-cream py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
              A Legacy of <br />
              <span className="text-temple-gold italic">Divine Grace</span>
            </h2>
            <div className="space-y-6 text-lg text-temple-cream/80 leading-relaxed">
              <p>
                The Sampath Vinayaka Temple stands as a beacon of spiritual solace in Visakhapatnam. Established with the vision of providing a sacred space for devotees to connect with the divine, the temple has grown into a significant cultural landmark.
              </p>
              <p>
                Lord Ganesha, the remover of obstacles, is worshipped here in His majestic form. Every ritual, from the morning Abhishekam to the evening Aarti, is performed with utmost devotion and adherence to Vedic traditions.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
              <img
                src="https://picsum.photos/seed/history/800/1000"
                alt="Temple History"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-temple-gold rounded-full flex items-center justify-center text-temple-maroon font-serif text-2xl font-bold text-center p-4 shadow-xl -rotate-12">
              Over 50 Years of Devotion
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
