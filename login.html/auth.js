document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginErrorMessage = document.getElementById('login-error-message');
    const logoutButton = document.getElementById('logout-btn');

    // Se o formulário de login existir na página
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginEmail.value;
            const password = loginPassword.value;

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Login bem-sucedido, redireciona para o app principal
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    // Mostra uma mensagem de erro amigável
                    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                        loginErrorMessage.textContent = 'E-mail ou senha inválidos.';
                    } else {
                        loginErrorMessage.textContent = 'Ocorreu um erro ao tentar fazer login.';
                    }
                    console.error("Erro de login:", error);
                });
        });
    }

    // Se o botão de logout existir na página
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                // Logout bem-sucedido, redireciona para a página de login
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error("Erro ao sair:", error);
            });
        });
    }

    // Verifica o estado do usuário em todas as páginas
    firebase.auth().onAuthStateChanged((user) => {
        const isLoginPage = window.location.pathname.includes('login.html');
        const isAppPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';

        if (user) {
            // Usuário está logado
            if (isLoginPage) {
                // Se estiver na página de login, redireciona para o app
                window.location.href = 'index.html';
            }
        } else {
            // Usuário não está logado
            if (isAppPage) {
                // Se estiver em qualquer página do app (que não seja a de login), redireciona para lá
                window.location.href = 'login.html';
            }
        }
    });
});
