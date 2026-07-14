// ======================
// 🎮 Hero's Quest
// 核心遊戲程式
// ======================


// ======================
// 🐉 怪物資料
// ======================

let monsters = [

  {
    name: "史萊姆",
    hp: 30,
    maxHp: 30,
    atk: 5,
    exp: 10
  },


  {
    name: "哥布林",
    hp: 50,
    maxHp: 50,
    atk: 8,
    exp: 20
  },


  {
    name: "骷髏兵",
    hp: 80,
    maxHp: 80,
    atk: 12,
    exp: 35
  }

];


// ======================
// 🗺️ 迷宮樓層
// ======================

const size = 10;

let currentFloor = 1;

let maxFloor = 10;

let mapData = [];

let revealed = [];


// ======================
// 😀 玩家資料
// ======================

let player = {

  x: 1,
  y: 1,

  hp: 100,
  maxHp: 100,

  atk: 15,

  gold: 0,

  exp: 0,

  level: 1,

  needExp: 20,

  //防禦狀態
  isDefending: false
};


// ======================
// ⚔️ 遊戲狀態
// ======================

let gameState = "map";


// 目前戰鬥怪物
let currentMonster = null;

// ======================
// 👾 新增隨機怪物
// ======================

function createMonster() {


  let random =
    Math.floor(
      Math.random() * monsters.length
    );


  let monster = monsters[random];


  return {

    name: monster.name,

    hp: monster.hp,

    maxHp: monster.maxHp,

    atk: monster.atk,

    exp: monster.exp

  };


}

// ======================
// 🎲 生成地圖
// ======================

function generateMap() {

  mapData = [];

  revealed = [];

  const safeZone = [
    { x: 1, y: 1 },

    { x: 2, y: 1 },

    { x: 1, y: 2 },

    { x: 2, y: 2 }
  ];



  for (let y = 0; y < size; y++) {

    let row = [];
    let fogRow = [];


    for (let x = 0; x < size; x++) {


      // 外牆

      if (
        x === 0 ||
        y === 0 ||
        x === size - 1 ||
        y === size - 1
      ) {

        row.push(1);

      }

      else {

        let isSafe = safeZone.some(pos =>
          pos.x === x && pos.y === y
        );

        if (isSafe) {

          row.push(0);

        }
        else {

          let random = Math.random();


          // 金幣

          if (random < 0.08) {

            row.push(2);

          }


          // 怪物

          else if (random < 0.15 + currentFloor * 0.02) {

            row.push(3);

          }


          // 空地

          else {

            row.push(0);

          }
          
        }
        
      }

      
      fogRow.push(false);
      
    }


    mapData.push(row);

    revealed.push(fogRow);

  }
  mapData[size-2][size-2] = 4;
}





// ======================
// 🗺️ 繪製地圖
// ======================

function drawMap() {


  const map =
    document.getElementById("map");


  if (!map) {
    return;
  }


  map.innerHTML = "";



  for (let y = 0; y < size; y++) {


    for (let x = 0; x < size; x++) {



      let cell =
        document.createElement("div");


      cell.classList.add("cell");

      if (
        (x === 1 && y === 1) ||
        (x === 2 && y === 1) ||
        (x === 1 && y === 2) ||
        (x === 2 && y === 2)
      ) {

        cell.classList.add("safe-zone");

      }


      // 未探索

      if (!revealed[y][x]) {


        cell.style.background = "#524949";


      }



      else {


        switch (mapData[y][x]) {


          case 1:

            cell.classList.add("wall");

            break;



          case 2:

            cell.classList.add("coin");

            cell.innerText = "💰";

            break;



          case 3:

            cell.classList.add("monster");

            cell.innerText = "👾";

            break;

          case 4:

            cell.classList.add("exit");

            cell.innerText = "🚪";

            break;

        }

      }



      // 玩家位置

      if (
        player.x === x &&
        player.y === y
      ) {

        cell.classList.add("player");

        cell.innerText = "😀";

      }



      map.appendChild(cell);


    }

  }

}






// ======================
// 🚀 遊戲初始化
// ======================


function initGame() {


  generateMap();


  revealed[player.y][player.x] = true;


  drawMap();


  updatePlayerUI();


  showMessage(
    "🎮 勇者開始冒險！"
  );

}



initGame();

// ======================
// 🎮 玩家移動
// ======================


document.addEventListener("keydown", function (e) {


  // 只有探索模式才能移動

  if (gameState !== "map") {
    return;
  }



  let nx = player.x;
  let ny = player.y;



  switch (e.key.toLowerCase()) {

    case "w":
    case "arrowup":
      ny--;
      break;

    case "s":
    case "arrowdown":
      ny++;
      break;

    case "a":
    case "arrowleft":
      nx--;
      break;

    case "d":
    case "arrowright":
      nx++;
      break;

    default:

      return;

  }




  // 邊界防呆

  if (
    nx < 0 ||
    ny < 0 ||
    nx >= size ||
    ny >= size
  ) {

    return;

  }



  // 撞牆不能走

  if (mapData[ny][nx] === 1) {

    return;

  }



  player.x = nx;

  player.y = ny;



  // 開啟迷霧

  revealed[player.y][player.x] = true;



  // 撿金幣

  collectCoin();



  // 遇到怪物

  if (mapData[player.y][player.x] === 3) {

    showBattle();

  }

  // 進入下一關

  if (mapData[player.y][player.x] === 4) {

    nextFloor();

    return;

  }


  drawMap();



});





// ======================
// 💰 撿金幣
// ======================


function collectCoin() {


  if (
    mapData[player.y][player.x] === 2
  ) {


    player.gold += 10;


    mapData[player.y][player.x] = 0;



    updatePlayerUI();



    showMessage(
      "💰 獲得 10 金幣！"
    );


  }

}







// ======================
// ⚔️ 開始戰鬥
// ======================


function showBattle() {


  gameState = "battle";

  currentMonster = createMonster();

  document
    .getElementById("battlePanel")
    .style.display = "block";



  document
    .getElementById("map")
    .style.display = "none";



  document
    .getElementById("battleLog")
    .innerHTML = "";



  addBattleLog(
    "⚔️ 遭遇 " + currentMonster.name + "！"
  );



  updateBattleUI();

}







// ======================
// ⚔️ 玩家攻擊
// ======================


function attack() {



  if (gameState !== "battle") {

    return;

  }



  if (currentMonster === null) {

    return;

  }



  currentMonster.hp -= player.atk;



  if (currentMonster.hp < 0) {

    currentMonster.hp = 0;

  }



  addBattleLog(

    "😀 勇者造成 "
    + player.atk +
    " 點傷害！"

  );



  updateBattleUI();




  // 怪物死亡

  if (currentMonster.hp <= 0) {


    endBattle();


    return;

  }




  // 怪物反擊

  monsterAttack();


}

// ======================
// 🛡 防禦功能
// ======================

function defend() {


  if (gameState !== "battle") {

    return;

  }


  if (currentMonster === null) {

    return;

  }



  player.isDefending = true;



  addBattleLog(
    "🛡 勇者進入防禦姿態！"
  );


  showMessage(
    "🛡 防禦成功，降低傷害！"
  );


  // 怪物攻擊

  monsterAttack();


}





// ======================
// 👾 怪物攻擊
// ======================


function monsterAttack() {



  if (
    gameState !== "battle" ||
    currentMonster === null
  ) {

    return;

  }




  let damage = currentMonster.atk;



  // 如果玩家防禦

  if (player.isDefending) {


    damage =
      Math.floor(
        damage * 0.5
      );


    addBattleLog(
      "🛡 防禦減少傷害！"
    );


  }


  // 扣血

  player.hp -= damage;


  if (player.hp < 0) {

    player.hp = 0;

  }

  // 防禦解除

  player.isDefending = false;


  addBattleLog(

    "👾 "
    + currentMonster.name
    +
    "造成 "
    +
    currentMonster.atk
    +
    " 點傷害"

  );



  updateBattleUI();




  if (player.hp <= 0) {


    gameOver();


  }



}

// ======================
// 🏃 逃跑功能
// ======================

function runAway() {


  // 不是戰鬥不能逃跑

  if (gameState !== "battle") {

    return;

  }


  if (currentMonster === null) {

    return;

  }



  // 逃跑成功率
  // 70%成功

  let chance = Math.random();



  if (chance < 0.7) {


    addBattleLog(
      "🏃 成功逃離戰鬥！"
    );


    showMessage(
      "🏃 逃跑成功！"
    );


    currentMonster = null;


    gameState = "map";



    document
      .getElementById("battlePanel")
      .style.display = "none";



    document
      .getElementById("map")
      .style.display = "grid";



    drawMap();



  }

  else {


    addBattleLog(
      "❌ 逃跑失敗！"
    );


    showMessage(
      "❌ 逃跑失敗！"
    );


    // 失敗後怪物攻擊

    monsterAttack();


  }


}

// ======================
// 🎮 更新戰鬥資訊
// ======================

function updateBattleUI() {


  if (currentMonster === null) {

    return;

  }



  let monsterName =
    document.getElementById("monsterName");


  let monsterHp =
    document.getElementById("monsterHp");



  if (monsterName) {

    monsterName.innerText =
      "👾 " + currentMonster.name;

  }



  if (monsterHp) {

    monsterHp.innerText =
      "HP："
      +
      currentMonster.hp
      +
      " / "
      +
      currentMonster.maxHp;

  }




  // 怪物血條

  let monsterPercent =
    currentMonster.hp /
    currentMonster.maxHp *
    100;



  let monsterBar =
    document.getElementById("monsterHPBar");



  if (monsterBar) {

    monsterBar.style.width =
      monsterPercent + "%";

  }




  // 玩家 HP

  let playerPercent =
    player.hp /
    player.maxHp *
    100;



  let playerBar =
    document.getElementById("playerHPBar");



  if (playerBar) {

    playerBar.style.width =
      playerPercent + "%";

  }



  let playerHp =
    document.getElementById("playerHP");



  if (playerHp) {

    playerHp.innerText =
      "HP："
      +
      player.hp
      +
      " / "
      +
      player.maxHp;

  }



}








// ======================
// 📊 更新玩家資訊
// ======================


function updatePlayerUI() {



  document.getElementById("level").innerText =
    player.level;



  document.getElementById("exp").innerText =
    player.exp;



  document.getElementById("needExp").innerText =
    player.needExp;



  document.getElementById("gold").innerText =
    player.gold;



  document.getElementById("playerHP").innerText =
    "HP："
    +
    player.hp
    +
    " / "
    +
    player.maxHp;




  // HP BAR

  document.getElementById("playerHPBar")
    .style.width =
    (
      player.hp /
      player.maxHp *
      100
    )
    +
    "%";

  // EXP 血條
  let expPercent = Math.min(
    100,
    (player.exp / player.needExp) * 100
  );

  document.getElementById("expBar").style.width =
    expPercent + "%";


}








// ======================
// 🎉 戰鬥結束
// ======================


function endBattle() {



  addBattleLog(

    "🎉 打倒 "
    +
    currentMonster.name
    +
    "！"

  );



  showMessage(

    "🎉 勝利！獲得 EXP "
    +
    currentMonster.exp

  );




  // 清除地圖怪物

  mapData[player.y][player.x] = 0;




  // 獲得經驗

  player.exp += currentMonster.exp;



  checkLevelUp();



  updatePlayerUI();




  currentMonster = null;



  gameState = "map";



  document
    .getElementById("battlePanel")
    .style.display = "block";



  document
    .getElementById("map")
    .style.display = "grid";



  document
    .getElementById("monsterName")
    .innerText = "沒有敵人";



  document
    .getElementById("monsterHp")
    .innerText = "HP：--";



  document
    .getElementById("monsterHPBar")
    .style.width = "0%";



  drawMap();


}








// ======================
// 📝 戰鬥紀錄
// ======================


function addBattleLog(text) {


  let log =
    document.getElementById("battleLog");



  if (log) {

    log.innerHTML +=
      text +
      "<br>";

  }


}








// ======================
// ⬆️ 升級
// ======================


function checkLevelUp() {

  if (player.exp < player.needExp) {
    updatePlayerUI();
    return;
  }

  // ① 先讓經驗條滿
  document.getElementById("expBar").style.width = "100%";

  // ② 停留一下
  setTimeout(() => {
    document.getElementById("expBar").style.width = "0%";

    // ② 停留一下
    setTimeout(() => {

      player.exp -= player.needExp;

      player.level++;

      player.needExp += 20;

      player.maxHp += 20;

      player.hp =

        player.maxHp;

      player.atk += 5;

      updatePlayerUI();

      showMessage(
        "🎉 升級成功！\n" + "目前 Lv." + player.level
      );

    }, 200);

  }, 500);

}






// ======================
// 💀 GAME OVER
// ======================


function gameOver() {



  gameState = "over";



  currentMonster = null;



  document
    .getElementById("gameOver")
    .style.display = "flex";


}









// ======================
// 🔄 重新開始
// ======================


function resetGame() {



  player.x = 1;

  player.y = 1;



  player.hp = 100;

  player.maxHp = 100;



  player.atk = 15;



  player.level = 1;



  player.exp = 0;



  player.needExp = 20;



  player.gold = 0;


  player.isDefending = false;


  currentMonster = null;



  gameState = "map";



  generateMap();



  revealed[player.y][player.x] = true;



  document
    .getElementById("gameOver")
    .style.display = "none";



  document
    .getElementById("map")
    .style.display = "grid";



  document
    .getElementById("battlePanel")
    .style.display = "block";



  updatePlayerUI();



  drawMap();

  // 清空怪物資訊
  document.getElementById("monsterName").innerText = "沒有敵人";
  document.getElementById("monsterHp").innerText = "HP：--";
  document.getElementById("monsterHPBar").style.width = "0%";

  showMessage("🎮 勇者開始冒險！");


}








// ======================
// 💬 訊息提示
// ======================


function showMessage(text) {



  let box =
    document.getElementById("messageBox");



  if (!box) {

    return;

  }



  box.style.display = "block";


  box.innerText = text;



  setTimeout(() => {


    box.style.display = "none";


  }, 2000);



}

function nextFloor() {


  if (currentFloor >= maxFloor) {

    showMessage(
      "🏆 恭喜通關！"
    );

    return;

  }



  currentFloor++;



  showMessage(
    "🚪 進入第 "
    +
    currentFloor
    +
    " 層！"
  );



  player.x = 1;
  player.y = 1;



  generateMap();



  revealed[player.y][player.x] = true;


  drawMap();


}