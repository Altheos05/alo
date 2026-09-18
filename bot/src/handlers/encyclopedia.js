import { getUnlockedList, getEntry } from '../engine/encyclopedia.js';
import { menuRow, overflowLine, MAX_CARD_ROWS } from '../services/cardRenderer.js';

const TERM_RE = /(?:encyclopedia|encyclopédie|wiki|lore)\s+(.+)/i;

export async function handleEncyclopedia(db, playerId) {
  const entries = await getUnlockedList(db, playerId);
  if (entries.length === 0) {
    return `📖 Tu n'as encore rien découvert. Explore le monde, vainc des monstres, trouve des documents.`;
  }

  const lines = entries.map((e, idx) => `${idx + 1}. **${e.title}** (${e.category})`);
  const text = `📖 **Encyclopédie** (${entries.length} pages débloquées)\n${lines.join('\n')}\n\nTape "wiki [nom]" ou "lore [titre]" pour ouvrir une page.`;

  const rows = entries.slice(0, MAX_CARD_ROWS)
    .map((e, idx) => menuRow(idx + 1, e.title, e.category))
    .join('');
  const overflow = overflowLine(entries.length, 'autres pages');

  return {
    text,
    card: {
      template: 'encyclopedie_index',
      variables: { entryCount: entries.length, itemsHtml: rows + overflow },
    },
  };
}

async function handleEntryLookup(db, playerId, raw, { label, cardTemplate }) {
  const match = raw.match(TERM_RE);
  const term = match?.[1]?.trim();
  if (!term) return `📖 Que veux-tu consulter ? Ex. : "${label.toLowerCase()} Loup Alpha Sylvestre"`;

  const entry = await getEntry(db, playerId, term);
  if (!entry.found) {
    return `❌ Aucune page ne correspond à "${term}".`;
  }
  if (!entry.unlocked) {
    return `🔒 **${entry.title}** existe mais tu ne l'as pas encore débloquée. Explore, vaincs, ou trouve le document correspondant.`;
  }

  const text = `📖 **${entry.title}**\n${entry.content}`;
  return {
    text,
    card: {
      template: cardTemplate,
      variables: { title: entry.title, category: entry.category, content: entry.content },
    },
  };
}

export async function handleWiki(db, playerId, raw = '') {
  return handleEntryLookup(db, playerId, raw, { label: 'Wiki', cardTemplate: 'wiki' });
}

export async function handleLoreDoc(db, playerId, raw = '') {
  return handleEntryLookup(db, playerId, raw, { label: 'Lore', cardTemplate: 'lore' });
}

export default { handleEncyclopedia, handleWiki, handleLoreDoc };
