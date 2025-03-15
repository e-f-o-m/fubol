

async function insertEvent(params) {
    const { error } = await supabaseClient.from('event').insert(params);
    return { error }
}

async function updateEvent(eventId, params) {
    const { error } = await supabaseClient.from('event').update(params).eq('event_id', eventId)
    return { error }
}

async function deletePlayersByEvent(eventId) {
    const { error } = await supabaseClient.from('playerEvent').delete().eq('event_id', eventId);
    return { error }
}
async function deleteEvent(eventId) {
    const isErrorDeletePlayers = await deletePlayersByEvent(eventId)
    if( isErrorDeletePlayers?.error ){ return isErrorDeletePlayers }
    const { error } = await supabaseClient.from('event').delete().eq('event_id', eventId)
    return { error }
}


async function getEventsByOrganizerUserId(params) {
    const { data, error } = await supabaseClient.from('event').select().eq('organizer_user_id', params)
    return { data, error }
}

async function getEventsByTODO(params) {
    const { data, error } = await supabaseClient.from('event').select();
    return { data, error }
}

async function getEventsById(params) {
    const { data, error } = await supabaseClient.from('event').select().eq('event_id', params)
    return { data, error }
}