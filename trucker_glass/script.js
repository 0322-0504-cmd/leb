/* Glass Trucker NUI Controller */
(function(){
  const hasNative = typeof window.invokeNative !== 'undefined';

  const el = (id) => document.getElementById(id);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const state = {
    currentTab: 'rental',
    vehicles: [
      { key: 'mule', name: 'Mule', image: './images/mule.png', type: 'box', reqLevel: 1, rewards: { money:[800,1200], exp: 2 }, desc: 'Compact local delivery truck.' },
      { key: 'benson', name: 'Benson', image: './images/benson.png', type: 'box', reqLevel: 3, rewards: { money:[1400,2000], exp: 2 }, desc: 'Versatile mid-capacity truck.' },
      { key: 'phantom3', name: 'Phantom 3', image: './images/phantom3.png', type: 'trailer', reqLevel: 5, rewards: { money:[2200,3200], exp: [3,10] }, desc: 'Heavy prime mover for trailers.' },
      { key: 'trailers', name: 'Trailer', image: './images/trailers.png', type: 'trailer', reqLevel: 5, rewards: { money:[400,800], exp: [1,3] }, desc: 'Cargo trailer attachment.' }
    ],
    vIndex: 2,
    player: { name: 'Driver', level: 1, exp: 0, deliveries: 0, earnings: 0, tier: 'Rookie' },
    difficulties: null,
    currentJob: null,
    delivery: { dest: null, progress: 0, secondsLeft: 0, timerId: null }
  };

  function send(action, data={}){
    if(hasNative){
      fetch(`https://${GetParentResourceName()}/${action}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).catch(()=>{});
    } else {
      console.log('NUI:', action, data);
    }
  }

  function formatMoney(range){
    if(Array.isArray(range)) return `$${range[0]}-$${range[1]}`;
    return `$${range}`;
  }

  function setActiveTab(tab){
    state.currentTab = tab;
    $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
    $$('.view').forEach(v=>v.classList.remove('active'));
    el(`view-${tab}`).classList.add('active');
  }

  function updatePlayerInfo(player){
    state.player = { ...state.player, ...player };
    el('playerName').textContent = state.player.name || 'Driver';
    el('playerLevel').textContent = `Lv ${state.player.level||1}`;
    el('playerEarnings').textContent = `$${(state.player.earnings||0).toLocaleString()}`;
    el('playerTier').textContent = computeTier(state.player.level||1);

    const required = Math.max(100, (state.player.level||1) * 100);
    const cur = Math.min(state.player.exp||0, required);
    el('expText').textContent = `${cur} / ${required}`;
    el('expFill').style.width = `${(cur/required)*100}%`;
  }

  function computeTier(level){
    if(level >= 25) return 'Elite';
    if(level >= 15) return 'Pro';
    if(level >= 8) return 'Skilled';
    return 'Rookie';
  }

  function renderCarousel(){
    const v = state.vehicles[state.vIndex];
    if(!v) return;
    el('carImage').src = v.image;
    el('carName').textContent = v.name;
    el('carType').textContent = v.type === 'trailer' ? 'Trailer' : 'Box';
    el('carReq').textContent = `Req Lv ${v.reqLevel}`;
    el('carDesc').textContent = v.desc;
    const exp = Array.isArray(v.rewards.exp) ? `${v.rewards.exp[0]}-${v.rewards.exp[1]} XP` : `${v.rewards.exp} XP`;
    el('carRewards').textContent = `${formatMoney(v.rewards.money)} • ${exp}`;

    const dots = el('carDots');
    dots.innerHTML = '';
    state.vehicles.forEach((_, i)=>{
      const d = document.createElement('button');
      d.className = 'dot'+(i===state.vIndex?' active':'');
      d.addEventListener('click', ()=>{ state.vIndex = i; renderCarousel(); });
      dots.appendChild(d);
    });
  }

  function prevVehicle(){ state.vIndex = (state.vIndex - 1 + state.vehicles.length) % state.vehicles.length; renderCarousel(); }
  function nextVehicle(){ state.vIndex = (state.vIndex + 1) % state.vehicles.length; renderCarousel(); }

  function renderJobs(){
    const grid = el('jobsGrid');
    grid.innerHTML = '';
    if(!state.difficulties) return;
    Object.entries(state.difficulties).forEach(([key, d])=>{
      const unlocked = (state.player.level||1) >= (d.requiredLevel||1);
      const isActive = state.currentJob && state.currentJob.difficulty === key;
      const card = document.createElement('div');
      card.className = 'jobcard'+(!unlocked || isActive ? ' disabled':'');
      const typeText = d.type === 'trailer' ? 'Trailer delivery' : `${d.boxes||0} boxes`;
      const xp = Array.isArray(d.rewards?.exp) ? `${d.rewards.exp[0]}-${d.rewards.exp[1]} XP` : `${(d.boxes||0) * (d.rewards?.exp||2)} XP`;
      card.innerHTML = `
        <div class="jobcard__head">
          <div class="jobcard__title">${d.label||key}</div>
          <div class="pill">Lv ${d.requiredLevel||1}</div>
        </div>
        <div class="jobcard__row">${typeText} • ${formatMoney(d.rewards.money)} • ${xp}</div>
      `;
      if(unlocked && !isActive){
        card.addEventListener('click', ()=> startJob(key));
      }
      grid.appendChild(card);
    });
  }

  function updateDelivery(view){
    const v = { ...state.delivery, ...view };
    state.delivery = v;
    el('deliveryDest').textContent = v.dest || 'N/A';
    el('deliveryFill').style.width = `${Math.max(0, Math.min(100, v.progress||0))}%`;
    el('deliveryStatus').textContent = v.status || 'En route';
    if(typeof v.secondsLeft === 'number') el('deliveryTimer').textContent = secondsToClock(v.secondsLeft);
  }

  function secondsToClock(s){
    const m = Math.floor(s/60); const ss = s%60; return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }

  // Actions
  function rentVehicle(){
    const v = state.vehicles[state.vIndex];
    if(!v) return;
    send('rentVehicle', { vehicleType: v.key, difficulty: v.type==='trailer'?'hard':(v.reqLevel>=3?'medium':'easy'), vehicleName: v.name });
  }
  function startJob(diff){
    const d = diff || bestDifficultyForLevel();
    send('startJob', { difficulty: d });
  }
  function cancelAll(){ send('cancelJob', {}); }
  function closeUI(){ document.body.classList.add('hidden'); send('closeNUI', {}); }

  function bestDifficultyForLevel(){
    if(!state.difficulties) return 'easy';
    const lvl = state.player.level||1;
    const order = ['easy','medium','hard'];
    let pick = 'easy';
    order.forEach(n=>{ const req = state.difficulties[n]?.requiredLevel||1; if(lvl>=req) pick=n; });
    return pick;
  }

  // UI hooks
  $$('.tab').forEach(t=> t.addEventListener('click', ()=> setActiveTab(t.dataset.tab)) );
  el('carPrev').addEventListener('click', prevVehicle);
  el('carNext').addEventListener('click', nextVehicle);
  el('btnRent').addEventListener('click', rentVehicle);
  el('btnStart').addEventListener('click', ()=> startJob());
  el('btnCancel').addEventListener('click', cancelAll);
  el('btnClose').addEventListener('click', closeUI);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeUI(); });

  // Initialize
  renderCarousel();
  setActiveTab('rental');
  updatePlayerInfo(state.player);

  // Message handling
  window.addEventListener('message', (event)=>{
    const data = event.data || {};
    switch(data.action){
      case 'openJobMenu':
        updatePlayerInfo(data.playerStats||{});
        state.difficulties = data.difficulties || state.difficulties;
        state.currentJob = data.currentJob || null;
        renderJobs();
        setActiveTab('jobs');
        document.body.classList.remove('hidden');
        break;
      case 'openRentMenu':
        updatePlayerInfo(data.playerData||{});
        if(Array.isArray(data.vehicles)){
          state.vehicles = data.vehicles.map(v=>({
            key: v.type,
            name: v.name || v.type,
            image: v.image || `./images/${(v.type||'mule').toLowerCase()}.png`,
            type: v.type === 'phantom3' || v.type === 'trailers' ? 'trailer' : 'box',
            reqLevel: v.reqLevel || 1,
            rewards: v.rewards || { money:[1000,1500], exp: 2 },
            desc: v.description || 'Vehicle for delivery operations.'
          }));
          state.vIndex = 0;
          renderCarousel();
        }
        setActiveTab('rental');
        document.body.classList.remove('hidden');
        break;
      case 'updatePlayerData':
        updatePlayerInfo(data.playerData||{});
        break;
      case 'updateDelivery':
        updateDelivery(data.delivery||{});
        setActiveTab('delivery');
        break;
      case 'hideUI':
        document.body.classList.add('hidden');
        break;
    }
  });

  // Dev mode preview
  if(!hasNative){
    setTimeout(()=>{
      updatePlayerInfo({ name:'Alex', level:5, exp: 350, earnings: 15250 });
      state.difficulties = {
        easy: { label:'Local', requiredLevel:1, type:'box', boxes:6, rewards:{ money:[800,1200], exp:2 } },
        medium:{ label:'City', requiredLevel:3, type:'box', boxes:10, rewards:{ money:[1400,2000], exp:2 } },
        hard: { label:'Long Haul', requiredLevel:5, type:'trailer', rewards:{ money:[2200,3200], exp:[3,10] } }
      };
      renderJobs();
      updateDelivery({ dest: 'Paleto Bay Warehouse', progress: 35, secondsLeft: 910, status: 'Heading to destination' });
      document.body.classList.remove('hidden');
    }, 600);
  }
})();

