// Modern Trucker Dashboard - Clean & Functional

class TruckerDashboard {
    constructor() {
        this.currentTab = 'jobs';
        this.currentVehicleIndex = 0;
        this.vehicles = [];
        this.playerData = null;
        this.difficulties = null;
        this.currentJob = null;
        this.selectedJobDifficulty = null;
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupDefaultVehicles();
        this.hide();
    }
    
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
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
        
        // Action buttons
        document.getElementById('actionBtn').addEventListener('click', () => {
            this.handleActionButton();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.handleCancel();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeNUI();
                    break;
                case 'ArrowLeft':
                    if (this.currentTab === 'rental') this.previousVehicle();
                    break;
                case 'ArrowRight':
                    if (this.currentTab === 'rental') this.nextVehicle();
                    break;
            }
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Content`).classList.add('active');
        
        this.currentTab = tabName;
        this.updateActionButton();
    }
    
    updateActionButton() {
        const actionBtn = document.getElementById('actionBtn');
        
        switch(this.currentTab) {
            case 'jobs':
                actionBtn.textContent = this.selectedJobDifficulty ? 'Start Job' : 'Select Job';
                actionBtn.disabled = !this.selectedJobDifficulty;
                break;
            case 'rental':
                actionBtn.textContent = 'Rent Vehicle';
                actionBtn.disabled = false;
                break;
            case 'delivery':
                actionBtn.textContent = 'Continue';
                actionBtn.disabled = false;
                break;
        }
    }
    
    handleActionButton() {
        switch(this.currentTab) {
            case 'jobs':
                if (this.selectedJobDifficulty) {
                    this.startJob(this.selectedJobDifficulty);
                }
                break;
            case 'rental':
                this.rentVehicle();
                break;
        }
    }
    
    handleCancel() {
        if (this.currentJob) {
            this.cancelJob();
        } else {
            this.closeNUI();
        }
    }
    
    setupDefaultVehicles() {
        this.vehicles = [
            {
                name: 'Mule Truck',
                description: 'Compact delivery truck perfect for local routes',
                image: 'images/mule.png',
                type: 'mule',
                difficulty: 'easy',
                tags: ['Light', 'Easy', 'FREE']
            },
            {
                name: 'Benson Truck', 
                description: 'Medium truck ideal for citywide logistics',
                image: 'images/benson.png',
                type: 'benson',
                difficulty: 'medium',
                tags: ['Box', 'Medium', 'FREE']
            },
            {
                name: 'Phantom Truck',
                description: 'Heavy-duty truck for long-haul deliveries',
                image: 'images/phantom.png',
                type: 'phantom3',
                difficulty: 'hard',
                tags: ['Trailer', 'Hard', 'FREE']
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
        if (!vehicle) return;
        
        document.getElementById('vehicleImage').src = vehicle.image;
        document.getElementById('vehicleName').textContent = vehicle.name;
        document.getElementById('vehicleDescription').textContent = vehicle.description;
        
        // Update tags
        const tagsContainer = document.querySelector('.vehicle-tags');
        tagsContainer.innerHTML = '';
        vehicle.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = `tag ${tag.toLowerCase() === 'free' ? 'free' : ''}`;
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });
        
        // Update counter
        document.getElementById('currentVehicle').textContent = this.currentVehicleIndex + 1;
        document.getElementById('totalVehicles').textContent = this.vehicles.length;
    }
    
    updatePlayerInfo(playerData) {
        this.playerData = playerData;
        
        if (playerData) {
            document.getElementById('playerName').textContent = playerData.name || 'Driver';
            document.getElementById('playerLevel').textContent = `Level ${playerData.level || 1}`;
            
            // Update tier
            const level = playerData.level || 1;
            let tier = 'Rookie';
            if (level >= 20) tier = 'Elite';
            else if (level >= 10) tier = 'Pro';
            else if (level >= 5) tier = 'Skilled';
            
            document.getElementById('playerTier').textContent = tier;
            
            // Update stats
            document.getElementById('totalDeliveries').textContent = (playerData.total_deliveries || 0).toLocaleString();
            document.getElementById('totalEarnings').textContent = `$${(playerData.total_earnings || 0).toLocaleString()}`;
            
            // Update EXP bar
            const currentExp = playerData.experience || 0;
            const requiredExp = (playerData.level || 1) * 100;
            const expProgress = Math.min(currentExp, requiredExp);
            const expPercentage = (expProgress / requiredExp) * 100;
            
            document.getElementById('expFill').style.width = `${expPercentage}%`;
            document.getElementById('expText').textContent = `${expProgress} / ${requiredExp} XP`;
        }
    }
    
    updateJobsList() {
        const jobsList = document.getElementById('jobsList');
        if (!this.difficulties) return;
        
        jobsList.innerHTML = '';
        
        for (const [key, difficulty] of Object.entries(this.difficulties)) {
            const isUnlocked = !this.playerData || this.playerData.level >= difficulty.requiredLevel;
            
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.dataset.difficulty = key;
            
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
            
            jobCard.innerHTML = `
                <div class="job-header">
                    <div class="job-title">${difficulty.label}</div>
                    <div class="job-level">Level ${difficulty.requiredLevel}</div>
                </div>
                <div class="job-description">
                    ${difficulty.type === 'trailer' ? 'Trailer delivery job' : `Deliver ${difficulty.boxes} boxes`}
                </div>
                <div class="job-rewards">
                    <span class="job-money">$${difficulty.rewards.money[0]}-${difficulty.rewards.money[1]}</span>
                    <span class="job-exp">${expDisplay}</span>
                </div>
            `;
            
            if (isUnlocked) {
                jobCard.addEventListener('click', () => {
                    document.querySelectorAll('.job-card').forEach(card => {
                        card.classList.remove('selected');
                    });
                    
                    jobCard.classList.add('selected');
                    this.selectedJobDifficulty = key;
                    this.updateActionButton();
                });
            } else {
                jobCard.style.opacity = '0.5';
                jobCard.style.cursor = 'not-allowed';
            }
            
            jobsList.appendChild(jobCard);
        }
    }
    
    startJob(difficulty) {
        this.sendNUIMessage('startJob', { difficulty: difficulty });
        document.getElementById('deliveryTab').style.display = 'block';
        this.switchTab('delivery');
    }
    
    cancelJob() {
        this.sendNUIMessage('cancelJob');
        document.getElementById('deliveryTab').style.display = 'none';
        this.currentJob = null;
        this.switchTab('jobs');
    }
    
    rentVehicle() {
        const vehicle = this.vehicles[this.currentVehicleIndex];
        if (!vehicle) return;
        
        const actionBtn = document.getElementById('actionBtn');
        actionBtn.textContent = 'Renting...';
        actionBtn.disabled = true;
        
        setTimeout(() => {
            actionBtn.textContent = 'Rent Vehicle';
            actionBtn.disabled = false;
        }, 1500);
        
        this.sendNUIMessage('rentVehicle', {
            vehicleType: vehicle.type,
            difficulty: vehicle.difficulty,
            vehicleName: vehicle.name
        });
    }
    
    show() {
        this.isVisible = true;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('dashboard').style.display = 'flex';
    }
    
    hide() {
        this.isVisible = false;
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
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
            }).catch(() => {});
        } else {
            console.log('NUI Message:', action, data);
        }
    }
}

// Initialize dashboard
const dashboard = new TruckerDashboard();

// Handle messages from Lua
window.addEventListener('message', (event) => {
    const data = event.data;
    
    switch(data.action) {
        case 'openJobMenu':
            dashboard.updatePlayerInfo(data.playerStats);
            dashboard.difficulties = data.difficulties;
            dashboard.currentJob = data.currentJob;
            dashboard.updateJobsList();
            
            if (data.currentJob) {
                document.getElementById('deliveryTab').style.display = 'block';
                dashboard.switchTab('delivery');
            } else {
                document.getElementById('deliveryTab').style.display = 'none';
                dashboard.switchTab('jobs');
            }
            
            dashboard.show();
            break;
            
        case 'openRentMenu':
            dashboard.updatePlayerInfo(data.playerData);
            
            if (data.vehicles) {
                dashboard.vehicles = data.vehicles.map(vehicle => ({
                    name: vehicle.name || vehicle.type.toUpperCase(),
                    description: vehicle.description || `${vehicle.type} for deliveries`,
                    image: vehicle.image || `images/${vehicle.type.toLowerCase()}.png`,
                    type: vehicle.type,
                    difficulty: vehicle.difficulty,
                    tags: [
                        vehicle.difficulty === 'hard' ? 'Trailer' : vehicle.difficulty === 'medium' ? 'Box' : 'Light',
                        vehicle.difficulty.charAt(0).toUpperCase() + vehicle.difficulty.slice(1),
                        'FREE'
                    ]
                }));
                dashboard.currentVehicleIndex = 0;
                dashboard.updateVehicleDisplay();
            }
            
            dashboard.switchTab('rental');
            dashboard.show();
            break;
            
        case 'hideUI':
            dashboard.hide();
            break;
            
        case 'updatePlayer':
            dashboard.updatePlayerInfo(data.playerData);
            break;
    }
});

// Development mode - DISABLED
if (!window.invokeNative) {
    console.log('Development mode - Dashboard hidden');
}