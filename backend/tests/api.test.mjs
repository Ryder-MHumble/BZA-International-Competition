import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dbPath = join(root, 'data', 'dev-db.json');
const original = await readFile(dbPath, 'utf8');

function request(server, method, path, body, token) {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const req = http.request({ hostname: '127.0.0.1', port, path, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        const type = String(res.headers['content-type'] || '');
        resolve({ status: res.statusCode, body: type.includes('application/json') && text ? JSON.parse(text) : text });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

try {
  await writeFile(dbPath, JSON.stringify({ version: 1, registrations: [], statusLogs: [], emailIndex: {}, outbox: [] }, null, 2));
  const { handleRequest } = await import('../src/server.mjs');
  const server = http.createServer(handleRequest);
  await new Promise((resolve) => server.listen(0, resolve));

  const valid = {
    locale: 'zh-CN',
    studentName: '张三',
    gender: 'male',
    nationalityRegion: 'mainland',
    documentType: 'resident-id',
    documentNumber: '110101200901011234',
    birthDate: '2009/01/01',
    school: '北京市十一学校',
    gradeClass: '高一 3 班',
    organizationSameAsSchool: true,
    supervisingOrganization: '北京市十一学校',
    teacherName: '王老师',
    teacherCountryCode: '+86',
    teacherPhone: '13800000000',
    teacherEmail: 'teacher@example.com',
    personalCountryCode: '+86',
    phone: '13811112222',
    studentEmail: 'Student@Example.com',
    backupContact: 'wechat-student',
    guardianName: '李女士',
    guardianCountryCode: '+86',
    guardianPhone: '13900000000',
    techStack: ['Python', 'AI4Science'],
    bringProject: true,
    materials: [{ title: '项目演示', kind: 'project', url: 'https://github.com/example/project', description: 'Prototype repository' }],
    submissionSummary: '我希望展示一个 AI 辅助科学学习工具。',
    awards: '信息学竞赛校级一等奖',
    consentInformed: true,
    guardianConsent: true,
    disciplineAgreed: true,
    longTermInterest: true,
    privacyAgreed: true,
    source: 'public-site'
  };

  const created = await request(server, 'POST', '/api/v1/public/registrations', valid);
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'submitted');
  assert.equal(created.body.emailQueued, true);

  const duplicate = await request(server, 'POST', '/api/v1/public/registrations', { ...valid, studentEmail: 'student@example.com' });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.code, 'DUPLICATE_EMAIL');

  const badDocument = await request(server, 'POST', '/api/v1/public/registrations', { ...valid, studentEmail: 'new@example.com', nationalityRegion: 'mainland', documentType: 'passport' });
  assert.equal(badDocument.status, 400);
  assert.ok(badDocument.body.fields.documentType);

  const invalidUrl = await request(server, 'POST', '/api/v1/public/registrations', { ...valid, studentEmail: 'url@example.com', materials: [{ title: 'bad', kind: 'project', url: 'ftp://example.com/file' }] });
  assert.equal(invalidUrl.status, 400);
  assert.ok(invalidUrl.body.fields['materials.0.url']);

  const login = await request(server, 'POST', '/api/v1/admin/session', { username: 'admin', password: 'admin123' });
  assert.equal(login.status, 200);
  const token = login.body.token;

  const list = await request(server, 'GET', '/api/v1/admin/registrations', null, token);
  assert.equal(list.status, 200);
  assert.equal(list.body.total, 1);
  assert.equal(list.body.items[0].studentEmail, 'student@example.com');
  assert.equal(list.body.items[0].school, '北京市十一学校');

  const id = list.body.items[0].id;
  const reviewed = await request(server, 'PATCH', `/api/v1/admin/registrations/${id}/status`, { status: 'reviewed', note: '材料已查看' }, token);
  assert.equal(reviewed.status, 200);
  assert.equal(reviewed.body.status, 'reviewed');
  assert.equal(reviewed.body.statusLogs.length, 2);

  const detail = await request(server, 'GET', `/api/v1/admin/registrations/${id}`, null, token);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.materials[0].hostname, 'github.com');
  assert.deepEqual(detail.body.techStack, ['Python', 'AI4Science']);

  const csv = await request(server, 'GET', '/api/v1/admin/registrations/export.csv', null, token);
  assert.equal(csv.status, 200);

  server.close();
  console.log('Backend API tests passed.');
} finally {
  await writeFile(dbPath, original);
}
