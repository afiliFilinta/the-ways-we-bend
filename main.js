import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sceneHost = document.querySelector('#scene');
const intro = document.querySelector('#intro');
const startButton = document.querySelector('#start');
const instruction = document.querySelector('#instruction');
const instructionIndex = document.querySelector('#instruction-index');
const instructionCopy = document.querySelector('#instruction-copy');
const instructionHint = document.querySelector('#instruction-hint');
const verdict = document.querySelector('#verdict');
const verdictCopy = document.querySelector('#verdict-copy');
const finale = document.querySelector('#finale');
const restartButton = document.querySelector('#restart');
const stepLabel = document.querySelector('#step');
const progressFill = document.querySelector('#progress-fill');
const modeLabel = document.querySelector('#mode');
const soundButton = document.querySelector('#sound');
const audio = document.querySelector('#audio');

const COPY = {
  soundOn: 'SOUND: ON',
  soundOff: 'SOUND: OFF',
  instructionFirst: 'Draw a line. Any line.',
  hintFirst: 'Hold, move, then let go',
  hintRelease: 'Let go when it feels finished',
  hintLonger: 'Give it a little more room',
  instructionSecond: 'Try another one.',
  hintSecond: 'No need to make it perfect',
  instructionThird: 'Now draw the line that feels like yours.',
  hintThird: 'Don’t overthink it',
  verdictOne: 'There. Neater.',
  verdictTwo: 'Just as expected.',
  modeReady: 'Waiting for you',
  modeWaiting: 'Waiting for your line',
  modeWatching: 'Watching closely',
  modeAccepted: 'Accepted',
  modeShifting: 'Something is shifting',
  modeFree: 'Free to become',
};

let modeKey = 'modeReady';
let instructionCopyKey = 'instructionFirst';
let instructionHintKey = 'hintFirst';
let verdictKey = 'verdictOne';

function t(key) {
  return COPY[key] ?? key;
}

function setMode(key) {
  modeKey = key;
  modeLabel.textContent = t(key);
}

function setInstruction(copyKey, hintKey) {
  instructionCopyKey = copyKey;
  instructionHintKey = hintKey;
  instructionCopy.textContent = t(copyKey);
  instructionHint.textContent = t(hintKey);
}

const COLORS = {
  paper: 0xe9e4da,
  ink: 0x151513,
  red: 0xd94331,
  yellow: 0xf0bd30,
  blue: 0x2456a4,
  green: 0x667f69,
  finalPaper: 0xd7d0c3,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.paper);
scene.fog = new THREE.FogExp2(COLORS.paper, 0.012);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 180);
camera.position.set(0, 0, 28);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.tabIndex = 0;
sceneHost.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.enablePan = false;
controls.minDistance = 13;
controls.maxDistance = 48;
controls.autoRotate = false;
controls.target.set(0, 0, 0);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const drawingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const drawGroup = new THREE.Group();
const freeGroup = new THREE.Group();
scene.add(drawGroup, freeGroup);

let started = false;
let trial = 0;
let isDrawing = false;
let isBusy = false;
let isFree = false;
let currentLine = null;
let currentPoints = [];
let pointerDownAt = null;
let audioOn = false;
let freeMix = 0;
let lastTime = performance.now();

const animations = [];
const freeLines = [];
const acceptedLines = [];

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function setStep(value) {
  stepLabel.textContent = String(value).padStart(2, '0');
  progressFill.style.width = `${(value / 3) * 100}%`;
}

function beginExperience() {
  started = true;
  intro.classList.add('is-hidden');
  instruction.classList.add('is-visible');
  setMode('modeWaiting');
  setStep(1);
}

function pointOnPlane(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return raycaster.ray.intersectPlane(drawingPlane, new THREE.Vector3());
}

function beginLine(event) {
  if (!started || isBusy || isFree || event.button !== 0) return;
  const point = pointOnPlane(event);
  if (!point) return;

  isDrawing = true;
  pointerDownAt = { x: event.clientX, y: event.clientY };
  currentPoints = [point.clone()];
  const geometry = new THREE.BufferGeometry().setFromPoints(currentPoints);
  currentLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({
    color: trial === 2 ? COLORS.red : COLORS.ink,
    linewidth: 2,
  }));
  currentLine.position.z = 0.05 + trial * 0.08;
  drawGroup.add(currentLine);
  renderer.domElement.setPointerCapture(event.pointerId);
  setInstruction(instructionCopyKey, 'hintRelease');
  setMode('modeWatching');
}

function extendLine(event) {
  if (!isDrawing || !currentLine) return;
  const point = pointOnPlane(event);
  if (!point) return;

  const last = currentPoints[currentPoints.length - 1];
  if (last.distanceTo(point) < 0.12) return;
  currentPoints.push(point.clone());
  currentLine.geometry.dispose();
  currentLine.geometry = new THREE.BufferGeometry().setFromPoints(currentPoints);
}

function finishLine() {
  if (!isDrawing) return;
  isDrawing = false;

  if (currentPoints.length < 5) {
    if (currentLine) drawGroup.remove(currentLine);
    currentLine?.geometry.dispose();
    currentLine?.material.dispose();
    currentLine = null;
    setInstruction(instructionCopyKey, 'hintLonger');
    setMode('modeWaiting');
    return;
  }

  if (trial < 2) {
    straightenCurrentLine();
  } else {
    liberateCurrentLine();
  }
}

function straightenCurrentLine() {
  isBusy = true;
  const line = currentLine;
  const source = currentPoints.map((point) => point.clone());
  const first = source[0].clone();
  const last = source[source.length - 1].clone();
  const targets = source.map((_, index) => first.clone().lerp(last, index / (source.length - 1)));
  const startedAt = performance.now();

  animations.push((time) => {
    const raw = Math.min(1, (time - startedAt) / 850);
    const eased = 1 - Math.pow(1 - raw, 3);
    const positions = source.map((point, index) => point.clone().lerp(targets[index], eased));
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(positions);

    if (raw < 1) return true;
    line.material.color.set(COLORS.ink);
    line.material.transparent = true;
    line.material.opacity = 0.46;
    acceptedLines.push(line);
    showVerdict();
    trial += 1;
    currentLine = null;
    currentPoints = [];
    window.setTimeout(prepareNextTrial, 900);
    return false;
  });
}

function showVerdict() {
  verdictKey = trial === 0 ? 'verdictOne' : 'verdictTwo';
  verdictCopy.textContent = t(verdictKey);
  verdict.classList.remove('is-visible');
  void verdict.offsetWidth;
  verdict.classList.add('is-visible');
  setMode('modeAccepted');
}

function prepareNextTrial() {
  isBusy = false;
  setStep(trial + 1);
  instructionIndex.textContent = `${String(trial + 1).padStart(2, '0')} / 03`;
  setInstruction(
    trial === 1 ? 'instructionSecond' : 'instructionThird',
    trial === 1 ? 'hintSecond' : 'hintThird',
  );
  setMode(trial === 2 ? 'modeShifting' : 'modeWaiting');
}

function liberateCurrentLine() {
  isBusy = true;
  const source = resamplePoints(currentPoints, 64);
  drawGroup.remove(currentLine);
  currentLine.geometry.dispose();
  currentLine.material.dispose();
  currentLine = null;

  const palette = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.green, COLORS.ink];
  const lineCount = 20;

  for (let index = 0; index < lineCount; index += 1) {
    const seed = index * 2.399963;
    const spread = index / (lineCount - 1);
    const side = index % 2 === 0 ? 1 : -1;
    const xScale = 0.88 + Math.cos(seed) * 0.11 + spread * 0.16;
    const yScale = 0.9 + Math.sin(seed * 0.7) * 0.09;
    const targetScale = 0.88 + Math.sin(seed * 0.5) * 0.08;
    const targetOpacity = index === 0 ? 0.9 : 0.16 + (1 - spread) * 0.32;
    const positions = source.map((point, pointIndex) => {
      const t = pointIndex / (source.length - 1);
      const longBend = Math.sin(t * Math.PI * 1.35 + seed) * spread;
      const innerBend = Math.sin(t * Math.PI * (2.1 + spread * 1.8) + seed * 0.65);
      return new THREE.Vector3(
        point.x * xScale + longBend * 3.8 + side * spread * 2.2,
        point.y * yScale + innerBend * spread * 1.5 + Math.cos(seed) * spread * 1.6,
        innerBend * spread * 4.2 + (index - lineCount / 2) * 0.16,
      );
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(positions);
    const material = new THREE.LineBasicMaterial({
      color: palette[index % palette.length],
      transparent: true,
      opacity: index === 0 ? 1 : 0,
    });
    const line = new THREE.Line(geometry, material);
    line.scale.setScalar(index === 0 ? 1 : 0.01);
    line.userData = { positions, seed, spread, targetScale, targetOpacity };
    freeLines.push(line);
    freeGroup.add(line);
  }

  const startedAt = performance.now();
  animations.push((time) => {
    const raw = Math.min(1, (time - startedAt) / 2300);
    const eased = 1 - Math.pow(1 - raw, 4);
    freeMix = eased;
    scene.background.lerpColors(new THREE.Color(COLORS.paper), new THREE.Color(COLORS.finalPaper), eased);
    scene.fog.color.copy(scene.background);

    freeLines.forEach((line, index) => {
      const delay = Math.min(1, Math.max(0, raw * 1.45 - index * 0.012));
      const scale = THREE.MathUtils.lerp(0.01, line.userData.targetScale, delay);
      line.scale.setScalar(scale);
      line.material.opacity = delay * line.userData.targetOpacity;
    });

    acceptedLines.forEach((line) => {
      line.material.opacity = THREE.MathUtils.lerp(0.46, 0.1, eased);
    });

    camera.position.z = THREE.MathUtils.lerp(28, 25.5, eased);
    camera.position.x = Math.sin(eased * Math.PI) * 2.2;
    camera.lookAt(0, 0, 0);

    if (raw < 1) return true;
    enterFreeState();
    return false;
  });
}

function resamplePoints(points, count) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
  return curve.getPoints(count - 1);
}

function enterFreeState() {
  isBusy = false;
  isFree = true;
  instruction.classList.remove('is-visible');
  finale.classList.add('is-visible');
  document.body.classList.add('is-free');
  setMode('modeFree');
  setStep(3);
  controls.enabled = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.38;
}

function restart() {
  for (const line of [...acceptedLines, ...freeLines]) {
    line.geometry.dispose();
    line.material.dispose();
    line.parent?.remove(line);
  }
  acceptedLines.length = 0;
  freeLines.length = 0;
  animations.length = 0;
  drawGroup.clear();
  freeGroup.clear();

  trial = 0;
  isDrawing = false;
  isBusy = false;
  isFree = false;
  freeMix = 0;
  currentLine = null;
  currentPoints = [];
  controls.enabled = false;
  controls.autoRotate = false;
  camera.position.set(0, 0, 28);
  camera.lookAt(0, 0, 0);
  scene.background.set(COLORS.paper);
  scene.fog.color.set(COLORS.paper);
  document.body.classList.remove('is-free');
  finale.classList.remove('is-visible');
  instruction.classList.add('is-visible');
  instructionIndex.textContent = '01 / 03';
  verdictKey = 'verdictOne';
  setInstruction('instructionFirst', 'hintFirst');
  setMode('modeWaiting');
  setStep(1);
}

async function toggleSound() {
  audioOn = !audioOn;
  soundButton.setAttribute('aria-pressed', String(audioOn));
  soundButton.textContent = audioOn ? t('soundOn') : t('soundOff');
  audio.volume = 0.28;
  if (audioOn) {
    try {
      await audio.play();
    } catch {
      audioOn = false;
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.textContent = t('soundOff');
    }
  } else {
    audio.pause();
  }
}

function animate(time) {
  const delta = Math.min(0.05, (time - lastTime) / 1000);
  lastTime = time;

  for (let index = animations.length - 1; index >= 0; index -= 1) {
    if (!animations[index](time)) animations.splice(index, 1);
  }

  if (isFree) {
    freeLines.forEach((line, lineIndex) => {
      const positions = line.geometry.attributes.position;
      const originals = line.userData.positions;
      for (let index = 0; index < positions.count; index += 1) {
        const original = originals[index];
        const phase = time * .00035 + line.userData.seed + index * .085;
        positions.setXYZ(
          index,
          original.x + Math.sin(phase * 1.1) * .06 * line.userData.spread,
          original.y + Math.cos(phase * 1.4) * .05 * line.userData.spread,
          original.z + Math.sin(phase + lineIndex * .17) * .08,
        );
      }
      positions.needsUpdate = true;
    });
    freeGroup.rotation.y += delta * .012;
    controls.update();
  }

  renderer.render(scene, camera);
}

startButton.addEventListener('click', beginExperience);
restartButton.addEventListener('click', restart);
soundButton.addEventListener('click', toggleSound);
renderer.domElement.addEventListener('pointerdown', beginLine);
renderer.domElement.addEventListener('pointermove', extendLine);
renderer.domElement.addEventListener('pointerup', finishLine);
renderer.domElement.addEventListener('pointercancel', finishLine);
window.addEventListener('resize', resize);

resize();
renderer.setAnimationLoop(animate);
