"use client";

import { useEffect, useState } from "react";
import { db } from "@/integrations/firebase/config";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { BookOpen, Trophy, Medal, Star, Loader2, Search } from "lucide-react";

interface Submission {
  id: string;
  userId: string | null;
  userName: string;
  originalTerm: string;
  suggestedTranslation: string;
  sourceLang: string;
  targetLang: string;
  category: string;
  createdAt: any;
}

interface UserStats {
  userId: string | null;
  userName: string;
  count: number;
  submissions: Submission[];
}

export default function AdminGlossaryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"leaderboard" | "submissions">("leaderboard");

  useEffect(() => {
    const fetchData = async () => {
      if (!db) return;
      setLoading(true);
      try {
        const q = query(collection(db, "glossary_submissions"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
        setSubmissions(data);

        // Group by userId → compute per-user points
        const statsMap: Record<string, UserStats> = {};
        data.forEach(sub => {
          const key = sub.userId || sub.userName;
          if (!statsMap[key]) {
            statsMap[key] = { userId: sub.userId, userName: sub.userName, count: 0, submissions: [] };
          }
          statsMap[key].count++;
          statsMap[key].submissions.push(sub);
        });

        const sorted = Object.values(statsMap).sort((a, b) => b.count - a.count);
        setUserStats(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSubmissions = submissions.filter(s =>
    s.userName?.toLowerCase().includes(search.toLowerCase()) ||
    s.originalTerm?.toLowerCase().includes(search.toLowerCase()) ||
    s.suggestedTranslation?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = userStats.filter(u =>
    u.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-bold text-gray-400 w-4 text-center">{index + 1}</span>;
  };

  const getBadge = (count: number) => {
    if (count >= 50) return { label: "Maître", color: "bg-amber-100 text-amber-700 border-amber-200" };
    if (count >= 20) return { label: "Expert", color: "bg-blue-100 text-blue-700 border-blue-200" };
    if (count >= 5)  return { label: "Pionnier", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    return { label: "Débutant", color: "bg-gray-100 text-gray-600 border-gray-200" };
  };

  const formatDate = (ts: any) => {
    if (!ts) return "—";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return "—"; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contributions au Glossaire</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {submissions.length} terme(s) soumis par {userStats.length} utilisateur(s)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("leaderboard")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === "leaderboard" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Classement
          </button>
          <button
            onClick={() => setView("submissions")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === "submissions" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Tous les termes
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={view === "leaderboard" ? "Rechercher un utilisateur..." : "Rechercher un terme..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : view === "leaderboard" ? (
        /* ── LEADERBOARD VIEW ── */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune contribution trouvée</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Badge</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, idx) => {
                  const badge = getBadge(user.count);
                  return (
                    <tr key={user.userId || user.userName} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center">
                          {getRankIcon(idx)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.userName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-gray-800">{user.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-gray-900">{user.count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-gray-400">
                          {user.userId || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* ── ALL SUBMISSIONS VIEW ── */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun terme trouvé</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Terme original</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Traduction</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Langues</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {sub.userName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-gray-700 text-xs">{sub.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{sub.originalTerm}</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold">{sub.suggestedTranslation}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        {sub.sourceLang} → {sub.targetLang}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(sub.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
