import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Inicializa Firebase
const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

// UI refs
const loginForm = document.getElementById('loginForm');
const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const btnSignup = document.getElementById('btnSignup');
const btnLogout = document.getElementById('btnLogout');
const authInfo = document.getElementById('authInfo');

const cName = document.getElementById('cName');
const cPhone = document.getElementById('cPhone');
const cPlate = document.getElementById('cPlate');
const cNotes = document.getElementById('cNotes');
const btnSave = document.getElementById('btnSave');
const btnClear = document.getElementById('btnClear');
const contactsBody = document.getElementById('contactsBody');

// WhatsApp quick send (CRM form)
const waForm = document.getElementById('waForm');
const waTo = document.getElementById('waTo');
const waText = document.getElementById('waText');
const btnSendWA = document.getElementById('btnSendWA');
const waSendResult = document.getElementById('waSendResult');

let unsubContacts = null;
let currentUid = null;

btnLogin.addEventListener('click', async ()=>{
  const email = emailEl.value.trim();
  const pass = passEl.value.trim();
  if(!email || !pass) return;
  try{
    await signInWithEmailAndPassword(auth, email, pass);
  }catch(err){
    authInfo.textContent = 'Erro ao entrar: ' + err.message;
  }
});

btnSignup.addEventListener('click', async ()=>{
  const email = emailEl.value.trim();
  const pass = passEl.value.trim();
  if(!email || !pass) return;
  try{
    await createUserWithEmailAndPassword(auth, email, pass);
  }catch(err){
    authInfo.textContent = 'Erro ao criar conta: ' + err.message;
  }
});

btnLogout.addEventListener('click', async ()=>{
  await signOut(auth);
});

onAuthStateChanged(auth, (user)=>{
  if(user){
    currentUid = user.uid;
    authInfo.textContent = 'Logado como ' + (user.email || user.uid);
    btnLogout.disabled = false;
    startContactsListener();
  }else{
    currentUid = null;
    authInfo.textContent = 'Não autenticado.';
    btnLogout.disabled = true;
    if(unsubContacts) unsubContacts();
    contactsBody.innerHTML = '';
  }
});

function startContactsListener(){
  if(unsubContacts) unsubContacts();
  const colRef = collection(db, 'users', currentUid, 'contacts');
  unsubContacts = onSnapshot(colRef, (snap)=>{
    contactsBody.innerHTML = '';
    snap.forEach(docSnap => {
      const c = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(c.name||'')}</td>
        <td>${escapeHtml(c.phone||'')}</td>
        <td>${escapeHtml(c.plate||'')}</td>
        <td>${escapeHtml(c.notes||'')}</td>
        <td class="stack">
          <button class="btn secondary" data-edit="${docSnap.id}">Editar</button>
          <button class="btn secondary" data-wa="${c.phone||''}">WhatsApp</button>
          <button class="btn secondary" data-del="${docSnap.id}">Apagar</button>
        </td>
      `;
      contactsBody.appendChild(tr);
    });
  });
}

btnSave.addEventListener('click', async ()=>{
  if(!currentUid){ authInfo.textContent='Faça login.'; return; }
  const payload = {
    name: cName.value.trim(),
    phone: cPhone.value.trim(),
    plate: cPlate.value.trim(),
    notes: cNotes.value.trim(),
    ts: serverTimestamp()
  };
  if(!payload.name){ return; }
  try{
    await addDoc(collection(db, 'users', currentUid, 'contacts'), payload);
    cName.value = cPhone.value = cPlate.value = cNotes.value = '';
  }catch(err){
    alert('Erro ao salvar: ' + err.message);
  }
});

btnClear.addEventListener('click', ()=>{
  cName.value = cPhone.value = cPlate.value = cNotes.value = '';
});

contactsBody.addEventListener('click', async (e)=>{
  const editId = e.target.getAttribute('data-edit');
  const delId = e.target.getAttribute('data-del');
  const waNum = e.target.getAttribute('data-wa');
  if(editId){
    const tr = e.target.closest('tr');
    cName.value = tr.children[0].textContent;
    cPhone.value = tr.children[1].textContent;
    cPlate.value = tr.children[2].textContent;
    cNotes.value = tr.children[3].textContent;
    alert('Edite os campos e clique "Salvar contato" para criar uma nova versão. (Implementação simples)');
  }else if(delId){
    if(confirm('Apagar contato?')){
      await deleteDoc(doc(db, 'users', currentUid, 'contacts', delId));
    }
  }else if(waNum){
    waTo.value = waNum;
  }
});

btnSendWA.addEventListener('click', async ()=>{
  const to = waTo.value.trim();
  const text = waText.value.trim();
  if(!to || !text) return;
  try{
    const r = await window.WABot.sendMessage({to, text});
    waSendResult.textContent = r && r.ok ? 'Mensagem enviada!' : 'Falha ao enviar.';
  }catch(err){
    waSendResult.textContent = 'Erro: ' + err.message;
  }
});

function escapeHtml(str){ return (str||'').replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
