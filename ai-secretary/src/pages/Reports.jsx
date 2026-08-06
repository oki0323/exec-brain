import { useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { summarizeReport } from '../services/openai';

export default function Reports() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reports, setReports] = useState(storage.getReports());
  const [expandedId, setExpandedId] = useState(reports[0]?.id ?? null);
  const apiKey = storage.getApiKey();

  async function handleSummarize() {
    const t = text.trim();
    if (!t) return;
    if (!apiKey) {
      setError('先に設定画面でOpenAI APIキーを登録してください。');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await summarizeReport(t, apiKey);
      const list = storage.addReport({ sourceText: t, ...result });
      setReports(list);
      setExpandedId(list[0].id);
      setText('');
    } catch (e) {
      setError(e.message || '要約に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id) {
    setReports(storage.deleteReport(id));
  }

  function handleAddActionItemsToTasks(report) {
    (report.actionItems || []).forEach(item => {
      const label = item.owner || item.due
        ? `${item.task}（${[item.owner, item.due].filter(Boolean).join(' / ')}）`
        : item.task;
      storage.addTask(label);
    });
    window.alert(`${(report.actionItems || []).length}件のアクションアイテムをタスクに追加しました。`);
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>📝 日報・議事録の要約</h1>

      {!apiKey && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--warning)' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            要約機能を使うには、<Link to="/settings" style={{ color: 'var(--accent-light)' }}>設定画面</Link>でAPIキーを登録してください。
          </p>
        </div>
      )}

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="日報・議事録・会議メモなどを貼り付けてください"
        rows={8}
        style={{ marginBottom: 10 }}
      />
      <button className="btn btn-primary btn-full" onClick={handleSummarize} disabled={loading || !text.trim()} style={{ marginBottom: 16 }}>
        {loading ? <span className="spinner" /> : '🪄'} AIに要約してもらう
      </button>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <p className="section-title">要約履歴（{reports.length}）</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reports.length === 0 && <div className="empty-state">まだ要約はありません</div>}
        {reports.map(r => (
          <ReportCard
            key={r.id}
            report={r}
            expanded={expandedId === r.id}
            onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
            onDelete={() => handleDelete(r.id)}
            onAddTasks={() => handleAddActionItemsToTasks(r)}
          />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ report, expanded, onToggle, onDelete, onAddTasks }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }} onClick={onToggle}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
            {new Date(report.createdAt).toLocaleString('ja-JP')}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{report.summary}</div>
        </div>
        <span style={{ color: 'var(--text2)', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {report.decisions?.length > 0 && (
            <div>
              <p className="section-title" style={{ marginBottom: 6 }}>決定事項</p>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text)' }}>
                {report.decisions.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}

          {report.actionItems?.length > 0 && (
            <div>
              <p className="section-title" style={{ marginBottom: 6 }}>アクションアイテム</p>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text)' }}>
                {report.actionItems.map((a, i) => (
                  <li key={i}>
                    {a.task}
                    {(a.owner || a.due) && (
                      <span style={{ color: 'var(--text2)' }}> — {[a.owner, a.due].filter(Boolean).join(' / ')}</span>
                    )}
                  </li>
                ))}
              </ul>
              <button className="btn btn-ghost btn-sm" onClick={onAddTasks} style={{ marginTop: 8 }}>
                タスクに追加
              </button>
            </div>
          )}

          {report.followUps?.length > 0 && (
            <div>
              <p className="section-title" style={{ marginBottom: 6 }}>次回までの確認事項</p>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text)' }}>
                {report.followUps.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          <button className="btn btn-danger btn-sm" onClick={onDelete} style={{ alignSelf: 'flex-start' }}>
            この要約を削除
          </button>
        </div>
      )}
    </div>
  );
}
