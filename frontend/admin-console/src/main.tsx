import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Status = 'submitted' | 'reviewed' | 'contacted';
type Panel = 'overview' | 'materials' | 'review';
type Material = { id: string; title: string; url: string; kind: string; hostname: string; previewTitle?: string; description?: string };
type StatusLog = { id: string; fromStatus: Status | null; toStatus: Status; note?: string; createdAt: string };
type Registration = {
  id: string;
  status: Status;
  studentName: string;
  gender?: string;
  nationalityRegion?: string;
  documentType?: string;
  documentTypeLabel?: string;
  documentNumber?: string;
  birthDate?: string;
  school?: string;
  gradeClass?: string;
  supervisingOrganization?: string;
  teacherName?: string;
  teacherCountryCode?: string;
  teacherPhone?: string;
  teacherEmail?: string;
  personalCountryCode?: string;
  phone?: string;
  studentEmail: string;
  backupContact?: string;
  guardianName?: string;
  guardianCountryCode?: string;
  guardianPhone?: string;
  techStack?: string[];
  bringProject?: boolean;
  longTermInterest?: boolean;
  locale?: string;
  trackName?: string;
  trackCode?: string;
  materials: Material[];
  submissionSummary?: string;
  awards?: string;
  submittedAt: string;
  statusLogs?: StatusLog[];
};
type ListResult = { items: Registration[]; total: number; stats: Record<Status | 'total', number> };
type InfoBlock = { title: string; tone?: string; rows: (string | undefined)[] };
type Feedback = { type: 'success' | 'error'; message: string } | null;

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const TOKEN_KEY = 'ai-registration-admin-token';
const statusSteps = ['submitted', 'reviewed', 'contacted'] as const;
const panelOrder = ['overview', 'materials', 'review'] as const;
const statusLabels: Record<Status, string> = { submitted: '已提交', reviewed: '已审核', contacted: '已联系' };
const statusEn: Record<Status, string> = { submitted: 'Submitted', reviewed: 'Reviewed', contacted: 'Contacted' };
const statusTone: Record<Status, string> = { submitted: '晨蓝', reviewed: '极光青', contacted: '暖金' };
const regionLabels: Record<string, string> = {
  mainland: '中国大陆', hongkong: '中国香港', macao: '中国澳门', taiwan: '中国台湾', 'united-states': 'United States', singapore: 'Singapore', 'united-kingdom': 'United Kingdom', canada: 'Canada', other: 'Other'
};
const genderLabels: Record<string, string> = { male: '男 / Male', female: '女 / Female' };
const panelLabels: Record<Panel, string> = { overview: '资料光谱', materials: '材料预览', review: '审核记录' };

function maskDocument(value?: string) {
  if (!value) return '未填';
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}${'•'.repeat(Math.min(8, value.length - 6))}${value.slice(-3)}`;
}

function formatDate(value?: string) {
  if (!value) return '未提交';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function initials(name?: string) {
  const clean = String(name || '?').trim();
  return clean.slice(0, Math.min(2, clean.length)).toUpperCase();
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [query, setQuery] = useState('');
  const [data, setData] = useState<ListResult>({ items: [], total: 0, stats: { total: 0, submitted: 0, reviewed: 0, contacted: 0 } });
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<Registration | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [previewMode, setPreviewMode] = useState<'iframe' | 'list'>('iframe');
  const [activePanel, setActivePanel] = useState<Panel>('overview');
  const selectedIndex = useMemo(() => data.items.findIndex((item) => item.id === selectedId), [data.items, selectedId]);
  const currentStatusIndex = detail ? statusSteps.indexOf(detail.status) : -1;
  const completion = data.stats.total ? Math.round(((data.stats.reviewed + data.stats.contacted) / data.stats.total) * 100) : 0;
  const materialCount = detail?.materials?.length || 0;
  const hasFilter = status !== 'all' || query.trim().length > 0;

  function notify(type: 'success' | 'error', message: string) {
    setFeedback({ type, message });
  }

  async function login() {
    setLoginError('');
    try {
      const res = await fetch(`${API}/api/v1/admin/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.token) throw new Error(payload.message || '登录失败，请检查本地管理员账号。');
      localStorage.setItem(TOKEN_KEY, payload.token);
      setToken(payload.token);
    } catch (error) {
      setLoginError(getErrorMessage(error, '登录失败，请确认后端服务已启动。'));
    }
  }

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/registrations?status=${status}&q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || '列表同步失败。');
      setData(payload);
      if (payload.items[0] && !payload.items.some((item: Registration) => item.id === selectedId)) setSelectedId(payload.items[0].id);
      if (!payload.items[0]) { setSelectedId(''); setDetail(null); }
    } catch (error) {
      notify('error', getErrorMessage(error, '列表同步失败，请检查本地 API。'));
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    if (!id || !token) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/registrations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || '详情加载失败。');
      setDetail(payload);
      setSelectedId(id);
    } catch (error) {
      notify('error', getErrorMessage(error, '详情加载失败，请重新选择学生。'));
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus(nextStatus: Status) {
    if (!detail || detail.status === nextStatus || actionBusy) return;
    setActionBusy(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/registrations/${detail.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: nextStatus, note }) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || '状态更新失败。');
      setDetail(payload);
      setNote('');
      notify('success', `已将 ${detail.studentName} 标记为${statusLabels[nextStatus]}。`);
      await load();
    } catch (error) {
      notify('error', getErrorMessage(error, '状态更新失败，请重试。'));
    } finally {
      setActionBusy(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/registrations/export.csv`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('CSV 导出失败。');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `summit-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notify('success', 'CSV 已开始下载。');
    } catch (error) {
      notify('error', getErrorMessage(error, 'CSV 导出失败，请检查管理员登录状态。'));
    } finally {
      setExporting(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setDetail(null);
    setSelectedId('');
  }

  function clearFilters() {
    setStatus('all');
    setQuery('');
  }

  function handlePanelKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const current = panelOrder.indexOf(activePanel);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    setActivePanel(panelOrder[(current + delta + panelOrder.length) % panelOrder.length]);
  }

  useEffect(() => { load(); }, [token, status]);
  useEffect(() => { if (selectedId) loadDetail(selectedId); }, [selectedId]);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  if (!token) return <main className="login-screen">
    <div className="ops-sky" aria-hidden="true"><span /><span /><span /></div>
    <section className="login-card">
      <p className="eyebrow">Local Review Command</p>
      <h1>光谱审核舱</h1>
      <p className="login-card__copy">承接报名页的“光的语言”，为组委会运营人员提供学生资料、URL 材料预览、状态流转与 CSV 导出的本地审核入口。</p>
      <div className="login-grid"><label>用户名<input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></label><label>密码<input value={password} type="password" onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label></div>
      <button onClick={login}>进入审核指挥台</button>
      {loginError && <p className="error" role="alert">{loginError}</p>}
    </section>
  </main>;

  return <main className="ops-shell">
    <div className="ops-sky" aria-hidden="true"><span /><span /><span /></div>
    {feedback && <div className={`ops-toast ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</div>}
    <header className="ops-topbar">
      <div className="brand-mark"><i /> <span><strong>国际少年AI未来峰会</strong><small>Review Command / Local JSON</small></span></div>
      <div className="topbar-pulse"><span>{new Date().toLocaleDateString('zh-CN')}</span><b>{loading || detailLoading ? 'SYNCING' : 'LIVE'}</b></div>
      <button className="ghost-action" onClick={logout}>退出</button>
    </header>

    <section className="mission-hero mission-hero--compact">
      <div className="mission-title"><p className="eyebrow">Dashboard</p><h1>报名审核光谱</h1><p>面向本地 JSON 数据的审核指挥中心：先看队列与风险，再进入学生详情、材料预览和状态推进。</p></div>
      <div className="orbit-stats" aria-label="报名状态统计">
        <StatCard label="全部申请" value={data.stats.total} accent="total" />
        <StatCard label="待处理" value={data.stats.submitted} accent="submitted" />
        <StatCard label="已审核" value={data.stats.reviewed} accent="reviewed" />
        <StatCard label="已联系" value={data.stats.contacted} accent="contacted" />
        <article className="completion-ring" style={{ '--completion': `${completion}%` } as React.CSSProperties}><strong>{completion}%</strong><span>处理进度</span></article>
      </div>
    </section>

    <section className="ops-workspace">
      <aside className="control-deck">
        <div className="deck-head"><p className="eyebrow">Control</p><h2>筛选与导出</h2></div>
        <div className="status-segment" role="group" aria-label="状态筛选">
          <button aria-pressed={status === 'all'} className={status === 'all' ? 'active' : ''} onClick={() => setStatus('all')}>全部</button>
          {statusSteps.map((item) => <button key={item} aria-pressed={status === item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{statusLabels[item]}</button>)}
        </div>
        <label className="search-field"><span>搜索学生 / 学校 / 教师 / 技术栈</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="输入关键词后 Enter" onKeyDown={(e) => e.key === 'Enter' && load()} /></label>
        <label className="select-field"><span>材料预览模式</span><select value={previewMode} onChange={(e) => setPreviewMode(e.target.value as 'iframe' | 'list')}><option value="iframe">内嵌预览</option><option value="list">仅链接列表</option></select></label>
        <div className="deck-actions"><button className="primary-action" onClick={load}>{loading ? '同步中...' : '重新同步'}</button><button className="ghost-action" onClick={exportCsv}>{exporting ? '导出中...' : '导出 CSV'}</button></div>
        <div className="deck-note"><span>Local JSON</span><p>当前管理端不改变后端数据结构，只重新组织审核视图与交互路径。</p></div>
      </aside>

      <section className="applicant-stream" aria-busy={loading}>
        <div className="stream-head"><div><p className="eyebrow">Applicant Stream</p><h2>学生光轨</h2></div><span>{data.total} 条结果</span></div>
        <div className="stream-list">
          {loading && data.items.length === 0 && <SkeletonRows />}
          {!loading && data.items.length === 0 && <div className="empty-state"><strong>暂无符合条件的报名</strong><span>调整筛选或清空搜索后重试。</span>{hasFilter && <button className="ghost-action" onClick={clearFilters}>清空筛选</button>}</div>}
          {data.items.map((item, index) => <ApplicantRow key={item.id} item={item} index={index} active={item.id === selectedId} onSelect={() => { setSelectedId(item.id); setActivePanel('overview'); }} />)}
        </div>
      </section>

      <section className="review-theatre" aria-busy={detailLoading}>{detail ? <>
        {detailLoading && <div className="detail-sync" role="status">正在同步学生详情...</div>}
        <div className="theatre-hero theatre-hero--dense">
          <div className="identity-orb"><span>{initials(detail.studentName)}</span></div>
          <div className="hero-main"><p className="eyebrow">Applicant Detail</p><h2>{detail.studentName}</h2><div className="detail-tags"><span className={`status-pill ${detail.status}`}>{statusLabels[detail.status]} · {statusTone[detail.status]}</span><span>{detail.school || '未填学校'}</span><span>{formatDate(detail.submittedAt)}</span><span>{detail.locale || 'zh-CN'}</span></div></div>
          <ReviewDock detail={detail} note={note} setNote={setNote} currentStatusIndex={currentStatusIndex} updateStatus={updateStatus} busy={actionBusy} openReviewPanel={() => setActivePanel('review')} />
          <div className="switch"><button disabled={selectedIndex <= 0} onClick={() => setSelectedId(data.items[selectedIndex - 1].id)}>上一位</button><button disabled={selectedIndex < 0 || selectedIndex >= data.items.length - 1} onClick={() => setSelectedId(data.items[selectedIndex + 1].id)}>下一位</button></div>
        </div>

        <div className="panel-tabs" role="tablist" aria-label="详情模块" onKeyDown={handlePanelKey}>
          {panelOrder.map((panel) => <button key={panel} id={`tab-${panel}`} role="tab" aria-selected={activePanel === panel} aria-controls={`panel-${panel}`} tabIndex={activePanel === panel ? 0 : -1} className={activePanel === panel ? 'active' : ''} onClick={() => setActivePanel(panel)}>{panelLabels[panel]}{panel === 'materials' && <em>{materialCount}</em>}</button>)}
        </div>

        <div id={`panel-${activePanel}`} role="tabpanel" aria-labelledby={`tab-${activePanel}`}>
          {activePanel === 'overview' && <OverviewPanel detail={detail} />}
          {activePanel === 'materials' && <MaterialsPanel detail={detail} previewMode={previewMode} onFeedback={notify} />}
          {activePanel === 'review' && <ReviewPanel detail={detail} note={note} setNote={setNote} currentStatusIndex={currentStatusIndex} updateStatus={updateStatus} busy={actionBusy} />}
        </div>
      </> : <div className="detail-empty"><strong>等待选择学生</strong><span>从左侧学生光轨中选择一位申请者，查看完整资料与材料预览。</span></div>}</section>
    </section>
  </main>;
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return <article className={`stat-card ${accent}`}><span>{label}</span><strong>{value}</strong></article>;
}

function SkeletonRows() {
  return <div className="skeleton-stack" aria-hidden="true">{Array.from({ length: 5 }).map((_, index) => <span key={index} />)}</div>;
}

function ApplicantRow({ item, index, active, onSelect }: { item: Registration; index: number; active: boolean; onSelect: () => void }) {
  const stack = item.techStack?.slice(0, 2).join(' / ') || '待补充技术栈';
  return <button className={active ? 'applicant-row active' : 'applicant-row'} onClick={onSelect} aria-pressed={active}>
    <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
    <span className={`status-pill ${item.status}`}>{statusLabels[item.status]}</span>
    <b>{item.studentName}</b>
    <small>{item.school || item.trackName || '未填学校'}</small>
    <small>{item.studentEmail}</small>
    <em>{stack}</em>
  </button>;
}

function ReviewDock({ detail, note, setNote, currentStatusIndex, updateStatus, busy, openReviewPanel }: { detail: Registration; note: string; setNote: (value: string) => void; currentStatusIndex: number; updateStatus: (next: Status) => void; busy: boolean; openReviewPanel: () => void }) {
  const nextStatus = statusSteps[currentStatusIndex + 1];
  return <aside className="review-dock" aria-label="快速审核动作">
    <div className="review-dock__head"><span>Next Action</span><strong>{nextStatus ? `推进为${statusLabels[nextStatus]}` : '审核流程已完成'}</strong></div>
    <MiniFlow currentStatusIndex={currentStatusIndex} />
    <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="快速备注：例如已确认材料可公开预览。" />
    <div className="review-dock__actions"><button className="primary-action" disabled={!nextStatus || busy} onClick={() => nextStatus && updateStatus(nextStatus)}>{busy ? '更新中...' : nextStatus ? `确认 ${statusLabels[nextStatus]}` : '已完成'}</button><button className="ghost-action" onClick={openReviewPanel}>查看记录</button></div>
  </aside>;
}

function MiniFlow({ currentStatusIndex }: { currentStatusIndex: number }) {
  return <div className="mini-flow" aria-label="当前审核进度">{statusSteps.map((item, index) => <i key={item} className={index < currentStatusIndex ? 'done' : index === currentStatusIndex ? 'active' : ''}><span>{statusLabels[item]}</span></i>)}</div>;
}

function OverviewPanel({ detail }: { detail: Registration }) {
  const blocks: InfoBlock[] = [
    { title: '身份信息', tone: 'blue', rows: [`${genderLabels[detail.gender || ''] || detail.gender || '未填性别'} · ${regionLabels[detail.nationalityRegion || ''] || detail.nationalityRegion || '未填地区'}`, `${detail.documentTypeLabel || detail.documentType || '证件'} · ${maskDocument(detail.documentNumber)}`, `出生日期：${detail.birthDate || '未填'}`] },
    { title: '学校机构', tone: 'cyan', rows: [`${detail.school || '未填学校'} · ${detail.gradeClass || '未填班级'}`, `带队机构：${detail.supervisingOrganization || '未填'}`, `带队教师：${detail.teacherName || '未填'}`] },
    { title: '联系方式', tone: 'gold', rows: [`${detail.personalCountryCode || ''} ${detail.phone || '未填个人电话'}`, detail.studentEmail, `备用：${detail.backupContact || '未填'}`] },
    { title: '带队教师', tone: 'violet', rows: [`${detail.teacherCountryCode || ''} ${detail.teacherPhone || '未填电话'}`, detail.teacherEmail || '未填邮箱'] },
    { title: '监护人', tone: 'cyan', rows: [detail.guardianName || '未填姓名', `${detail.guardianCountryCode || ''} ${detail.guardianPhone || '未填电话'}`] },
    { title: '技术背景', tone: 'blue', rows: [`技术栈：${detail.techStack?.join(' / ') || '未填'}`, `自带项目展示：${detail.bringProject ? 'Yes' : 'No'}`, `长期项目意向：${detail.longTermInterest ? 'Yes' : 'No'}`] }
  ];
  return <div className="overview-panel">
    <div className="info-mosaic">{blocks.map((block) => <InfoCard key={block.title} block={block} />)}</div>
    <article className="narrative-card"><div><p className="eyebrow">Narrative</p><h3>项目简介与经历</h3></div><section><span>Project intro</span><p>{detail.submissionSummary || '学生未填写项目简介。'}</p></section><section><span>Awards</span><p>{detail.awards || '学生未填写过往获奖经历。'}</p></section></article>
  </div>;
}

function InfoCard({ block }: { block: InfoBlock }) {
  return <article className={`info-card ${block.tone || ''}`}><span>{block.title}</span>{block.rows.map((row, index) => <p key={index}>{row}</p>)}</article>;
}

function MaterialsPanel({ detail, previewMode, onFeedback }: { detail: Registration; previewMode: 'iframe' | 'list'; onFeedback: (type: 'success' | 'error', message: string) => void }) {
  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      onFeedback('success', '材料链接已复制。');
    } catch {
      onFeedback('error', '复制失败，请手动打开链接。');
    }
  }

  return <article className="materials-panel"><div className="article-head"><div><p className="eyebrow">Material Theatre</p><h3>URL 材料预览</h3></div><span>{detail.materials.length} links</span></div>{detail.materials.length === 0 && <p className="muted">学生暂未提交材料 URL。</p>}{detail.materials.map((material, index) => <div className="material-card" key={material.id}>
    <div className="material-meta"><span>{String(index + 1).padStart(2, '0')} · {material.kind}</span><b>{material.title}</b><small>{material.hostname}</small>{material.description && <p>{material.description}</p>}<div className="material-actions"><a href={material.url} target="_blank" rel="noreferrer">新标签打开</a><button onClick={() => copyUrl(material.url)}>复制链接</button></div></div>
    <MaterialPreview material={material} previewMode={previewMode} />
  </div>)}</article>;
}

function MaterialPreview({ material, previewMode }: { material: Material; previewMode: 'iframe' | 'list' }) {
  const [loaded, setLoaded] = useState(false);
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (previewMode !== 'iframe') return;
    setLoaded(false);
    setStalled(false);
    const timer = window.setTimeout(() => setStalled(true), 900);
    return () => window.clearTimeout(timer);
  }, [material.url, previewMode]);

  if (previewMode === 'list') return <div className="preview-link"><code>{material.url}</code></div>;

  return <div className={`preview-window ${loaded ? 'loaded' : ''} ${stalled && !loaded ? 'stalled' : ''}`}>
    {!loaded && <div className="preview-overlay"><strong>{stalled ? '可能无法内嵌预览' : '加载预览中'}</strong><span>{stalled ? '外部站点可能禁止 iframe，请使用“新标签打开”。' : '正在尝试生成材料窗口。'}</span></div>}
    <iframe src={material.url} title={material.title} sandbox="allow-same-origin allow-scripts allow-forms" onLoad={() => setLoaded(true)} onError={() => setStalled(true)} />
    <p className="preview-hint">若看到空白或安全拦截，这是外部网站限制嵌入；请直接新标签打开核验。</p>
  </div>;
}

function ReviewPanel({ detail, note, setNote, currentStatusIndex, updateStatus, busy }: { detail: Registration; note: string; setNote: (value: string) => void; currentStatusIndex: number; updateStatus: (next: Status) => void; busy: boolean }) {
  return <div className="review-panel">
    <article className="review-card"><div className="article-head"><div><p className="eyebrow">Review Flow</p><h3>状态推进</h3></div><span>{statusEn[detail.status]}</span></div><StatusFlow currentStatusIndex={currentStatusIndex} updateStatus={updateStatus} busy={busy} /><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="状态备注（可选）：例如，已电话确认材料公开权限。" /></article>
    <article className="timeline-card"><div><p className="eyebrow">Timeline</p><h3>状态记录</h3></div>{detail.statusLogs?.length ? detail.statusLogs.map((log) => <p key={log.id}><span>{statusLabels[log.toStatus]}</span>{new Date(log.createdAt).toLocaleString()} {log.note ? `· ${log.note}` : ''}</p>) : <p className="muted">暂无状态记录。</p>}</article>
  </div>;
}

function StatusFlow({ currentStatusIndex, updateStatus, busy }: { currentStatusIndex: number; updateStatus: (next: Status) => void; busy: boolean }) {
  return <div className="status-flow">{statusSteps.map((item, index) => <button key={item} className={index === currentStatusIndex ? 'active' : index < currentStatusIndex ? 'done' : ''} disabled={index <= currentStatusIndex || busy} onClick={() => updateStatus(item)}><span>{String(index + 1).padStart(2, '0')}</span>{statusLabels[item]}<small>{statusEn[item]}</small></button>)}</div>;
}

createRoot(document.getElementById('root')!).render(<App />);
