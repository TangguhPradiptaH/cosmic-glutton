var GRID_SIZE = 16;
var gameInterval;
var movementDirection = "up";
var snakeHead;
var snakeBodySegments = [];
var foodTarget;
var currentScore = 0;
var inputLocked = false;
var isGameActive = false;

// Konstanta untuk jalur API
const API_URL = 'api.php';

function getElement(id) {
  return document.getElementById(id);
}

function drawPlayfield() {
  getElement("grid").innerHTML = "";
  for (var i = 0; i < GRID_SIZE; i++) {
      var row = document.createElement("tr");
      for (var x = 0; x < GRID_SIZE; x++) {
          var cell = document.createElement("td");
          row.appendChild(cell);
      }
      getElement("grid").appendChild(row);
  }
}

function spawnSnakeHead() {
    snakeHead = {x:GRID_SIZE/2, y:GRID_SIZE/2, dir: movementDirection};
    renderCell(snakeHead.x, snakeHead.y, 'snake-head');
}

function renderCell(x, y, className) {
    var grid = getElement("grid");
    if (!grid.rows[y] || !grid.rows[y].cells[x]) return;
    
    var cell = grid.rows[y].cells[x];
    cell.className = ''; 
    if (className) cell.classList.add(className);
}

function initiateLaunch() {
    getElement("leaderboardSection").style.display = "none";
    getElement("btnStart").innerHTML = "3... 2... 1... LAUNCHING!";
    
    setTimeout(function(){
        if (!isGameActive) startGame();
    }, 2000);
}

function startGame() {
    getElement("score").innerHTML = "0";
    getElement("btnStart").style.display = "none";
    snakeBodySegments = [];
    resetGameElements();
    growSnake();
    document.onkeydown = handleKeyInput;
    gameInterval = setInterval(function(){ advanceFrame(); }, 150);
    isGameActive = true;
}

function advanceFrame() {
    inputLocked = true;
    renderCell(snakeHead.x, snakeHead.y);

    var dirChangeFlag = false;
    var dirChangeData;

    if (snakeHead.dir != movementDirection) {
        dirChangeData = {x:snakeHead.x, y:snakeHead.y, dir: movementDirection};
        dirChangeFlag = true;
        snakeHead.dir = movementDirection;
    }

    switch(movementDirection) {
        case "up": snakeHead.y--; break;
        case "down": snakeHead.y++; break;
        case "left": snakeHead.x--; break;
        case "right": snakeHead.x++; break;
    }

    if (snakeHead.x < 0 || snakeHead.y < 0 || snakeHead.x >= GRID_SIZE || snakeHead.y >= GRID_SIZE || checkBodyCollision(snakeHead.x, snakeHead.y)) {
        gameOver();
    }
    else {
        renderCell(snakeHead.x, snakeHead.y, 'snake-head'); 
        moveBodySegments();
        checkFoodConsumption();
    }

    if (dirChangeFlag) updateTurnData(dirChangeData);
    inputLocked=false;
}

function gameOver() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    var finalScore = snakeBodySegments.length;
    getElement("score").innerHTML = finalScore;

    showGameOverScreen(); 
}

function moveBodySegments() {
    for (var i = 0; i < snakeBodySegments.length; i++) {
        renderCell(snakeBodySegments[i].x, snakeBodySegments[i].y);
        snakeBodySegments[i].dir = getNextDirection(snakeBodySegments[i]);

        switch(snakeBodySegments[i].dir) {
            case "up": snakeBodySegments[i].y--; break;
            case "down": snakeBodySegments[i].y++; break;
            case "left": snakeBodySegments[i].x--; break;
            case "right": snakeBodySegments[i].x++; break;
        }
        renderCell(snakeBodySegments[i].x, snakeBodySegments[i].y, 'snake-body');
    }
}

function checkBodyCollision(x, y) {
    for (var i = 0; i < snakeBodySegments.length; i++) {
        if (x == snakeBodySegments[i].x && y == snakeBodySegments[i].y) return true;
    }
    return false;
}

function getNextDirection(segmentParam) {
    for (var i = 0; i < segmentParam.turnData.length; i++) {
        if (segmentParam.x == segmentParam.turnData[i].x && segmentParam.y == segmentParam.turnData[i].y) {
            var newDirection = segmentParam.turnData[i].dir;
            segmentParam.turnData.splice(i, 1);
            return newDirection;
        }
    }
    return segmentParam.dir;
}

function updateTurnData(turnParam) {
    for (var i = 0; i < snakeBodySegments.length; i++) {
        if (!snakeBodySegments[i].turnData) {
            snakeBodySegments[i].turnData = [];
        }
        snakeBodySegments[i].turnData.push(turnParam);
    }
}

function handleKeyInput(e) {
    if (isGameActive) e.preventDefault();
    if (inputLocked) return;
    e = e || window.event;
    
    if ((e.keyCode == '38' || e.keyCode == '87') && movementDirection != "down") movementDirection="up";
    else if ((e.keyCode == '40' || e.keyCode == '83') && movementDirection != "up") movementDirection="down";
    else if ((e.keyCode == '37' || e.keyCode == '65') && movementDirection != "right") movementDirection="left";
    else if ((e.keyCode == '39' || e.keyCode == '68') && movementDirection != "left") movementDirection="right";
}

function checkFoodConsumption() {
    if (snakeHead.x == foodTarget.x && snakeHead.y == foodTarget.y) {
        currentScore++;
        addSegmentToBody();
        growSnake();
        getElement('score').innerHTML = currentScore;
    }
}

function addSegmentToBody() {
    var newSegment;
    var turnDataCopy = [];

    if (snakeBodySegments.length == 0) {
        switch(movementDirection) {
            case "up": newSegment = {x: snakeHead.x, y: snakeHead.y+1, dir: movementDirection, turnData: turnDataCopy}; break;
            case "down": newSegment = {x: snakeHead.x, y: snakeHead.y-1, dir: movementDirection, turnData: turnDataCopy}; break;
            case "left": newSegment = {x: snakeHead.x+1, y: snakeHead.y, dir: movementDirection, turnData: turnDataCopy}; break;
            case "right": newSegment = {x: snakeHead.x-1, y: snakeHead.y, dir: movementDirection, turnData: turnDataCopy}; break;
        }
    }
    else {
        var last = snakeBodySegments[snakeBodySegments.length-1];
        switch(last.dir) {
            case "up": newSegment = {x:last.x, y:last.y+1, dir:last.dir, turnData: copyArray(last.turnData)}; break;
            case "down": newSegment = {x:last.x, y:last.y-1, dir:last.dir, turnData: copyArray(last.turnData)}; break;
            case "left": newSegment = {x:last.x+1, y:last.y, dir:last.dir, turnData: copyArray(last.turnData)}; break;
            case "right": newSegment = {x:last.x-1, y:last.y, dir:last.dir, turnData: copyArray(last.turnData)}; break;
        }
    }
    snakeBodySegments.push(newSegment);
    renderCell(newSegment.x, newSegment.y, 'snake-body');
}

function resetGameElements() {
    drawPlayfield();
    spawnSnakeHead();
}

function growSnake() {
    var x2, y2, done = false;
    while (!done) {
        x2 = Math.floor(Math.random()*GRID_SIZE);
        y2 = Math.floor(Math.random()*GRID_SIZE);
        if (!checkBodyCollision(x2,y2) && (snakeHead.x != x2 || snakeHead.y != y2)) done=true;
    }
    foodTarget = {x:x2, y:y2};
    renderCell(x2, y2, 'food-target');
}

function resetSimulation() {
    currentScore=0;
    movementDirection = "up";
    initiateLaunch();
}

function copyArray(arr) {
    if (arr) return arr.slice();
    return [];
}

/* =======================================================
   SERVER-SIDE LEADERBOARD LOGIC (using API)
   ======================================================= */

// [CREATE] Kirim skor ke API (api.php?action=save)
function saveScore() {
    let playerName = getElement("playerName").value.trim();
    let finalScore = snakeBodySegments.length;

    if (!playerName) {
        alert("Pilot name required for database entry!");
        return;
    }

    // Kirim data menggunakan fetch API
    fetch(`${API_URL}?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score: finalScore })
    })
    .then(response => {
        // Cek status HTTP 
        if (!response.ok) {
            // Jika ada error HTTP (misalnya 500 dari config.php)
            return response.text().then(text => { throw new Error(`HTTP Error ${response.status}: ${text}`); });
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            // Setelah skor disimpan, langsung tampilkan leaderboard yang diperbarui
            renderLeaderboard();
        } else {
            console.error("Save failed:", data.message);
            alert("Failed to upload score. Server error: " + data.message);
            renderLeaderboard();
        }
    })
    .catch(error => {
        console.error('Network/Fetch Error:', error);
        alert("Network error: Cannot connect to server API. Check console for details.");
        renderLeaderboard(); 
    });
    
    // UI Update: Sembunyikan input setelah klik
    getElement("inputForm").style.display = "none";
    getElement("leaderboardDisplay").style.display = "block";
}

// [READ] Ambil data dari API (api.php?action=load)
function renderLeaderboard() {
    fetch(`${API_URL}?action=load`)
    .then(response => {
        if (!response.ok) {
             return response.text().then(text => { throw new Error(`HTTP Error ${response.status}: ${text}`); });
        }
        return response.json();
    })
    .then(data => {
        let leaderboard = data.data || [];
        let tbody = getElement("leaderboardBody");
        tbody.innerHTML = "";

        leaderboard.forEach((entry, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    })
    .catch(error => {
        console.error('Error fetching leaderboard:', error);
        let tbody = getElement("leaderboardBody");
        tbody.innerHTML = `<tr><td colspan="3">Failed to load scores from server. Check console.</td></tr>`;
    });
}

// Fungsi tampilan saat mati
function showGameOverScreen() {
    getElement("leaderboardSection").style.display = "block";
    getElement("inputForm").style.display = "block";
    getElement("leaderboardDisplay").style.display = "none";
    getElement("playerName").value = "";
    getElement("playerName").focus();
}

// Saat halaman dimuat, panggil fungsi untuk menampilkan leaderboard yang sudah ada (menggunakan API)
window.addEventListener('load', () => {
    resetGameElements();
    renderLeaderboard();
});
