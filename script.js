document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Interaction
    const cursor = document.querySelector('.cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Reveal Animations on Scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Target elements for reveal
    document.querySelectorAll('.feature-card, .tech-image, .tech-details, .dashboard-text, .reveal-text').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1)';
        observer.observe(el);
    });

    // Handle intersection styles via JS injection (keeping CSS clean)
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Smooth Scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Hero Text Animation Logic
    const heroTitle = document.querySelector('.reveal-text');
    if (heroTitle) {
        heroTitle.classList.add('visible');
    }
});

// --- Advanced Simulation Logic ---
let currentLevel = 0;
let walletBalance = 0;
const BIN_HEIGHT_CM = 100; // Fake bin depth

// 1. Drag & Drop events
window.drag = (ev) => {
    const el = ev.currentTarget || ev.target;
    ev.dataTransfer.setData("type", el.getAttribute('data-type'));
    ev.dataTransfer.setData("volume", el.getAttribute('data-volume'));
    
    // Slight ghost effect
    setTimeout(() => { el.style.opacity = '0.5'; }, 0);
};

// End drag (restore opacity if it wasn't dropped)
document.addEventListener('dragend', (ev) => {
    if(ev.target.classList && ev.target.classList.contains('draggable-item')) {
        ev.target.style.opacity = '1';
    }
});

window.allowDrop = (ev) => {
    ev.preventDefault();
};

window.dragEnter = (ev) => {
    ev.preventDefault();
    document.getElementById('drop-zone').classList.add('drag-over');
    document.getElementById('bin-lid').classList.add('open');
};

window.dragLeave = (ev) => {
    if (ev.target.id === 'drop-zone') {
        document.getElementById('drop-zone').classList.remove('drag-over');
        document.getElementById('bin-lid').classList.remove('open');
    }
};

window.drop = (ev) => {
    ev.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
    document.getElementById('bin-lid').classList.remove('open');

    // Get Data
    const type = ev.dataTransfer.getData("type");
    const volume = parseInt(ev.dataTransfer.getData("volume"));
    
    if(!type || isNaN(volume)) return;

    processTrash(type, volume);
};

// 2. Logic Processing
const processTrash = (type, volume) => {
    if (currentLevel >= 100) {
        updateAIStatus("الحاوية ممتلئة! المرجو الإفراغ", "ai-error");
        return;
    }

    // AI Classification Simulation
    updateAIStatus("جاري تحليل المادة...", "ai-waiting");

    setTimeout(() => {
        let reward = 0;
        let aiMsg = "";
        
        switch(type) {
            case 'plastic': reward = 5; aiMsg = "بلاستيك - قابل للتدوير ♻️"; break;
            case 'paper': reward = 2; aiMsg = "ورق - قابل للتدوير ♻️"; break;
            case 'metal': reward = 4; aiMsg = "معدن - قابل للتدوير ♻️"; break;
        }
        
        updateAIStatus(aiMsg, "ai-success");

        // Process physics (Level and Distance)
        currentLevel = Math.min(100, currentLevel + volume);
        updateDashboard(reward);

    }, 800); // 800ms AI Processing delay
};

const updateAIStatus = (msg, className) => {
    const el = document.getElementById('iot-ai-status');
    el.innerText = msg;
    el.className = `iot-value ${className}`;
};

const updateDashboard = (rewardEarned) => {
    // Fill Bar
    document.getElementById('adv-trash-level').style.height = `${currentLevel}%`;
    document.getElementById('iot-fill-bar').style.width = `${currentLevel}%`;
    
    const fillText = document.getElementById('iot-fill-text');
    fillText.innerText = `${currentLevel}%`;
    if(currentLevel >= 80) fillText.style.color = '#ff4444';
    else fillText.style.color = 'var(--primary-color)';

    // Ultrasonic Distance (Inverse of fill)
    const currentDistance = BIN_HEIGHT_CM - (BIN_HEIGHT_CM * (currentLevel/100));
    document.getElementById('iot-distance').innerText = `${currentDistance.toFixed(1)} cm`;

    // Alert server if full
    if(currentLevel >= 90) {
        document.getElementById('iot-network').innerHTML = 'إرسال طلب إفراغ للبلدية... 📡';
        document.getElementById('iot-network').className = "iot-value connection-err";
    }

    // Add Reward
    if(rewardEarned > 0) {
        walletBalance += rewardEarned;
        const walletEl = document.getElementById('wallet-amount');
        walletEl.innerText = walletBalance.toFixed(2);
        
        // Bounce anim
        walletEl.parentElement.style.transform = 'scale(1.2)';
        setTimeout(() => walletEl.parentElement.style.transform = 'scale(1)', 200);
    }
};

window.resetAdvSim = () => {
    currentLevel = 0;
    walletBalance = 0;
    updateDashboard(0);
    document.getElementById('wallet-amount').innerText = "0.00";
    
    document.getElementById('iot-network').innerHTML = 'ESP32 متصل 🟢';
    document.getElementById('iot-network').className = "iot-value connection-ok";
    
    updateAIStatus("في الانتظار...", "ai-waiting");
};
