// SUAS CREDENCIAIS DO FIREBASE JÁ ESTÃO AQUI DENTRO
const firebaseConfig = {
  apiKey: "AIzaSyA5H7sBUCdgNueLXvdv_sxPTUHT6n38Z9k",
  authDomain: "superapp-d0368.firebaseapp.com",
  projectId: "superapp-d0368",
  storageBucket: "superapp-d0368.appspot.com",
  messagingSenderId: "469594170619",
  appId: "1:469594170619:web:145a2e1ee3fc807d0bbc5e",
  measurementId: "G-ZZTHW2QHR4"
};

// ======================================================
// NÃO PRECISA MEXER ABAIXO DESTA LINHA
// ======================================================

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

    // --- LÓGICA DO BOTÃO SAIR (MOVIDA PARA O SCRIPT PRINCIPAL) ---
    // A lógica do logout será controlada pelo script.js para garantir que tudo carregue primeiro.

    // --- PROTEÇÃO DE PÁGINAS ---
    firebase.auth().onAuthStateChanged((user) => {
        const isLoginPage = window.location.pathname.includes('login.html');
        
        if (user && isLoginPage) {
            window.location.replace('index.html');
        } else if (!user && !isLoginPage) {
            window.location.replace('login.html');
        }
    });
});
