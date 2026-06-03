import { countryCodes, displayCountryCode } from './constants';
import { SelectField } from './SelectField';
import type { FormState, Locale } from './types';

type Props = {
  form: FormState;
  locale: Locale;
  errorField?: string;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

const text = {
  'zh-CN': {
    title: '联系方式',
    helper: '报名编号与后续通知会发送至个人邮箱；请确保监护人联系电话可达。',
    personalPhone: '个人手机号',
    email: '个人邮箱',
    backup: '个人微信号 / 备用联系方式（选填）',
    backupPh: 'WeChat / WhatsApp / Telegram',
    guardian: '监护人姓名',
    guardianPhone: '监护人手机号'
  },
  en: {
    title: 'Contact',
    helper: 'Registration ID and updates will be sent to the personal email. Please provide a reachable guardian phone number.',
    personalPhone: 'Personal Mobile Phone',
    email: 'Email',
    backup: 'WeChat / Backup Contact (optional)',
    backupPh: 'WeChat / WhatsApp / Telegram',
    guardian: 'Guardian Name',
    guardianPhone: 'Guardian Mobile Phone'
  }
} as const;

export function ContactStep({ form, locale, errorField, update }: Props) {
  const t = text[locale];
  const countryCodeOptions = countryCodes.map((option) => ({ value: option[0], label: displayCountryCode(option, locale) }));
  return <div className="panel step-panel contact-panel" data-step-panel="contact">
    <div className="panel-heading"><span>03</span><h3>{t.title}</h3><p>{t.helper}</p></div>
    <div className="grid two">
      <div className={errorField === 'phone' ? 'phone-field field-error' : 'phone-field'}><span>{t.personalPhone}</span><div><SelectField name="personalCountryCode" value={form.personalCountryCode} options={countryCodeOptions} onChange={(value) => update('personalCountryCode', value)} /><input name="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="13800000000" required /></div></div>
      <label className={errorField === 'studentEmail' ? 'field-error' : ''}>{t.email}<input name="studentEmail" type="email" value={form.studentEmail} onChange={(e) => update('studentEmail', e.target.value)} placeholder="student@example.com" required /></label>
      <label className="wide">{t.backup}<input name="backupContact" value={form.backupContact} onChange={(e) => update('backupContact', e.target.value)} placeholder={t.backupPh} /></label>
      <label className={errorField === 'guardianName' ? 'field-error' : ''}>{t.guardian}<input name="guardianName" value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} required /></label>
      <div className={errorField === 'guardianPhone' ? 'phone-field field-error' : 'phone-field'}><span>{t.guardianPhone}</span><div><SelectField name="guardianCountryCode" value={form.guardianCountryCode} options={countryCodeOptions} onChange={(value) => update('guardianCountryCode', value)} /><input name="guardianPhone" value={form.guardianPhone} onChange={(e) => update('guardianPhone', e.target.value)} placeholder="13900000000" required /></div></div>
    </div>
  </div>;
}
