export const registrationStatuses = ['submitted', 'reviewed', 'contacted'] as const;
export const locales = ['zh-CN', 'en'] as const;
export const materialKinds = ['project', 'video', 'code', 'portfolio', 'document', 'other'] as const;
export const genders = ['male', 'female'] as const;
export const nationalityRegions = ['mainland', 'hongkong', 'macao', 'taiwan', 'united-states', 'singapore', 'united-kingdom', 'canada', 'other'] as const;
export const documentTypes = ['resident-id', 'mainland-permit', 'residence-permit', 'taiwan-permit', 'passport'] as const;

export type RegistrationStatus = (typeof registrationStatuses)[number];
export type Locale = (typeof locales)[number];
export type MaterialKind = (typeof materialKinds)[number];
export type Gender = (typeof genders)[number];
export type NationalityRegion = (typeof nationalityRegions)[number];
export type DocumentType = (typeof documentTypes)[number];

export interface SubmissionMaterialInput {
  title: string;
  url: string;
  kind: MaterialKind;
  description?: string;
}

export interface SubmissionMaterialRecord extends SubmissionMaterialInput {
  id: string;
  hostname: string;
  previewStatus: 'valid' | 'unreachable' | 'unchecked';
  previewTitle?: string;
}

export interface CreateRegistrationInput {
  locale: Locale;
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
  teacherEmail?: string;
  personalCountryCode: string;
  phone: string;
  studentEmail: string;
  backupContact?: string;
  guardianName: string;
  guardianCountryCode: string;
  guardianPhone: string;
  techStack: string[];
  bringProject: boolean;
  materials: SubmissionMaterialInput[];
  submissionSummary?: string;
  awards?: string;
  consentInformed: boolean;
  guardianConsent: boolean;
  disciplineAgreed: boolean;
  longTermInterest?: boolean;
  privacyAgreed: boolean;
  source?: string;
}

export interface RegistrationRecord {
  id: string;
  seasonCode: string;
  trackCode: string;
  trackName: string;
  status: RegistrationStatus;
  statusUpdatedAt: string;
  studentName: string;
  gender: Gender;
  nationalityRegion: NationalityRegion;
  documentType: DocumentType;
  documentTypeLabel?: string;
  documentNumber: string;
  birthDate: string;
  school: string;
  gradeClass: string;
  organizationSameAsSchool: boolean;
  supervisingOrganization: string;
  teacherName: string;
  teacherCountryCode: string;
  teacherPhone: string;
  teacherEmail?: string;
  personalCountryCode: string;
  phone: string;
  studentEmail: string;
  backupContact?: string;
  guardianName: string;
  guardianCountryCode: string;
  guardianPhone: string;
  techStack: string[];
  bringProject: boolean;
  materials: SubmissionMaterialRecord[];
  submissionSummary?: string;
  awards?: string;
  consentInformed: true;
  consentInformedAt: string;
  guardianConsent: true;
  guardianConsentAt: string;
  disciplineAgreed: true;
  longTermInterest: boolean;
  privacyAgreed: true;
  privacyAgreedAt: string;
  privacyConsentVersion: string;
  locale: Locale;
  source?: string;
  dedupeKey: string;
  emailSentStatus: 'pending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
}

export interface CreateRegistrationResult {
  registrationId: string;
  status: 'submitted';
  submittedAt: string;
  emailQueued: boolean;
}

export interface RegistrationStatusLog {
  id: string;
  registrationId: string;
  fromStatus: RegistrationStatus | null;
  toStatus: RegistrationStatus;
  operatorId: string;
  note?: string;
  createdAt: string;
}

export interface RegistrationListQuery {
  page?: number;
  pageSize?: number;
  status?: RegistrationStatus | 'all';
  q?: string;
}

export interface RegistrationListResult {
  items: RegistrationRecord[];
  page: number;
  pageSize: number;
  total: number;
  stats: Record<RegistrationStatus | 'total', number>;
}
