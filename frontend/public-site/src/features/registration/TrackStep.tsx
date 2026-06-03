import { countryCodes, displayCountryCode } from './constants';
import type { FormState, Locale } from './types';

type Props = {
  form: FormState;
  locale: Locale;
  errorField?: string;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

const text = {
  'zh-CN': {
    title: '学校机构',
    helper: '带队机构用于运营联络；勾选同就读学校后会随学校名称同步。',
    school: '就读学校',
    schoolPh: 'School full name',
    grade: '年级与班级',
    gradePh: '例如：高一 3 班 / Grade 10 Class 3',
    org: '带队机构',
    same: '同就读学校',
    teacher: '带队教师姓名',
    phone: '带队教师手机号',
    email: '带队教师邮箱（选填）'
  },
  en: {
    title: 'School & Org',
    helper: 'The supervising organization is used for event communication. “Same as school” keeps it synced with the school field.',
    school: 'School',
    schoolPh: 'School full name',
    grade: 'Grade & Class',
    gradePh: 'Grade 10 Class 3',
    org: 'Supervising School / Organization',
    same: 'Same as school',
    teacher: 'Supervising Teacher Name',
    phone: 'Supervising Teacher Mobile Phone',
    email: 'Teacher Email (optional)'
  }
} as const;

export function TrackStep({ form, locale, errorField, update }: Props) {
  const t = text[locale];

  function updateSchool(value: string) {
    update('school', value);
    if (form.organizationSameAsSchool) update('supervisingOrganization', value);
  }

  function toggleSame(checked: boolean) {
    update('organizationSameAsSchool', checked);
    if (checked) update('supervisingOrganization', form.school);
  }

  return <div className="panel step-panel school-panel" data-step-panel="school">
    <div className="panel-heading"><span>02</span><h3>{t.title}</h3><p>{t.helper}</p></div>
    <div className="grid two">
      <label className={errorField === 'school' ? 'field-error' : ''}>{t.school}<input name="school" value={form.school} onChange={(e) => updateSchool(e.target.value)} placeholder={t.schoolPh} required /></label>
      <label className={errorField === 'gradeClass' ? 'field-error' : ''}>{t.grade}<input name="gradeClass" value={form.gradeClass} onChange={(e) => update('gradeClass', e.target.value)} placeholder={t.gradePh} required /></label>
      <label className={errorField === 'supervisingOrganization' ? 'field-error wide org-field' : 'wide org-field'}>{t.org}<input name="supervisingOrganization" value={form.organizationSameAsSchool ? form.school : form.supervisingOrganization} onChange={(e) => update('supervisingOrganization', e.target.value)} disabled={form.organizationSameAsSchool} required={!form.organizationSameAsSchool} /><span className="inline-check"><input type="checkbox" checked={form.organizationSameAsSchool} onChange={(e) => toggleSame(e.target.checked)} />{t.same}</span></label>
      <label className={errorField === 'teacherName' ? 'field-error' : ''}>{t.teacher}<input name="teacherName" value={form.teacherName} onChange={(e) => update('teacherName', e.target.value)} required /></label>
      <div className={errorField === 'teacherPhone' ? 'phone-field field-error' : 'phone-field'}><span>{t.phone}</span><div><select value={form.teacherCountryCode} onChange={(e) => update('teacherCountryCode', e.target.value)}>{countryCodes.map((option) => <option key={option[0]} value={option[0]}>{displayCountryCode(option, locale)}</option>)}</select><input name="teacherPhone" value={form.teacherPhone} onChange={(e) => update('teacherPhone', e.target.value)} placeholder="13800000000" required /></div></div>
      <label className={errorField === 'teacherEmail' ? 'field-error' : ''}>{t.email}<input name="teacherEmail" type="email" value={form.teacherEmail} onChange={(e) => update('teacherEmail', e.target.value)} placeholder="teacher@example.com" /></label>
    </div>
  </div>;
}
