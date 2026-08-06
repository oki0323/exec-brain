import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { chatWithSecretary } from '../services/openai';

export default function Chat() {
  const [messages, setMessages] = useState(storage.getChat());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const apiKey = storage.getApiKey();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    if (!apiKey) {
      setError('先に設定画面でOpenAI APIキーを登録してください。');
      return;
    }
    setError('');
    const next = storage.addChatMessage('user', text);
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const openTasks = storage.getTasks().filter(t => !t.done);
      const upcoming = storage.getSchedule().filter(e => e.date).sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')));
      const reply = await chatWithSecretary(next, apiKey, { openTasks, upcoming });
      setMessages(storage.addChatMessage('assistant', reply));
    } catch (e) {
      setError(e.message || '応答の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    if (window.confirm('会話履歴を削除しますか？')) {
      storage.clearChat();
      setMessages([]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - var(--nav-h))' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>💬 AI秘書に相談</h1>
        {messages.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>履歴を削除</button>
        )}
      </div>

      {!apiKey && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--warning)' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            OpenAI APIキーが未設定です。<Link to="/settings" style={{ color: 'var(--accent-light)' }}>設定画面</Link>で登録してください。
          </p>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {messages.length === 0 && (
          <div className="empty-state">
            仕事の相談、タスクの整理、次の一手のアドバイスなど、<br />
            何でも気軽に話しかけてください。
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.role === 'user' ? 'var(--accent-dim)' : 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: 13 }}>
            <span className="spinner" />
            考えています…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{error}</p>}

      <div style={{
        position: 'sticky',
        bottom: 'calc(var(--nav-h) + 12px)',
        display: 'flex',
        gap: 8,
        background: 'var(--bg)',
        paddingTop: 8,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="相談したいことを入力（Enterで送信）"
          rows={2}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
          送信
        </button>
      </div>
    </div>
  );
}
