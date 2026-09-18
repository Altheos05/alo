import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', 'cards', 'templates');
const CARD_VIEWPORT = { width: 1080, height: 1440, deviceScaleFactor: 1 };

function fillTemplate(html, variables = {}) {
  let filled = html;
  for (const [key, value] of Object.entries(variables)) {
    if (value !== null && value !== undefined) {
      filled = filled.replaceAll(`{{${key}}}`, String(value));
    }
  }
  // Toute variable non fournie disparaît plutôt que de fuiter en clair sur la carte.
  return filled.replace(/\{\{\w+\}\}/g, '');
}

/**
 * Rend un gabarit de bot/src/cards/templates/<templateName>.html en PNG.
 * Réutilise le Chromium déjà lancé par whatsapp-web.js (client.pupBrowser) —
 * aucune dépendance Puppeteer supplémentaire à ajouter au projet.
 * Retourne null (jamais une exception) si le rendu échoue : l'appelant doit
 * alors se rabattre sur la réponse texte seule.
 */
export async function renderCard(client, templateName, variables = {}) {
  const browser = client?.pupBrowser;
  if (!browser) {
    logger.warn('Rendu de carte impossible — navigateur WhatsApp indisponible', { templateName });
    return null;
  }

  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  let html;
  try {
    html = fs.readFileSync(templatePath, 'utf-8');
  } catch (err) {
    logger.error('Gabarit de carte introuvable', { templateName, error: err.message });
    return null;
  }

  const filled = fillTemplate(html, variables);

  let page;
  try {
    page = await browser.newPage();
    await page.setViewport(CARD_VIEWPORT);
    // domcontentloaded (pas networkidle0) : une police Google Fonts lente ne doit
    // jamais faire échouer la carte — au pire elle rend avec la police de repli.
    await page.setContent(filled, { waitUntil: 'domcontentloaded', timeout: 8000 });
    return await page.screenshot({ type: 'png' });
  } catch (err) {
    logger.error('Échec du rendu de carte', { templateName, error: err.message });
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * Construit une ligne de menu (mêmes classes CSS .menu-row/.menu-num/.menu-label
 * que tous les gabarits) — pour les cartes qui listent un nombre variable
 * d'entrées (inventaire, quêtes...) et doivent injecter du HTML déjà construit
 * via une seule variable {{xHtml}} plutôt que des placeholders à plat.
 */
export function menuRow(num, label, sub = '') {
  const subHtml = sub ? `<span class="menu-sub">${escapeHtml(sub)}</span>` : '';
  return `<div class="menu-row"><div class="menu-num">${num}</div><div class="menu-label">${escapeHtml(label)} ${subHtml}</div></div>`;
}

export const MAX_CARD_ROWS = 8;

export function pct(current, max) {
  return max > 0 ? Math.max(0, Math.min(100, Math.round((current / max) * 100))) : 0;
}

/** Ligne "+N autres..." affichée sous une liste tronquée à MAX_CARD_ROWS. */
export function overflowLine(totalCount, label = 'autres') {
  const remaining = totalCount - MAX_CARD_ROWS;
  return remaining > 0 ? `<div class="overflow">+${remaining} ${label}</div>` : '';
}

export default { renderCard, menuRow, escapeHtml, pct, overflowLine, MAX_CARD_ROWS };
