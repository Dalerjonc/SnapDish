// Utility functions for managing cooking history

export interface HistoryItem {
  id: number;
  name: string;
  image?: string;
  source: 'identify' | 'ingredients';
  date: string;
  recipe?: any; // Full recipe data stored for offline access
}

export const addToHistory = (recipe: any, source: 'identify' | 'ingredients') => {
  if (typeof window === 'undefined') return; // Server-side check
  
  const historyItem: HistoryItem = {
    id: recipe.id,
    name: recipe.name,
    image: recipe.image,
    source,
    date: new Date().toLocaleDateString(),
    recipe: recipe // Store full recipe for offline access
  };
  
  // Get existing history
  const existingHistory = localStorage.getItem('cookingHistory');
  let history: HistoryItem[] = existingHistory ? JSON.parse(existingHistory) : [];
  
  // Remove duplicate if it exists (by id)
  history = history.filter(item => item.id !== recipe.id);
  
  // Add new item to beginning of array
  history.unshift(historyItem);
  
  // Keep only last 50 items to avoid storage issues
  history = history.slice(0, 50);
  
  // Save back to localStorage
  localStorage.setItem('cookingHistory', JSON.stringify(history));
};

export const getHistoryFromStorage = (): HistoryItem[] => {
  if (typeof window === 'undefined') return []; // Server-side check
  
  const existingHistory = localStorage.getItem('cookingHistory');
  return existingHistory ? JSON.parse(existingHistory) : [];
};

export const clearHistory = () => {
  if (typeof window === 'undefined') return; // Server-side check
  
  localStorage.removeItem('cookingHistory');
};