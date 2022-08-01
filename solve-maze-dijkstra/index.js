class Chara {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.moveDirInfoList = [];
  }

  move(x, y) {
    this.x = x;
    this.y = y;
  }

  trace() {
    isTrace = true;
    return new Promise(async (resolve) => {
      // https://createjs.com/getting-started/tweenjs
      // https://zenn.dev/wintyo/articles/2973f15a265581
      // TODO Tweenでアニメーション
      const charaDom = document.querySelector('.chara');
      for (let index = 0; index < this.moveDirInfoList.length; index++) {
        charaDom.classList.remove('front');
        charaDom.classList.remove('left');
        charaDom.classList.remove('right');
        charaDom.classList.remove('back');
        const moveDirInfo = this.moveDirInfoList[index];
        const {direction, x, y} = {...moveDirInfo};
        switch (direction) {
          case CHARA_DIR_FRONT:
            charaDom.classList.add('front');
            charaDom.classList.add('animate1');
            break;

          case CHARA_DIR_LEFT:
            charaDom.classList.add('left');
            charaDom.classList.add('animate1');
            break;

          case CHARA_DIR_RIGHT:
            charaDom.classList.add('right');
            charaDom.classList.add('animate1');
            break;

          case CHARA_DIR_BACK:
            charaDom.classList.add('back');
            charaDom.classList.add('animate1');
            break;

          default:
            break;
        }
        await wait(0.1);
        charaDom.style.top = `${parameter.tileSize * y}px`;
        charaDom.style.left = `${parameter.tileSize * x}px`;
      }
      resolve();
    });
  }

  setMoveDirInfoList(routeInfoList) {
    this.moveDirInfoList = [];
    let prevRouteInfo = null;
    for (let index = 0; index < routeInfoList.length; index++) {
      const routeInfo = routeInfoList[index];

      if (!prevRouteInfo) {
        this.moveDirInfoList.push(
          Object.assign({direction: CHARA_DIR_FRONT}, routeInfo)
        );
      } else if (
        prevRouteInfo.x < routeInfo.x &&
        prevRouteInfo.y === routeInfo.y
      ) {
        this.moveDirInfoList.push(
          Object.assign({direction: CHARA_DIR_RIGHT}, routeInfo)
        );
      } else if (
        prevRouteInfo.x > routeInfo.x &&
        prevRouteInfo.y === routeInfo.y
      ) {
        this.moveDirInfoList.push(
          Object.assign({direction: CHARA_DIR_LEFT}, routeInfo)
        );
      } else if (
        prevRouteInfo.x === routeInfo.x &&
        prevRouteInfo.y < routeInfo.y
      ) {
        this.moveDirInfoList.push(
          Object.assign({direction: CHARA_DIR_FRONT}, routeInfo)
        );
      } else if (
        prevRouteInfo.x === routeInfo.x &&
        prevRouteInfo.y > routeInfo.y
      ) {
        this.moveDirInfoList.push(
          Object.assign({direction: CHARA_DIR_BACK}, routeInfo)
        );
      }

      prevRouteInfo = routeInfo;
    }

    return this.moveDirInfoList;
  }
}

function wait(waitTimeSeconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000 * waitTimeSeconds);
  });
}

class Maze {
  constructor(mazeSize, mazeDom) {
    this.mazeSize = mazeSize % 2 === 0 ? mazeSize + 1 : mazeSize;
    this.mazeDomList = [];
    this.mazeBox = [];
    this.startPos = {};
    this.goalPos = {};
    this.mazeDom = mazeDom;
    this.DEFAULT_MAZE_CREATE_STICK = {algorithm: 1};
    this.MAZE_CREATE_STICK = {algorithm: 1};
  }

  create(options) {
    options = options || this.DEFAULT_MAZE_CREATE_STICK;
    if (options.algorithm === this.MAZE_CREATE_STICK.algorithm) {
      this.createByStick();
    }
    this.show();
    return {
      mazeDomList: this.mazeDomList,
      mazeBox: this.mazeBox,
      startPos: this.startPos,
      goalPos: this.goalPos,
    };
  }

  update(newStartPos, newGoalPos) {
    reset();
    tearDownHandleNextGoalPos();
    this.mazeDomList = new Array(this.mazeSize);
    const rowCount = this.mazeBox.length;
    for (let row = 0; row < rowCount; row++) {
      this.mazeDomList[row] = new Array(this.mazeSize);
      const colCount = this.mazeBox[row].length;
      for (let col = 0; col < colCount; col++) {
        if (row === newStartPos.y && col === newStartPos.x) {
          // スタート
          this.mazeBox[row][col] = 1;
          this.startPos = {x: col, y: row};

          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('s');

          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        } else if (row === newGoalPos.y && col === newGoalPos.x) {
          // ゴール
          this.mazeBox[row][col] = 1;
          this.goalPos = {x: col, y: row};
          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('e');
          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        } else if (this.mazeBox[row][col] === 0) {
          // 壁
          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('w');
          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        } else {
          // 通路
          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('p');
          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        }
      }
    }
    setUpHandleNextGoalPos();
    return {
      mazeDomList: this.mazeDomList,
      mazeBox: this.mazeBox,
      startPos: this.startPos,
      goalPos: this.goalPos,
    };
  }

  show() {
    tearDownHandleNextGoalPos();
    this.mazeDomList = new Array(this.mazeSize);
    const rowCount = this.mazeBox.length;
    for (let row = 0; row < rowCount; row++) {
      this.mazeDomList[row] = new Array(this.mazeSize);
      const colCount = this.mazeBox[row].length;
      for (let col = 0; col < colCount; col++) {
        if (row === 4 && col === 3) {
          // スタート
          this.mazeBox[row][col] = 1;
          this.startPos = {x: col, y: row};
          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('s');
          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        } else if (row === this.mazeSize - 5 && col === this.mazeSize - 2) {
          // ゴール
          this.mazeBox[row][col] = 1;
          this.goalPos = {x: col, y: row};
          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('e');
          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        } else if (this.mazeBox[row][col] === 0) {
          // 壁
          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('w');
          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        } else {
          // 通路
          const divDom = document.createElement('div');
          divDom.setAttribute('data-row', row);
          divDom.setAttribute('data-col', col);
          divDom.style.width = `${parameter.tileSize}px`;
          divDom.style.height = `${parameter.tileSize}px`;
          divDom.classList.add('tile');
          divDom.classList.add('p');
          this.mazeDom.appendChild(divDom);
          this.mazeDomList[row][col] = divDom;
        }
      }
    }
    this.mazeDom.style.width = `${this.mazeSize * parameter.tileSize}px`;
    this.mazeDom.style.height = `${this.mazeSize * parameter.tileSize}px`;
    setUpHandleNextGoalPos();
  }

  createByStick() {
    // 初期化
    // まずは壁と通路を交互に作成する
    this.mazeBox = new Array(this.mazeSize);
    for (let i = 0; i < this.mazeBox.length; i++) {
      this.mazeBox[i] = new Array(this.mazeSize);
      for (let j = 0; j < this.mazeBox[i].length; j++) {
        if (i === 0 || i + 1 === this.mazeSize) {
          // 最初の列と最後の列も壁
          this.mazeBox[i][j] = 0;
        } else if (j === 0 || j + 1 === this.mazeSize) {
          // 奇数行は全部通路
          this.mazeBox[i][j] = 0;
        } else if (i % 2 === 1) {
          // 偶数行は壁と通路を交互に配置
          this.mazeBox[i][j] = 1;
        } else {
          // 壁と通路
          this.mazeBox[i][j] = j % 2;
        }
      }
    }

    // ここから壁倒しで迷路を作る
    for (let r = 0; r < this.mazeBox.length; r++) {
      // 最初と最後の行は対象外
      if (r === 0 || r + 1 === this.mazeBox.length) {
        continue;
      }
      // 壁がある行のみを対象
      if (r % 2 === 1) {
        continue;
      }
      // 行を取り出す
      let row = this.mazeBox[r];

      // 最初の行のみ、上下左右倒してOK（重なるのはNG）
      let direction = ['top', 'bottom', 'left', 'right'];
      if (r >= 4) {
        // 最初以外は、上には倒しちゃだめー
        direction = direction.slice(1);
      }

      for (let i = 0; i < row.length; i++) {
        // 端っこは対象外
        if (i === 0 || i + 1 === row.length) {
          continue;
        }
        if (i % 2 === 0) {
          direction = shuffle(direction);
          for (let j = 0; j < direction.length; j++) {
            if (direction[j] === 'top') {
              if (this.mazeBox[r - 1][i] === 1) {
                this.mazeBox[r - 1][i] = 0;
                break;
              }
            }
            if (direction[j] === 'left') {
              if (this.mazeBox[r][i - 1] === 1) {
                this.mazeBox[r][i - 1] = 0;
                break;
              }
            }
            if (direction[j] === 'right') {
              if (this.mazeBox[r][i + 1] === 1) {
                this.mazeBox[r][i + 1] = 0;
                break;
              }
            }
            if (direction[j] === 'bottom') {
              if (this.mazeBox[r + 1][i] === 1) {
                this.mazeBox[r + 1][i] = 0;
                break;
              }
            }
          }
        }
      }
    }
  }
}

function shuffle(t) {
  let last = t.length;
  let n;
  while (last > 0) {
    n = Math.floor(Math.random() * last);
    swap(t, n, --last);
  }
  return t;
}

function swap(t, i, j) {
  let q = t[i];
  t[i] = t[j];
  t[j] = q;
  return t;
}

function reset() {
  currentMazeDomList = [];
  currentMazeBox = [];
  const mazeDom = document.querySelector('.maze');
  const itemDomList = [...mazeDom.querySelectorAll('*')];
  for (let index = 0; index < itemDomList.length; index++) {
    const itemDom = itemDomList[index];
    itemDom.parentElement.removeChild(itemDom);
  }
}

function attachChara(startPos) {
  const mazeDom = document.querySelector('.maze');
  chara = new Chara(startPos.x, startPos.y);
  const divDom = document.createElement('div');
  divDom.classList.add('chara');
  divDom.style.top = `${chara.y * parameter.tileSize}px`;
  divDom.style.left = `${chara.x * parameter.tileSize}px`;
  mazeDom.appendChild(divDom);
}

function generate() {
  reset();
  const mazeDom = document.querySelector('.maze');
  maze = new Maze(parameter.mazeSize, mazeDom);
  const {mazeDomList, mazeBox, startPos, goalPos} = maze.create({
    algorithm: 1,
  });
  currentMazeDomList = mazeDomList;
  currentMazeBox = mazeBox;
  currentStartPos = startPos;
  currentGoalPos = goalPos;

  attachChara(startPos);
}

class Node {
  constructor(x, y, type) {
    this.score = Number.MAX_VALUE;
    this.prev = null;
    this.done = false;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

function scoreFromMap(map, startX, startY) {
  let copiedMap = new Array(map.length);
  let tmpInfoList = [];

  for (let i = 0; i < map.length; i++) {
    copiedMap[i] = new Array(map[i].length);
    for (let j = 0; j < map[i].length; j++) {
      copiedMap[i][j] = new Node(j, i, map[i][j]);
    }
  }

  const startNode = copiedMap[startY][startX];

  startNode.score = 0;
  tmpInfoList.push(startNode);

  while (tmpInfoList.length !== 0) {
    let node = null;
    let minIndex = -1;
    let minScore = Number.MAX_VALUE;
    for (let i = 0; i < tmpInfoList.length; i++) {
      let tmp = tmpInfoList[i];
      if (tmp.done) {
        continue;
      }
      if (tmp.score < minScore) {
        minScore = tmp.score;
        minIndex = i;
        node = tmp;
      }
    }

    if (node === null) {
      break;
    }

    tmpInfoList.splice(minIndex, 1);
    node.done = true;

    // up >>> right >>> down >>> left
    const dirX = [0, 1, 0, -1];
    const dirY = [1, 0, -1, 0];
    for (let i = 0; i < 4; i++) {
      const width = copiedMap[node.y].length;
      const height = copiedMap.length;
      if (
        node.y + dirY[i] < 0 ||
        node.y + dirY[i] >= height ||
        node.x + dirX[i] < 0 ||
        node.x + dirX[i] >= width
      ) {
        continue;
      }

      let willVisitMapInfo = copiedMap[node.y + dirY[i]][node.x + dirX[i]];

      if (willVisitMapInfo.done || willVisitMapInfo.type == NODE_TYPE_WALL) {
        continue;
      }

      if (node.score + 1 < willVisitMapInfo.score) {
        willVisitMapInfo.score = node.score + 1;
        willVisitMapInfo.prev = node;
        if (tmpInfoList.indexOf(willVisitMapInfo) === -1) {
          tmpInfoList.push(willVisitMapInfo);
        }
      }
    }
  }

  return copiedMap;
}

function niceSort(itemInfoList, keyName, isAsc = true) {
  itemInfoList.sort((a, b) => {
    if (isAsc) {
      if (a[keyName] > b[keyName]) {
        return 1;
      }
      if (b[keyName] > a[keyName]) {
        return -1;
      }
      if (b[keyName] === a[keyName]) {
        return 0;
      }
    } else {
      if (a[keyName] > b[keyName]) {
        return -1;
      }
      if (b[keyName] > a[keyName]) {
        return 1;
      }
      if (b[keyName] === a[keyName]) {
        return 0;
      }
    }
  });

  return itemInfoList;
}

function visualizeSolvedRoute(routeInfoList) {
  for (let index = 0; index < routeInfoList.length; index++) {
    const routeInfo = routeInfoList[index];
    const {x, y} = {...routeInfo};
    if (x === currentStartPos.x && y === currentStartPos.y) {
      continue;
    }
    if (x === currentGoalPos.x && y === currentGoalPos.y) {
      continue;
    }
    const pathDom = currentMazeDomList[y][x];
    pathDom.style.backgroundColor = `#f0b021`;
  }
}

function solveMaze() {
  if (currentMazeBox.length === 0) {
    return;
  }

  const map = scoreFromMap(
    currentMazeBox,
    currentStartPos.x,
    currentStartPos.y
  );

  const route = [];

  let goalNode = map[currentGoalPos.y][currentGoalPos.x];

  while (goalNode !== null) {
    goalNode.type = NODE_TYPE_ROUTE;
    route.push(goalNode);
    goalNode = goalNode.prev;
  }

  const routeInfoList = niceSort(route, 'score', true).map((item) => {
    return {x: item.x, y: item.y};
  });

  visualizeSolvedRoute(routeInfoList);

  chara.setMoveDirInfoList(routeInfoList);

  chara.trace().then(() => {
    isTrace = false;
    currentStartPos = {x: currentGoalPos.x, y: currentGoalPos.y};
  });
}

function tearDownHandleNextGoalPos() {
  const tileDomList = [...document.querySelectorAll('.tile')];
  for (let index = 0; index < tileDomList.length; index++) {
    const tileDom = tileDomList[index];
    tileDom.removeEventListener('click', handleNextGoalPos);
  }
}

function setUpHandleNextGoalPos() {
  const tileDomList = [...document.querySelectorAll('.tile')];
  for (let index = 0; index < tileDomList.length; index++) {
    const tileDom = tileDomList[index];
    tileDom.addEventListener('click', handleNextGoalPos);
  }
}

function handleNextGoalPos(event) {
  const tileDom = event.target;
  const row = Number(tileDom.getAttribute('data-row'));
  const col = Number(tileDom.getAttribute('data-col'));

  if (currentMazeBox[row][col] === 0) {
    return;
  }

  if (isTrace) {
    return;
  }

  currentMazeBox[row][col] = 1;
  currentGoalPos = {x: col, y: row};
  const {mazeDomList, mazeBox, startPos, goalPos} = maze.update(
    currentStartPos,
    currentGoalPos
  );

  currentMazeDomList = mazeDomList;
  currentMazeBox = mazeBox;
  currentStartPos = startPos;
  currentGoalPos = goalPos;

  attachChara(currentStartPos);
}

const NODE_TYPE_WALL = 0;
const NODE_TYPE_ROUTE = 2;

const CHARA_DIR_FRONT = 0;
const CHARA_DIR_LEFT = 1;
const CHARA_DIR_RIGHT = 2;
const CHARA_DIR_BACK = 3;

let isTrace;
let maze;
let chara;
let currentMazeDomList = [];
let currentMazeBox = [];
let currentStartPos = {};
let currentGoalPos = {};
let stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

let parameter = {
  mazeSize: 10,
  tileSize: 32,
};

let controllerInfo = {
  'Maze Size': 10,
  'Tile Size': 32,
  'Generate Maze': () => {
    generate();
  },
  'Solve Maze': () => {
    solveMaze();
  },
};

const gui = new dat.GUI();
gui.width = 300;
gui.add(controllerInfo, 'Maze Size', 10, 40, 1).onChange((event) => {
  detectChangeParameter(event, 'Maze Size');
});
gui.add(controllerInfo, 'Tile Size', 32, 50, 1).onChange((event) => {
  detectChangeParameter(event, 'Tile Size');
});
gui.add(controllerInfo, 'Generate Maze');
gui.add(controllerInfo, 'Solve Maze');

function detectChangeParameter(event, keyName) {
  if (keyName === 'Maze Size') {
    parameter.mazeSize = event;
  }
  if (keyName === 'Tile Size') {
    parameter.tileSize = event;
  }
  generate();
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

loop();
