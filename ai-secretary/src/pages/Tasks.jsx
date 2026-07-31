import { useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { organizeTasks } from '../services/openai';

export default function Tasks() {
  const [tasks, setTasks] = useState(storage.getTasks());
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState('');
  const apiKey = storage.getApiKey();

  function handleAdd() {
    const t = title.trim();
    if (!t) return;
    setTasks(storage.addTask(t));
    setTitle('');
  }

  function handleToggle(id) {
    setTasks(storage.toggleTask(id));
  }

  function handleDelete(id) {
    setTasks(storage.deleteTask(id));
  }

  async function handleOrganize() {
    const openTasks = tasks.filter(t => !t.done);
    if (openTasks.length === 0) return;
    if (!apiKey) {
      setError('先に設定画面でOpenAI APIキーを登録してください。');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await organizeTasks(openTasks, apiKey);
      setTasks(storage.applyTaskSuggestions(result.suggestions || []));
      setFocus(result.focus || '');
    } catch (e) {
      setError(e.message || 'タスクの整理に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  const open = [...tasks.filter(t => !t.done)].sort((a, b) => {
    if (a.priority == null && b.priority == null) return 0;
    if (a.priority == null) return 1;
    if (b.priority == null) return -1;
    return a.priority - b.priority;
  });
  const done = tasks.filter(t => t.done);

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>✅ タスク管理</h1>

      {!apiKey && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--warning)' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            AIによる整理機能を使うには、<Link to="/settings" style={{ color: 'var(--accent-light)' }}>設定画面</Link>でAPIキーを登録してください。
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="新しいタスクを入力"
        />
        <button className="btn btn-primary" onClick={handleAdd} disabled={!title.trim()}>追加</button>
      </div>

      <button
        className="btn btn-ghost btn-full"
        onClick={handleOrganize}
        disabled={loading || open.length === 0}
        style={{ marginBottom: 12 }}
      >
        {loading ? <span className="spinner" /> : '🪄'} AIに優先順位を整理してもらう
      </button>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {focus && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--accent-dim)', borderColor: 'var(--accent)' }}>
          <p style={{ fontSize: 13 }}>🎯 {focus}</p>
        </div>
      )}

      <p className="section-title">未完了（{open.length}）</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {open.length === 0 && <div className="empty-state">タスクはありません</div>}
        {open.map(t => (
          <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          <p className="section-title">完了済み（{done.length}）</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {done.map(t => (
              <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px' }}>
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          textDecoration: task.done ? 'line-through' : 'none',
          color: task.done ? 'var(--text2)' : 'var(--text)',
        }}>
          {task.priority != null && !task.done && (
            <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', marginRight: 8 }}>
              優先度 {task.priority}
            </span>
          )}
          {task.title}
        </div>
        {task.note && (
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>💡 {task.note}</div>
        )}
      </div>
      <button
        onClick={() => onDelete(task.id)}
        style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
