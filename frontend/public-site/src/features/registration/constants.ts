import type { CountryCodeOption, DocumentType, FormState, Locale, NationalityRegion } from './types';

export const locales = ['zh-CN', 'en'] as const;

export const initialForm: FormState = {
  studentName: '',
  gender: '',
  nationalityRegion: 'mainland',
  documentType: 'resident-id',
  documentNumber: '',
  birthDate: '',
  school: '',
  gradeClass: '',
  organizationSameAsSchool: true,
  supervisingOrganization: '',
  teacherName: '',
  teacherCountryCode: '+86',
  teacherPhone: '',
  teacherEmail: '',
  personalCountryCode: '+86',
  phone: '',
  studentEmail: '',
  backupContact: '',
  guardianName: '',
  guardianCountryCode: '+86',
  guardianPhone: '',
  techStack: [],
  bringProject: false,
  submissionSummary: '',
  awards: '',
  materials: [{ title: '', url: '', kind: 'project', description: '' }],
  consentInformed: false,
  guardianConsent: false,
  disciplineAgreed: false,
  longTermInterest: false,
  privacyAgreed: false
};

export const countryCodes: readonly CountryCodeOption[] = [
  ['+86', '+86 中国', '+86 China'],
  ['+852', '+852 中国香港', '+852 Hong Kong, China'],
  ['+853', '+853 中国澳门', '+853 Macao, China'],
  ['+886', '+886 中国台湾', '+886 Taiwan, China'],
  ['+1', '+1 US/Canada', '+1 US/Canada'],
  ['+44', '+44 UK', '+44 UK'],
  ['+65', '+65 Singapore', '+65 Singapore'],
  ['+81', '+81 Japan', '+81 Japan'],
  ['+82', '+82 Korea', '+82 Korea'],
  ['+61', '+61 Australia', '+61 Australia'],
  ['+49', '+49 Germany', '+49 Germany'],
  ['+33', '+33 France', '+33 France'],
  ['+91', '+91 India', '+91 India'],
  ['+39', '+39 Italy', '+39 Italy'],
  ['+34', '+34 Spain', '+34 Spain'],
  ['+55', '+55 Brazil', '+55 Brazil']
];

export const nationalityOptions = [
  ['mainland', '中国大陆', 'Mainland China'],
  ['hongkong', '中国香港', 'Hong Kong, China'],
  ['macao', '中国澳门', 'Macao, China'],
  ['taiwan', '中国台湾', 'Taiwan, China'],
  ['united-states', 'United States', 'United States'],
  ['singapore', 'Singapore', 'Singapore'],
  ['united-kingdom', 'United Kingdom', 'United Kingdom'],
  ['canada', 'Canada', 'Canada'],
  ['other', 'Other', 'Other']
] as const satisfies readonly (readonly [NationalityRegion, string, string])[];

export const documentOptionsByRegion: Record<NationalityRegion, readonly DocumentType[]> = {
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

export const documentLabels: Record<DocumentType, Record<Locale, string>> = {
  'resident-id': { 'zh-CN': '居民身份证', en: 'Resident Identity Card' },
  'mainland-permit': { 'zh-CN': '港澳居民来往内地通行证', en: 'Mainland Travel Permit' },
  'residence-permit': { 'zh-CN': '港澳台居民居住证', en: 'Residence Permit' },
  'taiwan-permit': { 'zh-CN': '台湾居民来往大陆通行证', en: 'Mainland Travel Permit for Taiwan Residents' },
  passport: { 'zh-CN': '护照', en: 'Passport' }
};

export const documentNumberLabels: Record<DocumentType, Record<Locale, string>> = {
  'resident-id': { 'zh-CN': '身份证号', en: 'Resident ID Number' },
  'mainland-permit': { 'zh-CN': '通行证号', en: 'Permit Number' },
  'residence-permit': { 'zh-CN': '居住证号', en: 'Residence Permit Number' },
  'taiwan-permit': { 'zh-CN': '通行证/居住证号', en: 'Permit or Residence Permit Number' },
  passport: { 'zh-CN': '护照号', en: 'Passport Number' }
};

export const techStackOptions = ['Python', 'C++', 'Java', 'AI4Science', 'Machine Learning', 'Frontend', 'Product', 'Design', 'Data', 'Other'] as const;

export const materialKindLabels: Record<string, Record<Locale, string>> = {
  project: { 'zh-CN': '项目', en: 'Project' },
  video: { 'zh-CN': '视频', en: 'Video' },
  code: { 'zh-CN': '代码', en: 'Code' },
  portfolio: { 'zh-CN': '作品集', en: 'Portfolio' },
  document: { 'zh-CN': '文档', en: 'Document' },
  other: { 'zh-CN': '其他', en: 'Other' }
};

export const activities = {
  'zh-CN': [
    { title: '开幕式 & 项目路演', hook: '看见全球少年 AI 项目，与优秀同龄人快速建立连接。', detail: '包含峰会开幕、赛程公布、标杆项目展示、外部国际项目展示、名片交换与摊位互动。' },
    { title: '个人大师赛', hook: '硬核个人赛，检验 AI4Science 与 AI+Math 能力。', detail: '个人赛采用双赛道，并产生个人奖项。成绩可作为选手进入长期项目的重要参考。' },
    { title: '团体创意赛', hook: '跨文化协作，共同为真实问题寻求可落地的解法。', detail: '以现场组队和跨国协作为核心，包含开题宣讲、组队确认、导师答疑、成果提交、路演市集与评分环节。' },
    { title: 'AI未来报告与少年智库圆桌', hook: '不仅写代码，也要讨论 AI 与未来文明。', detail: '专家报告、学生代表圆桌、观众 QA/抢麦互动，最终产出核心观点。' },
    { title: '闭幕式', hook: '集中展示成果，颁发个人与团队奖项。', detail: '闭幕式回顾活动成果并颁发个人与团队奖项，优秀项目可进入后续展示与持续沟通。' }
  ],
  en: [
    { title: 'Opening & Project Expo', hook: 'Discover youth AI projects and quickly connect with outstanding peers worldwide.', detail: 'Includes summit opening, program announcement, benchmark project showcase, international project demos, name-card exchange and booth interaction.' },
    { title: 'Individual Master Challenge', hook: 'A rigorous individual challenge testing AI4Science and AI+Math capabilities.', detail: 'The individual challenge uses two tracks and produces individual awards. Results may serve as an important reference for long-term program opportunities.' },
    { title: 'Team Creative Challenge', hook: 'Collaborate across cultures to seek practical solutions to real-world problems.', detail: 'Built around on-site team formation and cross-border collaboration, this session includes challenge briefing, team confirmation, mentor Q&A, outcome submission, demo fair and evaluation.' },
    { title: 'AI Future Report & Youth Think Tank Roundtable', hook: 'Beyond coding, students also discuss AI and future civilization.', detail: 'Includes expert reports, a student representative roundtable, audience Q&A and open-mic interaction, ultimately producing key insights.' },
    { title: 'Closing Ceremony', hook: 'Showcase outcomes and present individual and team awards.', detail: 'The closing ceremony reviews summit outcomes and presents individual and team awards. Outstanding projects may enter follow-up showcases and continued communication.' }
  ]
} as const;

export const highlights = {
  'zh-CN': [
    { title: '个人大师赛', body: 'AI4Science 与 AI+Math 双赛道，检验硬核算法、建模与工程实现能力。' },
    { title: '团体创意赛', body: '自主搭建跨文化团队共创产品，获得世界顶尖专家导师点评反馈。' },
    { title: '少年智库圆桌', body: '不仅写代码，也表达观点，讨论 AI、社会与未来文明。' }
  ],
  en: [
    { title: 'Individual Master Challenge', body: 'AI4Science and AI+Math tracks to test algorithmic thinking, modeling and engineering skills.' },
    { title: 'Team Creative Challenge', body: 'Students build cross-cultural teams, co-create products and receive feedback from world-class expert mentors.' },
    { title: 'Youth Think Tank Roundtable', body: 'Beyond coding, students express ideas and discuss AI, society and future civilization.' }
  ]
} as const;

export const faqs = {
  'zh-CN': [
    { question: 'Q1：对选手英文能力要求高吗？', answer: '活动具有国际化交流属性，鼓励学生具备基本英文沟通和展示能力。项目展示及跨国协作环节将涉及英文表达，但学生也可借助团队协作和工具辅助完成交流。' },
    { question: 'Q2：活动主办方是谁？', answer: '国际少年 AI 未来峰会由北京中关村学院、北京少年人工智能学院发起并组织。北京中关村学院是专注人工智能与交叉学科的高等教育科研机构，北京少年人工智能学院长期参与青少年人工智能教育、科技创新人才培养与国际交流项目建设。' },
    { question: 'Q3：活动是否收费？', answer: '活动面向经邀请或推荐的优秀中学生开放。对正式入选并确认参会的学生，活动期间在中国境内的核心活动参与费用原则上由项目支持方承担。' },
    { question: 'Q4：活动面向的群体？', answer: '本活动面向全球已在人工智能、信息学、算法、AI4Science、机器人、科学计算、工程创新或相关技术实践中展现突出能力的优秀中学生。' },
    { question: 'Q5：活动是否接受公开报名？', answer: '本活动不设公开海选入口，学生需通过合作中学、国家/地区组织机构、国际竞赛社区、科技创新教育合作伙伴或组委会认可的推荐渠道获得报名资格。' },
    { question: 'Q6：各国组织机构如何加入生态并长期联系？', answer: '欢迎各国人工智能教育组织、青少年科技竞赛组织、优秀中学、国际学校、科研教育机构及 AI 创新社群与峰会建立长期合作联系。联系邮箱：xxxx' }
  ],
  en: [
    { question: 'Q1: Is a high level of English required for participants?', answer: 'The summit has an international exchange dimension. Students are encouraged to have basic English communication and presentation skills. Project showcases and cross-border collaboration sessions will involve English, while students may also rely on teamwork and appropriate tools to support communication.' },
    { question: 'Q2: Who are the organizers?', answer: 'The International Youth AI Future Summit is initiated and organized by Zhongguancun Academy and Beijing Youth Artificial Intelligence Academy (Haidian) / Beijing Junior Artificial Intelligence Academy, with experience in youth AI education, technology innovation talent development and international exchange programs.' },
    { question: 'Q3: Is there a participation fee?', answer: 'The summit is open to outstanding secondary school students who are invited or recommended. For students who are officially selected and confirmed to attend, participation fees for core activities during the summit in China will in principle be covered by project supporters.' },
    { question: 'Q4: Who is the summit for?', answer: 'The summit is designed for outstanding secondary school students worldwide who have demonstrated strong capabilities in artificial intelligence, informatics, algorithms, AI4Science, robotics, scientific computing, engineering innovation or related technical practice.' },
    { question: 'Q5: Is open public registration available?', answer: 'The summit does not offer an open public selection channel. Students need to obtain registration eligibility through partner schools, national or regional organizations, international competition communities, technology innovation education partners or recommendation channels recognized by the Organizing Committee.' },
    { question: 'Q6: How can organizations join this ecosystem?', answer: 'AI education organizations, youth technology competition organizations, leading schools, international schools, research and education institutions, and AI innovation communities from around the world are welcome to build long-term partnerships with the summit. Contact email: xxxx' }
  ]
} as const;

export function defaultDocumentType(region: NationalityRegion) {
  return documentOptionsByRegion[region][0];
}

export function displayCountryCode(option: CountryCodeOption, locale: Locale) {
  return locale === 'zh-CN' ? option[1] : option[2];
}
