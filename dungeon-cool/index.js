class Leaf {
  constructor(x, y, height, width) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
  }
}

function randomRangeNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
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


function createSectionDom(x, y, width, height) {
  const sectionDom = document.createElement('div');
  sectionDom.classList.add('section');
  sectionDom.style.top = `${y}px`;
  sectionDom.style.left = `${x}px`;
  sectionDom.style.width = `${width}px`;
  sectionDom.style.height = `${height}px`;
  return sectionDom;
}

function appendTo(appendToDom, leafInfo) {
  const {x, y, width, height} = {...leafInfo};
  const sectionDom = createSectionDom(x, y, width, height);
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
  const root = new Leaf(parameter.x, parameter.y, parameter.height, parameter.width);
  leafInfoList.push(root);
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

function reflectDom() {
  let appendToDom = document.querySelector(`.workspace`);
  for (let index = 0; index < leafInfoList.length; index++) {
    const leafInfo = leafInfoList[index];
    const {leftChild, rightChild} = {...leafInfo};
    if (leftChild && rightChild) {
      appendToDom = appendTo(appendToDom, leafInfo);
      appendTo(appendToDom, leftChild);
      appendTo(appendToDom, rightChild);
    } else {
      appendTo(appendToDom, leafInfo);
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

let leafInfoList = [];
let parameter = {
  x: 110,
  y: 110,
  width: 700,
  height: 700,
  leftChild: null,
  rightChild: null,
  minLeafSize: 80,
  maxLeafSize: 100,
};

let controllerInfo = {
  'Start OffsetX': 110,
  'Start OffsetY': 110,
  'Workspace Width': 700,
  'Workspace Height': 700,
  'Min Section Size': 80,
  'Max Section Size': 100,
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
  niceRolling();
}

function niceRolling() {
  initialize();

  splitSection();

  reflectDom();
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

loop();
niceRolling();
