"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { Search, Loader2, MoreHorizontal, FileDown, ShieldCheck, Clock, Award } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, "profiles"), orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(list);
      } catch (err) {
        console.error("Erreur de récupération des utilisateurs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const toggleUserVerification = async (userId: string, currentStatus?: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, "profiles", userId), { is_verified: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: newStatus } : u));
    } catch (err) {
      console.error("Erreur de mise à jour de la vérification:", err);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus?: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await updateDoc(doc(db, "profiles", userId), { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error("Erreur de mise à jour du statut:", err);
    }
  };

  const toggleUserAdmin = async (userId: string, currentAdmin?: boolean) => {
    try {
      const newAdmin = !currentAdmin;
      await updateDoc(doc(db, "profiles", userId), { is_admin: newAdmin });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: newAdmin } : u));
    } catch (err) {
      console.error("Erreur de mise à jour du rôle admin:", err);
    }
  };

  const deleteUser = async (userId: string, displayName: string) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le membre "${displayName || 'Utilisateur'}" ? Cette action supprimera sa fiche de profil.`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "profiles", userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Erreur de suppression de l'utilisateur:", err);
    }
  };

  const updateUserSubscription = async (userId: string, tier: string) => {
    try {
      const updates: any = { 
        subscription_tier: tier,
        plan: tier
      };
      
      if (tier === 'free_trial') {
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);
        updates.trial_expires_at = trialExpiresAt;
      } else if (tier === 'pro' || tier === 'plus') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        updates.subscriptionExpiresAt = expiresAt;
        updates.subscription_expires_at = expiresAt.toISOString();
        updates.subscriptionStatus = "active";
        updates.status = "active";
        updates.dailyOcrLimit = tier === 'pro' ? 30 : 60;
        updates.dailyAiDocumentLimit = tier === 'pro' ? 1 : 5;
      }
      
      await updateDoc(doc(db, "profiles", userId), updates);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    } catch (err) {
      console.error("Erreur de mise à jour de l'abonnement:", err);
    }
  };

  const getTrialDaysRemaining = (user: any) => {
    const trialExpiresAt = user.trial_expires_at;
    const createdAt = user.created_at || user.createdAt;
    
    // Most reliable: calculate strictly from created_at
    if (createdAt) {
      const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      const trialEndDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const diffTime = trialEndDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }

    // Fallback
    if (!trialExpiresAt) return 0;
    const expiry = trialExpiresAt.toDate ? trialExpiresAt.toDate() : new Date(trialExpiresAt);
    const diffTime = expiry.getTime() - new Date().getTime();
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Force cap to 7 days to hide old 14-day values
    if (diffDays > 7) diffDays = 7;
    
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredUsers = users.filter(u => 
    (u.display_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.professional_title?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un membre par nom ou titre..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <FileDown className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Titre / Profession</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Abonnement / Essai</th>
                <th className="px-6 py-4">Date d'inscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                    <p className="text-gray-500 mt-2 text-sm">Chargement des membres...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun membre trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const remainingDays = getTrialDaysRemaining(user);
                  const isTrial = user.subscription_tier === 'free_trial' || !user.subscription_tier;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs shrink-0 border border-gray-200">
                            {user.display_name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {user.display_name || "Utilisateur Anonyme"}
                              {user.is_verified && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                                  Vérifié
                                </span>
                              )}
                              {user.is_admin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5 font-mono">{user.email || "—"}</div>
                            <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-500 mt-1">
                              {user.phone && <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-medium">📞 {user.phone}</span>}
                              {user.license_number && <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-medium">🪪 N° {user.license_number}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-700 font-medium">{user.professional_title || user.profession || "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : user.status || 'Inconnu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isTrial ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded w-max">
                              <Clock className="w-3 h-3" />
                              Essai Gratuit
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {remainingDays} jours restants
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider w-max ${
                              user.subscription_tier === 'plus' 
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              <Award className="w-3.5 h-3.5" />
                              {user.subscription_tier === 'plus' ? '🚀 Plus' : '⭐ Pro'}
                            </span>
                            {user.subscription_expires_at || user.subscriptionExpiresAt ? (
                              <span className="text-[11px] text-gray-500 font-medium">
                                Expire le: {(() => {
                                  const expiryData = user.subscriptionExpiresAt || user.subscription_expires_at;
                                  const date = expiryData.toDate ? expiryData.toDate() : new Date(expiryData);
                                  return date.toLocaleDateString('fr-FR', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  });
                                })()}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">Sans expiration</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                        {user.created_at?.toDate ? new Date(user.created_at.toDate()).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-md hover:bg-gray-100 border border-transparent hover:border-gray-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-xl rounded-xl p-1 z-50">
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Gestion du Membre
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1 bg-gray-100" />
                            
                            <DropdownMenuItem 
                              onClick={() => toggleUserVerification(user.id, user.is_verified)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              {user.is_verified ? "Retirer la vérification" : "Valider/Vérifier le compte"}
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                                user.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {user.status === 'active' ? "Suspendre le compte" : "Activer le compte"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 bg-gray-100" />
                            <DropdownMenuLabel className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Plan d'Abonnement
                            </DropdownMenuLabel>

                            <DropdownMenuItem 
                              onClick={() => updateUserSubscription(user.id, 'free_trial')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              Activer l'Essai Gratuit
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => updateUserSubscription(user.id, 'pro')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors font-medium"
                            >
                              Passer au plan ⭐ Pro
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => updateUserSubscription(user.id, 'plus')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors font-medium"
                            >
                              Passer au plan 🚀 Plus
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 bg-gray-100" />

                            <DropdownMenuItem 
                              onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                            >
                              {user.is_admin ? "Retirer le rôle Admin" : "Nommer Administrateur"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 bg-gray-100" />
                            
                            <DropdownMenuItem 
                              onClick={() => deleteUser(user.id, user.display_name)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors font-medium"
                            >
                              Supprimer le membre
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Total : <strong className="text-gray-900">{filteredUsers.length}</strong> membres enregistrés</span>
        </div>
      </div>
    </div>
  );
}
