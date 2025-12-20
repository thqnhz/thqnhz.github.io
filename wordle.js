(function() {
    const wordleWindow = document.getElementById("wordle-window");
    const wordleIcon = document.getElementById("wordle-icon");
    const closeWordleBtn = document.getElementById("close-wordle");
    const grid = document.getElementById("wordle-grid");
    const keyboard = document.getElementById("wordle-keyboard");
    const toastContainer = document.getElementById("wordle-toast-container");
    const lengthSelect = document.getElementById("word-length-select");
    const newGameBtn = document.getElementById("new-game-btn");

    const MAX_GUESSES = 6;
    let wordLength = 5;
    let currentGuess = "";
    let currentRow = 0;
    let targetWord = "CODE";
    let validGuesses = new Set();
    let isGameActive = true;
    let isLoading = true;

    async function initWordle() {
        wordLength = parseInt(lengthSelect.value);
        currentRow = 0;
        currentGuess = "";
        isGameActive = true;
        validGuesses.clear();
        grid.innerHTML = "";

        grid.style.setProperty('--word-length', wordLength);
        grid.style.setProperty('--aspect-ratio', `${wordLength}/${MAX_GUESSES}`);

        keyboard.innerHTML = `
            <div class="keyboard-row">
                <button class="key" data-key="Q">Q</button>
                <button class="key" data-key="W">W</button>
                <button class="key" data-key="E">E</button>
                <button class="key" data-key="R">R</button>
                <button class="key" data-key="T">T</button>
                <button class="key" data-key="Y">Y</button>
                <button class="key" data-key="U">U</button>
                <button class="key" data-key="I">I</button>
                <button class="key" data-key="O">O</button>
                <button class="key" data-key="P">P</button>
            </div>
            <div class="keyboard-row">
                <button class="key" data-key="A">A</button>
                <button class="key" data-key="S">S</button>
                <button class="key" data-key="D">D</button>
                <button class="key" data-key="F">F</button>
                <button class="key" data-key="G">G</button>
                <button class="key" data-key="H">H</button>
                <button class="key" data-key="J">J</button>
                <button class="key" data-key="K">K</button>
                <button class="key" data-key="L">L</button>
            </div>
            <div class="keyboard-row">
                <button class="key wide" data-key="ENTER">ENTER</button>
                <button class="key" data-key="Z">Z</button>
                <button class="key" data-key="X">X</button>
                <button class="key" data-key="C">C</button>
                <button class="key" data-key="V">V</button>
                <button class="key" data-key="B">B</button>
                <button class="key" data-key="N">N</button>
                <button class="key" data-key="M">M</button>
                <button class="key wide" data-key="BACKSPACE">&#9003;</button>
            </div>
        `;

        for (let i = 0; i < MAX_GUESSES; i++) {
            const row = document.createElement("div");
            row.className = "tile-row";
            for (let j = 0; j < wordLength; j++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                row.appendChild(tile);
            }
            grid.appendChild(row);
        }

        isLoading = true;
        try {
            const listResponse = await fetch(`asset/wordle_valid_guess/${wordLength}_letter.txt`);
            if (!listResponse.ok) throw new Error("Word list not found");
            const listText = await listResponse.text();

            const normalizedText = listText.replace(/[\r\n]+/g, ' ');
            validGuesses = new Set(normalizedText.split(' ').map(w => w.toUpperCase().trim()).filter(w => w.length === wordLength));

            const wordResponse = await fetch(`https://random-word-api.vercel.app/api?words=50&length=${wordLength}&type=uppercase`);
            const words = await wordResponse.json();

            const validApiWords = words.filter(w => w.length === wordLength);

            if (validApiWords.length > 0) {
                targetWord = validApiWords[Math.floor(Math.random() * validApiWords.length)];
                validGuesses.add(targetWord);
            } else {
                throw new Error("No valid words returned from API");
            }

        } catch (error) {
            console.error("Failed to load game data:", error);
            showToast("Failed to load game data");
        } finally {
            isLoading = false;
        }
    }

    lengthSelect.addEventListener("change", () => {
        initWordle();
        lengthSelect.blur();
    });

    newGameBtn.addEventListener("click", () => {
        initWordle();
        newGameBtn.blur();
    });

    wordleIcon.addEventListener("click", () => {
        wordleWindow.classList.remove("hidden");
        if (grid.children.length === 0) initWordle();
    });

    closeWordleBtn.addEventListener("click", () => {
        wordleWindow.classList.add("hidden");
    });

    function handleInput(key) {
        if (!isGameActive || isLoading) return;

        if (key === "ENTER") {
            submitGuess();
        } else if (key === "BACKSPACE" || key === "DELETE") {
            deleteLetter();
        } else if (/^[A-Z]$/.test(key)) {
            addLetter(key);
        }
    }

    function addLetter(letter) {
        if (currentGuess.length < wordLength) {
            currentGuess += letter;
            updateGrid();
        }
    }

    function deleteLetter() {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateGrid();
        }
    }

    function updateGrid() {
        const row = grid.children[currentRow];
        const tiles = row.children;

        for (let i = 0; i < wordLength; i++) {
            const tile = tiles[i];
            tile.textContent = currentGuess[i] || "";
            if (currentGuess[i]) {
                tile.setAttribute("data-state", "active");
            } else {
                tile.removeAttribute("data-state");
            }
        }
    }

    async function submitGuess() {
        if (currentGuess.length !== wordLength) {
            shakeRow();
            showToast("Not enough letters");
            return;
        }

        if (!validGuesses.has(currentGuess)) {
            showToast("Not in word list");
            shakeRow();
            return;
        }

        const row = grid.children[currentRow];
        const tiles = row.children;
        const guessArray = Array.from(currentGuess);
        const targetArray = Array.from(targetWord);

        guessArray.forEach((letter, i) => {
            if (letter === targetArray[i]) {
                tiles[i].setAttribute("data-state", "correct");
                updateKeyboard(letter, "correct");
                targetArray[i] = null;
                guessArray[i] = null;
            }
        });

        guessArray.forEach((letter, i) => {
            if (letter && targetArray.includes(letter)) {
                tiles[i].setAttribute("data-state", "present");
                updateKeyboard(letter, "present");
                targetArray[targetArray.indexOf(letter)] = null;
            } else if (letter) {
                tiles[i].setAttribute("data-state", "absent");
                updateKeyboard(letter, "absent");
            }
        });

        for (let i = 0; i < wordLength; i++) {
            tiles[i].classList.add("flip");
            await new Promise(r => setTimeout(r, 100)); // Stagger animations
        }

        if (currentGuess === targetWord) {
            showToast("Splendid!");
            isGameActive = false;
        } else if (currentRow === MAX_GUESSES - 1) {
            showToast(targetWord);
            isGameActive = false;
        } else {
            currentRow++;
            currentGuess = "";
        }
    }

    function updateKeyboard(letter, state) {
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        if (!key) return;

        const currentState = key.getAttribute("data-state");

        if (state === "correct") {
            key.setAttribute("data-state", "correct");
        } else if (state === "present" && currentState !== "correct") {
            key.setAttribute("data-state", "present");
        } else if (state === "absent" && currentState !== "correct" && currentState !== "present") {
            key.setAttribute("data-state", "absent");
        }
    }

    function shakeRow() {
        const row = grid.children[currentRow];
        row.classList.add("shake");
        setTimeout(() => row.classList.remove("shake"), 500);
    }

    function showToast(message, duration = 3000) {
        const toast = document.createElement("div");
        toast.className = "wordle-toast";
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hide");
            toast.addEventListener("animationend", () => {
                if (toast.parentElement) toast.remove();
            });
        }, duration);
    }

    document.addEventListener("keydown", (e) => {
        if (wordleWindow.classList.contains("hidden")) return;
        if(document.activeElement === lengthSelect || document.activeElement === newGameBtn) return;
        handleInput(e.key.toUpperCase());
    });

    keyboard.addEventListener("click", (e) => {
        if (e.target.matches("button.key")) {
            handleInput(e.target.dataset.key);
        }
    });

    console.log("%cCheating spoils the fun! \nIf you are looking for the word, it's hidden securely. ;)", "color: red; font-size: 16px; font-weight: bold;");

})();
