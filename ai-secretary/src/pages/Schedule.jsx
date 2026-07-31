import { useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { parseScheduleEntry, suggestNextAction } from '../services/openai';

export default function Schedule() {
  const [entries, setEntries] = useState(storage.getSchedule());
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [error, setError] = useState('');
  const [advice, setAdvice] = useState('');
  const apiKey = storage.getApiKey();

  async function handleAdd() {
    const t = text.trim();
    if (!t) return;
    setError('');

    if (!apiKey) {
      setEntries(storage.addScheduleEntry({ text: t, date: null, time: null, kind: 'memo' }));
      setText('');
      return;
    }

    setLoading(true);
    try {
      const parsed = await parseScheduleEntry(t, apiKey);
      setEntries(storage.addScheduleEntry({
        text: t,
        title: parsed.title || t.slice(0, 20),
        date: parsed.date || null,
        time: parsed.time || null,
        kind: parsed.kind === 'schedule' ? 'schedule' : 'memo',
      }));
      setText('');
    } catch (e) {
      setError(e.message || '解析に失敗しました。メモとして保存することもできます。');
    } finally {
      setLoading(false);
    }
  }

  function handleAddAsMemo() {
    const t = text.trim();
    if (!t) return;
    setEntries(storage.addScheduleEntry({ text: t, date: null, time: null, kind: 'memo' }));
    setText('');
    setError('');
  }

  function handleDelete(id) {
    setEntries(storage.deleteScheduleEntry(id));
  }

  async function handleAdvice() {
    if (!apiKey) {
      setError('先に設定画面でOpenAI APIキーを登録してください。');
      return;
    }
    setAdviceLoading(true);
    setError('');
    try {
      const result = await suggestNextAction(entries, apiKey);
      setAdvice(result.advice || '');
    } catch (e) {
      setError(e.message || 'アドバイスの取得に失敗しました。');
    } finally {
      setAdviceLoading(false);
    }
  }

  const scheduled = entries
    .filter(e => e.date)
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')));
  const memos = entries.filter(e => !e.date);

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>📅 スケジュール／メモ秘書</h1>

      {!apiKey && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--warning)' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            日付・時刻の自動抽出には、<Link to="/settings" style={{ color: 'var(--accent-light)' }}>設定画面</Link>でAPIキーを登録してください。未設定でもメモとして保存できます。
          </p>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="例：来週火曜の14時に山田さんと打ち合わせ／来期の採用計画についてのメモ"
          rows={2}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-full" onClick={handleAdd} disabled={loading || !text.trim()}>
            {loading ? <span className="spinner" /> : '追加（AIが日時を解析）'}
          </button>
          {apiKey && (
            <button className="btn btn-ghost" onClick={handleAddAsMemo} disabled={loading || !text.trim()}>
              メモとして保存
            </button>
          )}
        </div>
      </div>

      <button
        className="btn btn-ghost btn-full"
        onClick={handleAdvice}
        disabled={adviceLoading || entries.length === 0}
        style={{ marginBottom: 12 }}
      >
        {adviceLoading ? <span className="spinner" /> : '🧭'} 次に取るべきアクションをAIに聞く
      </button>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {advice && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--accent-dim)', borderColor: 'var(--accent)' }}>
          <p style={{ fontSize: 13 }}>🧭 {advice}</p>
        </div>
      )}

      <p className="section-title">予定（{scheduled.length}）</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {scheduled.length === 0 && <div className="empty-state">登録された予定はありません</div>}
        {scheduled.map(e => (
          <EntryRow key={e.id} entry={e} onDelete={handleDelete} />
        ))}
      </div>

      <p className="section-title">メモ（{memos.length}）</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {memos.length === 0 && <div className="empty-state">メモはありません</div>}
        {memos.map(e => (
          <EntryRow key={e.id} entry={e} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

function EntryRow({ entry, onDelete }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {entry.date && (
          <div style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 600, marginBottom: 4 }}>
            {entry.date}{entry.time ? ` ${entry.time}` : ''}
          </div>
        )}
        {entry.title && (
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{entry.title}</div>
        )}
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{entry.text}</div>
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
