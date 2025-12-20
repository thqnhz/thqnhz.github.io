const fullscreenOverlay = document.getElementById("fullscreen-overlay");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const closeBtn = document.querySelector(".windows-button.red");
const vscode = document.getElementById("vscode");
const desktop = document.getElementById("desktop");
const vscodeIcon = document.getElementById("vscode-icon");
const hourElement = document.getElementById('hour');
const dayElement = document.getElementById('day');

const showPrompt = () => {
    fullscreenOverlay.style.opacity = "1";
    fullscreenOverlay.style.pointerEvents = "auto";
};

const hidePrompt = () => {
    fullscreenOverlay.style.opacity = "0";
    fullscreenOverlay.style.pointerEvents = "none";
};

// Check for fullscreen state changes
document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        hidePrompt();
    } else {
        showPrompt();
    }
});

window.addEventListener("load", () => {
    setTimeout(() => {
        if (!document.fullscreenElement) {
            showPrompt();
        }
    }, 300);
});

fullscreenBtn.addEventListener("click", async () => {
    try {
        await document.documentElement.requestFullscreen();
        hidePrompt();
    } catch (error) {
        alert("Failed to enter fullscreen. Please press F11 manually.");
    }
});

function transitionToDesktop() {
    vscode.classList.remove('fade-in', 'fade-out');
    desktop.classList.remove('fade-in', 'fade-out');
    vscode.classList.add('hidden');
    desktop.classList.remove('hidden');
    desktop.classList.add('fade-in');
    setTimeout(() => desktop.classList.remove('fade-in'), 300);
}

function transitionToVSCode() {
    vscode.classList.remove('fade-in', 'fade-out');
    desktop.classList.remove('fade-in', 'fade-out');
    desktop.classList.add('hidden');
    vscode.classList.remove('hidden');
    vscode.classList.add('fade-in');
    setTimeout(() => vscode.classList.remove('fade-in'), 300);
}

closeBtn.addEventListener("click", transitionToDesktop);
vscodeIcon.addEventListener("click", transitionToVSCode);

const updateClock = () => {
    const now = new Date();
    hourElement.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    dayElement.textContent = now.toLocaleDateString();
};

updateClock();
const clockInterval = setInterval(updateClock, 60000);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        updateClock();
    }
});
