// Modern Vehicle Rental NUI System - Beautiful 2025 Design
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
        this.createRippleEffect();
        this.hide(); // Start hidden
    }
    
    bindEvents() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousVehicle());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextVehicle());
        
        // Action buttons
        document.getElementById('rentBtn').addEventListener('click', (e) => {
            this.createRipple(e, e.currentTarget);
            setTimeout(() => this.rentVehicle(), 200);
        });
        
        document.getElementById('cancelBtn').addEventListener('click', (e) => {
            this.createRipple(e, e.currentTarget);
            setTimeout(() => this.closeNUI(), 200);
        });
        
        document.getElementById('closeBtn').addEventListener('click', () => this.closeNUI());
        
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
        
        // Dot navigation
        this.setupDotNavigation();
    }
    
    createRippleEffect() {
        // Add ripple effect to all buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }
    
    createRipple(event, element) {
        const ripple = element.querySelector('.btn-ripple');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'scale(0)';
        
        // Trigger animation
        setTimeout(() => {
            ripple.style.transform = 'scale(4)';
            ripple.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            ripple.style.transform = 'scale(0)';
            ripple.style.opacity = '0.3';
        }, 600);
    }
    
    setupCarousel() {
        // Enhanced vehicle data with better descriptions and specs
        this.vehicles = [
            {
                name: 'Phantom Truck',
                description: 'Professional heavy-duty truck designed for long-haul deliveries and heavy cargo transport across the state.',
                image: 'https://via.placeholder.com/400x200/0a0a0a/00d4ff?text=PHANTOM+TRUCK',
                type: 'phantom3',
                difficulty: 'hard',
                badge: 'HEAVY DUTY',
                specs: {
                    type: 'Trailer',
                    difficulty: 'Hard',
                    price: 'FREE'
                }
            },
            {
                name: 'Benson Truck',
                description: 'Versatile medium-capacity truck perfect for citywide logistics and regional delivery operations.',
                image: 'https://via.placeholder.com/400x200/0a0a0a/00ff87?text=BENSON+TRUCK',
                type: 'benson',
                difficulty: 'medium',
                badge: 'VERSATILE',
                specs: {
                    type: 'Box Truck',
                    difficulty: 'Medium',
                    price: 'FREE'
                }
            },
            {
                name: 'Mule Truck',
                description: 'Compact and efficient delivery truck ideal for local routes and quick urban deliveries.',
                image: 'https://via.placeholder.com/400x200/0a0a0a/ff0096?text=MULE+TRUCK',
                type: 'mule',
                difficulty: 'easy',
                badge: 'EFFICIENT',
                specs: {
                    type: 'Light Truck',
                    difficulty: 'Easy',
                    price: 'FREE'
                }
            }
        ];
        
        this.updateCarousel();
        this.updateCounter();
    }
    
    setupDotNavigation() {
        const dotsContainer = document.getElementById('dotsContainer');
        
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
        const dotsContainer = document.getElementById('dotsContainer');
        dotsContainer.innerHTML = '';
        
        this.vehicles.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot ${index === this.currentVehicleIndex ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });
    }
    
    updateCounter() {
        document.getElementById('currentIndex').textContent = this.currentVehicleIndex + 1;
        document.getElementById('totalVehicles').textContent = this.vehicles.length;
    }
    
    previousVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex - 1 + this.vehicles.length) % this.vehicles.length;
        this.updateCarousel();
        this.animateCarousel('prev');
        this.updateCounter();
    }
    
    nextVehicle() {
        this.currentVehicleIndex = (this.currentVehicleIndex + 1) % this.vehicles.length;
        this.updateCarousel();
        this.animateCarousel('next');
        this.updateCounter();
    }
    
    goToVehicle(index) {
        if (index >= 0 && index < this.vehicles.length && index !== this.currentVehicleIndex) {
            this.currentVehicleIndex = index;
            this.updateCarousel();
            this.animateCarousel('direct');
            this.updateCounter();
        }
    }
    
    updateCarousel() {
        const vehicle = this.vehicles[this.currentVehicleIndex];
        if (!vehicle) return;
        
        // Update vehicle display with enhanced information
        document.getElementById('vehicleImage').src = vehicle.image;
        document.getElementById('vehicleName').textContent = vehicle.name;
        document.getElementById('vehicleDescription').textContent = vehicle.description;
        document.getElementById('vehicleBadge').textContent = vehicle.badge;
        document.getElementById('vehicleType').textContent = vehicle.specs.type;
        document.getElementById('vehicleDifficulty').textContent = vehicle.specs.difficulty;
        
        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentVehicleIndex);
        });
        
        // Add loading effect
        const vehicleCard = document.getElementById('vehicleCard');
        vehicleCard.classList.add('loading');
        
        setTimeout(() => {
            vehicleCard.classList.remove('loading');
        }, 300);
    }
    
    animateCarousel(direction) {
        const vehicleCard = document.getElementById('vehicleCard');
        const image = document.getElementById('vehicleImage');
        
        // Enhanced animation based on direction
        let translateX = '0px';
        let scale = '1';
        
        switch(direction) {
            case 'prev':
                translateX = '-20px';
                scale = '0.95';
                break;
            case 'next':
                translateX = '20px';
                scale = '0.95';
                break;
            case 'direct':
                scale = '0.9';
                break;
        }
        
        // Apply animation
        vehicleCard.style.transform = `translateX(${translateX}) scale(${scale})`;
        vehicleCard.style.opacity = '0.7';
        image.style.transform = 'scale(1.1)';
        
        // Reset animation
        setTimeout(() => {
            vehicleCard.style.transform = 'translateX(0) scale(1)';
            vehicleCard.style.opacity = '1';
            image.style.transform = 'scale(1)';
        }, 200);
        
        // Add glow effect
        this.addGlowEffect();
    }
    
    addGlowEffect() {
        const vehicleCard = document.getElementById('vehicleCard');
        const glow = vehicleCard.querySelector('.vehicle-glow');
        
        glow.style.opacity = '1';
        setTimeout(() => {
            glow.style.opacity = '0';
        }, 500);
    }
    
    updatePlayerInfo(playerData) {
        this.playerData = playerData;
        
        if (playerData) {
            // Update player information
            document.getElementById('playerName').textContent = playerData.name || 'Driver';
            document.getElementById('playerLevel').textContent = `Level ${playerData.level || 1}`;
            
            // Update statistics
            document.getElementById('totalDeliveries').textContent = (playerData.total_deliveries || 0).toLocaleString();
            document.getElementById('totalEarnings').textContent = `$${(playerData.total_earnings || 0).toLocaleString()}`;
            
            // Update EXP bar with animation
            const currentExp = playerData.experience || 0;
            const requiredExp = (playerData.level || 1) * 100;
            const expProgress = Math.min(currentExp, requiredExp);
            const expPercentage = (expProgress / requiredExp) * 100;
            
            const expFill = document.getElementById('expFill');
            const expText = document.getElementById('expText');
            
            // Animate EXP bar
            setTimeout(() => {
                expFill.style.width = `${expPercentage}%`;
                expText.textContent = `${expProgress} / ${requiredExp} XP`;
            }, 500);
            
            // Trigger EXP particles animation
            this.animateExpParticles();
        }
    }
    
    animateExpParticles() {
        const particles = document.querySelectorAll('.exp-particle');
        particles.forEach((particle, index) => {
            setTimeout(() => {
                particle.style.animation = 'none';
                particle.offsetHeight; // Trigger reflow
                particle.style.animation = 'expFloat 3s ease-in-out infinite';
            }, index * 200);
        });
    }
    
    updateVehicles(vehicleData) {
        if (vehicleData && Array.isArray(vehicleData)) {
            // Map server data to enhanced vehicle objects
            this.vehicles = vehicleData.map(vehicle => ({
                name: vehicle.name || vehicle.type.toUpperCase(),
                description: vehicle.description || `Professional ${vehicle.type} for delivery operations`,
                image: vehicle.image || `https://via.placeholder.com/400x200/0a0a0a/00d4ff?text=${vehicle.name.replace(/\s+/g, '+').toUpperCase()}`,
                type: vehicle.type,
                difficulty: vehicle.difficulty,
                badge: this.getDifficultyBadge(vehicle.difficulty),
                specs: {
                    type: this.getVehicleTypeDisplay(vehicle.difficulty),
                    difficulty: this.getDifficultyDisplay(vehicle.difficulty),
                    price: 'FREE'
                }
            }));
            
            this.currentVehicleIndex = 0;
            this.updateCarousel();
            this.updateDots();
            this.updateCounter();
        }
    }
    
    getDifficultyBadge(difficulty) {
        const badges = {
            'easy': 'EFFICIENT',
            'medium': 'VERSATILE', 
            'hard': 'HEAVY DUTY'
        };
        return badges[difficulty] || 'STANDARD';
    }
    
    getVehicleTypeDisplay(difficulty) {
        const types = {
            'easy': 'Light Truck',
            'medium': 'Box Truck',
            'hard': 'Trailer'
        };
        return types[difficulty] || 'Truck';
    }
    
    getDifficultyDisplay(difficulty) {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
    
    rentVehicle() {
        const currentVehicle = this.vehicles[this.currentVehicleIndex];
        if (!currentVehicle) return;
        
        // Enhanced visual feedback
        const rentBtn = document.getElementById('rentBtn');
        const btnText = rentBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        // Button animation
        rentBtn.style.transform = 'scale(0.95)';
        btnText.textContent = 'PROCESSING...';
        rentBtn.style.background = 'linear-gradient(135deg, #ff0096 0%, #00d4ff 100%)';
        
        // Add loading effect to vehicle card
        document.getElementById('vehicleCard').classList.add('loading');
        
        setTimeout(() => {
            rentBtn.style.transform = 'scale(1)';
            btnText.textContent = originalText;
            rentBtn.style.background = 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)';
            document.getElementById('vehicleCard').classList.remove('loading');
        }, 1500);
        
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
        
        // Animate entrance
        const container = document.querySelector('.container');
        container.style.animation = 'containerEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        
        // Stagger animations for elements
        this.staggerElementAnimations();
    }
    
    staggerElementAnimations() {
        const elements = [
            '.header',
            '.stats-card',
            '.vehicle-showcase',
            '.actions'
        ];
        
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }
    
    hide() {
        this.isVisible = false;
        document.body.style.display = 'none';
    }
    
    closeNUI() {
        // Animate exit
        const container = document.querySelector('.container');
        container.style.animation = 'containerExit 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        
        setTimeout(() => {
            this.hide();
            this.sendNUIMessage('closeNUI');
        }, 600);
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

// Add exit animation to CSS
const exitAnimation = document.createElement('style');
exitAnimation.textContent = `
    @keyframes containerExit {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
        }
    }
`;
document.head.appendChild(exitAnimation);

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
    console.log('Running in development mode - Beautiful 2025 Design');
    
    // Test data with enhanced information
    setTimeout(() => {
        vehicleRentalNUI.updatePlayerInfo({
            name: 'Alex Rodriguez',
            level: 8,
            experience: 1250,
            total_deliveries: 147,
            total_earnings: 89750
        });
        vehicleRentalNUI.show();
    }, 1000);
}