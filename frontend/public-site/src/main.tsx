import React, {
  FormEvent,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import { ConfirmStep } from "./features/registration/ConfirmStep";
import { ContactStep } from "./features/registration/ContactStep";
import { IdentityStep } from "./features/registration/IdentityStep";
import { MaterialsStep } from "./features/registration/MaterialsStep";
import { TrackStep } from "./features/registration/TrackStep";
import {
  activities,
  defaultDocumentType,
  faqs,
  highlights,
  initialForm,
} from "./features/registration/constants";
import { parsePreviews } from "./features/registration/materialPreview";
import type {
  FormState,
  Locale,
  PreviewMaterial,
} from "./features/registration/types";
import "./styles.css";

const LightField = lazy(() =>
  import("./components/LightField").then((module) => ({
    default: module.LightField,
  })),
);
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const DRAFT_KEY = "iy-ai-future-summit-draft-v1";
const localeKey = "iy-ai-future-summit-locale";

const copy = {
  "zh-CN": {
    lang: "中文",
    altLang: "EN",
    siteName: "国际少年AI未来峰会",
    brandSmall: "International Youth AI Future Summit",
    nav: ["赛事介绍", "核心活动", "报名", "FAQ"],
    date: "August 2026",
    heroTitle: "International Youth AI Future Summit",
    heroTitleLines: ["International", "Youth AI", "Future Summit"],
    heroSubtitle: "为全球极客中学生打造的 AI 竞技、协作与未来思辨舞台",
    heroLead:
      "面向全球优秀 AI 中学生的峰会介绍与报名提交页面。让学生、带队教师与合作机构在同一束光里理解活动、提交材料并进入持续沟通。",
    heroPanelTitle: "峰会现场",
    heroPanelItems: [
      "全球优秀中学生",
      "AI4Science / AI+Math",
      "项目展示、协作挑战与圆桌交流",
    ],
    openingSkip: "跳过",
    openingPrev: "上一页",
    openingNext: "下一页",
    openingEnter: "进入报名",
    openingProgress: "开场导览",
    openingSlides: [
      {
        kicker: "Dawn · Aurora Ribbon",
        title: "一场面向全球少年的 AI 未来峰会",
        body: "从竞技、协作到未来议题讨论，学生在同一场峰会里展示能力、建立连接，并看见 AI 与真实世界的关系。",
      },
      {
        kicker: "Noon · Core Activities",
        title: "个人大师赛、团体创意赛、少年智库圆桌",
        body: "硬核能力、跨文化共创与公开表达被放在同一条体验路径中，让优秀中学生不只提交材料，也呈现判断力。",
      },
      {
        kicker: "Dusk · Join Us",
        title: "准备好材料，走进这束光",
        body: "使用结构化表单提交身份、学校、联系与项目链接，报名信息会进入本地审核与后续通知流程。",
      },
    ],
    primary: "立即报名",
    secondary: "查看核心活动",
    organizers: "主办单位：北京中关村学院、北京少年人工智能学院",
    coOrganizers: "联合主办：中国人民大学附属中学、北京市十一学校",
    aboutKicker: "上午 · 光的衍射网格",
    aboutTitle: "不是普通竞赛页面，而是一场从黎明走向星夜的 AI 青少年峰会。",
    aboutBody: [
      "个人大师赛、团体创意赛、少年智库圆桌被整合成清晰的信息旅程，让学生先理解活动规格，再用结构化报名完成提交。",
      "报名以个人为单位；材料采用 URL 方式，方便学生提交，也方便管理员在详情页直接预览。",
    ],
    metrics: [
      ["5", "核心活动"],
      ["双语", "中文 / English"],
      ["URL", "材料预览"],
    ],
    activitiesKicker: "正午 · 焦散光斑",
    activitiesTitle: "核心活动",
    activitiesDesc: "点击展开可查看活动细节。",
    formKicker: "黄昏 · 体积光柱",
    formTitle: "选手报名表",
    draft: "草稿已自动保存到本机浏览器",
    resetDraft: "清空草稿",
    progress: "完成度",
    back: "上一步",
    next: "下一步",
    submit: "提交报名",
    submitting: "提交中...",
    stepLabels: ["身份信息", "学校机构", "联系方式", "技术背景", "勾选确认"],
    stepShort: ["身份", "学校", "联系", "技术", "确认"],
    successTitle: "报名已提交",
    successDesc:
      "报名状态：Submitted / Pending Review。请保存报名编号，并留意确认邮件与后续通知。",
    longTerm:
      "你已勾选长期项目意向。后续将结合活动表现与审核情况安排持续沟通。",
    sendEmail: "确认邮件已进入队列",
    newForm: "New / 继续新表单",
    copyId: "复制报名编号",
    faqKicker: "夜晚 · 静谧星轨",
    faqTitle: "还有疑问？",
    faqSearch: "搜索问题关键词",
    noFaq: "没有匹配的问题。",
    footerTitle: "让下一束光，从这里升起。",
    footerLine:
      "© 2026 International Youth AI Future Summit. Privacy · Terms · Contact",
    validationRequired: "请完成必填项。",
    validationEmail: "请输入有效邮箱地址。",
    validationPhone: "请填写手机号并包含区号或有效号码。",
    validationUrl:
      "请填写作品链接或材料 URL，且链接需以 https:// 或 http:// 开头。",
    validationConsent: "提交前必须勾选授权与承诺。",
    copied: "已复制报名编号。",
  },
  en: {
    lang: "EN",
    altLang: "中文",
    siteName: "International Youth AI Future Summit",
    brandSmall: "国际少年AI未来峰会",
    nav: ["About", "Activities", "Register", "FAQ"],
    date: "August 2026",
    heroTitle: "International Youth AI Future Summit",
    heroTitleLines: ["International", "Youth AI", "Future Summit"],
    heroSubtitle:
      "A global stage for AI competition, collaboration and future-oriented dialogue for tech-driven students worldwide.",
    heroLead:
      "A bilingual summit introduction and structured registration page for outstanding AI secondary school students, supervising teachers and partner institutions.",
    heroPanelTitle: "Summit Focus",
    heroPanelItems: [
      "Outstanding secondary students",
      "AI4Science / AI+Math",
      "Project expo, collaboration and roundtable dialogue",
    ],
    openingSkip: "Skip",
    openingPrev: "Prev",
    openingNext: "Next",
    openingEnter: "Enter",
    openingProgress: "Opening Guide",
    openingSlides: [
      {
        kicker: "Dawn · Aurora Ribbon",
        title: "A future summit for young AI builders worldwide",
        body: "Competition, collaboration and future-facing dialogue meet in one place, helping students show ability, build connections and understand AI in context.",
      },
      {
        kicker: "Noon · Core Activities",
        title: "Master Challenge, Team Creative Challenge and Think Tank Roundtable",
        body: "Technical strength, cross-cultural creation and public expression become one experience path for outstanding secondary school students.",
      },
      {
        kicker: "Dusk · Join Us",
        title: "Prepare your materials and step into the light",
        body: "Submit profile, school, contact and project links through a structured form that supports review and follow-up communication.",
      },
    ],
    primary: "Register Now",
    secondary: "Explore Activities",
    organizers:
      "Organizers: Zhongguancun Academy, Beijing Youth Artificial Intelligence Academy (Haidian) / Beijing Junior Artificial Intelligence Academy",
    coOrganizers:
      "Co-organizers: The High School Affiliated to Renmin University of China, Beijing National Day School",
    aboutKicker: "Morning · Diffraction Grid",
    aboutTitle:
      "Not a generic registration page, but a light journey from dawn to star night.",
    aboutBody: [
      "The experience connects the Individual Master Challenge, Team Creative Challenge and Youth Think Tank Roundtable into a clear path before students submit structured data.",
      "Registration remains individual. Materials use URL links so students can submit quickly and admins can preview submissions directly in detail pages.",
    ],
    metrics: [
      ["5", "Core Activities"],
      ["Bilingual", "Chinese / English"],
      ["URL", "Material Preview"],
    ],
    activitiesKicker: "Noon · Caustic Light",
    activitiesTitle: "Core Activities",
    activitiesDesc: "Expand to view activity details.",
    formKicker: "Dusk · Volumetric Light Shaft",
    formTitle: "Participant Registration",
    draft: "Draft saved locally in this browser",
    resetDraft: "Reset draft",
    progress: "Progress",
    back: "Back",
    next: "Next",
    submit: "Submit Registration",
    submitting: "Submitting...",
    stepLabels: ["Profile", "School & Org", "Contact", "Technical", "Confirm"],
    stepShort: ["Profile", "School", "Contact", "Tech", "Confirm"],
    successTitle: "Registration submitted",
    successDesc:
      "Status: Submitted / Pending Review. Save your registration ID and watch for confirmation emails.",
    longTerm:
      "You have indicated interest in the long-term program. Follow-up communication may be arranged based on activity performance and review results.",
    sendEmail: "Confirmation email queued",
    newForm: "New",
    copyId: "Copy registration ID",
    faqKicker: "Night · Quiet Star Trails",
    faqTitle: "Questions?",
    faqSearch: "Search questions",
    noFaq: "No matching questions.",
    footerTitle: "Let the next beam of light rise here.",
    footerLine:
      "© 2026 International Youth AI Future Summit. Privacy · Terms · Contact",
    validationRequired: "Please complete required fields.",
    validationEmail: "Please enter a valid email address.",
    validationPhone:
      "Please provide a phone number with country code or a valid number.",
    validationUrl:
      "Please provide a project/material URL that begins with http:// or https://.",
    validationConsent:
      "Required authorizations and commitments must be checked before submission.",
    copied: "Registration ID copied.",
  },
} as const;

const navTargets = ["about", "activities", "register", "faq"] as const;
type Submission = {
  registrationId: string;
  status: string;
  submittedAt: string;
  emailQueued: boolean;
};
type StepError = { field: string; message: string } | null;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isPhone(value: string) {
  return value.replace(/\D/g, "").length >= 8;
}

function isDate(value: string) {
  return /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(value.trim());
}

function validUrlMaterial(materials: PreviewMaterial[]) {
  return materials.some((item) => {
    try {
      const url = new URL(item.url.trim());
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  });
}

function validateStep(
  step: number,
  form: FormState,
  locale: Locale,
): StepError {
  const t = copy[locale];
  if (step === 0) {
    if (form.studentName.trim().length < 2)
      return { field: "studentName", message: t.validationRequired };
    if (!form.gender) return { field: "gender", message: t.validationRequired };
    if (!form.nationalityRegion)
      return { field: "nationalityRegion", message: t.validationRequired };
    if (!form.documentType)
      return { field: "documentType", message: t.validationRequired };
    if (!isDate(form.birthDate))
      return { field: "birthDate", message: t.validationRequired };
    if (form.documentNumber.trim().length < 3)
      return { field: "documentNumber", message: t.validationRequired };
  }
  if (step === 1) {
    if (form.school.trim().length < 2)
      return { field: "school", message: t.validationRequired };
    if (form.gradeClass.trim().length < 1)
      return { field: "gradeClass", message: t.validationRequired };
    if (
      !form.organizationSameAsSchool &&
      form.supervisingOrganization.trim().length < 2
    )
      return {
        field: "supervisingOrganization",
        message: t.validationRequired,
      };
    if (form.teacherName.trim().length < 2)
      return { field: "teacherName", message: t.validationRequired };
    if (!isPhone(form.teacherPhone))
      return { field: "teacherPhone", message: t.validationPhone };
    if (form.teacherEmail && !isEmail(form.teacherEmail))
      return { field: "teacherEmail", message: t.validationEmail };
  }
  if (step === 2) {
    if (!isPhone(form.phone))
      return { field: "phone", message: t.validationPhone };
    if (!isEmail(form.studentEmail))
      return { field: "studentEmail", message: t.validationEmail };
    if (form.guardianName.trim().length < 2)
      return { field: "guardianName", message: t.validationRequired };
    if (!isPhone(form.guardianPhone))
      return { field: "guardianPhone", message: t.validationPhone };
  }
  if (step === 3) {
    if (form.techStack.length < 1)
      return { field: "techStack", message: t.validationRequired };
    if (!validUrlMaterial(form.materials))
      return { field: "materials", message: t.validationUrl };
  }
  if (step === 4) {
    if (!form.consentInformed)
      return { field: "consentInformed", message: t.validationConsent };
    if (!form.guardianConsent)
      return { field: "guardianConsent", message: t.validationConsent };
    if (!form.disciplineAgreed)
      return { field: "disciplineAgreed", message: t.validationConsent };
    if (!form.privacyAgreed)
      return { field: "privacyAgreed", message: t.validationConsent };
  }
  return null;
}

function loadDraft(): { form: FormState; step: number; locale: Locale } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<{
      form: FormState;
      step: number;
      locale: Locale;
    }>;
    if (!parsed.form) return null;
    return {
      form: {
        ...initialForm,
        ...parsed.form,
        documentType:
          parsed.form.documentType ||
          defaultDocumentType(parsed.form.nationalityRegion || "mainland"),
      },
      step: parsed.step || 0,
      locale: parsed.locale || "zh-CN",
    };
  } catch {
    return null;
  }
}

function App() {
  const [locale, setLocale] = useState<Locale>(() =>
    localStorage.getItem(localeKey) === "en" ? "en" : "zh-CN",
  );
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [stepError, setStepError] = useState<StepError>(null);
  const [busy, setBusy] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [toast, setToast] = useState("");
  const [showBurst, setShowBurst] = useState(false);
  const [showOpening, setShowOpening] = useState(true);
  const [openingSlide, setOpeningSlide] = useState(0);
  const [activeId, setActiveId] = useState("about");
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState<number | null>(null);
  const [faqQuery, setFaqQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [activeScene, setActiveScene] = useState("aurora");
  const sceneShiftRef = React.useRef<ReturnType<typeof setTimeout>>();
  const t = copy[locale];
  const openingSlides = t.openingSlides;
  const previews = useMemo(
    () => parsePreviews(form.materials),
    [form.materials],
  );
  const progress = Math.round(
    ((Math.min(step, 4) + (submission ? 1 : 0)) / 5) * 100,
  );
  const filteredFaqs = faqs[locale].filter((item) =>
    `${item.question} ${item.answer}`
      .toLowerCase()
      .includes(faqQuery.trim().toLowerCase()),
  );

  useEffect(() => {
    setOpenFaq(0);
  }, [faqQuery, locale]);

  useEffect(() => {
    if (!showOpening) return;
    const timer = window.setTimeout(() => {
      setOpeningSlide((current) => {
        if (current >= openingSlides.length - 1) {
          window.setTimeout(() => setShowOpening(false), 420);
          return current;
        }
        return current + 1;
      });
    }, 3100);
    return () => window.clearTimeout(timer);
  }, [openingSlide, openingSlides.length, showOpening]);

  useEffect(() => {
    document.body.classList.toggle("opening-lock", showOpening);
    return () => document.body.classList.remove("opening-lock");
  }, [showOpening]);

  useEffect(() => {
    if (!showOpening) return;
    const preventScroll = (event: Event) => event.preventDefault();
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [showOpening]);

  useEffect(() => {
    document.body.dataset.locale = locale;
  }, [locale]);

  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    setForm(draft.form);
    setStep(Math.min(4, draft.step));
    setFurthestStep(Math.min(4, draft.step));
    setLocale(draft.locale);
  }, []);

  useEffect(() => {
    localStorage.setItem(localeKey, locale);
    const timer = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, locale }));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [form, step, locale]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    let raf = 0;
    const updateScrollState = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pageProgress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty("--page-progress", String(pageProgress));
      root.style.setProperty("--page-progress-pct", `${pageProgress * 100}%`);
      setNavScrolled(window.scrollY > 70);
      const trackProgress = Math.min(
        1,
        Math.max(
          0,
          (window.scrollY - window.innerHeight * 1.55) /
            (window.innerHeight * 0.95),
        ),
      );
      root.style.setProperty(
        "--track-dash",
        String((1 - trackProgress) * 1000),
      );
      const centers = navTargets.map((id) => {
        const node = document.getElementById(id);
        if (!node) return { id, dist: Infinity };
        const rect = node.getBoundingClientRect();
        return {
          id,
          dist: Math.abs(
            rect.top + rect.height * 0.28 - window.innerHeight * 0.36,
          ),
        };
      });
      centers.sort((a, b) => a.dist - b.dist);
      setActiveId(centers[0]?.id || "about");
      document.querySelectorAll<HTMLElement>(".scrub").forEach((node) => {
        const rect = node.getBoundingClientRect();
        const local =
          1 -
          Math.min(
            1,
            Math.max(
              0,
              (rect.top + rect.height * 0.2) /
                (window.innerHeight + rect.height * 0.2),
            ),
          );
        node.style.setProperty("--local-progress", String(local));
      });
      raf = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(updateScrollState);
    };
    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (entry) =>
            entry.isIntersecting && entry.target.classList.add("visible"),
        ),
      { threshold: 0.13, rootMargin: "0px 0px -8% 0px" },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((node) => revealObserver.observe(node));

    const sceneObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) {
          const scene = visible.target.dataset.scene;
          if (scene && scene !== activeScene) {
            setActiveScene(scene);
            body.dataset.scene = scene;
            body.classList.add("scene-shifting");
            clearTimeout(sceneShiftRef.current);
            sceneShiftRef.current = setTimeout(
              () => body.classList.remove("scene-shifting"),
              560,
            );
          }
        }
      },
      { threshold: [0.28, 0.5, 0.72], rootMargin: "-12% 0px -18% 0px" },
    );
    document
      .querySelectorAll("[data-scene]")
      .forEach((node) => sceneObserver.observe(node));

    updateScrollState();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      revealObserver.disconnect();
      sceneObserver.disconnect();
      clearTimeout(sceneShiftRef.current);
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setStepError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateMaterial(index: number, patch: Partial<PreviewMaterial>) {
    setStepError(null);
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addMaterial() {
    setForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { title: "", url: "", kind: "project", description: "" },
      ],
    }));
  }

  function removeMaterial(index: number) {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  }

  function scrollTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  function switchLocale() {
    setLocale((current) => (current === "zh-CN" ? "en" : "zh-CN"));
    setMenuOpen(false);
  }

  function moveOpeningSlide(direction: number) {
    setOpeningSlide((current) =>
      Math.min(openingSlides.length - 1, Math.max(0, current + direction)),
    );
  }

  function goNext() {
    const result = validateStep(step, form, locale);
    if (result) {
      setStepError(result);
      const form = document.querySelector(".signup-form") as HTMLElement | null;
      if (form) {
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
      }
      window.setTimeout(
        () =>
          document
            .querySelector<
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >(`[name="${result.field}"]`)
            ?.focus(),
        50,
      );
      return;
    }
    const next = Math.min(4, step + 1);
    setFurthestStep((prev) => Math.max(prev, next));
    setStep(next);
  }

  function jumpStep(target: number) {
    if (target <= furthestStep || target < step) setStep(target);
  }

  function resetDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setForm(initialForm);
    setStep(0);
    setFurthestStep(0);
    setSubmission(null);
    setStepError(null);
    setToast("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStepError(null);
    for (let index = 0; index < 5; index++) {
      const result = validateStep(index, form, locale);
      if (result) {
        setStep(index);
        setStepError(result);
        return;
      }
    }
    setBusy(true);
    try {
      const response = await fetch(`${API}/api/v1/public/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          studentName: form.studentName,
          gender: form.gender,
          nationalityRegion: form.nationalityRegion,
          documentType: form.documentType,
          documentNumber: form.documentNumber,
          birthDate: form.birthDate,
          school: form.school,
          gradeClass: form.gradeClass,
          organizationSameAsSchool: form.organizationSameAsSchool,
          supervisingOrganization: form.organizationSameAsSchool
            ? form.school
            : form.supervisingOrganization,
          teacherName: form.teacherName,
          teacherCountryCode: form.teacherCountryCode,
          teacherPhone: form.teacherPhone,
          teacherEmail: form.teacherEmail || undefined,
          personalCountryCode: form.personalCountryCode,
          phone: form.phone,
          studentEmail: form.studentEmail,
          backupContact: form.backupContact || undefined,
          guardianName: form.guardianName,
          guardianCountryCode: form.guardianCountryCode,
          guardianPhone: form.guardianPhone,
          techStack: form.techStack,
          bringProject: form.bringProject,
          materials: form.materials
            .filter((item) => item.url.trim())
            .map((item) => ({
              title: item.title || item.url,
              kind: item.kind,
              url: item.url,
              description: item.description,
            })),
          submissionSummary: form.submissionSummary || undefined,
          awards: form.awards || undefined,
          consentInformed: form.consentInformed,
          guardianConsent: form.guardianConsent,
          disciplineAgreed: form.disciplineAgreed,
          longTermInterest: form.longTermInterest,
          privacyAgreed: form.privacyAgreed,
          source: "public-site",
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.message ||
            Object.values(payload.fields || {}).join(" / ") ||
            "Submission failed",
        );
      setSubmission(payload);
      setShowBurst(true);
      window.setTimeout(() => setShowBurst(false), 2200);
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      setStepError({
        field: "submit",
        message: err instanceof Error ? err.message : "Submission failed",
      });
    } finally {
      setBusy(false);
    }
  }

  function copyRegistrationId() {
    if (!submission) return;
    navigator.clipboard?.writeText(submission.registrationId);
    setToast(t.copied);
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <>
      <Suspense
        fallback={<div className="light-field fallback" aria-hidden="true" />}
      >
        <LightField formProgress={step / 4} />
      </Suspense>
      <div className="grain" aria-hidden="true" />
      {showOpening && (
        <section className="opening" aria-label={t.openingProgress}>
          <div
            className="opening-track"
            style={{ transform: `translateX(${-openingSlide * 100}%)` }}
          >
            {openingSlides.map((slide, index) => (
              <article
                className="opening-slide"
                key={slide.title}
                aria-hidden={openingSlide !== index}
              >
                <p>{slide.kicker}</p>
                <h2>{slide.title}</h2>
                <span>{slide.body}</span>
              </article>
            ))}
          </div>
          <div className="opening-orbit" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="opening-controls">
            <div className="opening-dots" aria-label={t.openingProgress}>
              {openingSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  className={openingSlide === index ? "active" : ""}
                  aria-label={`${t.openingProgress} ${index + 1}`}
                  onClick={() => setOpeningSlide(index)}
                />
              ))}
            </div>
            <div className="opening-actions">
              <button
                type="button"
                className="ghost-btn"
                disabled={openingSlide === 0}
                onClick={() => moveOpeningSlide(-1)}
              >
                {t.openingPrev}
              </button>
              {openingSlide < openingSlides.length - 1 ? (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => moveOpeningSlide(1)}
                >
                  {t.openingNext}
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setShowOpening(false)}
                >
                  {t.openingEnter}
                </button>
              )}
              <button
                type="button"
                className="opening-skip"
                onClick={() => setShowOpening(false)}
              >
                {t.openingSkip}
              </button>
            </div>
          </div>
        </section>
      )}
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav
        className={navScrolled ? "site-nav scrolled" : "site-nav"}
        aria-label="Main navigation"
      >
        <a className="brand" href="#top" aria-label="Home">
          <span>
            <strong>{t.siteName}</strong>
            <small>{t.brandSmall}</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="nav-panel"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span className="sr-only">Menu</span>
        </button>
        <div
          className={menuOpen ? "nav-panel open" : "nav-panel"}
          id="nav-panel"
        >
          {navTargets.map((id, index) => (
            <button
              key={id}
              type="button"
              className={activeId === id ? "nav-link active" : "nav-link"}
              onClick={() => scrollTo(id)}
            >
              {t.nav[index]}
            </button>
          ))}
          <button type="button" className="lang-switch" onClick={switchLocale}>
            <span>{locale === "zh-CN" ? "中" : "EN"}</span>
            <i />
            <span>{locale === "zh-CN" ? "EN" : "中"}</span>
          </button>
          <button
            className="nav-cta"
            type="button"
            onClick={() => scrollTo("register")}
          >
            {t.primary}
          </button>
        </div>
      </nav>
      <aside className="scroll-rail" aria-label="Page progress">
        {navTargets.map((id, index) => (
          <button
            key={id}
            type="button"
            className={activeId === id ? "active" : ""}
            onClick={() => scrollTo(id)}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
        <span className="rail-line">
          <i />
        </span>
      </aside>
      <main id="main">
        <section className="section hero scrub" id="top" data-scene="aurora">
          <div className="hero-layout">
            <div className="hero-main">
              <p className="section-kicker reveal">{t.date} · Aurora Ribbon</p>
              <h1 className="hero-title reveal">
                {t.heroTitleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
            </div>
            <aside className="hero-panel reveal" aria-label={t.heroPanelTitle}>
              <p>{t.heroPanelTitle}</p>
              <ul>
                {t.heroPanelItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
            <div className="hero-copy reveal">
              <p>{t.heroSubtitle}</p>
              <p>{t.heroLead}</p>
            </div>
            <div className="hero-org reveal">
              <span>{t.organizers}</span>
              <span>{t.coOrganizers}</span>
            </div>
            <div className="hero-actions reveal">
              <button
                type="button"
                className="primary-btn magnetic"
                onClick={() => scrollTo("register")}
              >
                {t.primary}
              </button>
              <button
                type="button"
                className="ghost-btn magnetic"
                onClick={() => scrollTo("activities")}
              >
                {t.secondary}
              </button>
            </div>
          </div>
          <div className="highlight-deck reveal">
            {highlights[locale].map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="scroll-cue" aria-hidden="true">
            <span />
          </div>
        </section>

        <section id="about" className="section about scrub" data-scene="grid">
          <span className="ghost-number">01</span>
          <span className="ghost-word">ABOUT</span>
          <div className="about-copy reveal">
            <p className="section-kicker">{t.aboutKicker}</p>
            <h2>{t.aboutTitle}</h2>
            {t.aboutBody.map((body) => (
              <p key={body}>{body}</p>
            ))}
            <div className="stats">
              {t.metrics.map(([value, label]) => (
                <article key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="activities"
          className="section activities scrub"
          data-scene="caustics"
        >
          <div className="section-heading reveal">
            <p className="section-kicker">{t.activitiesKicker}</p>
            <h2>{t.activitiesTitle}</h2>
            <p>{t.activitiesDesc}</p>
          </div>
          <div
            className={
              activeActivity === null
                ? "activity-stage"
                : "activity-stage is-focused"
            }
          >
            <svg
              className="activity-connector"
              viewBox="0 0 1000 520"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M90 120 C 250 10, 350 220, 500 180 S 720 120, 900 310" />
            </svg>
            {activities[locale].map((item, index) => (
              <article
                key={item.title}
                className={
                  activeActivity === index
                    ? "activity-card open"
                    : activeActivity === null
                      ? "activity-card"
                      : "activity-card muted"
                }
              >
                <b aria-hidden="true">{String.fromCharCode(65 + index)}</b>
                <button
                  type="button"
                  onClick={() =>
                    setActiveActivity((current) =>
                      current === index ? null : index,
                    )
                  }
                  aria-expanded={activeActivity === index}
                >
                  <strong>{item.title}</strong>
                  <em>{item.hook}</em>
                </button>
                <div className="activity-detail">
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="register"
          className="section registration scrub"
          data-step={step}
          data-scene="shaft"
        >
          <div className="form-shell reveal">
            <aside className="step-column" aria-label="Registration steps">
              <p className="section-kicker">{t.formKicker}</p>
              <h2>{t.formTitle}</h2>
              <p className="draft-notice">{t.draft}</p>
              <ol className="step-list">
                {t.stepLabels.map((label, index) => (
                  <li
                    key={label}
                    className={
                      index === step
                        ? "active"
                        : index < step
                          ? "done"
                          : index <= furthestStep
                            ? "ready"
                            : "locked"
                    }
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{label}</strong>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="reset-draft"
                onClick={resetDraft}
              >
                {t.resetDraft}
              </button>
            </aside>
            <form className="signup-form" onSubmit={submit} noValidate>
              <div className="step-rail" aria-label="Registration steps">
                {t.stepShort.map((label, index) => (
                  <button
                    type="button"
                    className={
                      step === index
                        ? "active"
                        : index < step
                          ? "done"
                          : index <= furthestStep
                            ? "ready"
                            : "locked"
                    }
                    onClick={() => jumpStep(index)}
                    key={label}
                    disabled={index > furthestStep && index > step}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {label}
                  </button>
                ))}
              </div>
              <div className="progress">
                <span>{t.progress}</span>
                <i style={{ width: `${progress}%` }} />
              </div>
              {submission ? (
                <SuccessPanel
                  locale={locale}
                  form={form}
                  submission={submission}
                  toast={toast}
                  copyId={copyRegistrationId}
                  resetDraft={resetDraft}
                />
              ) : (
                <>
                  {step === 0 && (
                    <IdentityStep
                      form={form}
                      locale={locale}
                      errorField={stepError?.field}
                      update={update}
                    />
                  )}
                  {step === 1 && (
                    <TrackStep
                      form={form}
                      locale={locale}
                      errorField={stepError?.field}
                      update={update}
                    />
                  )}
                  {step === 2 && (
                    <ContactStep
                      form={form}
                      locale={locale}
                      errorField={stepError?.field}
                      update={update}
                    />
                  )}
                  {step === 3 && (
                    <MaterialsStep
                      form={form}
                      locale={locale}
                      previews={previews}
                      errorField={stepError?.field}
                      update={update}
                      updateMaterial={updateMaterial}
                      addMaterial={addMaterial}
                      removeMaterial={removeMaterial}
                    />
                  )}
                  {step === 4 && (
                    <ConfirmStep
                      form={form}
                      locale={locale}
                      errorField={stepError?.field}
                      error={
                        stepError?.field === "submit" ? stepError.message : ""
                      }
                      update={update}
                      jumpTo={(target) => {
                        setFurthestStep(4);
                        setStep(target);
                      }}
                    />
                  )}
                  {stepError && stepError.field !== "submit" && (
                    <p className="error form-error" role="alert">
                      {stepError.message}
                    </p>
                  )}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={step === 0 || busy}
                      onClick={() => setStep(step - 1)}
                    >
                      {t.back}
                    </button>
                    {step < 4 ? (
                      <button
                        type="button"
                        className="primary-btn magnetic"
                        onClick={goNext}
                      >
                        {t.next}
                      </button>
                    ) : (
                      <button className="primary-btn magnetic" disabled={busy}>
                        {busy ? t.submitting : t.submit}
                      </button>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        </section>

        <section id="faq" className="section faq scrub" data-scene="trails">
          <div className="faq-title reveal">
            <span>FAQ</span>
            <p>{t.faqKicker}</p>
            <h2>{t.faqTitle}</h2>
            <label className="faq-search">
              <input
                value={faqQuery}
                onChange={(e) => setFaqQuery(e.target.value)}
                placeholder={t.faqSearch}
              />
            </label>
          </div>
          <div className="faq-list reveal">
            {filteredFaqs.length === 0 && (
              <p className="empty-faq">{t.noFaq}</p>
            )}
            {filteredFaqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <article
                  className={isOpen ? "faq-item open" : "faq-item"}
                  key={item.question}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenFaq((current) => (current === index ? -1 : index))
                    }
                  >
                    {item.question}
                    <i />
                  </button>
                  <div className="faq-answer" aria-hidden={!isOpen}>
                    <p>{item.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <div
        className={showBurst ? "success-burst show" : "success-burst"}
        role="status"
        aria-live="polite"
        aria-hidden={!showBurst}
      >
        <strong>{t.successTitle}</strong>
        <span>Your light is rising</span>
      </div>
      <footer className="site-footer" data-scene="galaxy">
        <div className="footer-glow" aria-hidden="true" />
        <div className="footer-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="footer-main reveal">
          <div className="footer-statement">
            <p className="section-kicker">MIDNIGHT · GALAXY DRIFT</p>
            <h2>{t.footerTitle}</h2>
            <p>{t.heroSubtitle}</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            {navTargets.map((id, index) => (
              <button key={id} type="button" onClick={() => scrollTo(id)}>
                {t.nav[index]}
              </button>
            ))}
          </nav>
        </div>
        <div className="footer-constellation">
          <span>ACADEMY</span>
          <span>AI LAB</span>
          <span>YOUTH</span>
          <span>GLOBAL</span>
          <span>LIGHT</span>
        </div>
        <p className="copyright">{t.footerLine}</p>
      </footer>
    </>
  );
}

function SuccessPanel({
  locale,
  form,
  submission,
  toast,
  copyId,
  resetDraft,
}: {
  locale: Locale;
  form: FormState;
  submission: Submission;
  toast: string;
  copyId: () => void;
  resetDraft: () => void;
}) {
  const t = copy[locale];
  return (
    <section className="success-panel" aria-live="polite">
      <span className="success-mark">✓</span>
      <p className="section-kicker">
        {submission.status} ·{" "}
        {new Date(submission.submittedAt).toLocaleString(
          locale === "zh-CN" ? "zh-CN" : "en-US",
        )}
      </p>
      <h3>{t.successTitle}</h3>
      <p>{t.successDesc}</p>
      <div className="registration-id">
        <span>ID</span>
        <strong>{submission.registrationId}</strong>
      </div>
      {form.longTermInterest && (
        <div className="long-term-note">{t.longTerm}</div>
      )}
      <div className="success-actions">
        <button type="button" className="primary-btn" onClick={copyId}>
          {t.copyId}
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => alert(t.sendEmail)}
        >
          {t.sendEmail}
        </button>
        <button type="button" className="ghost-btn" onClick={resetDraft}>
          {t.newForm}
        </button>
      </div>
      {toast && <p className="success-toast">{toast}</p>}
    </section>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
