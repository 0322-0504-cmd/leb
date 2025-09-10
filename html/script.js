// Modern Vehicle Rental NUI System
class VehicleRentalNUI {
    constructor() {
        this.currentVehicleIndex = 0;
        this.vehicles = [];
        this.playerData = null;
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupCarousel();
        this.hide(); // Start hidden
    }
    
    bindEvents() {
        // Carousel navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.previousVehicle());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextVehicle());
        
        // Action buttons
        document.getElementById('rentBtn').addEventListener('click', () => this.rentVehicle());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeNUI());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeNUI();
                    break;
                case 'ArrowLeft':
                    this.previousVehicle();
                    break;
                case 'ArrowRight':
                    this.nextVehicle();
                    break;
                case 'Enter':
                    this.rentVehicle();
                    break;
            }
        });
        
        // Dot indicators
        this.setupDotNavigation();
    }
    
    setupCarousel() {
        // Default vehicles data - will be replaced by server data
        this.vehicles = [
            {
                name: 'Phantom Truck',
                description: 'Heavy-duty truck for long haul deliveries',
                image: 'https://via.placeholder.com/300x120/1a1a1a/00ffff?text=Phantom+Truck',
                type: 'phantom3',
                difficulty: 'hard'
            },
            {
                name: 'Benson Truck',
                description: 'Medium capacity truck for city deliveries',
                image: 'https://via.placeholder.com/300x120/1a1a1a/22c55e?text=Benson+Truck',
                type: 'benson',
                difficulty: 'medium'
            },
            {
                name: 'Mule Truck',
                description: 'Light delivery truck for local routes',
                image: 'https://via.placeholder.com/300x120/1a1a1a/f59e0b?text=Mule+Truck',
                type: 'mule',
                difficulty: 'easy'
            }
        ];
        
        this.updateCarousel();
    }
    
    setupDotNavigation() {
        const dotsContainer = document.getElementById('carouselDots');
        
        // Update dots when vehicles change
        this.updateDots();
        
        // Add click handlers to dots
        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                const index = Array.from(dotsContainer.children).indexOf(e.target);
                this.goToVehicle(index);
            }
        });
    }
    
    updateDots() {
        const dotsContainer = document.getElementById('carouselDots');
        dotsContainer.innerHTML = '';
        
        this.vehicles.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `dot ${index === this.currentVehicleIndex ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });
    }
    
    previousVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex - 1 + this.vehicles.length) % this.vehicles.length;
        this.updateCarousel();
        this.animateCarousel('prev');
    }
    
    nextVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex + 1) % this.vehicles.length;
        this.updateCarousel();
        this.animateCarousel('next');
    }
    
    goToVehicle(index) {
        if (index >= 0 && index < this.vehicles.length) {
            this.currentVehicleIndex = index;
            this.updateCarousel();
            this.animateCarousel('direct');
        }
    }
    
    updateCarousel() {
        const vehicle = this.vehicles[this.currentVehicleIndex];
        if (!vehicle) return;
        
        // Update vehicle display
        document.getElementById('currentVehicleImg').src = vehicle.image;
        document.getElementById('vehicleName').textContent = vehicle.name;
        document.getElementById('vehicleDescription').textContent = vehicle.description;
        
        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentVehicleIndex);
        });
    }
    
    animateCarousel(direction) {
        const vehicleDisplay = document.querySelector('.vehicle-display');
        
        // Add animation class
        vehicleDisplay.style.opacity = '0.7';
        vehicleDisplay.style.transform = direction === 'prev' ? 'translateX(-20px)' : 
                                       direction === 'next' ? 'translateX(20px)' : 'scale(0.95)';
        
        // Reset animation
        setTimeout(() => {
            vehicleDisplay.style.opacity = '1';
            vehicleDisplay.style.transform = 'translateX(0) scale(1)';
        }, 150);
    }
    
    updatePlayerInfo(playerData) {
        this.playerData = playerData;
        
        if (playerData) {
            document.getElementById('playerName').textContent = playerData.name || 'Driver';
            document.getElementById('playerLevel').textContent = `Level ${playerData.level || 1}`;
            
            // Update EXP bar
            const currentExp = playerData.experience || 0;
            const requiredExp = (playerData.level || 1) * 100;
            const expProgress = Math.min(currentExp, requiredExp);
            const expPercentage = (expProgress / requiredExp) * 100;
            
            document.getElementById('expFill').style.width = `${expPercentage}%`;
            document.getElementById('expText').textContent = `${expProgress} / ${requiredExp} EXP`;
        }
    }
    
    updateVehicles(vehicleData) {
        if (vehicleData && Array.isArray(vehicleData)) {
            this.vehicles = vehicleData;
            this.currentVehicleIndex = 0;
            this.updateCarousel();
            this.updateDots();
        }
    }
    
    rentVehicle() {
        const currentVehicle = this.vehicles[this.currentVehicleIndex];
        if (!currentVehicle) return;
        
        // Add visual feedback
        const rentBtn = document.getElementById('rentBtn');
        rentBtn.style.transform = 'scale(0.95)';
        rentBtn.querySelector('.btn-text').textContent = 'RENTING...';
        
        setTimeout(() => {
            rentBtn.style.transform = 'scale(1)';
            rentBtn.querySelector('.btn-text').textContent = 'RENT VEHICLE - FREE';
        }, 300);
        
        // Send to client
        this.sendNUIMessage('rentVehicle', {
            vehicleType: currentVehicle.type,
            difficulty: currentVehicle.difficulty,
            vehicleName: currentVehicle.name
        });
    }
    
    show() {
        this.isVisible = true;
        document.body.style.display = 'flex';
        
        // Animate panel entrance
        const panel = document.querySelector('.rental-panel');
        panel.style.animation = 'panelSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }
    
    hide() {
        this.isVisible = false;
        document.body.style.display = 'none';
    }
    
    closeNUI() {
        // Animate panel exit
        const panel = document.querySelector('.rental-panel');
        panel.style.animation = 'panelSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        
        setTimeout(() => {
            this.hide();
            this.sendNUIMessage('closeNUI');
        }, 400);
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

// Add panel slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes panelSlideOut {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
        }
    }
`;
document.head.appendChild(style);

// Initialize the NUI system
const vehicleRentalNUI = new VehicleRentalNUI();

// Handle messages from Lua
window.addEventListener('message', (event) => {
    const data = event.data;
    
    switch(data.action) {
        case 'openRentMenu':
            vehicleRentalNUI.updatePlayerInfo(data.playerData);
            vehicleRentalNUI.updateVehicles(data.vehicles);
            vehicleRentalNUI.show();
            break;
            
        case 'hideUI':
            vehicleRentalNUI.hide();
            break;
            
        case 'updatePlayerData':
            vehicleRentalNUI.updatePlayerInfo(data.playerData);
            break;
            
        case 'updateVehicles':
            vehicleRentalNUI.updateVehicles(data.vehicles);
            break;
    }
});

// Development testing (remove in production)
if (!window.invokeNative) {
    console.log('Running in development mode');
    
    // Test data
    setTimeout(() => {
        vehicleRentalNUI.updatePlayerInfo({
            name: 'Test Driver',
            level: 5,
            experience: 750
        });
        vehicleRentalNUI.show();
    }, 1000);
}