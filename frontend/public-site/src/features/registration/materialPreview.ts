import type { PreviewMaterial } from './types';

function providerFor(hostname: string) {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  if (host.includes('github.com')) return 'GitHub';
  if (host.includes('gitlab.com')) return 'GitLab';
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'Video';
  if (host.includes('bilibili.com')) return 'Bilibili';
  if (host.includes('notion.site') || host.includes('notion.so')) return 'Notion';
  if (host.includes('figma.com')) return 'Figma';
  if (host.includes('drive.google.com')) return 'Google Drive';
  if (host.includes('onedrive') || host.includes('sharepoint')) return 'Drive';
  return host.split('.')[0]?.toUpperCase() || 'URL';
}

export function parsePreviews(materials: PreviewMaterial[]): PreviewMaterial[] {
  const seen = new Map<string, number>();
  return materials.map((material, index) => {
    const raw = material.url.trim();
    if (!raw) return { ...material, valid: false, status: 'empty', previewText: 'Awaiting http/https link', hint: 'Paste a public URL so reviewers can preview it.' };

    try {
      const url = new URL(raw);
      const valid = ['http:', 'https:'].includes(url.protocol);
      if (!valid) return { ...material, valid: false, status: 'invalid', previewText: 'Only http/https links are supported.', hint: 'Use a public web link instead of file paths or ftp links.' };
      const canonical = url.href.replace(/\/$/, '');
      const firstIndex = seen.get(canonical);
      seen.set(canonical, firstIndex ?? index);
      const shareWarning = /drive\.google|docs\.google|notion|figma|dropbox|sharepoint|onedrive/i.test(url.hostname);
      const status = firstIndex !== undefined ? 'duplicate' : shareWarning ? 'share-warning' : 'valid';
      return {
        ...material,
        url: raw,
        valid: true,
        status,
        hostname: url.hostname,
        provider: providerFor(url.hostname),
        displayUrl: `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`,
        previewText: `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`,
        hint: status === 'duplicate' ? 'This link is already listed.' : shareWarning ? 'Please confirm reviewers can open the shared link.' : 'Looks ready for local preview.'
      };
    } catch {
      return { ...material, valid: false, status: 'invalid', previewText: 'The URL format is not recognizable.', hint: 'Links should begin with http:// or https://.' };
    }
  });
}
