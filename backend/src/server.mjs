import http from 'node:http';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import crypto from 'node:crypto';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const DATA_DIR = resolve(ROOT, 'data');
const DB_PATH = resolve(DATA_DIR, 'dev-db.json');
const CATALOG_PATH = resolve(DATA_DIR, 'catalog.json');
const EMAIL_TEMPLATE_PATH = resolve(ROOT, 'templates/registration-success-email.txt');
const PORT = Number(process.env.API_PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'local-admin-token';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(',')).split(',').map((origin) => origin.trim()).filter(Boolean);

if (IS_PRODUCTION) {
  const missing = ['ADMIN_TOKEN', 'ADMIN_USER', 'ADMIN_PASSWORD', 'CORS_ALLOWED_ORIGINS'].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
}

const statusOrder = ['submitted', 'reviewed', 'contacted'];
const allowedKinds = new Set(['project', 'video', 'code', 'portfolio', 'document', 'other']);
const allowedRegions = new Set(['mainland', 'hongkong', 'macao', 'taiwan', 'united-states', 'singapore', 'united-kingdom', 'canada', 'other']);
const documentOptionsByRegion = {
  mainland: ['resident-id'],
  hongkong: ['mainland-permit', 'residence-permit'],
  macao: ['mainland-permit', 'residence-permit'],
  taiwan: ['taiwan-permit'],
  'united-states': ['passport'],
  singapore: ['passport'],
  'united-kingdom': ['passport'],
  canada: ['passport'],
  other: ['passport']
};
const documentLabelZh = {
  'resident-id': '居民身份证',
  'mainland-permit': '港澳居民来往内地通行证',
  'residence-permit': '港澳台居民居住证',
  'taiwan-permit': '台湾居民来往大陆通行证',
  passport: '护照'
};

async function ensureFiles() {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    await atomicWrite(DB_PATH, { version: 1, registrations: [], statusLogs: [], emailIndex: {}, outbox: [] });
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function atomicWrite(path, data) {
  const tmp = `${path}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(tmp, path);
}

async function readDb() {
  await ensureFiles();
  const db = await readJson(DB_PATH);
  db.emailIndex ||= {};
  db.registrations ||= [];
  db.statusLogs ||= [];
  db.outbox ||= [];
  for (const reg of db.registrations) {
    if (reg.studentEmail) db.emailIndex[normalizeEmail(reg.studentEmail)] = reg.id;
  }
  return db;
}

async function readCatalog() {
  return readJson(CATALOG_PATH);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function trim(value) {
  return String(value || '').trim();
}

function makeId(prefix) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `${prefix}_${stamp}_${crypto.randomBytes(4).toString('hex')}`;
}

function hashEmail(email) {
  return `sha256:${crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex')}`;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isPhone(value) {
  return String(value || '').replace(/\D/g, '').length >= 8;
}

function isDate(value) {
  return /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(String(value || '').trim());
}

function parseHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

function badRequest(fields, message = 'Registration data is invalid.') {
  return { status: 400, body: { code: 'VALIDATION_ERROR', message, fields } };
}

function validateRegistration(input, catalog, db) {
  const fields = {};
  const normalizedEmail = normalizeEmail(input.studentEmail);

  if (!input.studentName || trim(input.studentName).length < 2) fields.studentName = '请输入选手姓名。';
  if (!['male', 'female'].includes(input.gender)) fields.gender = '请选择性别。';
  if (!allowedRegions.has(input.nationalityRegion)) fields.nationalityRegion = '请选择有效国籍/地区。';
  const allowedDocuments = documentOptionsByRegion[input.nationalityRegion] || [];
  if (!allowedDocuments.includes(input.documentType)) fields.documentType = '证件类型与国籍/地区不匹配。';
  if (!isDate(input.birthDate)) fields.birthDate = '请按 yyyy/mm/dd 或 yyyy-mm-dd 填写出生日期。';
  if (!input.documentNumber || trim(input.documentNumber).length < 3) fields.documentNumber = '请输入证件号。';

  if (!input.school || trim(input.school).length < 2) fields.school = '请输入就读学校。';
  if (!input.gradeClass || trim(input.gradeClass).length < 1) fields.gradeClass = '请输入年级与班级。';
  if (input.organizationSameAsSchool !== true && (!input.supervisingOrganization || trim(input.supervisingOrganization).length < 2)) fields.supervisingOrganization = '请输入带队机构。';
  if (!input.teacherName || trim(input.teacherName).length < 2) fields.teacherName = '请输入带队教师姓名。';
  if (!isPhone(input.teacherPhone)) fields.teacherPhone = '请输入有效带队教师手机号。';
  if (input.teacherEmail && !isEmail(input.teacherEmail)) fields.teacherEmail = '请输入有效带队教师邮箱。';

  if (!isPhone(input.phone)) fields.phone = '请输入有效个人手机号。';
  if (!isEmail(normalizedEmail)) fields.studentEmail = '请输入有效邮箱。';
  if (normalizedEmail && db.emailIndex[normalizedEmail]) fields.studentEmail = '该邮箱已经提交过报名，一个邮箱仅代表一个人。';
  if (!input.guardianName || trim(input.guardianName).length < 2) fields.guardianName = '请输入监护人姓名。';
  if (!isPhone(input.guardianPhone)) fields.guardianPhone = '请输入有效监护人手机号。';

  if (!Array.isArray(input.techStack) || input.techStack.length < 1) fields.techStack = '请至少选择一个技术栈标签。';
  if (!Array.isArray(input.materials) || input.materials.length < 1) {
    fields.materials = '请至少提交一个项目/作品/材料 URL。';
  } else if (input.materials.length > 6) {
    fields.materials = '材料链接最多 6 条。';
  } else {
    input.materials.forEach((material, index) => {
      if (!material.title || trim(material.title).length < 2) fields[`materials.${index}.title`] = '请填写材料标题。';
      if (!allowedKinds.has(material.kind)) fields[`materials.${index}.kind`] = '请选择有效材料类型。';
      if (!parseHttpUrl(material.url)) fields[`materials.${index}.url`] = '仅支持 http/https URL。';
    });
  }

  if (input.consentInformed !== true) fields.consentInformed = '提交前必须同意知情同意书。';
  if (input.guardianConsent !== true) fields.guardianConsent = '报名必须获得监护人阅读并同意。';
  if (input.disciplineAgreed !== true) fields.disciplineAgreed = '提交前必须承诺遵守峰会纪律。';
  if (input.privacyAgreed !== true) fields.privacyAgreed = '提交前必须确认信息真实并同意接收通知。';

  const track = catalog.tracks.find((item) => item.enabled) || { code: 'future-summit', nameZh: catalog.season.nameZh };
  if (Object.keys(fields).length) return badRequest(fields);
  return { track, normalizedEmail };
}

function sanitizeMaterials(materials) {
  return materials.map((material) => {
    const parsed = parseHttpUrl(material.url);
    return {
      id: makeId('mat'),
      title: trim(material.title),
      url: parsed.href,
      kind: material.kind,
      description: material.description ? trim(material.description) : undefined,
      hostname: parsed.hostname,
      previewStatus: 'unchecked',
      previewTitle: `${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`
    };
  });
}

async function createRegistration(input) {
  const catalog = await readCatalog();
  const db = await readDb();

  if (!catalog.season.registrationOpen) {
    return { status: 409, body: { code: 'REGISTRATION_CLOSED', message: '报名暂未开放。' } };
  }

  const validation = validateRegistration(input, catalog, db);
  if (validation.status) {
    if (validation.body.fields?.studentEmail?.includes('已经提交')) {
      return { status: 409, body: { code: 'DUPLICATE_EMAIL', message: validation.body.fields.studentEmail, fields: validation.body.fields } };
    }
    return validation;
  }

  const now = new Date().toISOString();
  const id = makeId('reg');
  const organization = input.organizationSameAsSchool === true ? trim(input.school) : trim(input.supervisingOrganization);
  const record = {
    id,
    seasonCode: catalog.season.code,
    trackCode: validation.track.code,
    trackName: validation.track.nameZh,
    status: 'submitted',
    statusUpdatedAt: now,
    studentName: trim(input.studentName),
    gender: input.gender,
    nationalityRegion: input.nationalityRegion,
    documentType: input.documentType,
    documentTypeLabel: documentLabelZh[input.documentType] || input.documentType,
    documentNumber: trim(input.documentNumber),
    birthDate: trim(input.birthDate),
    school: trim(input.school),
    gradeClass: trim(input.gradeClass),
    organizationSameAsSchool: input.organizationSameAsSchool === true,
    supervisingOrganization: organization,
    teacherName: trim(input.teacherName),
    teacherCountryCode: trim(input.teacherCountryCode || '+86'),
    teacherPhone: trim(input.teacherPhone),
    teacherEmail: input.teacherEmail ? normalizeEmail(input.teacherEmail) : undefined,
    personalCountryCode: trim(input.personalCountryCode || '+86'),
    phone: trim(input.phone),
    studentEmail: validation.normalizedEmail,
    backupContact: input.backupContact ? trim(input.backupContact) : undefined,
    guardianName: trim(input.guardianName),
    guardianCountryCode: trim(input.guardianCountryCode || '+86'),
    guardianPhone: trim(input.guardianPhone),
    techStack: input.techStack.map(trim).filter(Boolean),
    bringProject: input.bringProject === true,
    materials: sanitizeMaterials(input.materials),
    submissionSummary: input.submissionSummary ? trim(input.submissionSummary) : undefined,
    awards: input.awards ? trim(input.awards) : undefined,
    consentInformed: true,
    consentInformedAt: now,
    guardianConsent: true,
    guardianConsentAt: now,
    disciplineAgreed: true,
    longTermInterest: input.longTermInterest === true,
    privacyAgreed: true,
    privacyAgreedAt: now,
    privacyConsentVersion: catalog.season.privacyConsentVersion,
    locale: input.locale === 'en' ? 'en' : 'zh-CN',
    source: input.source ? trim(input.source) : 'public-site',
    dedupeKey: hashEmail(validation.normalizedEmail),
    emailSentStatus: 'pending',
    createdAt: now,
    updatedAt: now,
    submittedAt: now
  };

  const log = { id: makeId('log'), registrationId: id, fromStatus: null, toStatus: 'submitted', operatorId: 'system', createdAt: now };
  const outbox = {
    id: makeId('mail'),
    registrationId: id,
    type: 'registration_success_email',
    channel: 'email',
    to: [record.studentEmail, record.teacherEmail].filter(Boolean),
    status: 'pending',
    retryCount: 0,
    subject: '国际少年AI未来峰会报名已提交 / Registration Received',
    body: await renderEmail(record, catalog),
    createdAt: now,
    updatedAt: now
  };

  db.registrations.push(record);
  db.statusLogs.push(log);
  db.emailIndex[record.studentEmail] = id;
  db.outbox.push(outbox);
  await atomicWrite(DB_PATH, db);

  return { status: 201, body: { registrationId: id, status: 'submitted', submittedAt: now, emailQueued: true } };
}

async function renderEmail(record, catalog) {
  const template = await readFile(EMAIL_TEMPLATE_PATH, 'utf8');
  const values = {
    studentName: record.studentName,
    registrationId: record.id,
    trackName: record.trackName,
    submittedAt: record.submittedAt,
    school: record.school,
    teacherName: record.teacherName,
    status: 'Submitted / Pending Review',
    contactEmail: catalog.season.contactEmail
  };
  return template.replace(/{{(.*?)}}/g, (_, key) => values[key.trim()] ?? '');
}

function requireAdmin(req) {
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

async function listRegistrations(url) {
  const db = await readDb();
  let items = [...db.registrations].sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
  const status = url.searchParams.get('status') || 'all';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  if (status !== 'all') items = items.filter((item) => item.status === status);
  if (q) {
    items = items.filter((item) => [item.studentName, item.studentEmail, item.school, item.supervisingOrganization, item.teacherName, item.id, ...(item.techStack || [])].some((value) => String(value || '').toLowerCase().includes(q)));
  }
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || 20)));
  const stats = { total: db.registrations.length, submitted: 0, reviewed: 0, contacted: 0 };
  db.registrations.forEach((item) => { if (stats[item.status] !== undefined) stats[item.status]++; });
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: items.length, stats };
}

async function getRegistration(id) {
  const db = await readDb();
  const record = db.registrations.find((item) => item.id === id);
  if (!record) return null;
  return { ...record, statusLogs: db.statusLogs.filter((log) => log.registrationId === id) };
}

async function updateStatus(id, payload) {
  const db = await readDb();
  const record = db.registrations.find((item) => item.id === id);
  if (!record) return { status: 404, body: { code: 'NOT_FOUND', message: 'Registration not found.' } };
  const next = payload.status;
  if (!statusOrder.includes(next)) return badRequest({ status: '状态仅支持 submitted/reviewed/contacted。' });
  const currentIndex = statusOrder.indexOf(record.status);
  const nextIndex = statusOrder.indexOf(next);
  if (nextIndex < currentIndex) return { status: 409, body: { code: 'INVALID_STATUS_TRANSITION', message: '暂不支持状态回退。' } };
  const now = new Date().toISOString();
  const fromStatus = record.status;
  record.status = next;
  record.statusUpdatedAt = now;
  record.updatedAt = now;
  db.statusLogs.push({ id: makeId('log'), registrationId: id, fromStatus, toStatus: next, operatorId: payload.operatorId || 'local-admin', note: payload.note, createdAt: now });
  await atomicWrite(DB_PATH, db);
  return { status: 200, body: await getRegistration(id) };
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

async function exportCsv() {
  const db = await readDb();
  const headers = [
    'id', 'status', 'studentName', 'gender', 'nationalityRegion', 'documentType', 'documentNumber', 'birthDate',
    'school', 'gradeClass', 'supervisingOrganization', 'teacherName', 'teacherCountryCode', 'teacherPhone', 'teacherEmail',
    'personalCountryCode', 'phone', 'studentEmail', 'backupContact', 'guardianName', 'guardianCountryCode', 'guardianPhone',
    'techStack', 'bringProject', 'materials', 'submissionSummary', 'awards', 'longTermInterest', 'locale', 'submittedAt'
  ];
  const rows = db.registrations.map((item) => headers.map((key) => {
    if (key === 'materials') return csvEscape((item.materials || []).map((material) => `${material.title}: ${material.url}`).join(' | '));
    if (key === 'techStack') return csvEscape((item.techStack || []).join(' | '));
    return csvEscape(item[key]);
  }).join(','));
  return `${headers.join(',')}\n${rows.join('\n')}\n`;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    Vary: 'Origin'
  };
}

function send(req, res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    ...corsHeaders(req),
    ...headers
  });
  res.end(payload);
}

export async function handleRequest(req, res) {
  try {
    if (req.method === 'OPTIONS') return send(req, res, 204, '');
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/health') return send(req, res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/api/v1/public/season/current') return send(req, res, 200, await readCatalog());
    if (req.method === 'POST' && url.pathname === '/api/v1/public/registrations') {
      const result = await createRegistration(await readBody(req));
      return send(req, res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/v1/admin/session') {
      const payload = await readBody(req);
      if (payload.username === ADMIN_USER && payload.password === ADMIN_PASSWORD) return send(req, res, 200, { token: ADMIN_TOKEN });
      return send(req, res, 401, { code: 'INVALID_CREDENTIALS', message: 'Invalid admin credentials.' });
    }

    if (url.pathname.startsWith('/api/v1/admin/') && !requireAdmin(req)) return send(req, res, 401, { code: 'UNAUTHORIZED', message: 'Admin token required.' });

    if (req.method === 'GET' && url.pathname === '/api/v1/admin/registrations') return send(req, res, 200, await listRegistrations(url));
    if (req.method === 'GET' && url.pathname === '/api/v1/admin/registrations/export.csv') {
      return send(req, res, 200, await exportCsv(), { 'Content-Type': 'text/csv; charset=utf-8' });
    }
    const detailMatch = url.pathname.match(/^\/api\/v1\/admin\/registrations\/([^/]+)$/);
    if (req.method === 'GET' && detailMatch) {
      const detail = await getRegistration(detailMatch[1]);
      return detail ? send(req, res, 200, detail) : send(req, res, 404, { code: 'NOT_FOUND', message: 'Registration not found.' });
    }
    const statusMatch = url.pathname.match(/^\/api\/v1\/admin\/registrations\/([^/]+)\/status$/);
    if (req.method === 'PATCH' && statusMatch) {
      const result = await updateStatus(statusMatch[1], await readBody(req));
      return send(req, res, result.status, result.body);
    }

    send(req, res, 404, { code: 'NOT_FOUND', message: 'Route not found.' });
  } catch (error) {
    send(req, res, 500, { code: 'SERVER_ERROR', message: error.message });
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await ensureFiles();
  http.createServer(handleRequest).listen(PORT, HOST, () => {
    console.log(`Local JSON API running at http://${HOST}:${PORT}`);
  });
}
