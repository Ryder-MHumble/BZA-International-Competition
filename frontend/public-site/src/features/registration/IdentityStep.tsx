import { defaultDocumentType, documentLabels, documentNumberLabels, documentOptionsByRegion, nationalityOptions } from './constants';
import { SelectField } from './SelectField';
import type { DocumentType, FormState, Locale, NationalityRegion } from './types';

type Props = {
  form: FormState;
  locale: Locale;
  errorField?: string;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

const text = {
  'zh-CN': {
    title: '身份信息',
    helper: '证件类型会根据国籍/地区自动联动；当前只校验出生日期格式，不做年龄限制。',
    name: '选手姓名',
    nameHint: '中国籍学生填写中文全名；国际学生填写护照英文全名。',
    gender: '性别',
    male: '男',
    female: '女',
    region: '国籍 / 地区',
    docType: '证件类型',
    birthDate: '出生年月日',
    birthHint: '格式：yyyy/mm/dd 或 yyyy-mm-dd',
    placeholderName: '中文或英文法定姓名',
    placeholderDoc: '请填写证件号码'
  },
  en: {
    title: 'Profile',
    helper: 'Document type follows nationality/region. This version validates date format only and does not run age checks.',
    name: 'Participant Name',
    nameHint: 'Mainland China, Hong Kong, Macao or Taiwan students enter legal full name; international students enter passport English name.',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    region: 'Nationality / Region',
    docType: 'Document Type',
    birthDate: 'Date of Birth',
    birthHint: 'Format: yyyy/mm/dd or yyyy-mm-dd',
    placeholderName: 'Legal full name',
    placeholderDoc: 'Enter document number'
  }
} as const;

export function IdentityStep({ form, locale, errorField, update }: Props) {
  const t = text[locale];
  const documentOptions = documentOptionsByRegion[form.nationalityRegion];
  const genderOptions = [
    { value: '' as FormState['gender'], label: '--' },
    { value: 'male' as FormState['gender'], label: t.male },
    { value: 'female' as FormState['gender'], label: t.female }
  ];
  const regionOptions = nationalityOptions.map(([value, zh, en]) => ({ value, label: locale === 'zh-CN' ? zh : en }));

  function setRegion(value: NationalityRegion) {
    update('nationalityRegion', value);
    update('documentType', defaultDocumentType(value));
    update('documentNumber', '');
  }

  return <div className="panel step-panel profile-panel" data-step-panel="profile">
    <div className="panel-heading"><span>01</span><h3>{t.title}</h3><p>{t.helper}</p></div>
    <div className="grid two">
      <label className={errorField === 'studentName' ? 'field-error' : ''}>{t.name}<input name="studentName" value={form.studentName} onChange={(e) => update('studentName', e.target.value)} placeholder={t.placeholderName} required /><small>{t.nameHint}</small></label>
      <label className={errorField === 'gender' ? 'field-error' : ''}>{t.gender}<SelectField name="gender" value={form.gender} options={genderOptions} onChange={(value) => update('gender', value)} /></label>
      <label className={errorField === 'nationalityRegion' ? 'field-error' : ''}>{t.region}<SelectField name="nationalityRegion" value={form.nationalityRegion} options={regionOptions} onChange={setRegion} /></label>
      <label className={errorField === 'birthDate' ? 'field-error' : ''}>{t.birthDate}<input name="birthDate" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} placeholder="yyyy/mm/dd" required /><small>{t.birthHint}</small></label>
      <div className={errorField === 'documentType' ? 'document-switch field-error wide' : 'document-switch wide'}>
        <span>{t.docType}</span>
        {documentOptions.length === 1 ? <strong>{documentLabels[documentOptions[0]][locale]}</strong> : <div className="document-options">{documentOptions.map((type) => <label key={type} className={form.documentType === type ? 'doc-option selected' : 'doc-option'}><input type="radio" name="documentType" checked={form.documentType === type} onChange={() => update('documentType', type as DocumentType)} />{documentLabels[type][locale]}</label>)}</div>}
      </div>
      <label className={errorField === 'documentNumber' ? 'field-error wide' : 'wide'}>{documentNumberLabels[form.documentType][locale]}<input name="documentNumber" value={form.documentNumber} onChange={(e) => update('documentNumber', e.target.value)} placeholder={t.placeholderDoc} required /></label>
    </div>
  </div>;
}
