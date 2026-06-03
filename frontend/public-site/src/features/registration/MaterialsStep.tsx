import { materialKindLabels, techStackOptions } from './constants';
import { SelectField } from './SelectField';
import type { FormState, Locale, MaterialKind, PreviewMaterial } from './types';

type Props = {
  form: FormState;
  locale: Locale;
  previews: PreviewMaterial[];
  errorField?: string;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  updateMaterial: (index: number, patch: Partial<PreviewMaterial>) => void;
  addMaterial: () => void;
  removeMaterial: (index: number) => void;
};

const text = {
  'zh-CN': {
    title: '技术背景',
    helper: '本地原型采用 URL 材料方案替代文件上传；请确保链接公开可访问。',
    stack: '技术栈标签',
    bring: '是否参与自带项目展示',
    yes: 'Yes / 是',
    no: 'No / 否',
    materials: 'GitHub / 作品集 / 项目预览链接',
    add: '+ 添加材料',
    titleField: '标题',
    kind: '类型',
    url: 'URL',
    desc: '说明（选填）',
    remove: '移除',
    summary: '个人项目简介（选填）',
    summaryPh: 'What problem does your AI project solve?',
    awards: '过往获奖经历（选填）',
    awardsPh: 'AI / programming awards, competitions or notable projects'
  },
  en: {
    title: 'Technical',
    helper: 'This local prototype uses URL materials instead of file upload. Please make sure every link is publicly accessible.',
    stack: 'Tech Stack',
    bring: 'Bring a project for showcase?',
    yes: 'Yes',
    no: 'No',
    materials: 'GitHub / Portfolio / Demo Link',
    add: '+ Add Material',
    titleField: 'Title',
    kind: 'Type',
    url: 'URL',
    desc: 'Description (optional)',
    remove: 'Remove',
    summary: 'Personal Project Introduction (optional)',
    summaryPh: 'What problem does your AI project solve?',
    awards: 'Previous Awards and Experience (optional)',
    awardsPh: 'AI / programming awards, competitions or notable projects'
  }
} as const;

export function MaterialsStep({ form, locale, previews, errorField, update, updateMaterial, addMaterial, removeMaterial }: Props) {
  const t = text[locale];
  const materialKindOptions = Object.keys(materialKindLabels).map((kind) => ({ value: kind as MaterialKind, label: materialKindLabels[kind][locale] }));

  function toggleStack(value: string) {
    update('techStack', form.techStack.includes(value) ? form.techStack.filter((item) => item !== value) : [...form.techStack, value]);
  }

  return <div className="panel step-panel technical-panel" data-step-panel="technical">
    <div className="panel-heading"><span>04</span><h3>{t.title}</h3><p>{t.helper}</p></div>
    <div className={errorField === 'techStack' ? 'tag-cloud field-error' : 'tag-cloud'} aria-label={t.stack}>
      <span>{t.stack}</span>
      <div>{techStackOptions.map((item) => <button key={item} type="button" className={form.techStack.includes(item) ? 'tag selected' : 'tag'} onClick={() => toggleStack(item)}>{item}</button>)}</div>
    </div>
    <div className="choice-row"><span>{t.bring}</span><button type="button" className={form.bringProject ? 'choice selected' : 'choice'} onClick={() => update('bringProject', true)}>{t.yes}</button><button type="button" className={!form.bringProject ? 'choice selected' : 'choice'} onClick={() => update('bringProject', false)}>{t.no}</button></div>
    <div className={errorField === 'materials' ? 'materials field-error' : 'materials'}>
      <div className="materials__head"><strong>{t.materials}</strong><button type="button" onClick={addMaterial}>{t.add}</button></div>
      {form.materials.map((item, index) => <div key={index} className="material-editor">
        <div className="grid three">
          <label>{t.titleField}<input name={`materials.${index}.title`} value={item.title} onChange={(e) => updateMaterial(index, { title: e.target.value })} placeholder={locale === 'zh-CN' ? '项目演示 / 代码仓库' : 'Demo / Repository'} /></label>
          <label>{t.kind}<SelectField value={item.kind} options={materialKindOptions} onChange={(value) => updateMaterial(index, { kind: value })} /></label>
          <label>{t.url}<input name={`materials.${index}.url`} value={item.url} onChange={(e) => updateMaterial(index, { url: e.target.value })} placeholder="https://..." /></label>
          <label className="wide">{t.desc}<input value={item.description || ''} onChange={(e) => updateMaterial(index, { description: e.target.value })} placeholder={locale === 'zh-CN' ? '一句话说明这个链接里有什么' : 'One sentence about what reviewers will see'} /></label>
        </div>
        <div className={`preview preview--${previews[index]?.status || 'empty'}`}><span>{previews[index]?.provider || (locale === 'zh-CN' ? '待校验' : 'Pending')}</span><strong>{previews[index]?.displayUrl || (locale === 'zh-CN' ? '输入 http/https 链接后生成预览' : 'Paste an http/https link to generate a preview')}</strong><small>{previews[index]?.hint}</small><div className="preview-actions">{previews[index]?.valid && <a href={item.url} target="_blank" rel="noreferrer">Open</a>}{form.materials.length > 1 && <button type="button" onClick={() => removeMaterial(index)}>{t.remove}</button>}</div></div>
      </div>)}
    </div>
    <div className="grid two">
      <label className="wide">{t.summary}<textarea value={form.submissionSummary} onChange={(e) => update('submissionSummary', e.target.value)} placeholder={t.summaryPh} /></label>
      <label className="wide">{t.awards}<textarea value={form.awards} onChange={(e) => update('awards', e.target.value)} placeholder={t.awardsPh} /></label>
    </div>
  </div>;
}
