const fullscreenOverlay = document.getElementById("fullscreen-overlay");

function showPrompt() {
    fullscreenOverlay.style.opacity = "1";
    fullscreenOverlay.style.pointerEvents = "auto";
}

function hidePrompt() {
    fullscreenOverlay.style.opacity = "0";
    fullscreenOverlay.style.pointerEvents = "none";
}

// Check for fullscreen
document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) hidePrompt();
    else showPrompt();
})

// Check when loading page
window.addEventListener("load", () => {
    setTimeout(() => {
        if (!document.fullscreenElement) showPrompt();
    }, 300);
})

const fullscreenBtn = document.getElementById("fullscreen-btn");

fullscreenBtn.addEventListener("click", async () => {
    try {
        await document.documentElement.requestFullscreen();
        hidePrompt();
    } catch (error) {
        alert("Failed to fullscreen. Please press F11 manually.")
    }
})

const closeBtn = document.querySelector(".windows-button.red");
const vscode = document.getElementById("vscode");
const desktop = document.getElementById("desktop");

closeBtn.addEventListener("click", () => {
    vscode.classList.add("fade-out");
    setTimeout(() => {
        vscode.classList.add("hidden");

        desktop.classList.remove("hidden");
        requestAnimationFrame(() => desktop.classList.add("fade-in"));
    }, 300);
})

const vscode_icon = document.getElementById("vscode-icon");

vscode_icon.addEventListener("click", () => {
    desktop.classList.add("fade-out");
    setTimeout(() => {
        desktop.classList.add("hidden");

        vscode.classList.remove("hidden");
        requestAnimationFrame(() => vscode.classList.add("fade-in"));
    }, 300);
})

function updateClock() {
    const now = new Date();
    document.getElementById('hour').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    document.getElementById('day').textContent = now.toLocaleDateString();
}

updateClock();
setInterval(updateClock, 1000);
