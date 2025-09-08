// Navegação entre abas e integração de UI com o bot
(function(){
  const tabs = document.getElementById('tabs');
  const goButtons = document.querySelectorAll('[data-goto]');
  const panels = {
    home: document.getElementById('panel-home'),
    crm: document.getElementById('panel-crm'),
    mentoria: document.getElementById('panel-mentoria'),
  };

  function show(tab){
    for(const b of tabs.querySelectorAll('button')) b.classList.toggle('active', b.dataset.tab===tab);
    Object.keys(panels).forEach(k => panels[k].classList.toggle('active', k===tab));
  }

  tabs.addEventListener('click', (e)=>{
    if(e.target.tagName==='BUTTON'){
      show(e.target.dataset.tab);
    }
  });
  goButtons.forEach(btn => btn.addEventListener('click', ()=> show(btn.dataset.goto)));

  // Chat widget
  const fab = document.getElementById('chatFab');
  const drawer = document.getElementById('chatDrawer');
  const closeBtn = document.getElementById('chatClose');
  const chatList = document.getElementById('chatList');
  const chatTo = document.getElementById('chatTo');
  const chatText = document.getElementById('chatText');
  const chatSend = document.getElementById('chatSend');

  fab.addEventListener('click', ()=> drawer.classList.add('open'));
  closeBtn.addEventListener('click', ()=> drawer.classList.remove('open'));

  function appendMsg({who='Você', text, ts=Date.now()}){
    const div = document.createElement('div');
    div.className='chat-msg';
    const date = new Date(ts).toLocaleString();
    div.innerHTML = `<strong>${who}</strong> <span class="muted" style="font-size:12px">${date}</span><br>${escapeHtml(text)}`;
    chatList.appendChild(div);
    chatList.scrollTop = chatList.scrollHeight;
  }

  chatSend.addEventListener('click', async ()=>{
    const to = chatTo.value.trim();
    const text = chatText.value.trim();
    if(!to || !text){ return }
    appendMsg({who:'Você', text});
    chatText.value='';
    try{
      const r = await WABot.sendMessage({to, text});
      if(!r.ok) appendMsg({who:'Sistema', text:'Falha ao enviar.'});
    }catch(err){
      appendMsg({who:'Sistema', text:'Erro ao enviar: '+err});
    }
  });

  // WA status & events
  const waDot = document.getElementById('waDot');
  const waLabel = document.getElementById('waLabel');
  const miniStatus = document.getElementById('miniStatus');
  const btnCheckWA = document.getElementById('btnCheckWA');
  const waStatusText = document.getElementById('waStatusText');

  function setStatus(connected, user){
    waDot.classList.toggle('on', connected);
    waDot.classList.toggle('off', !connected);
    waLabel.textContent = connected ? `WhatsApp: conectado${user? ' ('+user+')':''}` : 'WhatsApp: desconectado';
    miniStatus.textContent = connected ? 'WA on' : 'WA off';
    waStatusText.textContent = connected ? 'on' : 'off';
  }

  btnCheckWA.addEventListener('click', async ()=> {
    const s = await WABot.checkStatus();
    setStatus(s.connected, s.user);
  });

  // Iniciar bot
  WABot.init({
    onStatus:(s)=> setStatus(s.connected, s.user),
    onMessage:(m)=> {
      appendMsg({who: m.from || 'Contato', text: m.text || '', ts: m.ts || Date.now()});
    }
  });

  function escapeHtml(str){
    return str.replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  }
})();
