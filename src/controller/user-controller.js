const supabaseClient = supabase.createClient('https://mfneijiqlqzdivfpopol.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbmVpamlxbHF6ZGl2ZnBvcG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzkwNzYsImV4cCI6MjA1NzMxNTA3Nn0.xQ9xjZEIk690Oj9B7-GXYzdphX6kmRh1Mqqv6UG8V28')

/* Auth */
async function verification() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user?.aud) {
        if (window.location.href.includes("login/index.html")) {
            window.location.href = `index.html&_=${new Date().getTime()}`
        }
    } else {
        if (!window.location.href.includes("login/index.html")) {
            window.location.href = `login/index.html&_=${new Date().getTime()}`
        }
    }
}
verification();

async function updateUserAuth(idAuth, params) {
    const { data, error } = await supabaseClient.auth.admin.updateUserById(idAuth, params);
    return { data, error };
}


/* ==== Table === */

async function getUserByEmail(params) {
    const { data, error } = await supabaseClient.from('user').select().eq('email', params);
    return { data, error };
}

async function insertUser(params) {
    const { data, error } = await supabaseClient.from('user').insert(params).select();
    return { data, error };
}


async function signUpUser(params) {
    const { data, error } = await supabaseClient.auth.signUp(params);
    return { data, error }
}

async function signInUser(params) {
    const { data, error } = await supabaseClient.auth.signInWithPassword(params);
    return { data, error }
}


async function resetPasswordForEmail(params) {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(params);
    return { data, error }
}

async function newPassword(params) {
    const { data, error } = await supabaseClient.auth.updateUser(params);
    return { data, error }
}

async function signOutUser() {
    let { error } = await supabaseClient.auth.signOut()
    return { error }
}