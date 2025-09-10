// Trucker Tablet NUI - Clean and Simple
class TruckerTabletNUI {
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
        this.hide(); // Start hidden
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
        document.getElementById('prevVehicleBtn').addEventListener('click', () => {
            this.previousVehicle();
        });
        
        document.getElementById('nextVehicleBtn').addEventListener('click', () => {
            this.nextVehicle();
        });
        
        // Rent vehicle button
        document.getElementById('rentVehicleBtn').addEventListener('click', () => {
            this.rentVehicle();
        });
        
        // Cancel job button
        document.getElementById('cancelJobBtn').addEventListener('click', () => {
            this.cancelJob();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            if (e.key === 'Escape') {
                this.closeNUI();
            }
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Content`).classList.add('active');
        
        this.currentTab = tabName;
    }
    
    setupDefaultVehicles() {
        this.vehicles = [
            {
                name: 'Phantom Truck',
                description: 'Heavy-duty truck for trailer deliveries',
                image: 'https://via.placeholder.com/300x150/1a1a1a/3b82f6?text=PHANTOM+TRUCK',
                type: 'phantom3',
                difficulty: 'hard',
                specs: {
                    type: 'Trailer',
                    difficulty: 'Hard'
                }
            },
            {
                name: 'Benson Truck',
                description: 'Medium truck for box deliveries',
                image: 'https://via.placeholder.com/300x150/1a1a1a/22c55e?text=BENSON+TRUCK',
                type: 'benson',
                difficulty: 'medium',
                specs: {
                    type: 'Box Truck',
                    difficulty: 'Medium'
                }
            },
            {
                name: 'Mule Truck',
                description: 'Light truck for local deliveries',
                image: 'https://via.placeholder.com/300x150/1a1a1a/f59e0b?text=MULE+TRUCK',
                type: 'mule',
                difficulty: 'easy',
                specs: {
                    type: 'Light Truck',
                    difficulty: 'Easy'
                }
            }
        ];
        
        this.updateVehicleDisplay();
        this.updateVehicleCounter();
    }
    
    previousVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex - 1 + this.vehicles.length) % this.vehicles.length;
        this.updateVehicleDisplay();
        this.updateVehicleCounter();
    }
    
    nextVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex + 1) % this.vehicles.length;
        this.updateVehicleDisplay();
        this.updateVehicleCounter();
    }
    
    updateVehicleDisplay() {
        const vehicle = this.vehicles[this.currentVehicleIndex];
        if (!vehicle) return;
        
        document.getElementById('vehicleImage').src = vehicle.image;
        document.getElementById('vehicleName').textContent = vehicle.name;
        document.getElementById('vehicleDescription').textContent = vehicle.description;
        document.getElementById('vehicleType').textContent = vehicle.specs.type;
        document.getElementById('vehicleDifficulty').textContent = vehicle.specs.difficulty;
    }
    
    updateVehicleCounter() {
        document.getElementById('currentVehicle').textContent = this.currentVehicleIndex + 1;
        document.getElementById('totalVehicles').textContent = this.vehicles.length;
    }
    
    updatePlayerInfo(playerData) {
        this.playerData = playerData;
        
        if (playerData) {
            document.getElementById('playerName').textContent = playerData.name || 'Driver';
            document.getElementById('playerLevel').textContent = `Level ${playerData.level || 1}`;
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
            const isActive = this.currentJob && this.currentJob.difficulty === key;
            
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            
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
                <div class="job-title">${difficulty.label}</div>
                <div class="job-description">
                    ${difficulty.type === 'trailer' ? 'Trailer delivery job' : `Deliver ${difficulty.boxes} boxes`}
                </div>
                <div class="job-rewards">
                    <span class="job-money">$${difficulty.rewards.money[0]}-${difficulty.rewards.money[1]}</span>
                    <span class="job-exp">${expDisplay}</span>
                    <span class="job-level">Level ${difficulty.requiredLevel}</span>
                </div>
            `;
            
            if (isUnlocked && !isActive) {
                jobCard.addEventListener('click', () => this.startJob(key));
                jobCard.style.cursor = 'pointer';
            } else {
                jobCard.style.opacity = '0.5';
                jobCard.style.cursor = 'not-allowed';
            }
            
            jobsList.appendChild(jobCard);
        }
    }
    
    updateActiveJobSection() {
        const activeJobSection = document.getElementById('activeJobSection');
        const activeJobDetails = document.getElementById('activeJobDetails');
        
        if (this.currentJob && this.difficulties && this.difficulties[this.currentJob.difficulty]) {
            const difficulty = this.difficulties[this.currentJob.difficulty];
            activeJobSection.style.display = 'block';
            
            let progressText = '';
            if (difficulty.type === 'box') {
                const delivered = (difficulty.boxes || 0) - (this.currentJob.remainingBoxes || 0);
                const total = difficulty.boxes || 0;
                progressText = `${delivered}/${total} boxes delivered`;
            } else if (difficulty.type === 'trailer') {
                progressText = 'Trailer delivery in progress';
            }
            
            activeJobDetails.innerHTML = `
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8);">
                    <div><strong>Job:</strong> ${difficulty.label}</div>
                    <div><strong>Status:</strong> ${progressText}</div>
                    ${this.currentJob.destination ? `<div><strong>Destination:</strong> ${this.currentJob.destination.name}</div>` : ''}
                </div>
            `;
        } else {
            activeJobSection.style.display = 'none';
        }
    }
    
    startJob(difficulty) {
        this.sendNUIMessage('startJob', { difficulty: difficulty });
    }
    
    cancelJob() {
        this.sendNUIMessage('cancelJob');
    }
    
    rentVehicle() {
        const currentVehicle = this.vehicles[this.currentVehicleIndex];
        if (!currentVehicle) return;
        
        const rentBtn = document.getElementById('rentVehicleBtn');
        const originalText = rentBtn.textContent;
        
        rentBtn.textContent = 'RENTING...';
        rentBtn.style.opacity = '0.7';
        
        setTimeout(() => {
            rentBtn.textContent = originalText;
            rentBtn.style.opacity = '1';
        }, 1500);
        
        this.sendNUIMessage('rentVehicle', {
            vehicleType: currentVehicle.type,
            difficulty: currentVehicle.difficulty,
            vehicleName: currentVehicle.name
        });
    }
    
    show() {
        this.isVisible = true;
        document.body.style.display = 'flex';
        document.getElementById('tablet').classList.remove('hidden');
    }
    
    hide() {
        this.isVisible = false;
        document.body.style.display = 'none';
        document.getElementById('tablet').classList.add('hidden');
    }
    
    closeNUI() {
        this.hide();
        this.sendNUIMessage('closeNUI');
    }
    
    sendNUIMessage(action, data = {}) {
        if (window.invokeNative) {
            // In-game environment
            fetch(`https://${GetParentResourceName()}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).catch(() => {
                console.log('Failed to send NUI message:', action);
            });
        } else {
            // Development environment
            console.log('NUI Message:', action, data);
        }
    }
}

// Initialize the NUI system
const truckerTabletNUI = new TruckerTabletNUI();

// Handle messages from Lua
window.addEventListener('message', (event) => {
    const data = event.data;
    
    console.log('Received message:', data); // Debug log
    
    switch(data.action) {
        case 'openJobMenu':
            console.log('Opening job menu'); // Debug log
            truckerTabletNUI.playerData = data.playerStats;
            truckerTabletNUI.difficulties = data.difficulties;
            truckerTabletNUI.currentJob = data.currentJob;
            truckerTabletNUI.updatePlayerInfo(data.playerStats);
            truckerTabletNUI.updateJobsList();
            truckerTabletNUI.updateActiveJobSection();
            truckerTabletNUI.switchTab('jobs');
            truckerTabletNUI.show();
            break;
            
        case 'openRentMenu':
            console.log('Opening rent menu'); // Debug log
            truckerTabletNUI.playerData = data.playerData;
            truckerTabletNUI.updatePlayerInfo(data.playerData);
            if (data.vehicles) {
                truckerTabletNUI.vehicles = data.vehicles.map(vehicle => ({
                    name: vehicle.name || vehicle.type.toUpperCase(),
                    description: vehicle.description || `${vehicle.type} for deliveries`,
                    image: vehicle.image || `https://via.placeholder.com/300x150/1a1a1a/3b82f6?text=${vehicle.name.replace(/\s+/g, '+').toUpperCase()}`,
                    type: vehicle.type,
                    difficulty: vehicle.difficulty,
                    specs: {
                        type: vehicle.difficulty === 'hard' ? 'Trailer' : vehicle.difficulty === 'medium' ? 'Box Truck' : 'Light Truck',
                        difficulty: vehicle.difficulty.charAt(0).toUpperCase() + vehicle.difficulty.slice(1)
                    }
                }));
                truckerTabletNUI.updateVehicleDisplay();
                truckerTabletNUI.updateVehicleCounter();
            }
            truckerTabletNUI.switchTab('rental');
            truckerTabletNUI.show();
            break;
            
        case 'hideUI':
            console.log('Hiding UI'); // Debug log
            truckerTabletNUI.hide();
            break;
            
        case 'updatePlayerData':
            truckerTabletNUI.updatePlayerInfo(data.playerData);
            break;
    }
});

// Development testing
if (!window.invokeNative) {
    console.log('Running in development mode - Trucker Tablet');
    
    // Test data
    setTimeout(() => {
        truckerTabletNUI.updatePlayerInfo({
            name: 'Test Driver',
            level: 5,
            experience: 750,
            total_deliveries: 25,
            total_earnings: 15000
        });
        
        truckerTabletNUI.difficulties = {
            easy: {
                label: 'Local Deliveries',
                requiredLevel: 1,
                type: 'box',
                vehicle: 'mule',
                boxes: 6,
                rewards: { money: [800, 1200], exp: 2 }
            },
            medium: {
                label: 'Citywide Logistics',
                requiredLevel: 3,
                type: 'box',
                vehicle: 'benson',
                boxes: 10,
                rewards: { money: [1400, 2000], exp: 2 }
            },
            hard: {
                label: 'Long-Haul Trailer',
                requiredLevel: 5,
                type: 'trailer',
                vehicle: 'phantom3',
                trailer: 'trailers',
                rewards: { money: [2200, 3200], exp: [3, 10] }
            }
        };
        
        truckerTabletNUI.updateJobsList();
        truckerTabletNUI.show();
    }, 1000);
}