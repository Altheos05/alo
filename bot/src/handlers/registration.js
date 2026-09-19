import { createPlayer } from '../services/player.js';

// D86 : le genre, choisi à l'inscription, conditionne le mariage (D-SOC-10).
const GENDERS = { homme: 'male', femme: 'female', neutre: 'neutral' };
const USAGE = `📋 Utilisation : "!link_start [Race] [Nom] [Genre]" — Genre : homme, femme ou neutre (définitif). Ex. "!link_start Sylph Aelwen femme"`;

async function findRace(db, query) {
  const result = await db.query(
    'SELECT race_id, name, capital_zone_id FROM t_races WHERE name ILIKE $1 OR race_id ILIKE $1 LIMIT 1',
    [`%${query}%`]
  );
  return result.rows[0] || null;
}

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

  const tokens = raw.trim().split(/\s+/).slice(1);
  const gender = GENDERS[tokens.at(-1)?.toLowerCase()];
  if (tokens.length < 3 || !gender) return USAGE;
  const args = tokens.slice(0, -1);

  // Race en deux mots (« Cait Sith ») essayée avant la race en un mot.
  let race = args.length >= 3 ? await findRace(db, `${args[0]} ${args[1]}`) : null;
  let nameTokens = args.slice(2);
  if (!race) {
    race = await findRace(db, args[0]);
    nameTokens = args.slice(1);
  }
  if (!race) {
    return `❌ Race "${args[0]}" inconnue. Races disponibles : Sylph, Salamander, Undine, Cait Sith, Puca, Spriggan, Leprechaun, Imp, Gnome.`;
  }
  const avatarName = nameTokens.join(' ');
  if (!race.capital_zone_id) {
    return `❌ La capitale de ${race.name} n'est pas configurée. Contacte un GM.`;
  }

  try {
    const player = await createPlayer(db, phoneNumber, avatarName, race.race_id, race.capital_zone_id, gender);
    return `🎉 Bienvenue, **${player.avatar_name}** ! Tu es un(e) ${race.name}, niveau ${player.level}, ${player.yrd_balance} Yrds.\nTape "statut" pour voir ta fiche.`;
  } catch (err) {
    if (err.code === '23505') return `❌ Ce nom de personnage est déjà pris.`;
    return `❌ Inscription impossible pour l'instant.`;
  }
}

export default { handleLinkStart };
