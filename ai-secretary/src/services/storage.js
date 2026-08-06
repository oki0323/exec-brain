const KEYS = {
  API_KEY: 'ai_secretary_api_key',
  TASKS: 'ai_secretary_tasks',
  SCHEDULE: 'ai_secretary_schedule',
  REPORTS: 'ai_secretary_reports',
  CHAT: 'ai_secretary_chat',
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

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const storage = {
  // Settings
  getApiKey: () => get(KEYS.API_KEY, '') || (import.meta.env.VITE_OPENAI_API_KEY ?? ''),
  setApiKey: (k) => set(KEYS.API_KEY, k),

  // Tasks — { id, title, done, priority, note, createdAt }
  getTasks: () => get(KEYS.TASKS, []),
  addTask: (title) => {
    const tasks = storage.getTasks();
    tasks.unshift({ id: uid(), title, done: false, priority: null, note: '', createdAt: new Date().toISOString() });
    set(KEYS.TASKS, tasks);
    return tasks;
  },
  toggleTask: (id) => {
    const tasks = storage.getTasks().map(t => t.id === id ? { ...t, done: !t.done } : t);
    set(KEYS.TASKS, tasks);
    return tasks;
  },
  deleteTask: (id) => {
    const tasks = storage.getTasks().filter(t => t.id !== id);
    set(KEYS.TASKS, tasks);
    return tasks;
  },
  applyTaskSuggestions: (suggestions) => {
    // suggestions: [{ id, priority, note }]
    const tasks = storage.getTasks();
    const byId = new Map(suggestions.map(s => [s.id, s]));
    const updated = tasks.map(t => byId.has(t.id) ? { ...t, priority: byId.get(t.id).priority, note: byId.get(t.id).note ?? t.note } : t);
    set(KEYS.TASKS, updated);
    return updated;
  },

  // Schedule / memo entries — { id, text, date, time, kind: 'schedule'|'memo', createdAt }
  getSchedule: () => get(KEYS.SCHEDULE, []),
  addScheduleEntry: (entry) => {
    const list = storage.getSchedule();
    list.unshift({ id: uid(), createdAt: new Date().toISOString(), ...entry });
    set(KEYS.SCHEDULE, list);
    return list;
  },
  deleteScheduleEntry: (id) => {
    const list = storage.getSchedule().filter(e => e.id !== id);
    set(KEYS.SCHEDULE, list);
    return list;
  },

  // Report summaries — { id, sourceText, summary, decisions, actionItems, followUps, createdAt }
  getReports: () => get(KEYS.REPORTS, []),
  addReport: (report) => {
    const list = storage.getReports();
    list.unshift({ id: uid(), createdAt: new Date().toISOString(), ...report });
    set(KEYS.REPORTS, list.slice(0, 50));
    return list;
  },
  deleteReport: (id) => {
    const list = storage.getReports().filter(r => r.id !== id);
    set(KEYS.REPORTS, list);
    return list;
  },

  // Chat history — [{ role: 'user'|'assistant', content, ts }]
  getChat: () => get(KEYS.CHAT, []),
  addChatMessage: (role, content) => {
    const chat = storage.getChat();
    chat.push({ role, content, ts: new Date().toISOString() });
    set(KEYS.CHAT, chat.slice(-60));
    return chat;
  },
  clearChat: () => set(KEYS.CHAT, []),
};
