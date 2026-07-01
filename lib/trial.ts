export type TrialAction = 'ocr' | 'doc' | 'text' | 'chat';

export type AccessTier = 'admin' | 'pro' | 'plus' | 'trial' | 'free';

// Limits per tier
export const TIER_LIMITS = {
  admin: { ocrPerDay: Infinity, docPerDay: Infinity, textPerDay: Infinity, chatPerDay: Infinity, maxPages: Infinity, maxOcrPagesPerDay: Infinity, exportFormat: ['docx', 'xlsx'] },
  pro:   { ocrPerDay: 10,       docPerDay: 2,         textPerDay: Infinity, chatPerDay: 30,       maxPages: 5,        maxOcrPagesPerDay: 50,       exportFormat: ['docx', 'xlsx'] },
  plus:  { ocrPerDay: 18,       docPerDay: 10,        textPerDay: Infinity, chatPerDay: 80,       maxPages: 5,        maxOcrPagesPerDay: 90,       exportFormat: ['docx', 'xlsx'] },
  trial: { ocrPerDay: 3,        docPerDay: 1,         textPerDay: Infinity, chatPerDay: 10,       maxPages: 5,        maxOcrPagesPerDay: 15,       exportFormat: ['docx', 'xlsx'] },
  free:  { ocrPerDay: 1,        docPerDay: 0,         textPerDay: Infinity, chatPerDay: 3,        maxPages: 1,        maxOcrPagesPerDay: 1,        exportFormat: ['docx', 'xlsx'] },
};

export function getAlgeriaDateKey(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Algiers',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
}

/**
 * Determine the effective access tier for a user.
 * Reads subscription from profile (Firestore) and trial state from localStorage.
 */
export function getAccessTier(profile: any): AccessTier {
  if (!profile) return 'free';
  if (profile.is_admin) return 'admin';

  const tier = profile.subscription_tier || profile.plan;
  if (tier === 'pro')  return 'pro';
  if (tier === 'plus') return 'plus';

  // Check if trial is still valid
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('legtrans_trial_v2');
      const trialData = raw ? JSON.parse(raw) : null;
      if (trialData) {
        const daysSinceStart = Math.floor((Date.now() - trialData.startDate) / (1000 * 60 * 60 * 24));
        if (daysSinceStart < 7) return 'trial';
      }
    } catch (_) {}
  }

  return 'free'; // trial expired → free tier (not blocked)
}

export function checkTrialLimits(action: TrialAction, isAdmin?: boolean, profile?: any): { allowed: boolean; error?: string; tier?: AccessTier } {
  if (isAdmin) return { allowed: true, tier: 'admin' };
  if (typeof window === 'undefined') return { allowed: true };

  const tier = profile ? getAccessTier(profile) : _getTierFromLocalStorage();
  const limits = TIER_LIMITS[tier];

  const now = new Date();
  const today = getAlgeriaDateKey();
  let trialData: any;

  try {
    const raw = localStorage.getItem('legtrans_trial_v2');
    trialData = raw ? JSON.parse(raw) : null;
  } catch (_) { trialData = null; }

  if (!trialData) {
    trialData = { startDate: now.getTime(), dailyUsage: { date: today, ocrCount: 0, ocrPagesCount: 0, docCount: 0, textCount: 0 } };
    localStorage.setItem('legtrans_trial_v2', JSON.stringify(trialData));
  }

  // Reset daily counts if new day
  if (trialData.dailyUsage.date !== today) {
    trialData.dailyUsage = { date: today, ocrCount: 0, ocrPagesCount: 0, docCount: 0, textCount: 0 };
    localStorage.setItem('legtrans_trial_v2', JSON.stringify(trialData));
  }

  // Doc translation disabled for free tier
  if (action === 'doc' && limits.docPerDay === 0) {
    return { allowed: false, error: 'doc_disabled_free', tier };
  }

  if (action === 'ocr' && trialData.dailyUsage.ocrCount >= limits.ocrPerDay) {
    return { allowed: false, error: tier === 'free' ? 'limit_reached_ocr_free' : 'limit_reached_ocr', tier };
  }

  if (action === 'ocr' && (trialData.dailyUsage.ocrPagesCount || 0) >= limits.maxOcrPagesPerDay) {
    return { allowed: false, error: 'limit_reached_ocr_pages', tier };
  }

  if (action === 'doc' && trialData.dailyUsage.docCount >= limits.docPerDay) {
    return { allowed: false, error: 'limit_reached_doc', tier };
  }

  if (action === 'text' && limits.textPerDay !== Infinity && (trialData.dailyUsage.textCount || 0) >= limits.textPerDay) {
    return { allowed: false, error: 'limit_reached_text_free', tier };
  }

  return { allowed: true, tier };
}

function _getTierFromLocalStorage(): AccessTier {
  try {
    const raw = localStorage.getItem('legtrans_trial_v2');
    const trialData = raw ? JSON.parse(raw) : null;
    if (trialData) {
      const daysSinceStart = Math.floor((Date.now() - trialData.startDate) / (1000 * 60 * 60 * 24));
      if (daysSinceStart < 7) return 'trial';
    }
  } catch (_) {}
  return 'free';
}

export function incrementTrialUsage(action: TrialAction, isAdmin?: boolean, pagesCount: number = 1) {
  if (isAdmin) return;
  if (typeof window === 'undefined') return;
  const today = getAlgeriaDateKey();

  try {
    const raw = localStorage.getItem('legtrans_trial_v2');
    if (!raw) return;
    const trialData = JSON.parse(raw);

    // Determine tier to decide whether to reset
    const daysSinceStart = Math.floor((new Date().getTime() - trialData.startDate) / (1000 * 60 * 60 * 24));
    const tier = daysSinceStart < 7 ? 'trial' : 'free';

    if (trialData.dailyUsage.date !== today) {
      trialData.dailyUsage = { date: today, ocrCount: 0, ocrPagesCount: 0, docCount: 0, textCount: 0 };
    }

    if (action === 'ocr') {
      trialData.dailyUsage.ocrCount  = (trialData.dailyUsage.ocrCount  || 0) + 1;
      trialData.dailyUsage.ocrPagesCount = (trialData.dailyUsage.ocrPagesCount || 0) + pagesCount;
    }
    if (action === 'doc')  trialData.dailyUsage.docCount  = (trialData.dailyUsage.docCount  || 0) + 1;
    if (action === 'text') trialData.dailyUsage.textCount = (trialData.dailyUsage.textCount || 0) + 1;

    localStorage.setItem('legtrans_trial_v2', JSON.stringify(trialData));
  } catch (_) {}
}

export function getTrialStats(isAdmin?: boolean, profile?: any) {
  if (isAdmin) return { daysLeft: '∞' as any, todayLeftOcr: '∞' as any, todayLeftOcrPages: '∞' as any, todayLeftDoc: '∞' as any, countOcr: 0, countOcrPages: 0, countDoc: 0, countText: 0, isAdmin: true, tier: 'admin' as AccessTier };
  if (typeof window === 'undefined') return null;

  const now = new Date();
  const today = getAlgeriaDateKey();

  try {
    let raw = localStorage.getItem('legtrans_trial_v2');
    if (!raw) {
      const oldRaw = localStorage.getItem('legtrans_trial');
      const oldData = oldRaw ? JSON.parse(oldRaw) : null;
      const initialData = {
        startDate: oldData ? oldData.startDate : now.getTime(),
        dailyUsage: { date: today, ocrCount: (oldData?.dailyUsage?.date === today ? oldData.dailyUsage.count : 0), ocrPagesCount: 0, docCount: 0, textCount: 0 },
      };
      localStorage.setItem('legtrans_trial_v2', JSON.stringify(initialData));
      raw = JSON.stringify(initialData);
    }

    const trialData = JSON.parse(raw);

    const daysSinceStart = Math.floor((now.getTime() - trialData.startDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 7 - daysSinceStart);
    const tier: AccessTier = profile ? getAccessTier(profile) : (daysLeft > 0 ? 'trial' : 'free');

    if (trialData.dailyUsage.date !== today) {
      trialData.dailyUsage = { date: today, ocrCount: 0, ocrPagesCount: 0, docCount: 0, textCount: 0 };
      localStorage.setItem('legtrans_trial_v2', JSON.stringify(trialData));
    }


    const limits = TIER_LIMITS[tier];

    const countOcr  = trialData.dailyUsage.ocrCount  || 0;
    const countOcrPages = trialData.dailyUsage.ocrPagesCount || 0;
    const countDoc  = trialData.dailyUsage.docCount  || 0;
    const countText = trialData.dailyUsage.textCount || 0;

    const todayLeftOcr = limits.ocrPerDay === Infinity ? '∞' : Math.max(0, limits.ocrPerDay - countOcr);
    const todayLeftOcrPages = limits.maxOcrPagesPerDay === Infinity ? '∞' : Math.max(0, limits.maxOcrPagesPerDay - countOcrPages);
    const todayLeftDoc = limits.docPerDay === 0 ? 0 : limits.docPerDay === Infinity ? '∞' : Math.max(0, limits.docPerDay - countDoc);

    return { daysLeft, todayLeftOcr, todayLeftOcrPages, todayLeftDoc, countOcr, countOcrPages, countDoc, countText, isAdmin: false, tier };
  } catch (_) {
    return null;
  }
}
