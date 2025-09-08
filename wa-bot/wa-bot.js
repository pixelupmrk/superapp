window.WABot = (function(){
  let cfg=null, es=null, listeners={status:[], message:[]}, statusObj={connected:false,user:null};
  function init(){
    cfg = window.PIXELUP_BOT_CONFIG || { WA_BASE_URL:'/api' };
    openEvents();
  }
  function on(event, cb){ (listeners[event]||(listeners[event]=[])).push(cb); }
  function emit(event, data){ (listeners[event]||[]).forEach(cb=>{ try{cb(data);}catch(e){} }); }
  function openEvents(){
    try{
      if(es){ es.close(); es=null; }
      const url = cfg.WA_BASE_URL.replace(/\/$/,'') + '/events' + (cfg.API_TOKEN ? ('?token='+encodeURIComponent(cfg.API_TOKEN)) : '');
      es = new EventSource(url);
      es.onmessage = (ev)=>{
        try{
          const data = JSON.parse(ev.data);
          if(data.type==='status'){ statusObj = data; emit('status', statusObj); }
          if(data.type==='message'){ emit('message', data); }
        }catch{}
      };
      es.onerror = ()=>{};
    }catch{}
  }
  async function checkStatus(){
    const url = cfg.WA_BASE_URL.replace(/\/$/,'') + '/status';
    const r = await fetch(url);
    if(!r.ok) throw new Error('status fail');
    const j = await r.json();
    statusObj = j; emit('status', j); return j;
  }
  async function send({to, text}){
    const url = cfg.WA_BASE_URL.replace(/\/$/,'') + '/send';
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({to, text, token: cfg.API_TOKEN||''}) });
    return r.ok ? (await r.json()) : {ok:false};
  }
  return { init, on, checkStatus, send, getStatus:()=>statusObj };
})();