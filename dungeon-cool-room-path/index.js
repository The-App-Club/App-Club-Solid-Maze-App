class Leaf {
  constructor(x, y, height, width) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.room = null;
  }

  setRoomInfo(roomInfo) {
    this.room = roomInfo;
  }

  createPaths(leafInfo) {
    if (leafInfo) {
      const {leftChild, rightChild} = {...leafInfo};
      if (leftChild !== undefined && rightChild !== undefined) {
        createHall(leftChild.getRoom(leftChild), rightChild.getRoom(rightChild));
      }
    }
  }

  createRooms(leafInfo) {
    if (leafInfo) {
      const {leftChild, rightChild} = {...leafInfo};
      if (leftChild !== undefined || rightChild !== undefined) {
        if (leftChild !== undefined) {
          leftChild.createRooms(leftChild);
        }
        if (rightChild !== undefined) {
          rightChild.createRooms(rightChild);
        }
      } else {
        const roomSize = {x: randomRangeNumber(parameter.minRoomSize, leafInfo.width - 2), y: randomRangeNumber(parameter.minRoomSize, leafInfo.height - 2)};
        const roomPos = {x: randomRangeNumber(1, leafInfo.width - roomSize.x - 1), y: randomRangeNumber(1, leafInfo.height - roomSize.y - 1)};
        leafInfo.setRoomInfo({x: leafInfo.x + roomPos.x, y: leafInfo.y + roomPos.y, width: roomSize.x, height: roomSize.y});
      }
    }
  }

  getRoom(leafInfo) {
    if (leafInfo.room !== null) {
      return leafInfo.room;
    } else {
      let lRoom;
      let rRoom;
      if (leafInfo.leftChild !== null) {
        lRoom = leafInfo.leftChild.getRoom(leafInfo.leftChild);
      }
      if (leafInfo.rightChild !== null) {
        rRoom = leafInfo.rightChild.getRoom(leafInfo.rightChild);
      }
      if (lRoom === null && rRoom === null) {
        return null;
      } else if (rRoom === null) {
        return lRoom;
      } else if (lRoom === null) {
        return rRoom;
      } else if (Math.random() > 0.5) {
        return lRoom;
      } else {
        return rRoom;
      }
    }
  }
}

function randomRangeNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function createHall(leftRoomInfo, rightRoomInfo) {
  let point1 = {
    x: randomRangeNumber(leftRoomInfo.x + 1, leftRoomInfo.x + leftRoomInfo.width - 2),
    y: randomRangeNumber(leftRoomInfo.y + 1, leftRoomInfo.y + leftRoomInfo.height - 2),
  };
  let point2 = {
    x: randomRangeNumber(rightRoomInfo.x + 1, rightRoomInfo.x + rightRoomInfo.width - 2),
    y: randomRangeNumber(rightRoomInfo.y + 1, rightRoomInfo.y + rightRoomInfo.height - 2),
  };

  let w = point2.x - point1.x;
  let h = point2.y - point1.y;

  if (w < 0) {
    if (h < 0) {
      if (Math.random() < 0.5) {
        hallInfoList.push({x: point2.x, y: point1.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point2.x, y: point2.y, width: parameter.pathSize, height: Math.abs(h)});
      } else {
        hallInfoList.push({x: point2.x, y: point2.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point1.x, y: point2.y, width: parameter.pathSize, height: Math.abs(h)});
      }
    } else if (h > 0) {
      if (Math.random() < 0.5) {
        hallInfoList.push({x: point2.x, y: point1.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point2.x, y: point1.y, width: parameter.pathSize, height: Math.abs(h)});
      } else {
        hallInfoList.push({x: point2.x, y: point2.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point1.x, y: point1.y, width: parameter.pathSize, height: Math.abs(h)});
      }
    } // if (h == 0)
    else {
      hallInfoList.push({x: point2.x, y: point2.y, width: Math.abs(w), height: parameter.pathSize});
    }
  } else if (w > 0) {
    if (h < 0) {
      if (Math.random() < 0.5) {
        hallInfoList.push({x: point1.x, y: point2.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point1.x, y: point2.y, width: parameter.pathSize, height: Math.abs(h)});
      } else {
        hallInfoList.push({x: point1.x, y: point1.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point2.x, y: point2.y, width: parameter.pathSize, height: Math.abs(h)});
      }
    } else if (h > 0) {
      if (Math.random() < 0.5) {
        hallInfoList.push({x: point1.x, y: point1.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point2.x, y: point1.y, width: parameter.pathSize, height: Math.abs(h)});
      } else {
        hallInfoList.push({x: point1.x, y: point2.y, width: Math.abs(w), height: parameter.pathSize});
        hallInfoList.push({x: point1.x, y: point1.y, width: parameter.pathSize, height: Math.abs(h)});
      }
    } // if (h == 0)
    else {
      hallInfoList.push({x: point1.x, y: point1.y, width: Math.abs(w), height: parameter.pathSize});
    }
  } // if (w == 0)
  else {
    if (h < 0) {
      hallInfoList.push({x: point2.x, y: point2.y, width: parameter.pathSize, height: Math.abs(h)});
    } else if (h > 0) {
      hallInfoList.push({x: point1.x, y: point1.y, width: parameter.pathSize, height: Math.abs(h)});
    }
  }
}

function split(leftChild, rightChild, x, y, width, height) {
  if (leftChild || rightChild) {
    return {canSplit: false};
  }

  let isSplitHeight = Math.random() > 0.5;

  if (width > height && width / height >= 1.25) {
    isSplitHeight = false;
  }

  if (height > width && height / width >= 1.25) {
    isSplitHeight = true;
  }

  const max = (isSplitHeight ? height : width) - parameter.minLeafSize;

  if (max <= parameter.minLeafSize) {
    return {canSplit: false};
  }

  const niceSize = randomRangeNumber(parameter.minLeafSize, max);

  if (isSplitHeight) {
    leftChild = new Leaf(x, y, niceSize, width);
    rightChild = new Leaf(x, y + niceSize, height - niceSize, width);
  } else {
    leftChild = new Leaf(x, y, height, niceSize);
    rightChild = new Leaf(x + niceSize, y, height, width - niceSize);
  }

  return {canSplit: true, left: leftChild, right: rightChild};
}

function createSectionDom(x, y, width, height, selectorClassName) {
  const sectionDom = document.createElement('div');
  sectionDom.classList.add(selectorClassName);
  sectionDom.style.top = `${y}px`;
  sectionDom.style.left = `${x}px`;
  sectionDom.style.width = `${width}px`;
  sectionDom.style.height = `${height}px`;
  return sectionDom;
}

function appendTo(appendToDom, leafInfo, selectorClassName) {
  const {x, y, width, height} = {...leafInfo};
  const sectionDom = createSectionDom(x, y, width, height, selectorClassName);
  appendToDom.appendChild(sectionDom);
  return sectionDom;
}

function clear() {
  const workspaceDom = document.querySelector(`.workspace`);
  const sectionDomList = [...workspaceDom.querySelectorAll(`*`)];
  for (let index = 0; index < sectionDomList.length; index++) {
    const sectionDom = sectionDomList[index];
    sectionDom.parentElement.removeChild(sectionDom);
  }
}

function initialize() {
  clear();
  leafInfoList = [];
  hallInfoList = [];
  const root = new Leaf(parameter.x, parameter.y, parameter.height, parameter.width);
  leafInfoList.push(root);
}

function makePath() {
  for (let index = 0; index < leafInfoList.length; index++) {
    const leafInfo = leafInfoList[index];
    leafInfo.createPaths(leafInfo);
  }
}

function makeRoom() {
  for (let index = 0; index < leafInfoList.length; index++) {
    const leafInfo = leafInfoList[index];
    leafInfo.createRooms(leafInfo);
  }
}

function splitSection() {
  let willSplitTry = true;

  // https://gamedevelopment.tutsplus.com/tutorials/how-to-use-bsp-trees-to-generate-game-maps--gamedev-12268

  while (willSplitTry) {
    willSplitTry = false;
    for (let index = 0; index < leafInfoList.length; index++) {
      let leafInfo = leafInfoList[index];
      if (!leafInfo.leftChild && !leafInfo.rightChild) {
        if (leafInfo.width > parameter.maxLeafSize || leafInfo.height > parameter.maxLeafSize || Math.random() > 0.25) {
          const {canSplit, left, right} = {
            ...split(leafInfo.leftChild, leafInfo.rightChild, leafInfo.x, leafInfo.y, leafInfo.width, leafInfo.height),
          };
          if (canSplit) {
            Object.assign(leafInfo, {leftChild: left, rightChild: right});
            leafInfoList.push(leafInfo.leftChild);
            leafInfoList.push(leafInfo.rightChild);
            willSplitTry = true;
          }
        }
      }
    }
  }
}

function reflectPathDom() {
  const appendToDom = document.querySelector(`.workspace`);
  for (let index = 0; index < hallInfoList.length; index++) {
    const hallInfo = hallInfoList[index];
    if (hallInfo) {
      appendTo(appendToDom, hallInfo, 'path');
    }
  }
}

function reflectRoomDom() {
  const appendToDom = document.querySelector(`.workspace`);
  for (let index = 0; index < leafInfoList.length; index++) {
    const leafInfo = leafInfoList[index];
    const {room} = {...leafInfo};
    if (room) {
      appendTo(appendToDom, room, 'room');
    }
  }
}

function reflectSectionDom() {
  let appendToDom = document.querySelector(`.workspace`);
  for (let index = 0; index < leafInfoList.length; index++) {
    const leafInfo = leafInfoList[index];
    const {leftChild, rightChild} = {...leafInfo};
    if (leftChild && rightChild) {
      appendTo(appendToDom, leftChild, 'section');
      appendTo(appendToDom, rightChild, 'section');
    }
    appendToDom = document.querySelector(`.workspace`);
  }
}

let stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

let hallInfoList = [];
let leafInfoList = [];
let parameter = {
  x: 110,
  y: 110,
  width: 700,
  height: 700,
  leftChild: null,
  rightChild: null,
  minLeafSize: 150,
  maxLeafSize: 150,
  minRoomSize: 120,
  pathSize: 1,
};

let controllerInfo = {
  'Start OffsetX': 110,
  'Start OffsetY': 110,
  'Workspace Width': 700,
  'Workspace Height': 700,
  'Min Section Size': 150,
  'Max Section Size': 150,
  'Min Room Size': 120,
  'Path Size': 1,
  'Workspace Clear': initialize,
  'Workspace Split': niceRolling,
};

const gui = new dat.GUI();
gui.width = 300;
gui.add(controllerInfo, 'Start OffsetX', 1, 500, 1).onChange((event) => {
  detectChangeParameter(event, 'Start OffsetX');
});
gui.add(controllerInfo, 'Start OffsetY', 1, 500, 1).onChange((event) => {
  detectChangeParameter(event, 'Start OffsetY');
});
gui.add(controllerInfo, 'Workspace Width', 1, window.innerWidth, 1).onChange((event) => {
  detectChangeParameter(event, 'Workspace Width');
});
gui.add(controllerInfo, 'Workspace Height', 1, window.innerHeight, 1).onChange((event) => {
  detectChangeParameter(event, 'Workspace Height');
});
gui.add(controllerInfo, 'Min Section Size', 1, window.innerHeight, 1).onChange((event) => {
  detectChangeParameter(event, 'Min Section Size');
});
gui.add(controllerInfo, 'Max Section Size', 1, window.innerHeight, 1).onChange((event) => {
  detectChangeParameter(event, 'Max Section Size');
});
gui.add(controllerInfo, 'Min Room Size', 10, parameter.minLeafSize, 1).onChange((event) => {
  detectChangeParameter(event, 'Min Room Size');
});
gui.add(controllerInfo, 'Path Size', 1, 5, 1).onChange((event) => {
  detectChangeParameter(event, 'Path Size');
});
gui.add(controllerInfo, 'Workspace Clear');
gui.add(controllerInfo, 'Workspace Split');

function detectChangeParameter(event, keyName) {
  if (keyName === 'Start OffsetX') {
    parameter.x = event;
  }
  if (keyName === 'Start OffsetY') {
    parameter.y = event;
  }
  if (keyName === 'Workspace Width') {
    parameter.width = event;
  }
  if (keyName === 'Workspace Height') {
    parameter.height = event;
  }
  if (keyName === 'Min Section Size') {
    parameter.minLeafSize = event;
  }
  if (keyName === 'Max Section Size') {
    parameter.maxLeafSize = event;
  }
  if (keyName === 'Min Room Size') {
    parameter.minRoomSize = event;
  }
  if (keyName === 'Path Size') {
    parameter.pathSize = event;
  }
  niceRolling();
}

function niceRolling() {
  initialize();

  splitSection();

  makeRoom();

  makePath();

  reflectPathDom();

  reflectRoomDom();

  reflectSectionDom();
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

loop();
niceRolling();
