import { getAvatarSkills } from '../engine/skills.js';
import { escapeHtml } from '../services/cardRenderer.js';

const TYPE_LABELS = { MAG: 'Sorts', OSS: 'Original Sword Skills', PAS: 'Passives' };

function rankDots(rank, max) {
  let dots = '';
  for (let i = 1; i <= max; i++) {
    dots += `<div class="rank-dot" style="${i <= rank ? 'background:var(--accent);' : ''}"></div>`;
  }
  return `<div class="rank">${dots}</div>`;
}

export async function handleSkillList(db, playerId) {
  const skills = await getAvatarSkills(db, playerId);
  if (skills.length === 0) {
    return `📜 Tu n'as encore appris aucune compétence. Trouve un Maître de compétence dans une zone.`;
  }

  const lines = skills.map(s =>
    `• **${s.name}** (${s.skill_id}) — Rang ${s.mastery_rank}/${s.max_mastery}${s.is_equipped ? ' [équipée]' : ''}`
  );
  const text = `📜 **Compétences** (${skills.length})\n${lines.join('\n')}`;

  const grouped = {};
  for (const s of skills) {
    (grouped[s.skill_type] ||= []).push(s);
  }

  let html = '';
  for (const [type, group] of Object.entries(grouped)) {
    html += `<div class="hud-label" style="margin:14px 0 8px 0;">${escapeHtml(TYPE_LABELS[type] || type)}</div>`;
    for (const s of group) {
      html += `<div class="skill-row"><span class="skill-name">${escapeHtml(s.name)} <span class="skill-tag">${escapeHtml(s.skill_id)}</span></span>${rankDots(s.mastery_rank, s.max_mastery)}</div>`;
    }
  }

  return {
    text,
    card: {
      template: 'competences_liste',
      variables: { skillCount: skills.length, skillsHtml: html },
    },
  };
}

export default { handleSkillList };
