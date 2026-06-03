import { documentLabels } from './constants';
import type { FormState, Locale } from './types';

type Props = {
  form: FormState;
  locale: Locale;
  errorField?: string;
  error: string;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  jumpTo: (step: number) => void;
};

const text = {
  'zh-CN': {
    title: '勾选确认',
    helper: '提交前请确认信息真实完整，并已获得监护人授权。',
    profile: '身份',
    school: '学校机构',
    contact: '联系方式',
    materials: '技术材料',
    edit: '返回修改',
    consent: '我已阅读并同意《知情同意书》',
    guardian: '该授权已获得监护人的阅读并同意',
    discipline: '我承诺遵守峰会纪律，服从统一管理',
    longTerm: '我有意加入少年学院，参与学院长期项目',
    truth: '我确认以上信息真实、完整，并同意接收活动通知'
  },
  en: {
    title: 'Confirm',
    helper: 'Please confirm that the information is true and that guardian authorization has been obtained before submission.',
    profile: 'Profile',
    school: 'School & Org',
    contact: 'Contact',
    materials: 'Technical Materials',
    edit: 'Edit',
    consent: 'I have read and agree to the Informed Consent Form',
    guardian: 'My guardian has read and agreed to this authorization',
    discipline: 'I commit to following summit rules and unified event management',
    longTerm: 'I am interested in joining the Youth Academy and participating in long-term projects',
    truth: 'I confirm the information is true and agree to receive event notifications'
  }
} as const;

export function ConfirmStep({ form, locale, errorField, error, update, jumpTo }: Props) {
  const t = text[locale];
  const visibleOrg = form.organizationSameAsSchool ? form.school : form.supervisingOrganization;
  const materialCount = form.materials.filter((material) => material.url.trim()).length;

  return <div className="panel step-panel confirm-panel" data-step-panel="confirm">
    <div className="panel-heading"><span>05</span><h3>{t.title}</h3><p>{t.helper}</p></div>
    <div className="confirm-grid">
      <article><span>{t.profile}</span><button type="button" onClick={() => jumpTo(0)}>{t.edit}</button><p>{form.studentName || '--'} · {form.gender || '--'}</p><p>{documentLabels[form.documentType][locale]} · {form.birthDate || '--'}</p></article>
      <article><span>{t.school}</span><button type="button" onClick={() => jumpTo(1)}>{t.edit}</button><p>{form.school || '--'} · {form.gradeClass || '--'}</p><p>{visibleOrg || '--'} · {form.teacherName || '--'}</p></article>
      <article><span>{t.contact}</span><button type="button" onClick={() => jumpTo(2)}>{t.edit}</button><p>{form.studentEmail || '--'} · {form.personalCountryCode} {form.phone || '--'}</p><p>{form.guardianName || '--'} · {form.guardianCountryCode} {form.guardianPhone || '--'}</p></article>
      <article><span>{t.materials}</span><button type="button" onClick={() => jumpTo(3)}>{t.edit}</button><p>{form.techStack.join(' / ') || '--'}</p><p>{materialCount} URL · {form.bringProject ? 'Showcase project' : 'No project showcase'}</p></article>
    </div>
    <div className="consent-stack">
      <label className={errorField === 'consentInformed' ? 'check field-error' : 'check'}><input type="checkbox" checked={form.consentInformed} onChange={(e) => update('consentInformed', e.target.checked)} /> <span>{t.consent} <a href="#">#</a></span></label>
      <label className={errorField === 'guardianConsent' ? 'check field-error' : 'check'}><input type="checkbox" checked={form.guardianConsent} onChange={(e) => update('guardianConsent', e.target.checked)} /> <span>{t.guardian}</span></label>
      <label className={errorField === 'disciplineAgreed' ? 'check field-error' : 'check'}><input type="checkbox" checked={form.disciplineAgreed} onChange={(e) => update('disciplineAgreed', e.target.checked)} /> <span>{t.discipline}</span></label>
      <label className="check"><input type="checkbox" checked={form.longTermInterest} onChange={(e) => update('longTermInterest', e.target.checked)} /> <span>{t.longTerm}</span></label>
      <label className={errorField === 'privacyAgreed' ? 'check field-error' : 'check'}><input type="checkbox" checked={form.privacyAgreed} onChange={(e) => update('privacyAgreed', e.target.checked)} /> <span>{t.truth}</span></label>
    </div>
    {error && <p className="error" role="alert">{error}</p>}
  </div>;
}
