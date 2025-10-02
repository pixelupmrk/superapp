// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5H7sBUCdgNueLXvdv_sxPTUHT6n38Z9k",
  authDomain: "superapp-d0368.firebaseapp.com",
  projectId: "superapp-d0368",
  storageBucket: "superapp-d0368.firebasestorage.app",
  messagingSenderId: "469594170619",
  appId: "1:469594170619:web:145a2e1ee3fc807d0bbc5e",
  measurementId: "G-ZZTHW2QHR4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);//
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
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
