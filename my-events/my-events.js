let myUser = null
let eventSelected = null
let events = null
/* ================================= LIST EVENTS ================================= */
async function listEvents() {
    toggleForm('my-events-container');
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const { error, data } = await getUserByEmail(user.email);
    if(error){ return }
    myUser = data[0]
    getEventsByOrganizerUserId(myUser.user_id).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        if(res?.data?.length > 0){
            events = res?.data 
            let dataHTML = '<ul class="w-full overflow-hidden transition-all">'
            for (const envetItem of res.data) {
                const date = new Date(envetItem.date);
                const formattedDate = date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                });

                const dateFormated = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

                const [hour, minute] = envetItem.time.split(":"); // Extraer HH y MM
                const timeObj = new Date();
                timeObj.setHours(hour, minute); // Asignar la hora al objeto Date
                const timeFormated = timeObj.toLocaleTimeString("es-ES", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                });

                dataHTML += `<li class="mb-2 w-full flex relative transition-all" id="event_id-${envetItem.event_id}">
                    <div class="w-full flex flex-col rounded-lg bg-gray-100 px-4 pb-3 pt-2 gap-1 drop-shadow-sm" onclick="itemOptionsToggle(${envetItem.event_id})">
                        <div class="text-blue-800 font-semibold">⚽ ${envetItem.place}</div>
                        <div class="ml-1 text-sm">${dateFormated} A <span class="text-blue-800 font-semibold">${timeFormated}<span></div>
                    </div>
                    <div class="absolute -right-1 translate-x-full flex gap-1 justify-center align-center h-full">
                        <button class="bg-blue-500 text-white p-2 rounded-2xl shadow-md" onclick="openEvent(${envetItem.event_id})">Abrir</button>
                        <button class="bg-blue-500 text-white p-2 rounded-2xl shadow-md" onclick="toggleForm('update-event-container')">Editar</button>
                    </div>
                </li>`
            }
            dataHTML += '</ul>'
            document.getElementById('my-events-container').innerHTML = dataHTML
        }else{
            document.getElementById('my-events-container').innerHTML = `<p class="text-gray-300 mt-16">No tienes eventos programador</p>`
        }
    }).catch(error => {
        alert("Error al listar eventos");
        console.error('>> >>list error:', error);
    }).finally(() => {
        loading.close();
    })
}
listEvents();

function openEvent(event_id) {
    const obj = { event_id: event_id, type: 1 };
    const jsonString = JSON.stringify(obj);
    const base64String = btoa(jsonString);
    const timestamp = new Date().getTime();
    window.location.href = `../index.html?event=${base64String}&_=${timestamp}`;
}

function itemOptionsToggle(event_id){
    eventSelected = events.find(res=>res.event_id == event_id);
    const element = document.getElementById('event_id-'+event_id);
    if (element.style.transform === "translateX(-124px)") {
        element.style.transform = "translateX(0)"; // Vuelve a su posición original
    } else {
        element.style.transform = "translateX(-124px)"; // Mueve hacia la izquierda
    }
}

/* ================================= CREATE EVENT ================================= */
function onSubmitCreateEvent(event) {
    /* {
        date: "34243434"
        time: "12:40"
        place: "lugar"
    } */
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
    insertEvent(queryData).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        showError("");
        listEvents();
    }).catch(error => {
        showError("Error al insertar evento");
        console.error('>> >>insert event error:', error);
    }).finally(() => {
        loading.close();
    })
}

function onSubmitUpdateEvent(event) {
    /* {
        date: "34243434"
        time: "12:40"
        place: "lugar"
    } */
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
    updateEvent(eventSelected.event_id, queryData).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        showError("");
        listEvents();
    }).catch(error => {
        showError("Error al actualizar evento");
        console.error('>> >>update event error:', error);
    }).finally(() => {
        loading.close();
    })
}

async function onDeleteEvent(){
    const isConfirmed = confirm(`¿Está seguro que desea eliminar este evento?`);
    if (isConfirmed) {
        loading.open();
        deleteEvent(eventSelected.event_id).then(res => {
            if (!!res && res?.error) { throw new Error(res.error) }
            showError("");
            alert('Evento Eliminado')
            listEvents();
        }).catch(error => {
            showError("Error al eliminar evento");
            console.error('>> >>delete event error:', error);
        }).finally(() => {
            loading.close();
        })
    }
}
async function onCancelUpdate(){
    eventSelected = null;
    toggleForm('my-events-container');
}

function showError(message) {
    loading.close();
    document.getElementById("error-message").textContent = message;
}

function toggleForm(formType) {
    document.getElementById('my-events-container').classList.add('hidden');
    document.getElementById('create-event-container').classList.add('hidden');
    document.getElementById('update-event-container').classList.add('hidden');

    document.getElementById('btn-create-events').classList.add('hidden');
    document.getElementById('btn-my-events').classList.add('hidden');
    document.getElementById(formType).classList.remove('hidden');
    if(formType === 'my-events-container'){
        document.getElementById('btn-create-events').classList.remove('hidden');
    }else if(formType === 'create-event-container'){
        document.getElementById('btn-my-events').classList.remove('hidden')
    }else if(formType === 'update-event-container'){
        const eventDate = eventSelected.date.split("T")[0];
        const [hour, minute] = eventSelected.time.split(":");
        document.querySelector('#update-event-container form [name="date"]').value = eventDate;
        document.querySelector('#update-event-container form [name="time"]').value = hour+':'+minute;
        document.querySelector('#update-event-container form [name="place"]').value = eventSelected.place;
        document.querySelector('#update-event-container form [name="required_players"]').value = eventSelected.required_players;
        document.querySelector('#update-event-container form [name="state_event"]').value      = eventSelected.state_event;
        document.querySelector('#update-event-container form [name="description"]').value      = eventSelected.description;
    }
}