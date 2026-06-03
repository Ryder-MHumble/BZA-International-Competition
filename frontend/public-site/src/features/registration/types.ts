export type Locale = 'zh-CN' | 'en';
export type Gender = 'male' | 'female' | '';
export type NationalityRegion = 'mainland' | 'hongkong' | 'macao' | 'taiwan' | 'united-states' | 'singapore' | 'united-kingdom' | 'canada' | 'other';
export type DocumentType = 'resident-id' | 'mainland-permit' | 'residence-permit' | 'taiwan-permit' | 'passport';
export type MaterialKind = 'project' | 'video' | 'code' | 'portfolio' | 'document' | 'other';
export type PreviewStatus = 'empty' | 'valid' | 'invalid' | 'duplicate' | 'share-warning';

export type PreviewMaterial = {
  title: string;
  url: string;
  kind: MaterialKind;
  description?: string;
  hostname?: string;
  provider?: string;
  displayUrl?: string;
  previewText?: string;
  hint?: string;
  status?: PreviewStatus;
  valid?: boolean;
};

export type FormState = {
  studentName: string;
  gender: Gender;
  nationalityRegion: NationalityRegion;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  school: string;
  gradeClass: string;
  organizationSameAsSchool: boolean;
  supervisingOrganization: string;
  teacherName: string;
  teacherCountryCode: string;
  teacherPhone: string;
  teacherEmail: string;
  personalCountryCode: string;
  phone: string;
  studentEmail: string;
  backupContact: string;
  guardianName: string;
  guardianCountryCode: string;
  guardianPhone: string;
  techStack: string[];
  bringProject: boolean;
  materials: PreviewMaterial[];
  submissionSummary: string;
  awards: string;
  consentInformed: boolean;
  guardianConsent: boolean;
  disciplineAgreed: boolean;
  longTermInterest: boolean;
  privacyAgreed: boolean;
};

export type ActivityCopy = {
  title: string;
  hook: string;
  detail: string;
};

export type HighlightCopy = {
  title: string;
  body: string;
};

export type FaqCopy = {
  question: string;
  answer: string;
};

export type CountryCodeOption = readonly [value: string, labelZh: string, labelEn: string];
