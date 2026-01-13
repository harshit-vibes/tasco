/**
 * Storage utilities for tracking tour completion state.
 * Uses localStorage to persist tour completion across sessions.
 */

const TOUR_STORAGE_KEY = "tasco-tours-seen";

interface TourStorage {
  [appId: string]: {
    [tourId: string]: boolean;
  };
}

function getStorage(): TourStorage {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStorage(storage: TourStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(storage));
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Check if a user has seen a specific tour
 */
export function hasSeenTour(appId: string, tourId: string): boolean {
  const storage = getStorage();
  return storage[appId]?.[tourId] ?? false;
}

/**
 * Mark a tour as seen/completed
 */
export function markTourAsSeen(appId: string, tourId: string): void {
  const storage = getStorage();
  if (!storage[appId]) storage[appId] = {};
  storage[appId][tourId] = true;
  setStorage(storage);
}

/**
 * Reset a specific tour so it shows again
 */
export function resetTour(appId: string, tourId: string): void {
  const storage = getStorage();
  if (storage[appId]) {
    delete storage[appId][tourId];
    setStorage(storage);
  }
}

/**
 * Reset all tours for an app, or all tours globally
 */
export function resetAllTours(appId?: string): void {
  if (appId) {
    const storage = getStorage();
    delete storage[appId];
    setStorage(storage);
  } else {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    }
  }
}
