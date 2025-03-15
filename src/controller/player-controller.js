
/* ==== Table === */

async function insertPlayer(params) {
    const { data, error } = await supabaseClient.from('playerEvent').insert(params).select();
    return { data, error };
}

async function updatePlayer(playerId, params) {
    const { data, error } = await supabaseClient.from('playerEvent').update(params).eq('player_id', playerId);
    return { data, error };
}

async function deletePlayerById(playerId) {
    const { data, error } = await supabaseClient.from('playerEvent').delete(params).eq('player_id', playerId);
    return { data, error };
}

async function getPlayersByEvent(eventId) {
    const { data, error } = await supabaseClient.from('playerEvent').select().eq('event_id', eventId);
    return { data, error };
}