let slime = {
  name: "史萊姆",
  hp: 30,
  atk: 5,
  exp: 10
}
const size = 10;
let revealed = [];
let mapData = [];
let player = {
  x: 1,
  y: 1,
  hp: 100,
  atk: 15,
  gold: 0,
  exp: 0,
  level: 1
};

let currentMonster = null;

let gameState = "map";


// ======================
// 🎲 生成隨機地圖
// ======================
function generateMap() {

  mapData = [];
  revealed = [];

  for (let y = 0; y < size; y++) {

    let row = [];
    let rRow = [];

    for (let x = 0; x < size; x++) {

      // 外框是牆
      if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
        row.push(1);
      }

      else {
        let r = Math.random();

        if (r < 0.08) {
          row.push(2); // 金幣
        }
        else if (r < 0.13) {
          row.push(3); // 怪物
        }
        else {
          row.push(0); // 空地
        }

      }
      rRow.push(false);
    }

    mapData.push(row);
    revealed.push(rRow);
  }
}


// ======================
// 🎨 畫地圖
// ======================
function drawMap() {


  const map = document.getElementById("map");
  map.innerHTML = "";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (!revealed[y][x]) {
        cell.style.background = "#000";
        cell.innerText = "";
      }

      else {


        if (mapData[y][x] === 1) {
          cell.classList.add("wall");
        }

        if (mapData[y][x] === 2) {
          cell.classList.add("coin");
          cell.innerText = "💰";
        }

        if (mapData[y][x] === 3) {
          cell.classList.add("monster");
          cell.innerText = "👾";
        }
      }

      if (player.x === x && player.y === y) {
        cell.classList.add("player");
        cell.innerText = "😀";
      }



      map.appendChild(cell);
    }
  }
}


// ======================
// 🎮 移動控制
// ======================
document.addEventListener("keydown", (e) => {

  if (gameState !== "map") {
    return;
  }
  let nx = player.x;
  let ny = player.y;


  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--;
  if (e.key === "ArrowRight") nx++;

  // 撞牆不能走
  if (mapData[ny][nx] !== 1) {
    player.x = nx;
    player.y = ny;

    revealed[player.y][player.x] = true;
  }

  // 撿金幣
  if (mapData[player.y][player.x] === 2) {
    player.gold += 10;
    mapData[player.y][player.x] = 0;
    document.getElementById("gold").innerText = player.gold;
  }

  // 遇怪物
  if (mapData[player.y][player.x] === 3) {
    showBattle();
  }

  drawMap();
});

// ======================
// 🎮 顯示戰鬥
// ======================

function showBattle() {
  gameState = "battle";
  currentMonster = {
    name: slime.name,
    hp: slime.hp,
    atk: slime.atk,
    exp: slime.exp
  };

  document.getElementById("battle").style.display = "block";
  document.getElementById("map").style.display = "none";

  updateBattleUI();
}



// ======================
// 🎮 攻擊
// ======================

function attack() {

  currentMonster.hp -= player.atk;

  if (currentMonster.hp < 0) {
    currentMonster.hp = 0;
  }

  updateBattleUI();

  if (currentMonster.hp <= 0) {

    endBattle();

  }
}

function endBattle() {
  alert("🎉 打倒了" + currentMonster.name);

  document.getElementById("battle").style.display = "none";
  document.getElementById("map").style.display = "grid";

  mapData[player.y][player.x] = 0;
  console.log(mapData[player.y][player.x]);

  player.exp += currentMonster.exp;
  player.gold += 20;

  document.getElementById("gold").innerText = player.gold;

  currentMonster = null;

  gameState = "map";

  

  drawMap();
}

// ======================
// 🎮 更新戰鬥資訊
// ======================

function updateBattleUI() {

  document.getElementById("monsterName").innerText =
    currentMonster.name;

  document.getElementById("monsterHp").innerText =
    "HP：" + currentMonster.hp + " / 30";

  document.getElementById("playerHP").innerText =
    "HP：" + player.hp + " / 100";
}


// ======================
// 🚀 初始化
// ======================
generateMap();
drawMap();
revealed[player.y][player.x] = true;
