// ======================
// 🎮 Hero's Quest
// 核心遊戲程式
// ======================

// 地圖種類
// 0 空地
// 1 牆
// 2 金幣
// 3 怪物
// 4 出口
// 5 寶箱
// 6 商人

// ======================
// 🐉 怪物資料
// ======================

let monsters = [

  {
    name: "史萊姆",
    hp: 30,
    maxHp: 30,
    atk: 5,
    exp: 10,
    gold: 10,
    minFloor: 1,
    maxFloor: 3
  },


  {
    name: "哥布林",
    hp: 50,
    maxHp: 50,
    atk: 8,
    exp: 20,
    gold: 25,
    minFloor: 4,
    maxFloor: 6
  },


  {
    name: "骷髏兵",
    hp: 80,
    maxHp: 80,
    atk: 12,
    exp: 35,
    gold: 50,
    minFloor: 7,
    maxFloor: 9
  }

];


// ======================
// 🗺️ 迷宮樓層
// ======================
let exitUnlocked = false;

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

  potion: 0,

  maxPotion: 10,
  //防禦狀態
  isDefending: false
};

// ======================
// 🧙 新增商人變數
// ======================

let merchant = null;

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

  let availableMonsters =
    monsters.filter(monster =>

      currentFloor >= monster.minFloor
      &&
      currentFloor <= monster.maxFloor

    );


  let random =
    Math.floor(
      Math.random() * availableMonsters.length
    );


  let monster =
    availableMonsters[random];


  return {

    name: monster.name,

    hp: monster.hp,

    maxHp: monster.maxHp,

    atk: monster.atk,

    exp: monster.exp,

    gold: monster.gold

  };

}

// ======================
// 🎲 生成地圖
// ======================

function generateMap() {

  mapData = [];

  revealed = [];

  exitUnlocked = false;

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

          // 寶箱
          else if (random < 0.11) {

            row.push(5);

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

  createExit();
}

// ======================
// 🧙 生成流浪商人
// ======================

function createMerchant() {


  merchant = null;


  // 70%機率沒有商人

  if (Math.random() < 0.7) {

    return;

  }



  let x;
  let y;



  do {


    x =
      Math.floor(Math.random() * size);


    y =
      Math.floor(Math.random() * size);



  }
  while (

    mapData[y][x] !== 0 ||

    (x === 1 && y === 1)

  );



  merchant = {

    x: x,

    y: y

  };


  mapData[y][x] = 6;


}

// ======================
// 🚪 生成出口
// ======================

function createExit() {

  while (true) {

    let x = Math.floor(Math.random() * (size - 2)) + 1;
    let y = Math.floor(Math.random() * (size - 2)) + 1;

    // 不生成在出生安全區
    if (x <= 2 && y <= 2) {
      continue;
    }

    // 必須是空地
    if (mapData[y][x] !== 0) {
      continue;
    }

    mapData[y][x] = 4;
    break;

  }

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

            if (exitUnlocked) {

              cell.classList.add("exit");
              cell.innerText = "🚪";

            }

            break;

          case 5:

            cell.classList.add("chest");

            cell.innerText = "📦";

            break;

          case 6:

            cell.classList.add("merchant");

            cell.innerText = "🧙";

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

  // ======================
  // 檢查是否探索完成
  // ======================

  if (
    !exitUnlocked &&
    checkExploreComplete()
  ) {

    exitUnlocked = true;

    showMessage(
      "✨ 出口已開啟！"
    );

  }



  // 撿金幣

  collectCoin();

  // 開啟寶箱

  if (
    mapData[player.y][player.x] === 5
  ) {

    openChest();


    // 寶箱消失

    mapData[player.y][player.x] = 0;

  }

  //遇到商人

  if (
    mapData[player.y][player.x] === 6
    && gameState === "map"
  ) {

    openShop();

  }

  // 遇到怪物

  if (mapData[player.y][player.x] === 3) {

    showBattle();

    return;

  }

  // 進入下一關

  if (
    mapData[player.y][player.x] === 4 &&
    exitUnlocked
  ) {

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
// 📦 開啟寶箱
// ======================

function openChest() {


  let reward =
    Math.random();



  if (reward < 0.5) {


    player.gold += 50;


    showMessage(
      "📦 打開寶箱！\n獲得 50 金幣"
    );
  }
  else {

    if (player.potion < player.maxPotion) {

      player.potion++;

      showMessage(
        "📦 獲得治療藥水");

    }

    else {

      showMessage(
        "📦 找到藥水，但背包已滿");

    }

  }



  updatePlayerUI();


}

// ======================
// 🗺️ 商店功能
// ======================

function openShop() {

  gameState = "shop";

  document
    .getElementById("shop")
    .style.display = "block";

}



function closeShop() {

  gameState = "map";

  document
    .getElementById("shop")
    .style.display = "none";

}
//購買
function buyPotion() {


  if (player.gold < 50) {

    showMessage(
      "❌ Gold不足"
    );

    return;

  }



  if (player.potion >= player.maxPotion) {

    showMessage(
      "🧪 藥水已滿"
    );

    return;

  }



  player.gold -= 50;

  player.potion++;


  updatePlayerUI();


  showMessage(
    "🧪 購買治療藥水"
  );


}

// ======================
// 🗺️ 檢查探索率
// ======================

function checkExploreComplete() {

  for (let y = 1; y < size - 1; y++) {

    for (let x = 1; x < size - 1; x++) {

      if (!revealed[y][x]) {

        return false;

      }

    }

  }

  return true;

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
    damage
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
// 🧪 新增咕嚕咕嚕
// ======================

function usePotion() {


  // 只能戰鬥使用
  if (gameState !== "battle") {

    showMessage(
      "⚔️ 戰鬥中才能使用藥水！"
    );

    return;

  }



  if (player.potion <= 0) {

    showMessage(
      "❌ 沒有藥水！"
    );

    return;

  }



  if (player.hp >= player.maxHp) {

    showMessage(
      "❤️ HP 已滿！"
    );

    return;

  }



  let heal = 50;


  player.hp += heal;


  if (player.hp > player.maxHp) {

    player.hp = player.maxHp;

  }


  player.potion--;


  showMessage(
    "🧪 使用藥水，恢復50 HP"
  );


  updatePlayerUI();

  updateBattleUI();

  setTimeout(() => {

    monsterAttack();

  }, 1000);

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

  //藥水
  document.getElementById("potion").innerText =
    player.potion;
  //最大上限藥水
  document.getElementById("maxPotion").innerText =
    player.maxPotion;
}








// ======================
// 🎉 戰鬥結束
// ======================


function endBattle() {



  addBattleLog(

    "🎉 打倒 " + currentMonster.name + "！"

  );



  showMessage(

    "🎉 勝利！\n獲得 EXP " + currentMonster.exp +
            "\n獲得 Gold" + currentMonster.gold
  );




  // 清除地圖怪物

  mapData[player.y][player.x] = 0;




  // 獲得經驗

  player.exp += currentMonster.exp;

  player.gold += currentMonster.gold;

  checkLevelUp();

  // 10%掉藥水

  if (

    Math.random() < 0.1 &&

    player.potion < player.maxPotion

  ) {

    player.potion++;

    addBattleLog(
      "🧪 怪物掉落治療藥水！"
    );

  }

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


  player.potion = 0;


  player.isDefending = false;


  currentMonster = null;



  gameState = "map";



  generateMap();

  createMerchant();

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

  createMerchant();

  revealed[player.y][player.x] = true;


  drawMap();


}