import { getPlayer } from '../services/player.js';

const BASE_ALTITUDE = 10;

const UNIMPLEMENTED_RE = /^!?(?:vol_libre|barrel_roll|dive_bomb|hover)\b/i;
const GAUGE_RE = /^!?flight_gauge\b/i;

/**
 * Périmètre volontairement réduit : T_AVATARS n'a que is_flying (bool) et
 * flight_altitude (int) — aucune jauge de 10 min ni mode assisté/libre en
 * base (voir alo_progression.md ÉTAPE 58). !fly_mode devient une simple
 * bascule ; !vol_libre/!barrel_roll/!dive_bomb/!hover non implémentés (pas
 * de mécanique de combat aérien réelle à brancher dessus).
 */
export async function handleFlight(db, playerId, raw = '') {
  if (UNIMPLEMENTED_RE.test(raw.trim())) {
    return `🕊️ Cette manœuvre de vol n'est pas encore implémentée.`;
  }

  const player = await getPlayer(db, playerId);
  if (!player) return `❌ Impossible de déterminer ton état.`;

  // !flight_gauge est une commande de LECTURE (whatsapp_commands_list.md
  // §12 : « Affiche la barre de vol restante ») — ne doit jamais faire
  // basculer is_flying comme un !fly_mode nu le ferait.
  if (GAUGE_RE.test(raw.trim())) {
    const gaugeResult = await db.query('SELECT is_flying, flight_altitude FROM t_avatars WHERE avatar_uuid = $1', [playerId]);
    const gaugeState = gaugeResult.rows[0];
    if (!gaugeState) return `❌ Impossible de déterminer ton état de vol.`;
    return gaugeState.is_flying
      ? `🕊️ En vol — altitude ${gaugeState.flight_altitude}m. (Aucune jauge de temps de vol trackée en base pour l'instant.)`
      : `🕊️ Au sol.`;
  }

  const result = await db.query('SELECT is_flying, flight_altitude FROM t_avatars WHERE avatar_uuid = $1', [playerId]);
  const state = result.rows[0];
  if (!state) return `❌ Impossible de déterminer ton état de vol.`;

  const nextFlying = !state.is_flying;
  const nextAltitude = nextFlying ? BASE_ALTITUDE : 0;

  await db.query('UPDATE t_avatars SET is_flying = $1, flight_altitude = $2 WHERE avatar_uuid = $3', [nextFlying, nextAltitude, playerId]);

  const text = nextFlying ? `🕊️ Tu décolles — altitude ${nextAltitude}m.` : `🕊️ Tu atterris.`;

  return {
    text,
    card: {
      template: 'vol',
      variables: {
        playerName: player.avatar_name,
        flyingStatus: nextFlying ? 'En vol' : 'Au sol',
        altitude: nextAltitude,
      },
    },
  };
}

export default { handleFlight };
