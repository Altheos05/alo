import { createPlayer } from '../services/player.js';

const LINK_RE = /link_start\s+(\S+)\s+(.+)/i;

export async function handleLinkStart(db, phoneNumber, raw = '') {
  if (!phoneNumber) {
    return `❌ Inscription impossible sans numéro WhatsApp identifiable.`;
  }

  const existing = await db.query(
    'SELECT avatar_uuid, avatar_name FROM t_avatars WHERE whatsapp_phone = $1',
    [phoneNumber]
  );
  if (existing.rows.length > 0) {
    return `❌ Tu as déjà un personnage : **${existing.rows[0].avatar_name}**.`;
  }

  const match = raw.match(LINK_RE);
  if (!match) {
    return `📋 Utilisation : "!link_start [Race] [Nom]" — ex. "!link_start Sylph Aelwen"`;
  }
  const [, raceQuery, avatarNameRaw] = match;
  const avatarName = avatarNameRaw.trim();

  const raceResult = await db.query(
    'SELECT race_id, name, capital_zone_id FROM t_races WHERE name ILIKE $1 OR race_id ILIKE $1 LIMIT 1',
    [`%${raceQuery}%`]
  );
  if (raceResult.rows.length === 0) {
    return `❌ Race "${raceQuery}" inconnue. Races disponibles : Sylph, Salamander, Undine, Cait Sith, Puca, Spriggan, Leprechaun, Imp, Gnome.`;
  }
  const race = raceResult.rows[0];
  if (!race.capital_zone_id) {
    return `❌ La capitale de ${race.name} n'est pas configurée. Contacte un GM.`;
  }

  try {
    const player = await createPlayer(db, phoneNumber, avatarName, race.race_id, race.capital_zone_id);
    return `🎉 Bienvenue, **${player.avatar_name}** ! Tu es un(e) ${race.name}, niveau ${player.level}, ${player.yrd_balance} Yrds.\nTape "statut" pour voir ta fiche.`;
  } catch (err) {
    if (err.code === '23505') return `❌ Ce nom de personnage est déjà pris.`;
    return `❌ Inscription impossible pour l'instant.`;
  }
}

export default { handleLinkStart };
