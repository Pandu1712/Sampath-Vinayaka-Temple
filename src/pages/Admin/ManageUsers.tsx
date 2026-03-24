import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db, firebaseConfig } from "../../firebase";
import { UserProfile, UserPermissions } from "../../types";
import { useAuth, handleFirestoreError, OperationType } from "../../AuthContext";
import { Shield, User, UserCheck, ShieldAlert, Star, UserPlus, X, Mail, Lock, User as UserIcon } from "lucide-react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function ManageUsers() {
  const { isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState<{ 
    email: string; 
    password: string; 
    displayName: string; 
    role: "subadmin" | "admin";
    permissions: UserPermissions;
  }>({ 
    email: "", 
    password: "", 
    displayName: "", 
    role: "subadmin",
    permissions: { manageEvents: true, manageGallery: true, manageTimings: true }
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() })) as UserProfile[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "users");
    });
    return () => unsubscribe();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/admin" />;

  const updateRole = async (uid: string, newRole: string) => {
    if (newRole === 'superadmin' && !isSuperAdmin) {
      alert("Only Super Admins can promote users to Super Admin role.");
      return;
    }
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await updateDoc(doc(db, "users", uid), { role: newRole });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      }
    }
  };

  const updatePermissions = async (uid: string, permissions: UserPermissions) => {
    try {
      await updateDoc(doc(db, "users", uid), { permissions });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    // Create a secondary app instance to avoid logging out the current super admin
    const secondaryApp = initializeApp(firebaseConfig, "secondary");
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const { user: newUser } = await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email, newAdmin.password);
      
      const newProfile: UserProfile = {
        uid: newUser.uid,
        email: newAdmin.email,
        displayName: newAdmin.displayName || newAdmin.email.split('@')[0],
        photoURL: `https://ui-avatars.com/api/?name=${newAdmin.displayName || 'Admin'}&background=random`,
        role: newAdmin.role,
        createdAt: new Date().toISOString(),
        permissions: newAdmin.role === 'subadmin' ? newAdmin.permissions : undefined
      };

      try {
        await setDoc(doc(db, "users", newUser.uid), newProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${newUser.uid}`);
      }
      
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
      
      setShowCreateModal(false);
      setNewAdmin({ 
        email: "", 
        password: "", 
        displayName: "", 
        role: "subadmin",
        permissions: { manageEvents: true, manageGallery: true, manageTimings: true }
      });
      alert("Admin account created successfully!");
    } catch (error: any) {
      console.error("Error creating admin:", error);
      setCreateError(error.message || "Failed to create admin account.");
      await deleteApp(secondaryApp);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-temple-maroon">User Management</h1>
          <p className="text-gray-600">Manage administrative access and roles.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 bg-temple-maroon text-white px-6 py-3 rounded-2xl font-bold hover:bg-temple-maroon/90 transition-all shadow-lg shadow-temple-maroon/20"
        >
          <UserPlus size={20} />
          <span>Create New Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-temple-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-temple-cream/50 border-b border-temple-gold/10">
              <tr>
                <th className="px-8 py-6 font-bold text-temple-maroon uppercase tracking-wider text-sm">User</th>
                <th className="px-8 py-6 font-bold text-temple-maroon uppercase tracking-wider text-sm">Email</th>
                <th className="px-8 py-6 font-bold text-temple-maroon uppercase tracking-wider text-sm">Current Role</th>
                <th className="px-8 py-6 font-bold text-temple-maroon uppercase tracking-wider text-sm">Permissions (Sub-Admin Only)</th>
                <th className="px-8 py-6 font-bold text-temple-maroon uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-temple-gold/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-temple-cream flex items-center justify-center text-temple-maroon font-bold border border-temple-gold/20">
                          {user.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <span className="font-bold">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-500">{user.email}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'subadmin' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {user.role === 'subadmin' && (
                      <div className="flex flex-wrap gap-2">
                        <label className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-200">
                          <input 
                            type="checkbox" 
                            checked={user.permissions?.manageEvents ?? true} 
                            onChange={(e) => updatePermissions(user.uid, { 
                              manageEvents: e.target.checked,
                              manageGallery: user.permissions?.manageGallery ?? true,
                              manageTimings: user.permissions?.manageTimings ?? true
                            })}
                          />
                          <span>Events</span>
                        </label>
                        <label className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-200">
                          <input 
                            type="checkbox" 
                            checked={user.permissions?.manageGallery ?? true} 
                            onChange={(e) => updatePermissions(user.uid, { 
                              manageEvents: user.permissions?.manageEvents ?? true,
                              manageGallery: e.target.checked,
                              manageTimings: user.permissions?.manageTimings ?? true
                            })}
                          />
                          <span>Gallery</span>
                        </label>
                        <label className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-200">
                          <input 
                            type="checkbox" 
                            checked={user.permissions?.manageTimings ?? true} 
                            onChange={(e) => updatePermissions(user.uid, { 
                              manageEvents: user.permissions?.manageEvents ?? true,
                              manageGallery: user.permissions?.manageGallery ?? true,
                              manageTimings: e.target.checked
                            })}
                          />
                          <span>Timings</span>
                        </label>
                      </div>
                    )}
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <span className="text-xs text-gray-400 italic">Full Access</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateRole(user.uid, 'subadmin')}
                        disabled={user.role === 'subadmin'}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                        title="Make Sub-Admin"
                      >
                        <UserCheck size={20} />
                      </button>
                      <button
                        onClick={() => updateRole(user.uid, 'admin')}
                        disabled={user.role === 'admin'}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                        title="Make Admin"
                      >
                        <Shield size={20} />
                      </button>
                      <button
                        onClick={() => updateRole(user.uid, 'superadmin')}
                        disabled={user.role === 'superadmin' || !isSuperAdmin}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-30"
                        title={isSuperAdmin ? "Make Super-Admin" : "Only Super-Admin can do this"}
                      >
                        <Star size={20} />
                      </button>
                      <button
                        onClick={() => updateRole(user.uid, 'user')}
                        disabled={user.role === 'user'}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                        title="Remove Admin Access"
                      >
                        <User size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-temple-gold/10"
            >
              <div className="bg-temple-maroon p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Create New Admin</h2>
                  <p className="text-temple-cream/70 text-sm">Add a new administrative account</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="p-8 space-y-6">
                {createError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-temple-gold outline-none transition-all"
                      placeholder="John Doe"
                      value={newAdmin.displayName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, displayName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-temple-gold outline-none transition-all"
                      placeholder="admin@example.com"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
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
                      minLength={6}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-temple-gold outline-none transition-all"
                      placeholder="••••••••"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Initial Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewAdmin({ ...newAdmin, role: 'subadmin' })}
                      className={`py-3 rounded-2xl font-bold border-2 transition-all ${
                        newAdmin.role === 'subadmin'
                          ? 'border-temple-maroon bg-temple-maroon text-white'
                          : 'border-gray-100 text-gray-500 hover:border-temple-gold'
                      }`}
                    >
                      Sub-Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAdmin({ ...newAdmin, role: 'admin' })}
                      className={`py-3 rounded-2xl font-bold border-2 transition-all ${
                        newAdmin.role === 'admin'
                          ? 'border-temple-maroon bg-temple-maroon text-white'
                          : 'border-gray-100 text-gray-500 hover:border-temple-gold'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {newAdmin.role === 'subadmin' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Permissions</label>
                    <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newAdmin.permissions.manageEvents} 
                          onChange={(e) => setNewAdmin({
                            ...newAdmin,
                            permissions: { ...newAdmin.permissions, manageEvents: e.target.checked }
                          })}
                          className="w-5 h-5 rounded border-gray-300 text-temple-maroon focus:ring-temple-maroon"
                        />
                        <span className="text-sm font-medium text-gray-700">Manage Events</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newAdmin.permissions.manageGallery} 
                          onChange={(e) => setNewAdmin({
                            ...newAdmin,
                            permissions: { ...newAdmin.permissions, manageGallery: e.target.checked }
                          })}
                          className="w-5 h-5 rounded border-gray-300 text-temple-maroon focus:ring-temple-maroon"
                        />
                        <span className="text-sm font-medium text-gray-700">Manage Gallery</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newAdmin.permissions.manageTimings} 
                          onChange={(e) => setNewAdmin({
                            ...newAdmin,
                            permissions: { ...newAdmin.permissions, manageTimings: e.target.checked }
                          })}
                          className="w-5 h-5 rounded border-gray-300 text-temple-maroon focus:ring-temple-maroon"
                        />
                        <span className="text-sm font-medium text-gray-700">Manage Timings</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-temple-maroon text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-temple-maroon/20 hover:bg-temple-maroon/90 transition-all disabled:opacity-50"
                  >
                    {isCreating ? 'Creating Account...' : 'Create Admin Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
