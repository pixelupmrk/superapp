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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = window.location.pathname.includes('login.html');

    // Listener de autenticação centralizado para gerenciar redirecionamentos
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Se o usuário está logado e na página de login, vai para o app
            if (isLoginPage) {
                window.location.replace('index.html');
            }
        } else {
            // Se o usuário não está logado e não está na página de login, vai para o login
            if (!isLoginPage) {
                window.location.replace('login.html');
            }
        }
    });

    // Lógica do formulário de login (só roda na página de login)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loginErrorMessage = document.getElementById('login-error-message');

            firebase.auth().signInWithEmailAndPassword(email, password)
                .catch((error) => {
                    // O redirecionamento em caso de sucesso é feito pelo onAuthStateChanged
                    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                        loginErrorMessage.textContent = 'E-mail ou senha inválidos.';
                    } else {
                        loginErrorMessage.textContent = 'Ocorreu um erro ao tentar fazer login.';
                    }
                    console.error("Erro de login:", error);
                });
        });
    }

    // Lógica do botão de logout (só roda na página principal)
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
