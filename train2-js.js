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
  maxHp: 100,

  atk: 15,

  gold: 0,

  exp: 0,

  level: 1,

  needExp: 20
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


  addBattleLog(
    "⚔️ 遭遇 " + currentMonster.name + "！"
  );


  showMessage(
    "⚔️ 遭遇 " + currentMonster.name + "！"
  );


  updateBattleUI();


}



// ======================
// 🎮 攻擊
// ======================

function attack() {


  if (currentMonster == null) {

    return;

  }


  currentMonster.hp -= player.atk;



  addBattleLog(
    "😀 勇者造成 "
    + player.atk +
    " 點傷害！"
  );



  updateBattleUI();



  if (currentMonster.hp <= 0) {

    endBattle();

    return;

  }



  monsterAttack();


}

//怪物攻擊
function monsterAttack() {


  if (gameState != "battle") {

    return;

  }


  player.hp -= currentMonster.atk;



  addBattleLog(
    "👾 "
    + currentMonster.name +
    "造成 "
    + currentMonster.atk +
    " 點傷害"
  );



  updateBattleUI();



  if (player.hp <= 0) {

    gameOver();

  }

}

//底下的戰鬥資訊
function addBattleLog(text) {
  const battleLog = document.getElementById("battleLog");
  battleLog.innerHTML += text + "<br>";
}

//替代alert跳出式窗
function showMessage(text) {


  let box =
    document.getElementById("messageBox");


  box.style.display = "block";


  box.innerText = "";


  let index = 0;


  let timer = setInterval(() => {


    box.innerText += text[index];


    index++;


    if (index >= text.length) {

      clearInterval(timer);


      setTimeout(() => {


        box.style.display = "none";


      }, 2000);

    }


  }, 100);


}

//戰鬥結束
function endBattle() {


  addBattleLog(
    "🎉 打倒了 "
    + currentMonster.name + "！"
  );


  showMessage(
    "🎉 勝利！獲得 EXP " + currentMonster.exp
  );



  // 清除地圖怪物

  mapData[player.y][player.x] = 0;



  player.exp += currentMonster.exp;

  player.gold += 20;



  checkLevelUp();


  updatePlayerUI();



  currentMonster = null;


  gameState = "map";



  drawMap();


}

// ======================
// 🎮 更新戰鬥資訊
// ======================

function updateBattleUI() {

  if (currentMonster == null) {



    document.getElementById("monsterName").innerText =
      currentMonster.name;

    document.getElementById("monsterHp").innerText =
      "HP：" + currentMonster.hp + " / 30";

    document.getElementById("playerHP").innerText =
      "HP：" + player.hp + " / " + player.maxHp;

    // 怪物血條
    let monsterPercent =
      (currentMonster.hp / 30) * 100;

    let monsterBar =
      document.getElementById("monsterHPBar");

    monsterBar.style.width =
      monsterPercent + "%";



    // 玩家血條
    let playerPercent =
      (player.hp / player.maxHp) * 100;


    document.getElementById("playerHPBar").style.width =
      playerPercent + "%";


    if (monsterPercent < 30) {

      monsterBar.style.background = "red";

    }

    else if (monsterPercent < 60) {

      monsterBar.style.background = "orange";

    }

    else {

      monsterBar.style.background = "green";

    }

  }

  function updatePlayerUI() {

    document.getElementById("level").innerText =
      player.level;

    document.getElementById("exp").innerText =
      player.exp;

    document.getElementById("needExp").innerText =
      player.needExp;

    document.getElementById("gold").innerText =
      player.gold;

    return;
  }
}


//升級
function checkLevelUp() {

  if (player.exp >= player.needExp) {


    player.level++;

    player.exp = 0;


    player.maxHp += 20;

    player.hp = player.maxHp;


    player.atk += 5;


    player.needExp += 20;


    showMessage(
      "🎉 升級成功！\n" +
      "目前 Lv." + player.level
    );


  }

}

//遊戲結束
function gameOver() {


  document.getElementById("gameOver")
    .style.display = "flex";


  gameState = "over";


}

//重來
function resetGame() {

  player.maxHp = 100;
  player.hp = player.maxHp;
  player.gold = 0;
  player.exp = 0;
  player.needExp = 20;
  player.level = 1;
  player.atk = 15;

  player.x = 1;
  player.y = 1;

  // 清除目前戰鬥
  currentMonster = null;

  // 回到探索模式
  gameState = "map";

  // 重新生成地圖
  generateMap();

  revealed[player.y][player.x] = true;

  // 更新畫面
  document.getElementById("gold").innerText = player.gold;
  document.getElementById("playerHP").innerText = "HP：100 / 100";

  document.getElementById("map").style.display = "grid";
  document.getElementById("gameOver").style.display = "none";

  drawMap();
  updatePlayerUI();
}


// ======================
// 🚀 初始化
// ======================
generateMap();
revealed[player.y][player.x] = true;
drawMap();
showMessage("🎮 勇者開始冒險！");

