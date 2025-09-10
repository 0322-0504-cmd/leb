/* Trucker Job & Rental — Enhanced Logic */

const UI = {
  panel: document.getElementById('panel'),
  overlay: document.getElementById('overlay'),
  tabs: Array.from(document.querySelectorAll('.tab')),
  views: {
    rental: document.getElementById('view-rental'),
    jobs: document.getElementById('view-jobs'),
    delivery: document.getElementById('view-delivery'),
  },
  playerName: document.getElementById('playerName'),
  playerLevel: document.getElementById('playerLevel'),
  playerTier: document.getElementById('playerTier'),
  expFill: document.getElementById('expFill'),
  expText: document.getElementById('expText'),
  carPrev: document.getElementById('carPrev'),
  carNext: document.getElementById('carNext'),
  carTrack: document.getElementById('carTrack'),
  carDots: document.getElementById('carDots'),
  vehicleName: document.getElementById('vehicleName'),
  vehicleType: document.getElementById('vehicleType'),
  vehicleReq: document.getElementById('vehicleReq'),
  vehicleReward: document.getElementById('vehicleReward'),
  deliveryDest: document.getElementById('deliveryDest'),
  deliveryTime: document.getElementById('deliveryTime'),
  deliveryFill: document.getElementById('deliveryFill'),
  deliveryMeta: document.getElementById('deliveryMeta'),
  btnRent: document.getElementById('btnRent'),
  btnStart: document.getElementById('btnStart'),
  btnCancel: document.getElementById('btnCancel'),
  btnClose: document.getElementById('btnClose'),
};

const state = {
  isVisible: false,
  player: { name: 'Driver', level: 1, experience: 0 },
  vehicles: [
    { key: 'mule', name: 'Mule', type: 'Box', requiredLevel: 1, rewards: '$800-1200 • +2 XP/box', image: 'images/mule.png', difficulty: 'easy' },
    { key: 'benson', name: 'Benson', type: 'Box', requiredLevel: 3, rewards: '$1400-2000 • +2 XP/box', image: 'images/benson.png', difficulty: 'medium' },
    { key: 'phantom3', name: 'Phantom III', type: 'Trailer', requiredLevel: 5, rewards: '$2200-3200 • +3-10 XP', image: 'images/phantom.png', difficulty: 'hard' },
  ],
  currentSlide: 0,
  delivery: { destination: null, progress: 0, timeLeftSec: 0 },
  currentJobDiff: null,
  difficulties: null,
};

function getTier(level) {
  if (level >= 20) return 'Elite';
  if (level >= 15) return 'Veteran';
  if (level >= 10) return 'Pro';
  if (level >= 5) return 'Skilled';
  return 'Rookie';
}

function setVisible(show) {
  state.isVisible = !!show;
  if (show) {
    UI.panel.style.display = 'grid';
    UI.overlay.style.display = 'block';
    UI.panel.classList.remove('is-hidden');
    UI.overlay.classList.remove('is-hidden');
  } else {
    UI.panel.style.display = 'none';
    UI.overlay.style.display = 'none';
    UI.panel.classList.add('is-hidden');
    UI.overlay.classList.add('is-hidden');
  }
}

function switchTab(tab) {
  UI.tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === tab));
  Object.entries(UI.views).forEach(([k, el]) => el.classList.toggle('is-active', k === tab));
}

function updatePlayer(p) {
  state.player = { ...state.player, ...p };
  UI.playerName.textContent = state.player.name ?? 'Driver';
  UI.playerLevel.textContent = `Level ${state.player.level ?? 1}`;
  UI.playerTier.textContent = getTier(state.player.level ?? 1);
  const current = state.player.experience ?? 0;
  const required = Math.max(100, (state.player.level ?? 1) * 100);
  const pct = Math.min(100, Math.round((current / required) * 100));
  UI.expFill.style.width = pct + '%';
  UI.expText.textContent = `${current} / ${required}`;
}

function buildCarousel() {
  UI.carTrack.innerHTML = '';
  UI.carDots.innerHTML = '';
  state.vehicles.forEach((v, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel__slide';
    const img = document.createElement('img');
    img.alt = v.name;
    img.src = v.image;
    slide.appendChild(img);
    UI.carTrack.appendChild(slide);
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === state.currentSlide ? ' is-active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    UI.carDots.appendChild(dot);
  });
  applySlide();
}

function applySlide() {
  const offset = -state.currentSlide * 100;
  UI.carTrack.style.transform = `translateX(${offset}%)`;
  Array.from(UI.carDots.children).forEach((d, i) => d.classList.toggle('is-active', i === state.currentSlide));
  const v = state.vehicles[state.currentSlide];
  if (!v) return;
  UI.vehicleName.textContent = v.name;
  UI.vehicleType.textContent = v.type;
  UI.vehicleReq.textContent = `Req Lv ${v.requiredLevel}`;
  UI.vehicleReward.textContent = v.rewards;
}

function nextSlide() {
  state.currentSlide = (state.currentSlide + 1) % state.vehicles.length;
  applySlide();
}

function prevSlide() {
  state.currentSlide = (state.currentSlide - 1 + state.vehicles.length) % state.vehicles.length;
  applySlide();
}

function goToSlide(i) {
  state.currentSlide = Math.max(0, Math.min(i, state.vehicles.length - 1));
  applySlide();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateDelivery(d) {
  state.delivery = { ...state.delivery, ...d };
  UI.deliveryDest.textContent = state.delivery.destination ?? '—';
  UI.deliveryTime.textContent = formatTime(state.delivery.timeLeftSec ?? 0);
  const pct = Math.min(100, Math.max(0, Math.round(state.delivery.progress ?? 0)));
  UI.deliveryFill.style.width = pct + '%';
  UI.deliveryMeta.textContent = `${pct}%`;
}

function startJob(diff) {
  state.currentJobDiff = diff;
  postNUI('startJob', { difficulty: diff });
  switchTab('delivery');
}

function cancelJob() {
  state.currentJobDiff = null;
  postNUI('cancelJob', {});
}

function rentCurrentVehicle() {
  const v = state.vehicles[state.currentSlide];
  if (!v) return;
  postNUI('rentVehicle', { vehicleType: v.key, difficulty: v.difficulty, vehicleName: v.name });
}

function postNUI(action, data) {
  if (window.invokeNative) {
    fetch(`https://${GetParentResourceName()}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    }).catch(() => {});
  } else {
    console.log('NUI ->', action, data);
  }
}

// Events
UI.tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
UI.carNext.addEventListener('click', nextSlide);
UI.carPrev.addEventListener('click', prevSlide);
UI.btnRent.addEventListener('click', rentCurrentVehicle);
UI.btnStart.addEventListener('click', () => startJob(state.currentJobDiff || 'easy'));
UI.btnCancel.addEventListener('click', cancelJob);
UI.btnClose.addEventListener('click', () => { setVisible(false); postNUI('closeNUI', {}); });

// Messages from Lua
window.addEventListener('message', (e) => {
  const d = e.data || {};
  if (!d.action) return;
  switch (d.action) {
    case 'openJobMenu':
      if (d.playerStats) updatePlayer(d.playerStats);
      if (d.difficulties) state.difficulties = d.difficulties;
      setVisible(true);
      switchTab('jobs');
      break;
    case 'openRentMenu':
      if (d.playerData) updatePlayer(d.playerData);
      if (Array.isArray(d.vehicles) && d.vehicles.length) {
        state.vehicles = d.vehicles.map(v => ({
          key: v.type || v.key || 'mule',
          name: v.name || (v.type ? v.type.toUpperCase() : 'Truck'),
          type: v.vehicleType || (v.type === 'phantom3' ? 'Trailer' : 'Box'),
          requiredLevel: v.requiredLevel ?? 1,
          rewards: v.rewards || '$$ • XP',
          image: v.image || `images/${(v.type || 'mule')}.png`,
          difficulty: v.difficulty || 'easy',
        }));
        state.currentSlide = 0;
        buildCarousel();
      }
      setVisible(true);
      switchTab('rental');
      break;
    case 'hideUI':
      setVisible(false);
      break;
    case 'updatePlayer':
      updatePlayer(d.player || {});
      break;
    case 'updateDelivery':
      updateDelivery(d.delivery || {});
      break;
  }
});

// Dev preview - DISABLED for FiveM use
if (!window.invokeNative) {
  console.log('Running in development mode - NUI hidden by default');
  updatePlayer({ name: 'Alex', level: 7, experience: 320 });
  buildCarousel();
  // setVisible(true); // REMOVED - Don't auto-show NUI
}