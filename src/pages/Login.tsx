import { useState } from "react";
import { useAuth } from "../AuthContext";
import { LogIn, Mail, Lock } from "lucide-react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Login() {
  const { user, login, loginWithEmail, loading, authError, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email, password);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-temple-gold/10">
        <div className="bg-temple-maroon p-10 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <LogIn className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white">Admin Portal</h2>
          <p className="text-temple-cream/70 mt-2">Administrative Access Only</p>
        </div>
        
        <div className="p-10">
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center font-medium">
              {authError}
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-100 py-4 rounded-2xl hover:bg-gray-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className={`w-6 h-6 group-hover:scale-110 transition-transform ${isLoggingIn ? 'animate-pulse' : ''}`} 
                  />
                  <span className="font-bold text-gray-700">
                    {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
                  </span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400">Or use email</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full flex items-center justify-center space-x-3 bg-temple-cream/50 text-temple-maroon py-4 rounded-2xl hover:bg-temple-cream transition-all font-bold"
                >
                  <Mail size={20} />
                  <span>Admin Login with Email</span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="email"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleEmailAuth}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-temple-gold outline-none transition-all"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-temple-gold outline-none transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-temple-maroon text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-temple-maroon/20 hover:bg-temple-maroon/90 transition-all disabled:opacity-50"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full text-center text-sm text-gray-500 hover:text-temple-maroon transition-colors"
                >
                  Back to social login
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          
          <p className="mt-8 text-center text-xs text-gray-400">
            By logging in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
