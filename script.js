const firebaseConfig = {
  apiKey: "AIzaSyA5H7sBUCdgNueLXvdv_sxPTUHT6n38Z9k",
  authDomain: "superapp-d0368.firebaseapp.com",
  projectId: "superapp-d0368",
  storageBucket: "superapp-d0368.appspot.com",
  messagingSenderId: "469594170619",
  appId: "1:469594-ddee6770-d1ae-400e-99dd-fa4e49024021:web:145a2e1ee3fc807d0bbc5e",
  measurementId: "G-ZZTHW2QHR4"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = window.location.pathname.includes('login.html');
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            if (isLoginPage) window.location.replace('index.html');
        } else {
            if (!isLoginPage) window.location.replace('login.html');
        }
    });
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loginErrorMessage = document.getElementById('login-error-message');
            loginErrorMessage.textContent = '';
            firebase.auth().signInWithEmailAndPassword(email, password)
                .catch(() => { loginErrorMessage.textContent = 'E-mail ou senha inválidos.'; });
        });
    }
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut();
        });
    }
});
