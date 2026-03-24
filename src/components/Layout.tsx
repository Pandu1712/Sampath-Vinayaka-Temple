import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout, isSubAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
    { name: "Events", path: "/events" },
    { name: "Timings", path: "/timings" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-temple-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-temple-saffron rounded-full flex items-center justify-center text-white font-serif text-xl font-bold">
                  SV
                </div>
                <span className="font-serif text-xl font-bold text-temple-maroon hidden sm:block">
                  Sampath Vinayaka
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 hover:text-temple-saffron transition-colors font-medium"
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center space-x-4">
                  {isSubAdmin && (
                    <Link
                      to="/admin"
                      className="p-2 text-temple-maroon hover:bg-temple-gold/10 rounded-full transition-colors"
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard size={20} />
                    </Link>
                  )}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <img
                        src={user.photoURL || undefined}
                        alt={user.displayName || ""}
                        className="w-8 h-8 rounded-full border border-temple-gold"
                      />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-temple-gold/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-temple-maroon text-white px-6 py-2 rounded-full hover:bg-temple-maroon/90 transition-all shadow-lg shadow-temple-maroon/20"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-temple-maroon p-2"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-temple-gold/20 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-4 text-lg font-medium text-gray-700 hover:bg-temple-gold/10 rounded-lg"
                  >
                    {link.name}
                  </Link>
                ))}
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-temple-maroon text-white py-3 rounded-lg font-bold"
                  >
                    Login
                  </Link>
                )}
                {user && (
                  <div className="pt-4 border-t border-gray-100">
                    {isSubAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-4 text-lg font-medium text-temple-maroon hover:bg-temple-gold/10 rounded-lg"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-4 text-lg font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-temple-maroon text-temple-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-4">Sampath Vinayaka Temple</h3>
              <p className="text-temple-cream/80 leading-relaxed">
                A sacred space dedicated to Lord Ganesha, bringing peace, prosperity, and divine blessings to all devotees.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-temple-cream/70 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 uppercase tracking-widest">Contact Us</h4>
              <p className="text-temple-cream/70">
                Visakhapatnam, Andhra Pradesh<br />
                India<br />
                Email: info@sampathvinayaka.org
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-temple-cream/10 text-center text-temple-cream/50 text-sm">
            © {new Date().getFullYear()} Sampath Vinayaka Temple. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
