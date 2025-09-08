// Cliente front-end para seu backend WhatsApp (Baileys)
// Espera endpoints descritos em window.PIXELUP_BOT_CONFIG (definido em index.html)
window.WABot = (function(){
  let cfg = null;
  let statusWatcher = null;
  let msgWatcher = null;
  let es = null;

  async function init({onStatus, onMessage}){
    cfg = window.PIXELUP_BOT_CONFIG || {};
    statusWatcher = onStatus || (()=>{});
    msgWatcher = onMessage || (()=>{});

    // Primeiro, checar status
    try{
      const s = await checkStatus();
      statusWatcher(s);
    }catch(e){
      statusWatcher({connected:false});
    }

    // Abrir SSE de eventos (se disponível)
    openEvents();
  }

  function openEvents(){
    if(!cfg || !cfg.WA_BASE_URL) return;
    try{
      if(es){ es.close(); es = null; }
      const url = cfg.WA_BASE_URL.replace(/\/$/,'') + '/events' + (cfg.API_TOKEN ? ('?token='+encodeURIComponent(cfg.API_TOKEN)) : '');
      es = new EventSource(url);
      es.onmessage = (ev)=>{
        try{
          const data = JSON.parse(ev.data);
          // Esperado: {type:'message', from, to, text, ts}
          if(data && data.type==='message'){
            msgWatcher(data);
          }else if(data && data.type==='status'){
            statusWatcher(data);
          }
        }catch{}
      };
      es.onerror = ()=>{/*silenciar*/};
    }catch{}
  }

  async function checkStatus(){
    if(!cfg || !cfg.WA_BASE_URL) throw new Error('WA_BASE_URL não configurado');
    const url = cfg.WA_BASE_URL.replace(/\/$/,'') + '/status';
    const r = await fetch(url);
    if(!r.ok) throw new Error('Falha ao consultar status');
    return await r.json();
  }

  async function sendMessage({to, text}){
    if(!cfg || !cfg.WA_BASE_URL) return {ok:false, error:'WA_BASE_URL não configurado'};
    const url = cfg.WA_BASE_URL.replace(/\/$/,'') + '/send';
    const r = await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({to, text, token: cfg.API_TOKEN || ''})
    });
    try{
      const j = await r.json();
      return j;
    }catch{
      return {ok:false};
    }
  }

  return { init, checkStatus, sendMessage };
})();
