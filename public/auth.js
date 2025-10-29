// Arquivo: auth.js (Versão Definitiva)
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

// Inicializa o Firebase (apenas se não estiver inicializado)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
