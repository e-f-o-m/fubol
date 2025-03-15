const container = document.getElementById('futbol-container');
const { width, height } = container.getBoundingClientRect();
let myUser = null
let currentEvent = null
/* PLAYERS */
let isNewPlayer = false
let currentPlayer = { x: null, y: null, player_id: null }
let previousCoord = { x: null, y: null }
let players = []

async function createUserVerification() {
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { error, data } = await getUserByEmail(user.email);
    if (error) { throw new Error(error) }
    myUser = data[0];
    if (data != null && data.length == 0) {
        const queryData = {
            email: user.email,
            name: user.user_metadata?.name || null,
            verification_status: 'anonymous',/* created_at: null,user_id: null,alias: null,phone: null,reputation: null, */
        }
        insertUser(queryData).then(res => {
            if (!!res && res?.error) { throw new Error(res.error) }/* updateUserAuth(user.id, { user_metadata: { id: res?.data[0]?.user_id } }).then(resUpdateAuth =>{console.log('>> >>: resUpdateAuth', resUpdateAuth);}) */
        }).catch(error => {
            console.error('>> >>insert user error:', error);
        }).finally(() => {
            loading.close();
        })
    }
}

function verificationEvent() {
    loading.open();
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("event");

    const decodedString = atob(eventId);
    let decodedObj = null
    try {
        decodedObj = JSON.parse(decodedString);
    } catch (error) {
        redirecViewPage()
    }

    getEventsById(decodedObj?.event_id).then(res => {
        if (!!res && res?.error) { redirecViewPage() }
        currentEvent = res.data[0];
        getPlayers();
    }).catch(error => {
        redirecViewPage()
    }).finally(() => {
        loading.close();
    })

}
function redirecViewPage() {
    document.getElementById('main-events').innerHTML = `<div class="p-2 text-red-500 text-center">
            <p id="error-message" id="text-center">No se encontraron eventos</p>
            <p id="error-message" id="text-center">Redireccionando en 3 segundos</p>
        </div>`
    setTimeout(() => {
        if (myUser) {
            window.location.href = `my-events/index.html&_=${new Date().getTime()}`
        } else {
            window.location.href = `home/index.html&_=${new Date().getTime()}`
        }
    }, 3000);
}

function getPlayers() {
    getPlayersByEvent(currentEvent?.event_id).then(res => {
        if (!!res && res?.error) { redirecViewPage() }
        players = res.data;
        const date = new Date(currentEvent.date);
        const formattedDate = timestampTOddd_dd(currentEvent?.date);
        const [hour, minute] = currentEvent.time?.split(":");
        const dateMils = date.getTime();

        /* Status */
        let statusEvent = ''
        document.getElementById('status-event').classList.remove('text-red-500');
        document.getElementById('status-event').classList.remove('text-blue-500');
        document.getElementById('status-event').classList.remove('text-teal-500');
        if(new Date().getDate() > date.getDate()){
            statusEvent = 'Delete'
        }else if(Date.now() > (dateMils + 3600000)){
            statusEvent = 'Finalizado'
            document.getElementById('status-event').classList.add('text-red-500');
        }else if(players.length < currentEvent.required_players){
            statusEvent = 'En progreso'
            document.getElementById('status-event').classList.add('text-blue-500');
        }else{
            statusEvent = 'Activo';
            document.getElementById('status-event').classList.add('text-teal-500');
        }

        /* Proximity time */
        const hours = []
        container.querySelectorAll('.player')?.forEach(ele=>ele.remove());
        for (const _player of players) {
            hours.push(_player.arrival_time);
            buildPlayer(_player);
        }
        const proximityTime = getAverageTime(hours);

        document.getElementById('date-event').textContent = formattedDate;
        document.getElementById('status-event').textContent = statusEvent
        document.getElementById('time-event').textContent = hour+':'+minute
        document.getElementById('proximity-time-event').textContent = proximityTime ?? ''
        document.getElementById('current-players-event').textContent =  players.length
        document.getElementById('required-players-event').textContent = currentEvent.required_players

    }).catch(error => {
        console.error('>> >>get players by event error:', error);
    }).finally(() => {
        loading.close();
    })
}

function addPlayer() {
    container.addEventListener("click", (event) => {
        if (event.target !== container) return;
        let x = event.offsetX;
        let y = event.offsetY;
        const porcentX = (x / width) * 100;
        const porcentY = (y / height) * 100;

        buildPlayer({x: porcentX, y: porcentY, player_id: 'temp', alias: 'Jugador'})
        isNewPlayer = true;
        openFormPlayer(true);
    });
}
function buildPlayer(player) {
    const newPlayer = document.createElement("div");
    newPlayer.className = "player absolute flex items-center flex-col z-10";
    newPlayer.id = 'player-'+player.player_id;
    if (player.x > 93) { player.x = player.x - 3 }
    if (player.y > 93) { player.y = player.y - 3 }
    
    currentPlayer = { x: player.x, y: player.y, player_id: player.player_id };

    newPlayer.style.top  = `${player.y}%`;
    newPlayer.style.left = `${player.x}%`;
    const color = player.y > 50 ? 'bg-red-500' : 'bg-blue-500';
    newPlayer.innerHTML = `
    <div class="overflow-hidden drop-shadow-xl">
        <div class="avatar -mb-1 border-gray-300 border-2 ${color} rounded-full w-8 h-8 flex justify-center items-center">
            <svg class="invert" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        </div>
    </div>
    <span class="name text-[10px] [text-shadow:_0_1px_0_rgb(0_0_0_/_70%)] text-white font-[400] relative z-20 -mt-[2px]">${player.alias}</span>`;
    container.appendChild(newPlayer);
    enableDrag(newPlayer);
}

let timeoutId
function enableDrag(element) {
    let offsetX = 0, offsetY = 0, initialX, initialY;
    let currentY = 0
    let currentX = 0
    element.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        initialX = touch.clientX - element.offsetLeft;
        initialY = touch.clientY - element.offsetTop;
    });

    element.addEventListener("touchmove", (e) => {
        e.preventDefault(); // Evita el scroll
        const touch = e.touches[0];
        let x = touch.clientX - initialX;
        let y = touch.clientY - initialY;
        // Restringir el movimiento dentro del contenedor
        const elementRect = element.getBoundingClientRect();
        x = Math.max(0, Math.min(x, width - elementRect.width));
        y = Math.max(0, Math.min(y, height - elementRect.height));
        const porcentX = (x / width) * 100;
        const porcentY = (y / height) * 100;
        currentX = porcentX
        currentY = porcentY
        element.style.left = `${porcentX}%`;
        element.style.top  = `${porcentY}%`;
    });

    element.addEventListener("touchend", () => {
        clearTimeout(timeoutId)
	        timeoutId = setTimeout(() => {
            if(currentY !== 0){
                const color = currentY > 50 ? 'bg-red-500' : 'bg-blue-500';
                element.querySelector('.avatar').classList.remove('bg-blue-500');
                element.querySelector('.avatar').classList.remove('bg-red-500');
                element.querySelector('.avatar').classList.add(color);
            }
            if (element.id !== 'player-temp') {
                const _player_id = Number(element?.id?.split('-')[1]);
                const _currentPlayer = players.find(fplayer=>fplayer?.player_id == _player_id);
                if(_currentPlayer){
                    currentPlayer = JSON.parse(JSON.stringify(_currentPlayer))
                }
                if(currentY > 0){
                    previousCoord = {x: currentPlayer.x, y: currentPlayer.y};
                    currentPlayer.x = Math.floor(currentX);
                    currentPlayer.y = Math.floor(currentY);
                }
                isNewPlayer = false;
                openFormPlayer(true);
            }
        }, 200);
    });
}

function openEventInfo(type) {
    setTimeout(() => {
        document.getElementById('event-container').classList.remove('hidden');
        if(type){
            const date =  new Date(currentEvent.date);
            const formattedDate = timestampTOddd_dd(currentEvent.date);
            const [hour, minute] = currentEvent.time.split(":");
            const dateMils = date.getTime();
    
            /* Status */
            let statusEvent = ''
            document.getElementById('status-event-info').classList.remove('text-red-500');
            document.getElementById('status-event-info').classList.remove('text-blue-500');
            document.getElementById('status-event-info').classList.remove('text-teal-500');
            if(new Date().getDate() > date.getDate()){
                statusEvent = 'Delete'
            }else if(Date.now() > (dateMils + 3600000)){
                statusEvent = 'Finalizado'
                document.getElementById('status-event-info').classList.add('text-red-500');
            }else if(players.length < currentEvent.required_players){
                statusEvent = 'En progreso'
                document.getElementById('status-event-info').classList.add('text-blue-500');
            }else{
                document.getElementById('status-event-info').classList.add('text-teal-500');
                statusEvent = 'Activo';
            }
    
            /* Proximity time */
            const hours = []
            for (const _player of players) {
                hours.push(_player.arrival_time);
            }
            const proximityTime = getAverageTime(hours);

            document.getElementById('event-container').classList.remove('hidden');
            document.getElementById("place-info").textContent = currentEvent.place
            document.getElementById("datetime-info").textContent = formattedDate + '  hora: ' + hour+':'+minute
            document.getElementById("proximity-time-info").textContent = proximityTime || ''
            document.getElementById("players-totals-info").textContent = players.length + ' de ' + currentEvent.required_players
            document.getElementById("status-event-info").textContent = statusEvent
            document.getElementById("description-info").textContent = currentEvent.description

            if(currentEvent.organizer_user_id == myUser.user_id){
                const eventDate = currentEvent.date.split("T")[0];
                document.querySelector('#event-container form [name="date"]').value = eventDate;
                document.querySelector('#event-container form [name="time"]').value = hour+':'+minute;
                document.querySelector('#event-container form [name="place"]').value = currentEvent.place;
                document.querySelector('#event-container form [name="required_players"]').value = currentEvent.required_players;
                document.querySelector('#event-container form [name="state_event"]').value      = currentEvent.state_event;
                document.querySelector('#event-container form [name="description"]').value      = currentEvent.description;
            }else{
                document.querySelector('#event-container form').style.display = 'none';
            }
        }else{
            document.getElementById('event-container').classList.add('hidden');
        }
    }, 150);
}

function openFormPlayer(type) {
    loading.open()
    setTimeout(() => {
        loading.close();
        document.getElementById('add-player-container').classList.remove('hidden');
        document.getElementById('btn-delete-player').classList.remove('hidden');
        if (isNewPlayer) {
            document.getElementById('title-form-player').textContent = 'Agregar Jugador'
            
            document.getElementById('btn-delete-player').classList.add('hidden');
            document.querySelector('#add-player-container [name="name"]').value         = null;
            document.querySelector('#add-player-container [name="arrival_time"]').value = null;
        }else{
            document.getElementById('title-form-player').textContent = 'Actualizar Jugador'
            document.querySelector('#add-player-container [name="name"]').value = currentPlayer.alias;
            document.querySelector('#add-player-container [name="arrival_time"]').value = currentPlayer.arrival_time;
        }
        if (type === false) {
            document.getElementById('add-player-container').classList.add('hidden');
            if(previousCoord){
                const elPlayer = document.getElementById('player-'+currentPlayer.player_id);
                elPlayer.style.top  = `${previousCoord.y}%`;
                elPlayer.style.left = `${previousCoord.x}%`;
                previousCoord = null;
                currentPlayer = null;
            }
        }else{
            if(myUser.user_id === currentEvent.organizer_user_id || myUser.user_id === currentPlayer.user_id || isNewPlayer){
                document.querySelector('#buttons-player').style.display = 'block';
            } else {
                document.querySelector('#buttons-player').style.display = 'none';
            }
        }
    }, 250);
}

function onSubmitUpsertPlayer(event) {
    /* {
        playersEvent
        player_id
        organizer_user_id
        user_id
        event_id
        arrival_time
    } */
    loading.open();
    event.preventDefault();
    const formData = new FormData(event.target);
    const fields = Object.fromEntries(formData.entries());

    const timeValue = fields.arrival_time + (fields.arrival_time.length>0?'':':00');

    const queryData = {
        user_id: myUser.user_id,
        alias: fields.name,
        arrival_time: timeValue,
        event_id: currentEvent.event_id,
        x: Math.floor(currentPlayer.x),
        y: Math.floor(currentPlayer.y)
    }

    selectQuery(queryData, currentPlayer.player_id).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        showError("");
        getPlayers();
        openFormPlayer(false);
    }).catch(error => {
        showError("Error al actualizar evento");
        console.error('>> >>update player error:', error);
    }).finally(() => {
        loading.close();
    })
}
function selectQuery(queryData, id) {
    if (isNewPlayer) {
        return insertPlayer(queryData)
    } else {
        return updatePlayer(id, queryData)
    }
}

function showError(message) {
    loading.close();
    document.getElementById("error-message").textContent = message;
}

function onDeletePlayer() {
    document.getElementById('player-temp')?.remove();
    if(currentPlayer){
        deletePlayerById(currentPlayer.player_id).then(res => {
            if (!!res && res?.error) { throw new Error(res.error) }
            getPlayers();
            openFormPlayer(false);
        }).catch(error => {
            showError("Error al eliminar jugador");
            console.error('>> >>delete player error:', error);
        }).finally(() => {
            loading.close();
        })
    }else{
        openFormPlayer(false);
        showError("");
    }
}
function onCancelUpdate() {
    document.getElementById('player-temp')?.remove();
    openFormPlayer(false);
}
function onCancelInfo() {
    openEventInfo(false);
}

/* Event */
function onSubmitUpdateEvent(event){
    loading.open();
    event.preventDefault();
    const formData = new FormData(event.target);
    const fields = Object.fromEntries(formData.entries());

    const timestamp = `${fields.date} ${fields.time}:00`;
    const timeValue = `${fields.time}:00`;

    const queryData = {
        date: timestamp,
        time: timeValue,
        place: fields.place,
        organizer_user_id: myUser.user_id,
        
        required_players: fields.required_players,
        state_event: fields.state_event,
        description: fields.description,  
    }
    updateEvent(currentEvent.event_id, queryData).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        verificationEvent();
        openEventInfo(false);
    }).catch(error => {
        showError("Error al actualizar evento");
        console.error('>> >>update event error:', error);
    }).finally(() => {
        loading.close();
    })
}

function onDeleteEvent(){
    const isConfirmed = confirm(`¿Está seguro que desea eliminar este evento?`);
    if (isConfirmed) {
        loading.open();
        deleteEvent(currentEvent.event_id).then(res => {
            if (!!res && res?.error) { throw new Error(res.error) }
            redirecViewPage();
        }).catch(error => {
            showError("Error al eliminar evento");
            console.error('>> >>delete event error:', error);
        }).finally(() => {
            loading.close();
        })
    }
}

function signOut(){
    loading.open();
    signOutUser().then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        window.location.href = `login/index.html&_=${new Date().getTime()}`
    }).catch(error => {
        console.error('>> >>sinout auth error:', error);
    }).finally(() => {
        loading.close();
    })
}

createUserVerification();
verificationEvent();
addPlayer();
