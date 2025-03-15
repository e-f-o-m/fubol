
/* ================================= SIGN IN ================================= */
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
        place: fields.place
    }
    insertEvent(queryData).then(res => {
        console.log('>> >>: ', res);
        if (!!res && res?.error) { throw new Error(res.error) }
        showError("Evento creado");
    }).catch(error => {
        showError("Error al insertar evento");
        console.error('>> >>insert event error:', error);
    }).finally(() => {
        loading.close();
    })
}


function toggleForm(formType) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-password-form').classList.add('hidden');
    document.getElementById('new-password-form').classList.add('hidden');
    document.getElementById(formType).classList.remove('hidden');
}