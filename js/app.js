(function(){
  const tabs = document.getElementById('tabs');
  const panels = { home: byId('panel-home'), crm: byId('panel-crm'), mentoria: byId('panel-mentoria') };
  tabs.addEventListener('click', (e)=>{
    if(e.target.tagName==='BUTTON'){ show(e.target.dataset.tab); }
  });
  document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', ()=> show(btn.dataset.goto)));
  function show(tab){
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
    Object.keys(panels).forEach(k => panels[k].classList.toggle('active', k===tab));
  }
  // Gate
  const gate = byId('gate'); const gatePass = byId('gatePass'); const gateBtn = byId('gateBtn'); const gateSkip = byId('gateSkip'); const gateHint = byId('gateHint');
  const ACCESS_PASS = (window.ACCESS_PASS||'').trim();
  const PRELOGIN = !!(window.FEATURES && window.FEATURES.PRELOGIN);
  if(PRELOGIN){
    const unlocked = localStorage.getItem('px_gate_ok')==='1';
    if(ACCESS_PASS==='' || unlocked){ /* bypass */ }
    else{
      gate.style.display='flex';
      gateHint.textContent = 'Dica: defina ACCESS_PASS="" para desativar.';
      gateBtn.onclick = ()=>{
        if(gatePass.value.trim()===ACCESS_PASS){
          localStorage.setItem('px_gate_ok','1'); gate.style.display='none';
        }else{ gateHint.textContent='Senha incorreta'; }
      };
      gateSkip.onclick = ()=>{ gateHint.textContent='Bloqueado. Informe a senha.'; };
    }
  }
  function byId(id){ return document.getElementById(id); }
})();