// SUAS CREDENCIAIS DO FIREBASE JÁ ESTÃO AQUI DENTRO
const firebaseConfig = {
  apiKey: "AIzaSyA5H7sBUCdgNueLXvdv_sxPTUHT6n38Z9k",
  authDomain: "superapp-d0368.firebaseapp.com",
  projectId: "superapp-d0368",
  storageBucket: "superapp-d0368.appspot.com",
  messagingSenderId: "469594170619",
  appId: "1:469594-ddee6770-d1ae-400e-99dd-fa4e49024021:web:145a2e1ee3fc807d0bbc5e",
  measurementId: "G-ZZTHW2QHR4"
};

// ======================================================
// NÃO PRECISA MEXER ABAIXO DESTA LINHA
// ======================================================

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = window.location.pathname.includes('login.html');

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Se o usuário está logado e na página de login, redireciona para o app
            if (isLoginPage) {
                window.location.replace('index.html');
            }
        } else {
            // Se o usuário não está logado e NÃO está na página de login, redireciona para o login
            if (!isLoginPage) {
                window.location.replace('login.html');
            }
        }
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loginErrorMessage = document.getElementById('login-error-message');
            loginErrorMessage.textContent = ''; // Limpa a mensagem de erro

            firebase.auth().signInWithEmailAndPassword(email, password)
                .catch((error) => {
                    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                        loginErrorMessage.textContent = 'E-mail ou senha inválidos.';
                    } else {
                        loginErrorMessage.textContent = 'Ocorreu um erro ao tentar fazer login.';
                        console.error("Erro de login:", error);
                    }
                });
        });
    }

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut().catch((error) => {
                console.error("Erro ao sair:", error);
            });
        });
    }
});
