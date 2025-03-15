
/* ================================= SIGN IN ================================= */
function onSubmitSignIn(event) {
    /* {
        "email": "domain@gmail.com",
        "password": "123"
    } */
    loading.open();
    event.preventDefault();
    const formData = new FormData(event.target);
    const fields = Object.fromEntries(formData.entries());

    const queryData = {
        email: fields.email,
        password: fields.password
    }
    signInUser(queryData).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        window.location.href = `index.html?_=${new Date().getTime()}`
    }).catch(error => {
        showError("Error al iniciar sesión");
        console.error('>> >>login auth error:', error);
    }).finally(() => {
        loading.close();
    })
}

/* ================================= SIGN UP ================================= */
function onSubmitSignUp(event) {
    /* {
        "name": "elkin",
        "email": "domain@gmail.com",
        "password": "123",
        "passwordConfirm": "1234"
        } */
    loading.open();
    event.preventDefault();
    const formData = new FormData(event.target);
    const fields = Object.fromEntries(formData.entries());

    // Validaciones
    if (!fields.name || !fields.email || !fields.password || !fields.passwordConfirm) {
        showError("Todos los campos son obligatorios");
        return;
    }

    if (!isValidEmail(fields.email)) {
        showError("Correo electrónico no válido");
        return;
    }

    if (fields.password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres");
        return;
    }

    if (fields.password !== fields.passwordConfirm) {
        showError("Las contraseñas no coinciden");
        return;
    }

    signUpUser({password: fields.password,email: fields.email, user_metadata: { name: fields.name } }).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        toggleForm('login-form');
    }).catch(error => {
        showError("Error al registrarse");
        console.error('>> >>login auth error:', error);
    }).finally(() => {
        loading.close();
    })
}

// Función para mostrar errores
function showError(message) {
    loading.close();
    document.getElementById("error-message").textContent = message;
}

// Función para validar email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}



/* ================================= RESTORE PASSWORD ================================= */
function onSubmitResetPassword(event) {
    /* {
        "email": "domain@gmail.com"
    } */
    loading.open();
    event.preventDefault();
    const formData = new FormData(event.target);
    const fields = Object.fromEntries(formData.entries());

    if (!isValidEmail(fields.email)) {
        showError("Correo electrónico no válido");
        return;
    }

    resetPasswordForEmail(fields.email).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        showError("Primero revisa tu correo");
        toggleForm('new-password-form');
    }).catch(error => {
        showError("Error al recuperar contraseña");
        console.error('>> >>restore auth error:', error);
    }).finally(() => {
        loading.close();
    });
}

/* ================================= RESTORE PASSWORD ================================= */
function onSubmitNewPassword(event) {
    /* {
        "email": "domain@gmail.com",
        "password": "123",
        "passwordConfirm": "1234"
    } */
    loading.open();
    event.preventDefault();
    const formData = new FormData(event.target);
    const fields = Object.fromEntries(formData.entries());

    // Validaciones
    if (!fields.email || !fields.password || !fields.passwordConfirm) {
        showError("Todos los campos son obligatorios");
        return;
    }

    if (!isValidEmail(fields.email)) {
        showError("Correo electrónico no válido");
        return;
    }

    if (fields.password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres");
        return;
    }

    if (fields.password !== fields.passwordConfirm) {
        showError("Las contraseñas no coinciden");
        return;
    }

    const queryData = {
        password: fields.password,
        email: fields.email,
    };
    newPassword(queryData).then(res => {
        if (!!res && res?.error) { throw new Error(res.error) }
        toggleForm('login-form');
    }).catch(error => {
        showError("Error al cambiar la contraseña");
        console.error('>> >>new pass auth error:', error);
    }).finally(() => {
        loading.close();
    })
}



function onSubmitSignOut() {
}


function toggleForm(formType) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-password-form').classList.add('hidden');
    document.getElementById('new-password-form').classList.add('hidden');
    document.getElementById(formType).classList.remove('hidden');
}