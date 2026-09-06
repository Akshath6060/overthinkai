import { useEffect } from 'react';
import { env } from '../config/env.js';

const DEFAULT_TITLE = 'Overthinker AI — Let AI Overthink Your Decisions';
const DEFAULT_DESCRIPTION = 'Overthinker AI uses multiple AI agents to analyse your decisions from different perspectives and help you reach a clearer verdict.';

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

export default function SEO({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, path = '/', noindex = false }) {
  useEffect(() => {
    const canonicalUrl = `${env.appUrl}${path === '/' ? '/' : path}`;
    document.title = title;
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow' });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, noindex, path, title]);

  return null;
}
