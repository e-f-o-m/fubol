let myUser = null
let eventSelected = null
let events = null
/* ================================= LIST EVENTS ================================= */
async function listEvents() {
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const { error, data } = await getUserByEmail(user.email);
    if(error){ return }
    myUser = data[0]
    getEventsByTODO(myUser.user_id).then(res => {
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

                console.log('>> >>: envetItem.event_id', envetItem.event_id);
                dataHTML += `<li class="mb-2 w-full flex relative transition-all" id="event_id-${envetItem.event_id}">
                    <div class="w-full flex flex-col rounded-lg bg-gray-100 px-4 pb-3 pt-2 gap-1 drop-shadow-sm" onclick="itemOptionsToggle(${envetItem.event_id})">
                        <div class="text-blue-800 font-semibold">⚽ ${envetItem.place}</div>
                        <div class="ml-1 text-sm">${dateFormated} A <span class="text-blue-800 font-semibold">${timeFormated}<span></div>
                    </div>
                    <div class="absolute -right-1 translate-x-full flex gap-1 justify-center align-center h-full">
                        <button class="bg-blue-500 text-white p-2 rounded-2xl shadow-md" onclick="openEvent(${envetItem.event_id})">Abrir</button>
                        
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
    window.location.href = `index.html?event=${base64String}&_=${timestamp}`;
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

function searchEvent(){
    const value = document.getElementById('search-input')?.value;
    eventSelected = events?.filter(res=> res.place?.toLowerCase().includes(value) ||  res.date.includes(value) || res.time.includes(value) );
    if(value){
        document.querySelectorAll('#my-events-container ul > li')?.forEach(res => { 
            res.classList.add('hidden');
        });

        eventSelected?.forEach(res=>{
            document.getElementById(`event_id-${res.event_id}`).classList.remove('hidden');
        });
    }else{
        document.querySelectorAll('#my-events-container ul > li').forEach(res => { 
            res.classList.remove('hidden');
        });
    }
}