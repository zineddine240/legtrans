import { useState, useEffect, useCallback } from "react";
import { db } from "@/integrations/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection, query, where, getDocs,
  addDoc, deleteDoc, doc, writeBatch
} from "firebase/firestore";

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

export function useTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTranslations = useCallback(async () => {
    if (!user || !db) {
      setTranslations([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "translations"),
        where("user_id", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const items: Translation[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          source_text: data.source_text || "",
          translated_text: data.translated_text || "",
          source_language: data.source_language || "",
          target_language: data.target_language || "",
          created_at: data.created_at || new Date().toISOString(),
        });
      });

      // Sort by created_at descending in JS memory (bypasses Firestore composite index requirement)
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Limit to 20 latest records
      setTranslations(items.slice(0, 20));
    } catch (error) {
      console.error("Error fetching translations from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const saveTranslation = async (
    sourceText: string,
    translatedText: string,
    sourceLanguage: string = "fr",
    targetLanguage: string = "ar"
  ) => {
    if (!user || !db) return null;

    try {
      const newDoc = {
        user_id: user.uid,
        source_text: sourceText,
        translated_text: translatedText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "translations"), newDoc);
      const saved: Translation = {
        id: docRef.id,
        ...newDoc
      };

      setTranslations((prev) => [saved, ...prev].slice(0, 20));
      return saved;
    } catch (error) {
      console.error("Error saving translation to Firestore:", error);
      return null;
    }
  };

  const deleteTranslation = async (id: string) => {
    if (!user || !db) return false;

    try {
      await deleteDoc(doc(db, "translations", id));
      setTranslations((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting translation from Firestore:", error);
      return false;
    }
  };

  const clearAllTranslations = async () => {
    if (!user || !db) return false;

    try {
      const q = query(
        collection(db, "translations"),
        where("user_id", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();

      setTranslations([]);
      return true;
    } catch (error) {
      console.error("Error clearing translations from Firestore:", error);
      return false;
    }
  };

  return {
    translations,
    loading,
    saveTranslation,
    deleteTranslation,
    clearAllTranslations,
    refetch: fetchTranslations,
  };
}
