document.body.style.opacity = '0';
document.fonts.ready.then(() => {
    document.body.style.opacity = '1';
}); 
let currentQuestion = '';
let currentAnswer = '';
let scores = {};
let usedQuestions = new Set(); // Houdt bij welke vragen al zijn gebruikt
let lives = 5; // Start met 5 levens
let timeLeft = 5; // 5 seconden per vraag
let timer = null;

// Voorbeeld vragen (je kunt deze uitbreiden)
const questions = [
    // Rekenen
    {
        question: "Wat is 12 * 8?",
        answer: "96",
        choices: ["86", "94", "96", "98"]
    },
    {
        question: "Hoeveel is 1/4 van 100?",
        answer: "25",
        choices: ["20", "25", "40", "50"]
    },
    // Aardrijkskunde
    {
        question: "Wat is de hoofdstad van Frankrijk?",
        answer: "parijs",
        choices: ["Londen", "Parijs", "Madrid", "Rome"]
    },
    {
        question: "Welke planeet staat bekend als de rode planeet?",
        answer: "mars",
        choices: ["Venus", "Mars", "Jupiter", "Saturnus"]
    },
    // Geschiedenis
    {
        question: "Wie schilderde de Nachtwacht?",
        answer: "rembrandt",
        choices: ["Van Gogh", "Rembrandt", "Vermeer", "Picasso"]
    },
    {
        question: "In welk jaar werd de eerste smartphone uitgebracht?",
        answer: "1994",
        choices: ["1994", "1998", "2000", "2007"]
    },
    // Natuur
    {
        question: "Hoeveel poten heeft een spin?",
        answer: "8",
        choices: ["6", "8", "10", "12"]
    },
    {
        question: "Wat is de snelste vogel ter wereld?",
        answer: "slechtvalk",
        choices: ["Adelaar", "Slechtvalk", "Struisvogel", "Kolibrie"]
    },
    // Sport
    {
        question: "Hoeveel spelers heeft een voetbalteam op het veld?",
        answer: "11",
        choices: ["9", "10", "11", "12"]
    },
    {
        question: "Welke sport wordt gespeeld op Wimbledon?",
        answer: "tennis",
        choices: ["Voetbal", "Tennis", "Golf", "Cricket"]
    },
    // Wetenschap
    {
        question: "Wat is de hardste natuurlijke stof op aarde?",
        answer: "diamant",
        choices: ["Goud", "IJzer", "Diamant", "Graniet"]
    },
    {
        question: "Hoeveel procent van de aarde is bedekt met water?",
        answer: "71",
        choices: ["51", "61", "71", "81"]
    },
    // Taal
    {
        question: "Welk woord is het tegenovergestelde van 'optimistisch'?",
        answer: "pessimistisch",
        choices: ["Realistisch", "Pessimistisch", "Dramatisch", "Fantastisch"]
    },
    {
        question: "Hoeveel letters heeft het Nederlandse alfabet?",
        answer: "26",
        choices: ["24", "25", "26", "27"]
    },
    // Entertainment
    {
        question: "Wie is de beste vriend van SpongeBob?",
        answer: "patrick",
        choices: ["Patrick", "Octo", "Sandy", "Plankton"]
    },
    {
        question: "Welk dier is Mario's broer Luigi?",
        answer: "loodgieter",
        choices: ["Dokter", "Loodgieter", "Brandweerman", "Politieagent"]
    },
    // Technologie
    {
        question: "Wat betekent WiFi?",
        answer: "wireless fidelity",
        choices: ["Wireless Fidelity", "Wide Finder", "Web Filter", "Wire Free"]
    },
    {
        question: "Welk bedrijf maakte de eerste iPhone?",
        answer: "apple",
        choices: ["Samsung", "Nokia", "Apple", "Microsoft"]
    },
    // Gezondheid
    {
        question: "Hoeveel glazen water moet je minimaal per dag drinken?",
        answer: "8",
        choices: ["4", "6", "8", "10"]
    },
    {
        question: "Welk vitamine krijg je van zonlicht?",
        answer: "d",
        choices: ["A", "B", "C", "D"]
    },
    // Extra rekenvragen
    {
        question: "Wat is 15% van 200?",
        answer: "30",
        choices: ["25", "30", "35", "40"]
    },
    {
        question: "Als een fiets €240 kost met 20% korting, wat was de originele prijs?",
        answer: "300",
        choices: ["280", "290", "300", "320"]
    },
    // Logica
    {
        question: "Als het buiten regent en je hebt geen paraplu, word je dan nat?",
        answer: "ja",
        choices: ["Ja", "Nee", "Misschien", "Hangt ervan af"]
    },
    {
        question: "Welk getal komt in deze reeks: 2, 4, 6, 8, ...?",
        answer: "10",
        choices: ["9", "10", "11", "12"]
    }
];

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Hier zou je normaal gesproken een echte login verificatie hebben
    if (username && password) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('game-section').style.display = 'block';
        if (!scores[username]) {
            scores[username] = 0;
        }
        lives = 5; // Reset levens bij nieuwe login
        updateLives();
        showNewQuestion();
        updateScoreboard();
    }
}

function startTimer() {
    // Reset timer
    timeLeft = 5;
    clearInterval(timer);
    
    // Maak of update progress bar
    const progressBar = document.getElementById('timer-bar');
    if (!progressBar) {
        const gameSection = document.getElementById('game-section');
        gameSection.insertAdjacentHTML('afterbegin', `
            <div class="timer-container">
                <div id="timer-bar"></div>
            </div>
        `);
    }
    
    // Start countdown
    const startTime = Date.now();
    const totalTime = 5000; // 5 seconden in milliseconds
    
    timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        timeLeft = 5 - Math.floor(elapsedTime / 1000);
        
        // Update progress bar
        const progress = ((totalTime - elapsedTime) / totalTime) * 100;
        const progressBar = document.getElementById('timer-bar');
        progressBar.style.width = `${Math.max(progress, 0)}%`;
        
        // Als tijd voorbij is
        if (elapsedTime >= totalTime) {
            clearInterval(timer);
            checkAnswer(null); // Automatisch fout antwoord
        }
    }, 50); // Update elke 50ms voor vloeiende animatie
}

function showNewQuestion() {
    // Reset usedQuestions als alle vragen zijn gebruikt
    if (usedQuestions.size >= questions.length) {
        usedQuestions.clear();
    }
    
    // Kies een random vraag die nog niet is gebruikt
    let availableQuestions = questions.filter((_, index) => !usedQuestions.has(index));
    let randomIndex = Math.floor(Math.random() * availableQuestions.length);
    let questionObj = availableQuestions[randomIndex];
    
    // Voeg de vraag toe aan gebruikte vragen
    usedQuestions.add(questions.indexOf(questionObj));
    
    currentQuestion = questionObj.question;
    currentAnswer = questionObj.answer.toLowerCase();
    
    // Toon de vraag
    document.getElementById('question').textContent = currentQuestion;
    
    // Maak de keuze knoppen
    const answerDiv = document.getElementById('answer-buttons');
    answerDiv.innerHTML = '';
    questionObj.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.onclick = () => checkAnswer(choice.toLowerCase());
        answerDiv.appendChild(button);
    });
    
    document.getElementById('result').textContent = '';
    
    // Start de timer voor deze vraag
    startTimer();
}

function checkAnswer(userAnswer) {
    clearInterval(timer);
    const username = document.getElementById('username').value;
    
    if (userAnswer === currentAnswer) {
        let points = 0;
        if (timeLeft >= 3) {
            points = 2;
            document.getElementById('result').textContent = 'Correct! +2 punten';
        } else if (timeLeft >= 1) {
            points = 1;
            document.getElementById('result').textContent = 'Correct! +1 punt';
        } else {
            document.getElementById('result').textContent = 'Correct! Maar te laat voor punten';
        }
        scores[username] += points;
        
        // Check voor Poki beloning (nu 50 punten in plaats van 30)
        if (scores[username] >= 50) {
            showPokiReward();
            return;
        }
    } else {
        lives--;
        document.getElementById('result').textContent = 'Fout antwoord!';
        updateLives();
        
        if (lives <= 0) {
            document.body.style.backgroundColor = '#ffcccc';
            const gameSection = document.getElementById('game-section');
            gameSection.innerHTML = `
                <div class="game-over">
                    <h1>GAME OVER!</h1>
                    <img src="images/body.png" alt="Crying Minecraft character" class="minecraft-crying">
                    <p>Je score: ${scores[username]}</p>
                    <p>Je hebt nog ${50 - scores[username]} punten nodig voor Poki!</p>
                    <button onclick="restartGame('${username}')">Klik om opnieuw te spelen</button>
                </div>
            `;
            return;
        }
    }
    
    updateScoreboard();
    setTimeout(showNewQuestion, 1000);
}

function showPokiReward() {
    document.body.style.backgroundColor = '#a5d6a7';
    const gameSection = document.getElementById('game-section');
    gameSection.innerHTML = `
        <div class="minecraft-reward">
            <h1>GEFELICITEERD!</h1>
            <h2>Je hebt meer dan 50 punten!</h2>
            <div class="poki-links">
                <a href="https://poki.nl/" target="_blank" class="poki-button">
                    SPEEL POKI GAMES
                </a>
                <div class="popular-games">
                    <h3>Populaire games op Poki:</h3>
                    <a href="https://poki.nl/g/subway-surfers" target="_blank" class="game-link">
                        Subway Surfers
                    </a>
                    <a href="https://poki.nl/g/minecraft-classic" target="_blank" class="game-link">
                        Minecraft Classic
                    </a>
                    <a href="https://poki.nl/g/among-us" target="_blank" class="game-link">
                        Among Us
                    </a>
                </div>
            </div>
            <button onclick="restartGame('${username}')" class="back-button">Terug naar Quiz</button>
        </div>
    `;
}

function startMinecraftGame() {
    const gridSize = 20;
    const grid = document.getElementById('game-grid');
    let selectedBlock = 'grass';
    let placedBlocks = 0;
    let gameActive = true;
    
    // Maak het grid
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            // Maak de onderste 3 rijen aarde
            if (y >= gridSize - 3) {
                cell.className = 'grid-cell dirt';
                cell.dataset.block = 'dirt';
            }
            
            cell.addEventListener('click', () => {
                if (!gameActive) return;
                
                if (cell.dataset.block) {
                    // Breek blok
                    cell.className = 'grid-cell';
                    delete cell.dataset.block;
                    placedBlocks--;
                } else {
                    // Plaats blok
                    cell.className = `grid-cell ${selectedBlock}`;
                    cell.dataset.block = selectedBlock;
                    placedBlocks++;
                    
                    // Check voor bonus punten na 50 blokken
                    if (placedBlocks >= 50) {
                        gameActive = false;
                        const username = document.getElementById('username').value;
                        const bonus = Math.floor(placedBlocks / 10);
                        scores[username] += bonus;
                        setTimeout(() => {
                            alert(`Je hebt ${placedBlocks} blokken gebouwd! Bonus punten: ${bonus}`);
                            updateScoreboard();
                            restartGame(username);
                        }, 100);
                    }
                }
                
                document.getElementById('block-count').textContent = placedBlocks;
            });
            
            grid.appendChild(cell);
        }
    }
    
    // Block selector
    const blockSelectors = document.querySelectorAll('.block-select');
    blockSelectors.forEach(selector => {
        selector.addEventListener('click', () => {
            selectedBlock = selector.dataset.block;
            // Highlight geselecteerde blok
            blockSelectors.forEach(s => s.classList.remove('selected'));
            selector.classList.add('selected');
        });
    });
}

function restartGame(username) {
    // Reset alles
    document.body.style.backgroundColor = 'white';
    lives = 5;
    scores[username] = 0;
    
    // Herstel de originele game sectie
    const gameSection = document.getElementById('game-section');
    gameSection.innerHTML = `
        <h2>Quiz Game</h2>
        <div id="lives"></div>
        <div id="question"></div>
        <div id="answer-buttons"></div>
        <div id="result"></div>
        <div id="scoreboard"></div>
    `;
    
    // Start het spel opnieuw
    updateLives();
    showNewQuestion();
    updateScoreboard();
}

function updateScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = '<h3>Scorebord:</h3>';
    for (const [player, score] of Object.entries(scores)) {
        scoreboard.innerHTML += `<p>${player}: ${score} punten</p>`;
    }
}

function updateLives() {
    const livesDisplay = document.getElementById('lives');
    if (!livesDisplay) {
        // Maak lives display als die nog niet bestaat
        const gameSection = document.getElementById('game-section');
        const livesDiv = document.createElement('div');
        livesDiv.id = 'lives';
        gameSection.insertBefore(livesDiv, gameSection.firstChild);
    }
    
    let heartsHTML = 'Levens: ';
    for (let i = 0; i < lives; i++) {
        heartsHTML += '<i class="fas fa-heart"></i> ';
    }
    document.getElementById('lives').innerHTML = heartsHTML;
}

