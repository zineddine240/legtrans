"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { db } from "@/integrations/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import {
  CreditCard,
  Receipt,
  Download,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const t = useTranslations("Billing");
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, "payments"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(fetched);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [user]);

  const subscriptionTier = profile?.subscription_tier || profile?.plan || "free_trial";
  const isPaid = profile?.is_admin || subscriptionTier === "pro" || subscriptionTier === "plus";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf8f3" }}>
      <TopBar />

      {/* Page header */}
      <div className="bg-white border-b px-4 sm:px-8 py-5" style={{ borderColor: "#e5e3dc" }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[22px] font-bold" style={{ color: "#1a1a1a", letterSpacing: "-0.03em" }}>{t("title")}</h1>
          <p className="text-[13px] font-medium mt-1" style={{ color: "#8a8a8a" }}>{t("subtitle")}</p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-6">
        
        {/* Active Subscription Card */}
        <div className="rounded-2xl bg-white overflow-hidden p-6" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(13,110,78,0.08)" }}>
                <CreditCard className="w-5 h-5" style={{ color: "#0d6e4e" }} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold" style={{ color: "#1a1a1a" }}>{t("activeSubscription")}</h2>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full p-4 rounded-xl flex items-center justify-between" style={{ background: isPaid ? "rgba(13,110,78,0.04)" : "#f5f3ed", border: `1px solid ${isPaid ? "rgba(13,110,78,0.2)" : "#e5e3dc"}` }}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: isPaid ? "#0d6e4e" : "#8a8a8a" }}>{t("plan")}</p>
                <p className="text-[20px] font-black capitalize" style={{ color: isPaid ? "#0d6e4e" : "#1a1a1a", letterSpacing: "-0.03em" }}>
                  {subscriptionTier === "free_trial" ? "Essai Gratuit" : subscriptionTier}
                </p>
              </div>
              {isPaid && <CheckCircle2 className="w-8 h-8" style={{ color: "#0d6e4e" }} />}
            </div>

            {profile?.subscription_expires_at && isPaid && (
              <div className="flex-1 w-full p-4 rounded-xl flex items-center justify-between bg-white" style={{ border: "1px solid #e5e3dc" }}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t("validUntil")}</p>
                  <p className="text-[15px] font-semibold text-gray-800">
                    {new Date(profile.subscription_expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "#f0ede8" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(30,64,175,0.08)" }}>
                <Receipt className="w-4 h-4" style={{ color: "#1e40af" }} />
              </div>
              <h2 className="text-[15px] font-bold" style={{ color: "#1a1a1a" }}>{t("history")}</h2>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-[13px] text-gray-400 italic">
                {t("noHistory")}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafaf9]">
                    <th className="py-3 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f0ede8]">{t("date")}</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f0ede8]">{t("reference")}</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f0ede8]">{t("plan")}</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f0ede8]">{t("amount")}</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f0ede8]">{t("status")}</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f0ede8] text-right">{t("invoice")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const d = payment.paidAt?.toDate ? payment.paidAt.toDate() : new Date(payment.paidAt);
                    return (
                      <tr key={payment.id} className="hover:bg-[#faf8f3] transition-colors border-b border-[#f0ede8] last:border-0">
                        <td className="py-4 px-6 text-[13px] font-medium text-gray-800">
                          {d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-4 px-6 text-[12px] font-mono text-gray-500">
                          {payment.paymentReference?.substring(0, 8)}...
                        </td>
                        <td className="py-4 px-6 text-[13px] font-bold text-gray-800 capitalize">
                          LegTrans {payment.plan}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-bold text-gray-800">
                          {payment.amount} DZD
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(13,110,78,0.1)", color: "#0d6e4e" }}>
                            {t("paid")}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            disabled
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#e5e3dc] text-gray-400 bg-gray-50 cursor-not-allowed"
                            title="Prochainement"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {t("download")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
