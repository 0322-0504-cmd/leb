// Modern Minimalist Trucker NUI
class MinimalistTruckerNUI {
    constructor() {
        this.currentTab = 'jobs';
        this.currentVehicleIndex = 0;
        this.vehicles = [];
        this.playerData = null;
        this.difficulties = null;
        this.currentJob = null;
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupDefaultVehicles();
        this.hide();
    }
    
    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Close button
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.closeNUI();
        });
        
        // Vehicle navigation
        document.getElementById('prevVehicle').addEventListener('click', () => {
            this.previousVehicle();
        });
        
        document.getElementById('nextVehicle').addEventListener('click', () => {
            this.nextVehicle();
        });
        
        // Actions
        document.getElementById('rentBtn').addEventListener('click', () => {
            this.rentVehicle();
        });
        
        document.getElementById('cancelJob').addEventListener('click', () => {
            this.cancelJob();
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            if (e.key === 'Escape') this.closeNUI();
        });
    }
    
    switchTab(tabName) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
    }
    
    setupDefaultVehicles() {
        this.vehicles = [
            {
                name: 'Phantom Truck',
                description: 'Professional heavy-duty truck designed for long-haul deliveries and heavy cargo transport',
                image: 'images/phantom.png',
                type: 'phantom3',
                difficulty: 'hard'
            },
            {
                name: 'Benson Truck',
                description: 'Versatile medium-capacity truck perfect for citywide logistics and regional delivery operations',
                image: 'images/benson.png',
                type: 'benson',
                difficulty: 'medium'
            },
            {
                name: 'Mule Truck',
                description: 'Compact and efficient delivery truck ideal for local routes and quick urban deliveries',
                image: 'images/mule.png',
                type: 'mule',
                difficulty: 'easy'
            }
        ];
        
        this.updateVehicleDisplay();
    }
    
    previousVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex - 1 + this.vehicles.length) % this.vehicles.length;
        this.updateVehicleDisplay();
    }
    
    nextVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex + 1) % this.vehicles.length;
        this.updateVehicleDisplay();
    }
    
    updateVehicleDisplay() {
        const vehicle = this.vehicles[this.currentVehicleIndex];
        if (!vehicle) {
            console.log('No vehicle to display at index:', this.currentVehicleIndex);
            return;
        }
        
        console.log('Updating vehicle display with:', vehicle); // Debug
        
        const imageElement = document.getElementById('vehicleImage');
        const nameElement = document.getElementById('vehicleName');
        const descElement = document.getElementById('vehicleDesc');
        const typeElement = document.getElementById('vehicleType');
        const diffElement = document.getElementById('vehicleDiff');
        
        if (imageElement) {
            imageElement.src = vehicle.image;
            console.log('Set image src to:', vehicle.image); // Debug
        }
        if (nameElement) nameElement.textContent = vehicle.name;
        if (descElement) descElement.textContent = vehicle.description;
        if (typeElement) typeElement.textContent = this.getTypeDisplay(vehicle.difficulty);
        if (diffElement) diffElement.textContent = this.getDifficultyDisplay(vehicle.difficulty);
        
        // Update counter
        document.getElementById('currentVehicle').textContent = this.currentVehicleIndex + 1;
        document.getElementById('totalVehicles').textContent = this.vehicles.length;
    }
    
    getTypeDisplay(difficulty) {
        const types = {
            'easy': 'Light',
            'medium': 'Box',
            'hard': 'Trailer'
        };
        return types[difficulty] || 'Truck';
    }
    
    getDifficultyDisplay(difficulty) {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
    
    updatePlayerInfo(playerData) {
        this.playerData = playerData;
        
        if (playerData) {
            document.getElementById('playerName').textContent = playerData.name || 'Driver';
            document.getElementById('playerLevel').textContent = `Level ${playerData.level || 1}`;
            document.getElementById('totalDeliveries').textContent = (playerData.total_deliveries || 0).toLocaleString();
            document.getElementById('totalEarnings').textContent = `$${(playerData.total_earnings || 0).toLocaleString()}`;
            
            // Update EXP
            const currentExp = playerData.experience || 0;
            const requiredExp = (playerData.level || 1) * 100;
            const expProgress = Math.min(currentExp, requiredExp);
            const expPercentage = (expProgress / requiredExp) * 100;
            
            document.getElementById('expFill').style.width = `${expPercentage}%`;
            document.getElementById('expText').textContent = `${expProgress} / ${requiredExp}`;
        }
    }
    
    updateJobsList() {
        const jobsList = document.getElementById('jobsList');
        if (!this.difficulties) return;
        
        jobsList.innerHTML = '';
        
        for (const [key, difficulty] of Object.entries(this.difficulties)) {
            const isUnlocked = !this.playerData || this.playerData.level >= difficulty.requiredLevel;
            const isActive = this.currentJob && this.currentJob.difficulty === key;
            
            const jobItem = document.createElement('div');
            jobItem.className = `job-item ${!isUnlocked || isActive ? 'disabled' : ''}`;
            
            let expDisplay = '';
            if (difficulty.type === 'box') {
                const totalExp = difficulty.boxes * (difficulty.rewards.exp || 2);
                expDisplay = `${totalExp} XP`;
            } else if (difficulty.type === 'trailer') {
                if (Array.isArray(difficulty.rewards.exp)) {
                    expDisplay = `${difficulty.rewards.exp[0]}-${difficulty.rewards.exp[1]} XP`;
                } else {
                    expDisplay = '3-10 XP';
                }
            }
            
            jobItem.innerHTML = `
                <div class="job-title">${difficulty.label}</div>
                <div class="job-desc">
                    ${difficulty.type === 'trailer' ? 'Trailer delivery' : `${difficulty.boxes} boxes delivery`}
                </div>
                <div class="job-rewards">
                    <span class="job-money">$${difficulty.rewards.money[0]}-${difficulty.rewards.money[1]}</span>
                    <span class="job-exp">${expDisplay}</span>
                    <span class="job-level">Level ${difficulty.requiredLevel}</span>
                </div>
            `;
            
            if (isUnlocked && !isActive) {
                jobItem.addEventListener('click', () => this.startJob(key));
            }
            
            jobsList.appendChild(jobItem);
        }
    }
    
    updateActiveJobSection() {
        const activeJob = document.getElementById('activeJob');
        const jobStatus = document.getElementById('jobStatus');
        
        if (this.currentJob && this.difficulties && this.difficulties[this.currentJob.difficulty]) {
            const difficulty = this.difficulties[this.currentJob.difficulty];
            activeJob.style.display = 'block';
            
            let statusText = '';
            if (difficulty.type === 'box') {
                const delivered = (difficulty.boxes || 0) - (this.currentJob.remainingBoxes || 0);
                const total = difficulty.boxes || 0;
                statusText = `${delivered}/${total} boxes delivered`;
            } else {
                statusText = 'Trailer delivery in progress';
            }
            
            jobStatus.innerHTML = `
                <div style="font-size: 14px; margin-bottom: 8px;">
                    <strong>${difficulty.label}</strong>
                </div>
                <div style="font-size: 12px; color: #92400e;">
                    ${statusText}
                    ${this.currentJob.destination ? `<br>Destination: ${this.currentJob.destination.name}` : ''}
                </div>
            `;
        } else {
            activeJob.style.display = 'none';
        }
    }
    
    startJob(difficulty) {
        this.sendNUIMessage('startJob', { difficulty: difficulty });
    }
    
    cancelJob() {
        this.sendNUIMessage('cancelJob');
    }
    
    rentVehicle() {
        const vehicle = this.vehicles[this.currentVehicleIndex];
        if (!vehicle) return;
        
        const btn = document.getElementById('rentBtn');
        const originalText = btn.textContent;
        
        btn.textContent = 'Renting...';
        btn.classList.add('loading');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('loading');
        }, 1500);
        
        this.sendNUIMessage('rentVehicle', {
            vehicleType: vehicle.type,
            difficulty: vehicle.difficulty,
            vehicleName: vehicle.name
        });
    }
    
    show() {
        this.isVisible = true;
        document.body.style.display = 'flex';
        document.getElementById('app').classList.remove('hidden');
    }
    
    hide() {
        this.isVisible = false;
        document.body.style.display = 'none';
        document.getElementById('app').classList.add('hidden');
    }
    
    closeNUI() {
        this.hide();
        this.sendNUIMessage('closeNUI');
    }
    
    sendNUIMessage(action, data = {}) {
        if (window.invokeNative) {
            fetch(`https://${GetParentResourceName()}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).catch(() => {
                console.log('Failed to send NUI message:', action);
            });
        } else {
            console.log('NUI Message:', action, data);
        }
    }
}

// Initialize
const minimalistTruckerNUI = new MinimalistTruckerNUI();

// Handle messages from Lua
window.addEventListener('message', (event) => {
    const data = event.data;
    
    switch(data.action) {
        case 'openJobMenu':
            minimalistTruckerNUI.playerData = data.playerStats;
            minimalistTruckerNUI.difficulties = data.difficulties;
            minimalistTruckerNUI.currentJob = data.currentJob;
            minimalistTruckerNUI.updatePlayerInfo(data.playerStats);
            minimalistTruckerNUI.updateJobsList();
            minimalistTruckerNUI.updateActiveJobSection();
            minimalistTruckerNUI.switchTab('jobs');
            minimalistTruckerNUI.show();
            break;
            
        case 'openRentMenu':
            console.log('Opening rent menu with data:', data); // Debug
            minimalistTruckerNUI.playerData = data.playerData;
            minimalistTruckerNUI.updatePlayerInfo(data.playerData);
            if (data.vehicles) {
                console.log('Processing vehicles:', data.vehicles); // Debug
                minimalistTruckerNUI.vehicles = data.vehicles.map(vehicle => {
                    const mappedVehicle = {
                        name: vehicle.name || (vehicle.type.toUpperCase() + ' TRUCK'),
                        description: vehicle.description || `Professional ${vehicle.type} for delivery operations`,
                        image: vehicle.image || `images/${vehicle.type.toLowerCase()}.png`,
                        type: vehicle.type,
                        difficulty: vehicle.difficulty
                    };
                    console.log('Mapped vehicle:', mappedVehicle); // Debug
                    return mappedVehicle;
                });
                minimalistTruckerNUI.updateVehicleDisplay();
            } else {
                console.log('No vehicles data, using defaults'); // Debug
                minimalistTruckerNUI.setupDefaultVehicles();
            }
            minimalistTruckerNUI.switchTab('rental');
            minimalistTruckerNUI.show();
            break;
            
        case 'hideUI':
            minimalistTruckerNUI.hide();
            break;
            
        case 'updatePlayerData':
            minimalistTruckerNUI.updatePlayerInfo(data.playerData);
            break;
    }
});

// Development testing
if (!window.invokeNative) {
    console.log('Running in development mode - Minimalist Design');
    
    setTimeout(() => {
        minimalistTruckerNUI.updatePlayerInfo({
            name: 'Alex',
            level: 5,
            experience: 750,
            total_deliveries: 25,
            total_earnings: 15000
        });
        
        minimalistTruckerNUI.difficulties = {
            easy: {
                label: 'Local Deliveries',
                requiredLevel: 1,
                type: 'box',
                boxes: 6,
                rewards: { money: [800, 1200], exp: 2 }
            },
            medium: {
                label: 'City Logistics',
                requiredLevel: 3,
                type: 'box',
                boxes: 10,
                rewards: { money: [1400, 2000], exp: 2 }
            },
            hard: {
                label: 'Long Haul',
                requiredLevel: 5,
                type: 'trailer',
                rewards: { money: [2200, 3200], exp: [3, 10] }
            }
        };
        
        minimalistTruckerNUI.updateJobsList();
        minimalistTruckerNUI.show();
    }, 1000);
}