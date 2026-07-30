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
const verdictScore = document.querySelector('#verdict-score');
const verdictGrade = document.querySelector('#verdict-grade');
const finale = document.querySelector('#finale');
const restartButton = document.querySelector('#restart');
const stepLabel = document.querySelector('#step');
const progressFill = document.querySelector('#progress-fill');
const modeLabel = document.querySelector('#mode');
const soundButton = document.querySelector('#sound');
const audio = document.querySelector('#audio');
const returnToSceneLink = document.querySelector('[data-return-to-scene]');
const restartExperienceLink = document.querySelector('[data-restart-experience]');

const COPY = {
  soundOn: 'SOUND: ON',
  soundOff: 'SOUND: OFF',
  instructionFirst: 'Draw a line. Any line.',
  hintFirst: 'Hold, move, then let go',
  hintRelease: 'Let go when it feels finished',
  hintLonger: 'Give it a little more room',
  instructionSecond: 'Try another one.',
  hintSecond: 'No need to make it perfect',
  instructionThird: 'One more. Make it properly straight.',
  hintThird: 'Slowly. Neatly. No wandering.',
  instructionFourth: 'Now draw the line that feels like yours.',
  hintFourth: 'Don’t overthink it',
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
let finaleCondenseTimer = null;

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
  progressFill.style.width = `${(value / 4) * 100}%`;
}

function beginExperience() {
  started = true;
  document.body.classList.add('is-started');
  intro.classList.add('is-hidden');
  instruction.classList.add('is-visible');
  setMode('modeWaiting');
  setStep(1);
  if (!audioOn) toggleSound();
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
    color: trial === 3 ? COLORS.red : COLORS.ink,
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

  if (trial < 3) {
    straightenCurrentLine();
  } else {
    liberateCurrentLine();
  }
}

function straightenCurrentLine() {
  isBusy = true;
  const line = currentLine;
  const source = currentPoints.map((point) => point.clone());
  const evaluation = evaluateStraightness(source);
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
    showVerdict(evaluation);
    trial += 1;
    currentLine = null;
    currentPoints = [];
    window.setTimeout(prepareNextTrial, 2300);
    return false;
  });
}

function evaluateStraightness(points) {
  const first = points[0];
  const last = points[points.length - 1];
  const direction = last.clone().sub(first);
  const directDistance = direction.length();
  if (directDistance < 0.001) {
    return {
      score: 0,
      grade: 'D',
      feedback: 'Try again. Choose the destination first, then let your hand follow.',
    };
  }

  let pathLength = 0;
  let squaredDeviation = 0;
  for (let index = 1; index < points.length; index += 1) {
    pathLength += points[index - 1].distanceTo(points[index]);
  }
  for (const point of points) {
    const relative = point.clone().sub(first);
    const projection = relative.dot(direction) / direction.lengthSq();
    const nearest = first.clone().addScaledVector(direction, projection);
    squaredDeviation += point.distanceToSquared(nearest);
  }

  const efficiency = THREE.MathUtils.clamp(directDistance / pathLength, 0, 1);
  const normalizedDeviation = Math.sqrt(squaredDeviation / points.length) / directDistance;
  const alignment = THREE.MathUtils.clamp(1 - normalizedDeviation * 7, 0, 1);
  const score = Math.round((efficiency * 0.55 + alignment * 0.45) * 100);

  if (score >= 92) {
    return { score, grade: 'A+', feedback: 'Excellent. Confident, controlled, and beautifully direct.' };
  }
  if (score >= 80) {
    return { score, grade: 'A', feedback: 'Good work. Steady, with only a little hesitation.' };
  }
  if (score >= 65) {
    return { score, grade: 'B', feedback: 'Promising. Keep your hand calm and trust the direction.' };
  }
  if (score >= 45) {
    return { score, grade: 'C', feedback: 'You’re searching. Slow down and guide the line with more intention.' };
  }
  return {
    score,
    grade: 'D',
    feedback: 'Try again. Choose the destination first, then let your hand follow.',
  };
}

function showVerdict(evaluation) {
  verdictGrade.textContent = evaluation.grade;
  verdictScore.textContent = `${evaluation.score} / 100`;
  verdictCopy.textContent = evaluation.feedback;
  verdict.classList.remove('is-visible');
  void verdict.offsetWidth;
  verdict.classList.add('is-visible');
  setMode('modeAccepted');
}

function prepareNextTrial() {
  isBusy = false;
  setStep(trial + 1);
  instructionIndex.textContent = `${String(trial + 1).padStart(2, '0')} / 04`;
  const nextPrompt = [
    null,
    ['instructionSecond', 'hintSecond'],
    ['instructionThird', 'hintThird'],
    ['instructionFourth', 'hintFourth'],
  ][trial];
  setInstruction(...nextPrompt);
  setMode(trial === 3 ? 'modeShifting' : 'modeWaiting');
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

    acceptedLines.forEach((line, index) => {
      line.material.opacity = THREE.MathUtils.lerp(0.46, 0, eased);
      line.position.y = THREE.MathUtils.lerp(0, 3.4 + index * 1.1, eased);
      line.position.x = THREE.MathUtils.lerp(0, index === 0 ? -1.4 : 1.2, eased);
      line.rotation.z = THREE.MathUtils.lerp(0, index === 0 ? -0.08 : 0.1, eased);
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
  acceptedLines.forEach((line) => drawGroup.remove(line));
  instruction.classList.remove('is-visible');
  finale.classList.remove('is-condensed');
  finale.classList.add('is-visible');
  window.clearTimeout(finaleCondenseTimer);
  finaleCondenseTimer = window.setTimeout(() => {
    finale.classList.add('is-condensed');
  }, 5000);
  document.body.classList.add('is-free');
  setMode('modeFree');
  document.querySelector('.desktop-help').textContent = 'DRAG / ZOOM · SCROLL TO CONTINUE';
  setStep(4);
  controls.enabled = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.38;
}

function restart() {
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.clearTimeout(finaleCondenseTimer);
  finaleCondenseTimer = null;
  for (const object of [...acceptedLines, ...freeLines]) {
    object.geometry.dispose();
    object.material.dispose();
    object.parent?.remove(object);
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
  document.body.classList.add('is-started');
  finale.classList.remove('is-visible', 'is-condensed');
  instruction.classList.add('is-visible');
  instructionIndex.textContent = '01 / 04';
  setInstruction('instructionFirst', 'hintFirst');
  setMode('modeWaiting');
  document.querySelector('.desktop-help').textContent = 'DRAW: HOLD + MOVE · LATER: DRAG / ZOOM';
  setStep(1);
}

function returnToScene(event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.history.replaceState(null, '', '#scene');
  renderer.domElement.focus({ preventScroll: true });
}

function restartFromStory(event) {
  event.preventDefault();
  restart();
  window.history.replaceState(null, '', '#scene');
  renderer.domElement.focus({ preventScroll: true });
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
returnToSceneLink.addEventListener('click', returnToScene);
restartExperienceLink.addEventListener('click', restartFromStory);
soundButton.addEventListener('click', toggleSound);
renderer.domElement.addEventListener('pointerdown', beginLine);
renderer.domElement.addEventListener('pointermove', extendLine);
renderer.domElement.addEventListener('pointerup', finishLine);
renderer.domElement.addEventListener('pointercancel', finishLine);
window.addEventListener('resize', resize);

resize();
renderer.setAnimationLoop(animate);
