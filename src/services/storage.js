const KEYS = {
  SCORES: 'exec_brain_scores',
  STREAK: 'exec_brain_streak',
  LAST_PLAYED: 'exec_brain_last_played',
  TUTORIAL_DONE: 'exec_brain_tutorial_done',
  DIFFICULTY: 'exec_brain_difficulty',
  API_KEY: 'exec_brain_api_key',
  HISTORY: 'exec_brain_history',
};

function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // Tutorial
  isTutorialDone: () => get(KEYS.TUTORIAL_DONE, false),
  setTutorialDone: () => set(KEYS.TUTORIAL_DONE, true),
  resetTutorial: () => set(KEYS.TUTORIAL_DONE, false),

  // Settings
  getDifficulty: () => get(KEYS.DIFFICULTY, 'intermediate'),
  setDifficulty: (d) => set(KEYS.DIFFICULTY, d),
  getApiKey: () => get(KEYS.API_KEY, ''),
  setApiKey: (k) => set(KEYS.API_KEY, k),

  // Scores — { logical, creative, numerical, decision, verbal }
  getScores: () =>
    get(KEYS.SCORES, { logical: 0, creative: 0, numerical: 0, decision: 0, verbal: 0 }),
  updateScore: (skill, score) => {
    const scores = storage.getScores();
    const prev = scores[skill] ?? 0;
    scores[skill] = prev === 0 ? score : Math.round((prev * 0.7 + score * 0.3));
    set(KEYS.SCORES, scores);
  },

  // History
  getHistory: () => get(KEYS.HISTORY, []),
  addHistory: (entry) => {
    const history = storage.getHistory();
    history.unshift({ ...entry, date: new Date().toISOString() });
    set(KEYS.HISTORY, history.slice(0, 90));
  },

  // Streak
  getStreak: () => get(KEYS.STREAK, 0),
  getLastPlayed: () => get(KEYS.LAST_PLAYED, null),
  updateStreak: () => {
    const today = new Date().toDateString();
    const last = storage.getLastPlayed();
    let streak = storage.getStreak();
    if (last === today) return streak;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    streak = last === yesterday ? streak + 1 : 1;
    set(KEYS.STREAK, streak);
    set(KEYS.LAST_PLAYED, today);
    return streak;
  },
  hasPlayedToday: () => {
    const today = new Date().toDateString();
    return storage.getLastPlayed() === today;
  },
};
