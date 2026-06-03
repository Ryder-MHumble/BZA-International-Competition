import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Status = 'submitted' | 'reviewed' | 'contacted';
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

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const TOKEN_KEY = 'ai-registration-admin-token';
const statusSteps = ['submitted', 'reviewed', 'contacted'] as const;
const statusLabels: Record<Status, string> = { submitted: '已提交', reviewed: '已审核', contacted: '已联系' };
const statusTone: Record<Status, string> = { submitted: '晨蓝', reviewed: '极光青', contacted: '暖金' };
const regionLabels: Record<string, string> = {
  mainland: '中国大陆', hongkong: '中国香港', macao: '中国澳门', taiwan: '中国台湾', 'united-states': 'United States', singapore: 'Singapore', 'united-kingdom': 'United Kingdom', canada: 'Canada', other: 'Other'
};
const genderLabels: Record<string, string> = { male: '男 / Male', female: '女 / Female' };

function maskDocument(value?: string) {
  if (!value) return '未填';
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}${'•'.repeat(Math.min(8, value.length - 6))}${value.slice(-3)}`;
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
  const [previewMode, setPreviewMode] = useState<'iframe' | 'list'>('iframe');
  const selectedIndex = useMemo(() => data.items.findIndex((item) => item.id === selectedId), [data.items, selectedId]);
  const currentStatusIndex = detail ? statusSteps.indexOf(detail.status) : -1;

  async function login() {
    setLoginError('');
    const res = await fetch(`${API}/api/v1/admin/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const payload = await res.json();
    if (payload.token) {
      localStorage.setItem(TOKEN_KEY, payload.token);
      setToken(payload.token);
      return;
    }
    setLoginError(payload.message || '登录失败，请检查本地管理员账号。');
  }

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/registrations?status=${status}&q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await res.json();
      setData(payload);
      if (payload.items[0] && !payload.items.some((item: Registration) => item.id === selectedId)) setSelectedId(payload.items[0].id);
      if (!payload.items[0]) { setSelectedId(''); setDetail(null); }
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    if (!id || !token) return;
    const res = await fetch(`${API}/api/v1/admin/registrations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setDetail(await res.json());
    setSelectedId(id);
  }

  async function updateStatus(nextStatus: Status) {
    if (!detail || detail.status === nextStatus) return;
    const res = await fetch(`${API}/api/v1/admin/registrations/${detail.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: nextStatus, note }) });
    const payload = await res.json();
    setDetail(payload);
    setNote('');
    load();
  }

  async function exportCsv() {
    const res = await fetch(`${API}/api/v1/admin/registrations/export.csv`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `summit-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => { load(); }, [token, status]);
  useEffect(() => { if (selectedId) loadDetail(selectedId); }, [selectedId]);

  if (!token) return <main className="login-screen">
    <div className="login-orbit" aria-hidden="true" />
    <section className="login-card">
      <p className="eyebrow">Local Admin</p>
      <h1>峰会审核舱</h1>
      <p className="login-card__copy">用于本地测试的国际少年AI未来峰会报名管理入口。登录后可查看 PRD 扩展字段、预览学生提交 URL、切换状态并导出 CSV。</p>
      <label>用户名<input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></label>
      <label>密码<input value={password} type="password" onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
      <button onClick={login}>进入看板</button>
      {loginError && <p className="error" role="alert">{loginError}</p>}
    </section>
  </main>;

  return <main className="console-shell">
    <div className="console-atmosphere" aria-hidden="true" />
    <aside className="command-panel">
      <div className="panel-brand"><p className="eyebrow">Dashboard</p><h1>报名看板</h1><span>International Youth AI Future Summit</span></div>
      <div className="stats" aria-label="报名状态统计">
        <article><strong>{data.stats.total}</strong><span>全部申请</span></article>
        {statusSteps.map((item) => <article key={item} className={item}><strong>{data.stats[item]}</strong><span>{statusLabels[item]}</span></article>)}
      </div>
      <div className="filters">
        <label>状态筛选<select value={status} onChange={(e) => setStatus(e.target.value as Status | 'all')}><option value="all">全部状态</option><option value="submitted">已提交</option><option value="reviewed">已审核</option><option value="contacted">已联系</option></select></label>
        <label>搜索<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="姓名 / 邮箱 / 学校 / 教师 / 技术栈 / 编号" onKeyDown={(e) => e.key === 'Enter' && load()} /></label>
        <label>预览模式<select value={previewMode} onChange={(e) => setPreviewMode(e.target.value as 'iframe' | 'list')}><option value="iframe">详情内嵌预览</option><option value="list">仅链接列表</option></select></label>
        <div className="filter-actions"><button onClick={load}>{loading ? '同步中...' : '搜索'}</button><button className="ghost" onClick={exportCsv}>导出 CSV</button></div>
      </div>
    </aside>

    <section className="student-rail">
      <div className="rail-head"><strong>学生队列</strong><span>{data.total} 条结果</span></div>
      {data.items.length === 0 && <div className="empty">暂无符合条件的报名。</div>}
      {data.items.map((item, index) => <button key={item.id} className={item.id === selectedId ? 'student-row active' : 'student-row'} onClick={() => setSelectedId(item.id)}>
        <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
        <span className={`pill ${item.status}`}>{statusLabels[item.status]}</span>
        <b>{item.studentName}</b>
        <small>{item.school || item.trackName || '未填学校'}</small>
        <small>{item.studentEmail}</small>
      </button>)}
    </section>

    <section className="detail-stage">{detail ? <>
      <div className="detail-hero"><div><p className="eyebrow">Applicant Detail</p><h2>{detail.studentName}</h2><div className="detail-meta"><span className={`pill ${detail.status}`}>{statusLabels[detail.status]} · {statusTone[detail.status]}</span><span>{detail.school || '未填学校'}</span><span>{new Date(detail.submittedAt).toLocaleDateString()}</span><span>{detail.locale || 'zh-CN'}</span></div></div><div className="switch"><button disabled={selectedIndex <= 0} onClick={() => setSelectedId(data.items[selectedIndex - 1].id)}>上一位</button><button disabled={selectedIndex < 0 || selectedIndex >= data.items.length - 1} onClick={() => setSelectedId(data.items[selectedIndex + 1].id)}>下一位</button></div></div>
      <div className="info-grid compact"><Info title="身份信息" rows={[`${genderLabels[detail.gender || ''] || detail.gender || '未填性别'} · ${regionLabels[detail.nationalityRegion || ''] || detail.nationalityRegion || '未填地区'}`, `${detail.documentTypeLabel || detail.documentType || '证件'} · ${maskDocument(detail.documentNumber)}`, `出生日期：${detail.birthDate || '未填'}`]} /><Info title="学校机构" rows={[`${detail.school || '未填学校'} · ${detail.gradeClass || '未填班级'}`, `带队机构：${detail.supervisingOrganization || '未填'}`, `带队教师：${detail.teacherName || '未填'}`]} /><Info title="联系方式" rows={[`${detail.personalCountryCode || ''} ${detail.phone || '未填个人电话'}`, detail.studentEmail, `备用：${detail.backupContact || '未填'}`]} /></div>
      <div className="info-grid"><Info title="带队教师" rows={[`${detail.teacherCountryCode || ''} ${detail.teacherPhone || '未填电话'}`, detail.teacherEmail || '未填邮箱']} /><Info title="监护人" rows={[detail.guardianName || '未填姓名', `${detail.guardianCountryCode || ''} ${detail.guardianPhone || '未填电话'}`]} /><Info title="技术背景" rows={[`技术栈：${detail.techStack?.join(' / ') || '未填'}`, `自带项目展示：${detail.bringProject ? 'Yes' : 'No'}`, `长期项目意向：${detail.longTermInterest ? 'Yes' : 'No'}`]} /></div>
      <article className="narrative-box"><h3>项目简介与经历</h3><p>{detail.submissionSummary || '学生未填写项目简介。'}</p><p>{detail.awards || '学生未填写过往获奖经历。'}</p></article>
      <article className="material-stage"><div className="article-head"><h3>URL 材料预览</h3><span>{detail.materials.length} links</span></div>{detail.materials.length === 0 && <p className="muted">学生暂未提交材料 URL。</p>}{detail.materials.map((material) => <div className="material" key={material.id}><div className="material__meta"><span>{material.kind}</span><b>{material.title}</b><small>{material.hostname}</small>{material.description && <p>{material.description}</p>}<div className="material__actions"><a href={material.url} target="_blank" rel="noreferrer">新标签打开</a><button onClick={() => navigator.clipboard.writeText(material.url)}>复制链接</button></div></div>{previewMode === 'iframe' ? <div className="preview-window"><iframe src={material.url} title={material.title} sandbox="allow-same-origin allow-scripts allow-forms" /></div> : <div className="preview-link"><code>{material.url}</code></div>}</div>)}</article>
      <article className="review-box"><h3>审核动作</h3><div className="status-flow">{statusSteps.map((item, index) => <button key={item} className={index === currentStatusIndex ? 'active' : index < currentStatusIndex ? 'done' : ''} disabled={index <= currentStatusIndex} onClick={() => updateStatus(item)}><span>{String(index + 1).padStart(2, '0')}</span>{statusLabels[item]}</button>)}</div><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="状态备注（可选）" /></article>
      <article className="timeline"><h3>状态记录</h3>{detail.statusLogs?.map((log) => <p key={log.id}><span>{statusLabels[log.toStatus]}</span>{new Date(log.createdAt).toLocaleString()} {log.note ? `· ${log.note}` : ''}</p>)}</article>
    </> : <div className="detail-empty">请选择一位学生查看材料与审核状态。</div>}</section>
  </main>;
}

function Info({ title, rows }: { title: string; rows: (string | undefined)[] }) {
  return <article><span>{title}</span>{rows.map((row, index) => <p key={index}>{row}</p>)}</article>;
}

createRoot(document.getElementById('root')!).render(<App />);
