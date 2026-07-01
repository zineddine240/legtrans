"use client";

import React, { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { db } from "@/integrations/firebase/config";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useTranslations } from "next-intl";

export function MarketingTestimonials() {
  const [liveFeedbacks, setLiveFeedbacks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const t = useTranslations("Testimonials");

  // Default reviews to show if the database has no approved feedbacks
  const defaultReviews = [
    {
      id: "def1",
      name: t("defaults.0.name"),
      role: t("defaults.0.role"),
      rating: 5,
      quote: t("defaults.0.quote")
    },
    {
      id: "def2",
      name: t("defaults.1.name"),
      role: t("defaults.1.role"),
      rating: 5,
      quote: t("defaults.1.quote")
    }
  ];

  useEffect(() => {
    if (!db) return;
    
    // Fetch latest 50 feedbacks
    const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      // Filter only approved ones locally to avoid needing a composite index
      const approvedList = list.filter(f => f.approved === true);
      setLiveFeedbacks(approvedList);
    }, (error) => {
      console.error("Error fetching feedbacks:", error);
    });

    return () => unsubscribe();
  }, []);

  const feedbacksToShow = liveFeedbacks.length >= 2 ? liveFeedbacks : defaultReviews;

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (feedbacksToShow.length <= 2) return; // No need to rotate if 2 or less

    const intervalId = setInterval(() => {
      setFade(false); // trigger fade out
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 2) % feedbacksToShow.length);
        setFade(true); // trigger fade in
      }, 500); // wait half a second for fade out transition
    }, 6000);

    return () => clearInterval(intervalId);
  }, [feedbacksToShow.length]);

  // Get exactly 2 testimonials to show sequentially
  const displayPairs = feedbacksToShow.slice(currentIndex, currentIndex + 2);
  // If we reach the end and only 1 item is remaining, wrap around to grab the first one
  if (displayPairs.length === 1 && feedbacksToShow.length > 1) {
    displayPairs.push(feedbacksToShow[0]);
  }

  return (
    <section className="py-32 bg-[#faf8f3]">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b08d3c]">
            {t("tag")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-dark">
            {t("list.title") || t("title")}
          </h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            {t("desc")}
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
          {displayPairs.map((item, idx) => (
            <div 
              key={item.id || idx} 
              className="bg-white p-8 md:p-10 rounded-3xl border border-[#e5e3dc] shadow-sm relative group hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[260px]"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/5 opacity-40 pointer-events-none" />
              
              <div>
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: item.rating || 5 }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-primary-dark font-medium leading-relaxed mb-8 italic text-lg text-left">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 border-t border-[#faf8f3] pt-6 mt-auto">
                <div className="w-12 h-12 rounded-full bg-[#b08d3c]/10 flex items-center justify-center text-[#b08d3c] font-bold text-lg">
                  {item.name ? item.name[0].toUpperCase() : "T"}
                </div>
                <div className="text-left">
                  <div className="font-bold text-[15px] text-primary-dark">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">{item.role || "Client"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
