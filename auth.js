// ATENÇÃO: COLE A SUA CONFIGURAÇÃO DO FIREBASE AQUI DENTRO
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Não precisa mexer abaixo desta linha
// Inicializa o Firebase apenas uma vez
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-btn');

    // --- LÓGICA DA PÁGINA DE LOGIN ---
    if (loginForm) {
        const loginEmail = document.getElementById('login-email');
        const loginPassword = document.getElementById('login-password');
        const loginErrorMessage = document.getElementById('login-error-message');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginEmail.value;
            const password = loginPassword.value;

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                        loginErrorMessage.textContent = 'E-mail ou senha inválidos.';
                    } else {
                        loginErrorMessage.textContent = 'Ocorreu um erro ao tentar fazer login.';
                    }
                    console.error("Erro de login:", error);
                });
        });
    }

    // --- LÓGICA DO BOTÃO SAIR ---
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error("Erro ao sair:", error);
            });
        });
    }

    // --- PROTEÇÃO DE PÁGINAS ---
    firebase.auth().onAuthStateChanged((user) => {
        const isLoginPage = window.location.pathname.includes('login.html');
        
        if (user && isLoginPage) {
            // Se o usuário está logado E está na página de login, manda para o app
            window.location.replace('index.html');
        } else if (!user && !isLoginPage) {
            // Se o usuário NÃO está logado E NÃO está na página de login, manda para o login
            window.location.replace('login.html');
        }
    });
});
