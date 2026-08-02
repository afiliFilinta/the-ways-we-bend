import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const sceneHost = document.querySelector('#scene');
const intro = document.querySelector('#intro');
const startButton = document.querySelector('#start');
const instruction = document.querySelector('#instruction');
const instructionCopy = document.querySelector('#instruction-copy');
const instructionHint = document.querySelector('#instruction-hint');
const drawingBoundary = document.querySelector('#drawing-boundary');
const drawingBoundaryLabel = document.querySelector('#drawing-boundary-label');
const traceGuide = document.querySelector('#trace-guide');
const verdict = document.querySelector('#verdict');
const verdictCopy = document.querySelector('#verdict-copy');
const verdictScore = document.querySelector('#verdict-score');
const verdictGrade = document.querySelector('#verdict-grade');
const finale = document.querySelector('#finale');
const restartButton = document.querySelector('#restart');
const stepLabel = document.querySelector('#step');
const progressFill = document.querySelector('#progress-fill');
const modeLabel = document.querySelector('#mode');
const soundButtons = [...document.querySelectorAll('[data-sound-toggle]')];
const audio = document.querySelector('#audio');
const returnToSceneLink = document.querySelector('[data-return-to-scene]');
const restartExperienceLink = document.querySelector('[data-restart-experience]');
const storyProgress = document.querySelector('#story-progress');
const storyFirstScore = document.querySelector('#story-first-score');
const storyDeviationDot = document.querySelector('#story-deviation-dot');
const storyDeviationLabel = document.querySelector('#story-deviation-label');
const detailStage = document.querySelector('.detail-stage');
const detailCallout = document.querySelector('.detail-callout');
const detailCalloutArrow = document.querySelector('.detail-callout-arrow');
const detailCalloutArrowPath = document.querySelector('#detail-callout-arrow-path');
const storyCloserTitle = document.querySelector('#story-closer-title');
const storyCloserCopy = document.querySelector('#story-closer-copy');
const storyAttemptsCopy = document.querySelector('#story-attempts-copy');
const storyTurnTitle = document.querySelector('#story-turn-title');
const storyTurnCopy = document.querySelector('#story-turn-copy');
const storyPortraitDate = document.querySelector('#story-portrait-date');
const printButtons = [...document.querySelectorAll('[data-export-print]')];

const TRANSLATIONS = {
  en: {
    metaDescription: 'A small interactive experiment about the beautiful ways we bend.',
    pageTitle: 'The Ways We Bend — A Three.js Experiment',
    sceneLabel: 'Interactive three-dimensional drawing space', restartLabel: 'Restart the experience', progressLabel: 'Experience progress',
    soundOn: 'SOUND: ON', soundOff: 'SOUND: OFF',
    introKicker: 'A small experiment about all the ways we bend.', introTitle: 'We were taught<br>to draw a <em>straight line.</em>', start: 'Let’s begin',
    instructionFirst: 'Draw a straight line.', hintFirst: 'Hold, move, then let go', hintRelease: 'Let go when it feels finished', hintLonger: 'Give it a little more room', hintRetry: 'Score B or higher to continue',
    instructionSecond: 'Draw a line inside the frame.', hintSecond: 'Keep the whole line within the boundary', instructionThird: 'Trace the straight line inside the frame.', hintThird: 'Follow the guide from end to end', instructionFourth: 'Now draw the line that feels like yours.', hintFourth: 'Inside or outside — it’s your choice',
    modeReady: 'Waiting for you', modeWaiting: 'Waiting for your line', modeWatching: 'Watching closely', modeAccepted: 'Accepted', modeRetry: 'B or higher required', modeShifting: 'Something is shifting', modeFree: 'Free to become',
    boundaryDraw: 'Draw inside this frame', boundaryTrace: 'Trace this line', verdictPlaceholder: 'Excellent control. A confident, direct line.',
    finaleKicker: 'Nothing went wrong.', finaleTitle: 'You were never meant<br>to be <em>a straight line.</em>', finaleCopy: 'The bends are where you became yourself.', continue: 'Continue ↓', beginAgain: 'Begin again ↺',
    desktopHelp: 'DRAW: HOLD + MOVE · LATER: DRAG / ZOOM', desktopHelpFree: 'DRAG / ZOOM · SCROLL TO CONTINUE', storyLabel: 'The story behind the experience', returnLines: '↑ RETURN TO YOUR LINES',
    control: 'CONTROL', accepted: 'ACCEPTED', measureIndex: 'THE MEASURE / 01', firstLine: 'This was your first line.', measureTitle: 'They gave it a number.<br>They called it <em>control.</em>', keepScrolling: 'Keep scrolling ↓',
    closerIndex: 'LOOK CLOSER / 02', directionChanged: 'You changed direction here.', closerTitle: 'The closer we look,<br>the less it looks<br>like a <em>mistake.</em>', closerCopy: 'A tremor. A pause. A correction.<br>Not noise — evidence that you were here.', deviation: '{value} PX FROM PERFECT',
    closerPreciseTitle: 'You stayed close to the rule.<br>That precision is <em>yours.</em>', closerPreciseCopy: 'Your hand chose a direction and held it.<br>Control did not erase your trace; it made it quieter.',
    closerSteadyTitle: 'Your line bent,<br>but never lost<br>its <em>direction.</em>', closerSteadyCopy: 'A small turn is not a mistake.<br>It is how your hand found its way while staying within the measure.',
    closerSearchingTitle: 'You left room<br>for the line to<br><em>find its way.</em>', closerSearchingCopy: 'The turns are visible, and so is your intention.<br>You stayed with the line until it reached somewhere.',
    attemptsIndex: 'THE ATTEMPTS / 03', attemptDirect: '01 / DIRECT', attemptContained: '02 / CONTAINED', attemptTraced: '03 / TRACED', attemptYours: '04 / YOURS', unscored: 'UNSCORED', attemptsTitle: 'Four instructions.<br>Four versions of <em>you.</em>', attemptsCopy: 'No attempt repeated the one before it. That difference is not failure. It is authorship.',
    attemptsConsistentCopy: 'The instructions changed; your rhythm remained. Repetition is not emptiness — it is a choice your hand knows.',
    attemptsEvolvingCopy: 'Each line moved a little away from the last. Your hand did not simply repeat the rule; it negotiated with it.',
    attemptsVariedCopy: 'These four lines do not move alike. That is not inconsistency — it is the same hand responding to four different limits.',
    turnIndex: 'THE TURN / 04', turnCopy: 'The rule stayed straight.<br>You did not have to.', turnTitle: 'Your line did not fail<br>the system. It made<br>the system <em>bend.</em>',
    turnInsideRepeatCopy: 'You stayed within the boundary and repeated a movement your hand already knew.', turnInsideRepeatTitle: 'You did not cross the line.<br>Still, what happened<br>inside was <em>yours.</em>',
    turnInsidePatientCopy: 'You stayed within the boundary and gave every turn the time it needed.', turnInsidePatientTitle: 'The frame held the space.<br>You decided how<br>to move <em>through it.</em>',
    turnInsideBendCopy: 'You stayed inside the frame, but you did not let it straighten your movement.', turnInsideBendTitle: 'You kept the boundary.<br>You changed what<br><em>inside</em> could mean.',
    turnCrossingCopy: 'Part of your line stayed in; part of it stepped out. You noticed the boundary and chose where to answer it.', turnCrossingTitle: 'You did not ignore the limit.<br>You decided where<br>it would <em>open.</em>',
    turnOutsideCopy: 'Your line spent most of its time beyond the frame. The rule remained visible; it simply stopped deciding for you.', turnOutsideTitle: 'The boundary stayed.<br>Your direction belonged<br>to <em>you.</em>',
    portraitIndex: 'YOUR PORTRAIT / 05', portraitDrawn: 'DRAWN BY YOUR HAND', portraitDevice: 'ON THIS DEVICE', portraitTitle: 'This is not how you failed<br>to draw a straight line.', portraitCopy: 'This is how you moved.', savePrint: 'Keep your lines ↓', drawAgain: 'Draw yours again',
    feedbackDestination: 'Try again. Choose the destination first, then let your hand follow.', feedbackTraceEnd: 'Trace the guide from end to end before letting go.', feedbackTraceInside: 'Keep the entire line inside the frame, then follow the guide.', feedbackTraceElsewhere: 'Follow the guide. A straight line elsewhere does not count.', feedbackTraceCloser: 'Keep your hand closer to the guide and try again.', feedbackMostlyOutside: 'Most of your line fell outside the frame. Stay within the boundary.', feedbackPartOutside: 'Part of your line crossed the frame. Keep the whole line inside.', feedbackAlmostInside: 'Almost there. Keep every part of the line inside the frame.', feedbackExcellent: 'Excellent. Confident, controlled, and beautifully direct.', feedbackGood: 'Good work. Steady, with only a little hesitation.', feedbackPromising: 'Promising. Keep your hand calm and trust the direction.', feedbackSearching: 'You’re searching. Slow down and guide the line with more intention.',
    printSettling: 'Letting the lines settle…', printPreparing: 'Preparing vector print…', printFallback: 'Keep your lines ↓', printError: 'The print could not be prepared on this device. Please try again.',
  },
};

const MIN_PASSING_SCORE = 65;
const MIN_BOUNDARY_PASS_RATIO = 0.999;
const TRIAL_PROMPTS = [
  ['instructionFirst', 'hintFirst'],
  ['instructionSecond', 'hintSecond'],
  ['instructionThird', 'hintThird'],
  ['instructionFourth', 'hintFourth'],
];

let modeKey = 'modeReady';
let instructionCopyKey = 'instructionFirst';
let instructionHintKey = 'hintFirst';
let activeFeedbackKey = null;
let storyDeviationValue = null;
let storyNarrativeKeys = {
  closerTitle: 'closerTitle',
  closerCopy: 'closerCopy',
  attemptsCopy: 'attemptsCopy',
  turnTitle: 'turnTitle',
  turnCopy: 'turnCopy',
};
function t(key) {
  return TRANSLATIONS.en[key] ?? key;
}

function formatTranslation(key, values = {}) {
  return Object.entries(values).reduce(
    (copy, [name, value]) => copy.replaceAll(`{${name}}`, value),
    t(key),
  );
}

function updatePortraitDate() {
  storyPortraitDate.textContent = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date()).toLocaleUpperCase('en');
}

function renderStoryNarrative() {
  storyCloserTitle.innerHTML = t(storyNarrativeKeys.closerTitle);
  storyCloserCopy.innerHTML = t(storyNarrativeKeys.closerCopy);
  storyAttemptsCopy.textContent = t(storyNarrativeKeys.attemptsCopy);
  storyTurnTitle.innerHTML = t(storyNarrativeKeys.turnTitle);
  storyTurnCopy.innerHTML = t(storyNarrativeKeys.turnCopy);
}

function applyCopy() {
  document.title = t('pageTitle');

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    element.setAttribute('content', t(element.dataset.i18nContent));
  });

  soundButtons.forEach((button) => {
    if (!button.hasAttribute('data-compact-control')) {
      button.textContent = t(audioOn ? 'soundOn' : 'soundOff');
    }
    button.setAttribute('aria-label', t(audioOn ? 'soundOn' : 'soundOff'));
  });
  setInstruction(instructionCopyKey, instructionHintKey);
  setMode(modeKey);
  drawingBoundaryLabel.textContent = t(
    drawingBoundary.classList.contains('has-trace-guide') ? 'boundaryTrace' : 'boundaryDraw',
  );
  document.querySelector('.desktop-help').textContent = t(isFree ? 'desktopHelpFree' : 'desktopHelp');
  if (activeFeedbackKey) verdictCopy.textContent = t(activeFeedbackKey);
  if (storyDeviationValue !== null) {
    storyDeviationLabel.textContent = formatTranslation('deviation', { value: storyDeviationValue });
  }
  renderStoryNarrative();
  updatePortraitDate();
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

const PENCIL_AUDIO_URL = './audio/pencil-on-paper.mp3';
const PENCIL_AUDIO_GAIN = 6;
const DRAWING_LINE_WIDTH = 2.4;
const FREE_LINE_WIDTH = 1;
const MIN_FREE_LINE_SCALE = 0.001;
const FREE_LINE_GROWTH_PER_SECOND = 0.009;
const LIBERATION_DURATION_MS = 3600;
const CAMERA_AUTO_ROTATE_SPEED = 0.24;
const CAMERA_MOTION_RAMP_MS = 6000;
const PRINT_SCENE_SETTLE_MS = 8000;
const A3_WIDTH_POINTS = 1190.55;
const A3_HEIGHT_POINTS = 841.89;

function createLineGeometry(points) {
  const drawablePoints = points.length === 1 ? [points[0], points[0]] : points;
  const positions = drawablePoints.flatMap((point) => [point.x, point.y, point.z]);
  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  return geometry;
}

class PencilAudioEngine {
  constructor(url) {
    this.url = url;
    this.context = null;
    this.masterGain = null;
    this.buffer = null;
    this.grains = [];
    this.activeSources = new Set();
    this.readyPromise = null;
    this.enabled = false;
    this.isDrawing = false;
    this.lastPointer = null;
    this.distanceSinceGrain = 0;
    this.lastGrainAt = -Infinity;
    this.triggerCount = 0;
  }

  async ensureReady() {
    if (this.buffer) return;
    if (this.readyPromise) return this.readyPromise;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      document.body.dataset.pencilAudioStatus = 'unsupported';
      throw new Error('Web Audio API is not supported.');
    }

    this.context = new AudioContextClass({ latencyHint: 'interactive' });
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.0001;
    this.masterGain.connect(this.context.destination);
    document.body.dataset.pencilAudioStatus = 'loading';

    this.readyPromise = fetch(this.url)
      .then((response) => {
        if (!response.ok) throw new Error(`Pencil audio request failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => this.context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffer = buffer;
        this.grains = this.findActiveGrains(buffer);
        document.body.dataset.pencilAudioStatus = 'ready';
      })
      .catch((error) => {
        document.body.dataset.pencilAudioStatus = 'error';
        console.warn('Pencil audio could not be prepared.', error);
        throw error;
      });

    return this.readyPromise;
  }

  findActiveGrains(buffer) {
    const samples = buffer.getChannelData(0);
    const windowFrames = Math.max(1, Math.floor(buffer.sampleRate * 0.24));
    const stepFrames = Math.max(1, Math.floor(buffer.sampleRate * 0.11));
    const measured = [];

    for (let start = 0; start + windowFrames < samples.length; start += stepFrames) {
      let sumSquares = 0;
      let sampleCount = 0;
      for (let index = start; index < start + windowFrames; index += 2) {
        sumSquares += samples[index] * samples[index];
        sampleCount += 1;
      }
      measured.push({
        offset: start / buffer.sampleRate,
        duration: windowFrames / buffer.sampleRate,
        energy: Math.sqrt(sumSquares / Math.max(1, sampleCount)),
      });
    }

    const maximumEnergy = Math.max(...measured.map((grain) => grain.energy), 0.0001);
    const active = measured.filter((grain) => grain.energy >= maximumEnergy * 0.08);
    const candidates = active.length >= 12 ? active : measured;
    return candidates.sort((first, second) => first.energy - second.energy);
  }

  async setEnabled(enabled) {
    this.enabled = enabled;

    if (!enabled) {
      this.end();
      this.fadeMasterTo(0.0001, 0.025);
      return;
    }

    await this.ensureReady();
    if (this.context.state === 'suspended') await this.context.resume();
    this.fadeMasterTo(PENCIL_AUDIO_GAIN, 0.04);
  }

  fadeMasterTo(value, duration) {
    if (!this.context || !this.masterGain) return;
    const now = this.context.currentTime;
    const gain = this.masterGain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(0.0001, gain.value), now);
    gain.linearRampToValueAtTime(value, now + duration);
  }

  begin(event, rect) {
    if (!this.enabled) return;
    this.isDrawing = true;
    this.lastPointer = {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
    };
    this.distanceSinceGrain = 0;
    this.lastGrainAt = -Infinity;
    this.triggerGrain(0.18, event, rect, true);
  }

  move(event, rect) {
    if (!this.enabled || !this.isDrawing) return;
    const coalesced = typeof event.getCoalescedEvents === 'function'
      ? event.getCoalescedEvents()
      : [];
    const samples = coalesced.length ? coalesced : [event];

    for (const sample of samples) {
      if (!this.lastPointer) {
        this.lastPointer = {
          x: sample.clientX,
          y: sample.clientY,
          time: sample.timeStamp,
        };
        continue;
      }

      const distance = Math.hypot(
        sample.clientX - this.lastPointer.x,
        sample.clientY - this.lastPointer.y,
      );
      const elapsed = THREE.MathUtils.clamp(
        sample.timeStamp - this.lastPointer.time,
        8,
        80,
      );
      const speed = distance / elapsed;
      const speedMix = THREE.MathUtils.clamp((speed - 0.04) / 1.35, 0, 1);
      this.distanceSinceGrain += distance;

      const distanceGate = THREE.MathUtils.lerp(18, 8, speedMix);
      const timeGate = THREE.MathUtils.lerp(72, 34, speedMix);
      if (
        this.distanceSinceGrain >= distanceGate
        && sample.timeStamp - this.lastGrainAt >= timeGate
      ) {
        this.triggerGrain(speedMix, sample, rect);
        this.distanceSinceGrain = 0;
        this.lastGrainAt = sample.timeStamp;
      }

      this.lastPointer = {
        x: sample.clientX,
        y: sample.clientY,
        time: sample.timeStamp,
      };
    }
  }

  triggerGrain(speedMix, event, rect, isOnset = false) {
    if (
      !this.enabled
      || !this.context
      || !this.buffer
      || !this.masterGain
      || !this.grains.length
      || this.activeSources.size >= 6
    ) return;

    const targetMix = isOnset ? 0.24 : 0.18 + speedMix * 0.76;
    const targetIndex = Math.round((this.grains.length - 1) * targetMix);
    const jitter = Math.floor(Math.random() * 7) - 3;
    const grain = this.grains[
      THREE.MathUtils.clamp(targetIndex + jitter, 0, this.grains.length - 1)
    ];
    const sourceDuration = THREE.MathUtils.lerp(0.26, 0.13, speedMix);
    const offsetJitter = Math.random() * Math.max(0, grain.duration - sourceDuration);
    const offset = Math.min(
      grain.offset + offsetJitter,
      this.buffer.duration - sourceDuration - 0.01,
    );
    const playbackRate = 0.92 + speedMix * 0.16 + (Math.random() - 0.5) * 0.04;
    const audibleDuration = sourceDuration / playbackRate;
    const pressure = event.pointerType === 'pen' && event.pressure > 0
      ? event.pressure
      : 0.5;
    const peakGain = (isOnset
      ? 0.045
      : THREE.MathUtils.lerp(0.045, 0.11, speedMix))
      * THREE.MathUtils.lerp(0.88, 1.12, pressure);
    const pan = THREE.MathUtils.clamp(
      ((event.clientX - rect.left) / rect.width) * 0.7 - 0.35,
      -0.35,
      0.35,
    );
    const now = this.context.currentTime;
    const attack = 0.006;
    const release = Math.min(0.035, audibleDuration * 0.35);

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    const panner = this.context.createStereoPanner();
    source.buffer = this.buffer;
    source.playbackRate.value = playbackRate;
    panner.pan.value = pan;

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + attack);
    gainNode.gain.setValueAtTime(
      peakGain,
      now + Math.max(attack, audibleDuration - release),
    );
    gainNode.gain.linearRampToValueAtTime(0.0001, now + audibleDuration);

    source.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.masterGain);

    this.activeSources.add(source);
    this.triggerCount += 1;
    document.body.dataset.pencilAudioGrains = String(this.triggerCount);
    document.body.dataset.pencilAudioVoices = String(this.activeSources.size);
    source.onended = () => {
      this.activeSources.delete(source);
      source.disconnect();
      gainNode.disconnect();
      panner.disconnect();
      document.body.dataset.pencilAudioVoices = String(this.activeSources.size);
    };
    source.start(now, Math.max(0, offset), sourceDuration);
  }

  end() {
    this.isDrawing = false;
    this.lastPointer = null;
    this.distanceSinceGrain = 0;
  }
}

const pencilAudio = new PencilAudioEngine(PENCIL_AUDIO_URL);

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
let currentScreenPoints = [];
let traceGuideConfig = null;
let finalContainmentRatio = null;
let pointerDownAt = null;
let currentDrawStartedAt = null;
let audioOn = false;
let freeMix = 0;
let lastTime = performance.now();
let finaleCondenseTimer = null;
let freeStateStartedAt = null;

const animations = [];
const freeLines = [];
const acceptedLines = [];
const storyLines = [];
const ACTIVE_LINE_COLOR = '#c85f4d';

function createLinePalette(colorValue) {
  const base = new THREE.Color(colorValue);
  const paper = new THREE.Color(COLORS.paper);
  const ink = new THREE.Color(COLORS.ink);
  return [
    base.clone(),
    base.clone().lerp(ink, 0.24),
    base.clone().lerp(paper, 0.18),
    base.clone().lerp(ink, 0.42),
    base.clone().lerp(paper, 0.38),
    base.clone().lerp(ink, 0.12),
    base.clone().lerp(paper, 0.56),
  ];
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  positionTraceGuide();
  updateDetailCalloutArrow();
}

function setStep(value) {
  stepLabel.textContent = String(value).padStart(2, '0');
  progressFill.style.width = `${(value / 4) * 100}%`;
}

function setDrawingBoundaryVisible(isVisible, showTraceGuide = false) {
  drawingBoundary.classList.toggle('is-visible', isVisible);
  drawingBoundary.classList.toggle('has-trace-guide', isVisible && showTraceGuide);
  drawingBoundary.setAttribute('aria-hidden', String(!isVisible));
  drawingBoundaryLabel.textContent = t(showTraceGuide ? 'boundaryTrace' : 'boundaryDraw');
  if (showTraceGuide && !traceGuideConfig) randomizeTraceGuide();
  positionTraceGuide();
}

function randomizeTraceGuide() {
  const isVertical = Math.random() < 0.5;
  const lengthRatio = isVertical
    ? THREE.MathUtils.lerp(0.38, 0.58, Math.random())
    : THREE.MathUtils.lerp(0.24, 0.36, Math.random());
  const halfLength = lengthRatio / 2;
  traceGuideConfig = {
    isVertical,
    lengthRatio,
    centerX: isVertical
      ? THREE.MathUtils.lerp(0.28, 0.72, Math.random())
      : THREE.MathUtils.lerp(0.1 + halfLength, 0.9 - halfLength, Math.random()),
    centerY: isVertical
      ? THREE.MathUtils.lerp(0.1 + halfLength, 0.9 - halfLength, Math.random())
      : THREE.MathUtils.lerp(0.28, 0.72, Math.random()),
  };
}

function positionTraceGuide() {
  if (!traceGuideConfig) return;
  const rect = drawingBoundary.getBoundingClientRect();
  const axisLength = traceGuideConfig.isVertical ? rect.height : rect.width;
  traceGuide.style.left = `${traceGuideConfig.centerX * 100}%`;
  traceGuide.style.top = `${traceGuideConfig.centerY * 100}%`;
  traceGuide.style.width = `${axisLength * traceGuideConfig.lengthRatio}px`;
  traceGuide.style.transform = `translate(-50%, -50%) rotate(${traceGuideConfig.isVertical ? 90 : 0}deg)`;
}

function getTraceGuideEndpoints() {
  const rect = drawingBoundary.getBoundingClientRect();
  const length = (traceGuideConfig.isVertical ? rect.height : rect.width)
    * traceGuideConfig.lengthRatio;
  const center = {
    x: rect.left + rect.width * traceGuideConfig.centerX,
    y: rect.top + rect.height * traceGuideConfig.centerY,
  };
  const halfLength = length / 2;
  return traceGuideConfig.isVertical
    ? {
        start: { x: center.x, y: center.y - halfLength },
        end: { x: center.x, y: center.y + halfLength },
      }
    : {
        start: { x: center.x - halfLength, y: center.y },
        end: { x: center.x + halfLength, y: center.y },
      };
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

  const drawingRect = renderer.domElement.getBoundingClientRect();
  isDrawing = true;
  pointerDownAt = { x: event.clientX, y: event.clientY };
  currentDrawStartedAt = performance.now();
  currentPoints = [point.clone()];
  currentScreenPoints = [{ x: event.clientX, y: event.clientY }];
  const geometry = createLineGeometry(currentPoints);
  currentLine = new Line2(geometry, new LineMaterial({
    color: trial === 3 ? COLORS.red : COLORS.ink,
    linewidth: DRAWING_LINE_WIDTH,
  }));
  currentLine.position.z = 0.05 + trial * 0.08;
  drawGroup.add(currentLine);
  renderer.domElement.setPointerCapture(event.pointerId);
  pencilAudio.begin(event, drawingRect);
  setInstruction(instructionCopyKey, 'hintRelease');
  setMode('modeWatching');
}

function extendLine(event) {
  if (!isDrawing || !currentLine) return;
  pencilAudio.move(event, renderer.domElement.getBoundingClientRect());
  const point = pointOnPlane(event);
  if (!point) return;

  const last = currentPoints[currentPoints.length - 1];
  if (last.distanceTo(point) < 0.12) return;
  currentPoints.push(point.clone());
  currentScreenPoints.push({ x: event.clientX, y: event.clientY });
  currentLine.geometry.dispose();
  currentLine.geometry = createLineGeometry(currentPoints);
}

function finishLine() {
  if (!isDrawing) return;
  isDrawing = false;
  pencilAudio.end();

  if (currentPoints.length < 5) {
    if (currentLine) drawGroup.remove(currentLine);
    currentLine?.geometry.dispose();
    currentLine?.material.dispose();
    currentLine = null;
    currentScreenPoints = [];
    setInstruction(instructionCopyKey, 'hintLonger');
    setMode('modeWaiting');
    return;
  }

  if (trial < 3) {
    straightenCurrentLine();
  } else {
    recordFinalLinePlacement();
    liberateCurrentLine();
  }
}

function straightenCurrentLine() {
  isBusy = true;
  const line = currentLine;
  const source = currentPoints.map((point) => point.clone());
  const isBoundaryTrial = trial === 1 || trial === 2;
  const containmentRatio = isBoundaryTrial ? evaluateBoundaryContainment(currentScreenPoints) : null;
  const traceEvaluation = trial === 2 ? evaluateTraceGuide(currentScreenPoints) : null;
  const evaluation = evaluateStraightness(source, { containmentRatio, traceEvaluation });
  const first = source[0].clone();
  const last = source[source.length - 1].clone();
  const targets = source.map((_, index) => first.clone().lerp(last, index / (source.length - 1)));
  const startedAt = performance.now();

  animations.push((time) => {
    const raw = Math.min(1, (time - startedAt) / 850);
    const eased = 1 - Math.pow(1 - raw, 3);
    const positions = source.map((point, index) => point.clone().lerp(targets[index], eased));
    line.geometry.dispose();
    line.geometry = createLineGeometry(raw < 1 ? positions : [first, last]);

    if (raw < 1) return true;
    line.material.color.set(evaluation.retryRequired ? COLORS.red : COLORS.ink);
    line.material.transparent = true;
    line.material.opacity = 1;
    showVerdict(evaluation);

    if (evaluation.retryRequired) {
      window.setTimeout(() => {
        drawGroup.remove(line);
        line.geometry.dispose();
        line.material.dispose();
        currentLine = null;
        currentPoints = [];
        currentScreenPoints = [];
        isBusy = false;
        if (trial === 2) {
          randomizeTraceGuide();
          positionTraceGuide();
        }
        setInstruction(TRIAL_PROMPTS[trial][0], 'hintRetry');
        setMode('modeWaiting');
      }, 2300);
      return false;
    }

    recordStoryLine(currentScreenPoints, evaluation, {
      duration: performance.now() - currentDrawStartedAt,
      containmentRatio,
    });
    acceptedLines.push(line);
    trial += 1;
    currentLine = null;
    currentPoints = [];
    currentScreenPoints = [];
    window.setTimeout(prepareNextTrial, 2300);
    return false;
  });
}

function evaluateBoundaryContainment(points) {
  const rect = drawingBoundary.getBoundingClientRect();
  let totalLength = 0;
  let insideLength = 0;

  for (let index = 1; index < points.length; index += 1) {
    const first = points[index - 1];
    const last = points[index];
    const segmentLength = Math.hypot(last.x - first.x, last.y - first.y);
    if (segmentLength < 0.001) continue;
    totalLength += segmentLength;
    insideLength += segmentLength * getSegmentInsideRatio(first, last, rect);
  }

  if (totalLength < 0.001) return 0;
  return THREE.MathUtils.clamp(insideLength / totalLength, 0, 1);
}

function getSegmentInsideRatio(first, last, rect) {
  const deltaX = last.x - first.x;
  const deltaY = last.y - first.y;
  let start = 0;
  let end = 1;
  const boundaries = [
    [-deltaX, first.x - rect.left],
    [deltaX, rect.right - first.x],
    [-deltaY, first.y - rect.top],
    [deltaY, rect.bottom - first.y],
  ];

  for (const [direction, distance] of boundaries) {
    if (Math.abs(direction) < 0.001) {
      if (distance < 0) return 0;
      continue;
    }

    const intersection = distance / direction;
    if (direction < 0) {
      start = Math.max(start, intersection);
    } else {
      end = Math.min(end, intersection);
    }
    if (start > end) return 0;
  }

  return THREE.MathUtils.clamp(end - start, 0, 1);
}

function evaluateTraceGuide(points) {
  const boundaryRect = drawingBoundary.getBoundingClientRect();
  const { start: guideStart, end: guideEnd } = getTraceGuideEndpoints();
  const guideX = guideEnd.x - guideStart.x;
  const guideY = guideEnd.y - guideStart.y;
  const guideLengthSquared = guideX * guideX + guideY * guideY;
  const tolerance = THREE.MathUtils.clamp(boundaryRect.height * 0.12, 18, 30);
  let proximityTotal = 0;
  let sampleCount = 0;
  let minimumProjection = 1;
  let maximumProjection = 0;

  function measurePoint(point) {
    const projection = ((point.x - guideStart.x) * guideX + (point.y - guideStart.y) * guideY)
      / guideLengthSquared;
    minimumProjection = Math.min(minimumProjection, projection);
    maximumProjection = Math.max(maximumProjection, projection);
    const distance = distanceToSegment(point, guideStart, guideEnd);
    proximityTotal += THREE.MathUtils.clamp(1 - distance / tolerance, 0, 1);
    sampleCount += 1;
  }

  measurePoint(points[0]);
  for (let index = 1; index < points.length; index += 1) {
    const first = points[index - 1];
    const last = points[index];
    const segmentLength = Math.hypot(last.x - first.x, last.y - first.y);
    const steps = Math.max(1, Math.ceil(segmentLength / 8));
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      measurePoint({
        x: THREE.MathUtils.lerp(first.x, last.x, progress),
        y: THREE.MathUtils.lerp(first.y, last.y, progress),
      });
    }
  }

  const proximity = sampleCount > 0 ? proximityTotal / sampleCount : 0;
  const coverage = THREE.MathUtils.clamp(
    Math.min(1, maximumProjection) - Math.max(0, minimumProjection),
    0,
    1,
  );
  return {
    proximity,
    coverage,
    accuracy: proximity * (0.2 + coverage * 0.8),
  };
}

function distanceToSegment(point, start, end) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  const projection = THREE.MathUtils.clamp(
    ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared,
    0,
    1,
  );
  return Math.hypot(
    point.x - (start.x + deltaX * projection),
    point.y - (start.y + deltaY * projection),
  );
}

function evaluateStraightness(points, { containmentRatio = null, traceEvaluation = null } = {}) {
  const first = points[0];
  const last = points[points.length - 1];
  const direction = last.clone().sub(first);
  const directDistance = direction.length();
  if (directDistance < 0.001) {
    return {
      score: 0,
      grade: 'D',
      feedbackKey: traceEvaluation === null ? 'feedbackDestination' : 'feedbackTraceEnd',
      retryRequired: true,
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
  const straightnessScore = (efficiency * 0.55 + alignment * 0.45) * 100;
  const boundaryMultiplier = containmentRatio === null ? 1 : 0.2 + containmentRatio * 0.8;
  const traceMultiplier = traceEvaluation === null ? 1 : 0.12 + traceEvaluation.accuracy * 0.88;
  const weightedScore = Math.round(straightnessScore * boundaryMultiplier * traceMultiplier);
  const boundaryPassed = containmentRatio === null
    || containmentRatio >= MIN_BOUNDARY_PASS_RATIO;
  const boundaryScoreCap = boundaryPassed ? 100 : MIN_PASSING_SCORE - 1;
  const score = Math.min(weightedScore, boundaryScoreCap);
  const tracePassed = traceEvaluation === null || (
    boundaryPassed
    && traceEvaluation.proximity >= 0.72
    && traceEvaluation.coverage >= 0.85
  );
  const retryRequired = score < MIN_PASSING_SCORE || !boundaryPassed || !tracePassed;
  let feedbackKey;

  if (traceEvaluation !== null && !tracePassed) {
    if (!boundaryPassed) {
      feedbackKey = 'feedbackTraceInside';
    } else if (traceEvaluation.proximity < 0.45) {
      feedbackKey = 'feedbackTraceElsewhere';
    } else if (traceEvaluation.coverage < 0.85) {
      feedbackKey = 'feedbackTraceEnd';
    } else {
      feedbackKey = 'feedbackTraceCloser';
    }
  } else if (containmentRatio !== null && !boundaryPassed) {
    if (containmentRatio < 0.25) {
      feedbackKey = 'feedbackMostlyOutside';
    } else if (containmentRatio < 0.8) {
      feedbackKey = 'feedbackPartOutside';
    } else {
      feedbackKey = 'feedbackAlmostInside';
    }
  } else {
    feedbackKey = feedbackKeyForScore(score);
  }

  return {
    score,
    grade: gradeForScore(score),
    feedbackKey,
    retryRequired,
  };
}

function feedbackKeyForScore(score) {
  if (score >= 92) return 'feedbackExcellent';
  if (score >= 80) return 'feedbackGood';
  if (score >= 65) return 'feedbackPromising';
  if (score >= 45) return 'feedbackSearching';
  return 'feedbackDestination';
}

function gradeForScore(score) {
  if (score >= 92) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 45) return 'C';
  return 'D';
}

function resampleScreenPoints(points, count = 24) {
  if (points.length < 2) return points;
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    lengths.push(lengths[index - 1] + Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    ));
  }
  const totalLength = lengths[lengths.length - 1];
  if (totalLength < 0.001) return [points[0], points[points.length - 1]];

  const samples = [];
  let segment = 1;
  for (let sample = 0; sample < count; sample += 1) {
    const target = totalLength * sample / (count - 1);
    while (segment < lengths.length - 1 && lengths[segment] < target) segment += 1;
    const startLength = lengths[segment - 1];
    const segmentLength = Math.max(0.001, lengths[segment] - startLength);
    const progress = (target - startLength) / segmentLength;
    samples.push({
      x: THREE.MathUtils.lerp(points[segment - 1].x, points[segment].x, progress),
      y: THREE.MathUtils.lerp(points[segment - 1].y, points[segment].y, progress),
    });
  }
  return samples;
}

function measureStoryLine(points) {
  const samples = resampleScreenPoints(points);
  const first = samples[0];
  const last = samples[samples.length - 1];
  const directDistance = Math.hypot(last.x - first.x, last.y - first.y);
  let pathLength = 0;
  let squaredDeviation = 0;
  let totalTurn = 0;

  for (let index = 1; index < samples.length; index += 1) {
    pathLength += Math.hypot(
      samples[index].x - samples[index - 1].x,
      samples[index].y - samples[index - 1].y,
    );
  }

  const deltaX = last.x - first.x;
  const deltaY = last.y - first.y;
  const directionLengthSquared = Math.max(1, deltaX * deltaX + deltaY * deltaY);
  samples.forEach((point) => {
    const projection = ((point.x - first.x) * deltaX + (point.y - first.y) * deltaY)
      / directionLengthSquared;
    const nearestX = first.x + deltaX * projection;
    const nearestY = first.y + deltaY * projection;
    squaredDeviation += (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2;
  });

  for (let index = 2; index < samples.length; index += 1) {
    const firstAngle = Math.atan2(
      samples[index - 1].y - samples[index - 2].y,
      samples[index - 1].x - samples[index - 2].x,
    );
    const secondAngle = Math.atan2(
      samples[index].y - samples[index - 1].y,
      samples[index].x - samples[index - 1].x,
    );
    totalTurn += Math.abs(Math.atan2(
      Math.sin(secondAngle - firstAngle),
      Math.cos(secondAngle - firstAngle),
    ));
  }

  const efficiency = THREE.MathUtils.clamp(directDistance / Math.max(1, pathLength), 0, 1);
  const normalizedDeviation = Math.sqrt(squaredDeviation / samples.length)
    / Math.max(1, directDistance);
  const turnRate = totalTurn / Math.max(1, samples.length - 2);
  const bend = THREE.MathUtils.clamp(
    (1 - efficiency) * 2.8 + normalizedDeviation * 6 + turnRate * 0.7,
    0,
    1,
  );
  return { efficiency, normalizedDeviation, turnRate, bend };
}

function recordStoryLine(points, evaluation = null, details = {}) {
  const snapshot = points.map((point) => ({ x: point.x, y: point.y }));
  if (snapshot.length < 2) return;
  storyLines.push({
    points: snapshot,
    score: evaluation?.score ?? null,
    duration: details.duration ?? null,
    containmentRatio: details.containmentRatio ?? null,
    metrics: measureStoryLine(snapshot),
  });
}

function makeStoryGeometry(points) {
  const minimumX = Math.min(...points.map((point) => point.x));
  const maximumX = Math.max(...points.map((point) => point.x));
  const minimumY = Math.min(...points.map((point) => point.y));
  const maximumY = Math.max(...points.map((point) => point.y));
  const sourceWidth = Math.max(1, maximumX - minimumX);
  const sourceHeight = Math.max(1, maximumY - minimumY);
  const scale = Math.min(860 / sourceWidth, 460 / sourceHeight);
  const offsetX = (1000 - sourceWidth * scale) / 2;
  const offsetY = (600 - sourceHeight * scale) / 2;
  const mapped = points.map((point) => ({
    x: offsetX + (point.x - minimumX) * scale,
    y: offsetY + (point.y - minimumY) * scale,
  }));
  const first = mapped[0];
  const last = mapped[mapped.length - 1];
  const deltaX = last.x - first.x;
  const deltaY = last.y - first.y;
  const lengthSquared = Math.max(1, deltaX * deltaX + deltaY * deltaY);
  let maximumDeviation = { distance: 0, point: first };

  mapped.forEach((point) => {
    const projection = THREE.MathUtils.clamp(
      ((point.x - first.x) * deltaX + (point.y - first.y) * deltaY) / lengthSquared,
      0,
      1,
    );
    const nearest = {
      x: first.x + deltaX * projection,
      y: first.y + deltaY * projection,
    };
    const distance = Math.hypot(point.x - nearest.x, point.y - nearest.y);
    if (distance > maximumDeviation.distance) maximumDeviation = { distance, point };
  });

  return {
    path: mapped.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' '),
    idealPath: `M${first.x.toFixed(1)} ${first.y.toFixed(1)} L${last.x.toFixed(1)} ${last.y.toFixed(1)}`,
    maximumDeviation,
  };
}

function updateDetailCalloutArrow() {
  const pointX = Number.parseFloat(storyDeviationDot.getAttribute('cx'));
  const pointY = Number.parseFloat(storyDeviationDot.getAttribute('cy'));
  if (!Number.isFinite(pointX) || !Number.isFinite(pointY)) return;

  const stageBounds = detailStage.getBoundingClientRect();
  const calloutBounds = detailCallout.getBoundingClientRect();
  if (!stageBounds.width || !stageBounds.height) return;

  const originX = calloutBounds.left - stageBounds.left + 15;
  const originY = calloutBounds.bottom - stageBounds.top;
  const targetX = pointX / 1000 * stageBounds.width;
  const targetY = pointY / 600 * stageBounds.height;
  const deltaX = targetX - originX;
  const deltaY = targetY - originY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < 1) return;

  const directionX = deltaX / distance;
  const directionY = deltaY / distance;
  const normalX = -directionY;
  const normalY = directionX;
  const arrowGap = 30;
  const endX = targetX - directionX * arrowGap;
  const endY = targetY - directionY * arrowGap;
  const routeX = endX - originX;
  const routeY = endY - originY;
  const points = [
    { x: originX, y: originY },
    { x: originX + routeX * 0.24 + normalX * 16, y: originY + routeY * 0.24 + normalY * 16 },
    { x: originX + routeX * 0.5 - normalX * 20, y: originY + routeY * 0.5 - normalY * 20 },
    { x: originX + routeX * 0.76 + normalX * 10, y: originY + routeY * 0.76 + normalY * 10 },
    { x: endX, y: endY },
  ];

  let path = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[Math.min(points.length - 1, index + 2)];
    const controlOneX = current.x + (next.x - previous.x) / 6;
    const controlOneY = current.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (afterNext.x - current.x) / 6;
    const controlTwoY = next.y - (afterNext.y - current.y) / 6;
    path += ` C${controlOneX.toFixed(1)} ${controlOneY.toFixed(1)}`
      + ` ${controlTwoX.toFixed(1)} ${controlTwoY.toFixed(1)}`
      + ` ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  detailCalloutArrow.setAttribute('viewBox', `0 0 ${stageBounds.width} ${stageBounds.height}`);
  detailCalloutArrowPath.setAttribute('d', path);
}

function chooseStoryNarrative() {
  const firstScore = storyLines[0]?.score ?? 0;
  let closerTitle = 'closerSearchingTitle';
  let closerCopy = 'closerSearchingCopy';
  if (firstScore >= 92) {
    closerTitle = 'closerPreciseTitle';
    closerCopy = 'closerPreciseCopy';
  } else if (firstScore >= 80) {
    closerTitle = 'closerSteadyTitle';
    closerCopy = 'closerSteadyCopy';
  }

  const bends = storyLines.slice(0, 4).map((line) => line.metrics.bend);
  let attemptsCopy = 'attemptsEvolvingCopy';
  if (bends.length === 4) {
    let differenceTotal = 0;
    let comparisons = 0;
    for (let first = 0; first < bends.length; first += 1) {
      for (let second = first + 1; second < bends.length; second += 1) {
        differenceTotal += Math.abs(bends[first] - bends[second]);
        comparisons += 1;
      }
    }
    const averageDifference = differenceTotal / comparisons;
    attemptsCopy = averageDifference < 0.11
      ? 'attemptsConsistentCopy'
      : averageDifference > 0.28
        ? 'attemptsVariedCopy'
        : 'attemptsEvolvingCopy';
  }

  const finalLine = storyLines[3];
  const containment = finalLine?.containmentRatio ?? finalContainmentRatio ?? 0;
  const duration = finalLine?.duration ?? 0;
  const bend = finalLine?.metrics.bend ?? 0;
  let turnTitle;
  let turnCopy;
  if (containment >= 0.95) {
    if (bend < 0.18) {
      turnTitle = 'turnInsideRepeatTitle';
      turnCopy = 'turnInsideRepeatCopy';
    } else if (duration >= 4500) {
      turnTitle = 'turnInsidePatientTitle';
      turnCopy = 'turnInsidePatientCopy';
    } else {
      turnTitle = 'turnInsideBendTitle';
      turnCopy = 'turnInsideBendCopy';
    }
  } else if (containment <= 0.05) {
    turnTitle = 'turnOutsideTitle';
    turnCopy = 'turnOutsideCopy';
  } else {
    turnTitle = 'turnCrossingTitle';
    turnCopy = 'turnCrossingCopy';
  }

  return { closerTitle, closerCopy, attemptsCopy, turnTitle, turnCopy };
}

function updateStoryArtifacts() {
  storyLines.slice(0, 4).forEach((line, index) => {
    const geometry = makeStoryGeometry(line.points);
    document.querySelectorAll(`[data-story-line="${index}"]`).forEach((path) => {
      path.setAttribute('d', geometry.path);
      const length = Math.ceil(path.getTotalLength());
      path.style.setProperty('--path-length', length);
    });
    document.querySelectorAll(`[data-story-ideal="${index}"]`).forEach((path) => {
      path.setAttribute('d', geometry.idealPath);
    });
    document.querySelectorAll(`[data-story-score="${index}"]`).forEach((label) => {
      label.textContent = line.score === null ? '—' : String(line.score);
    });

    if (index === 0) {
      storyFirstScore.textContent = line.score ?? '—';
      storyDeviationDot.setAttribute('cx', geometry.maximumDeviation.point.x.toFixed(1));
      storyDeviationDot.setAttribute('cy', geometry.maximumDeviation.point.y.toFixed(1));
      updateDetailCalloutArrow();
      storyDeviationValue = Math.max(1, Math.round(geometry.maximumDeviation.distance / 3));
      storyDeviationLabel.textContent = formatTranslation('deviation', { value: storyDeviationValue });
    }
  });

  storyNarrativeKeys = chooseStoryNarrative();
  renderStoryNarrative();
  updatePortraitDate();
}

function joinByteArrays(chunks) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const joined = new Uint8Array(length);
  let offset = 0;
  chunks.forEach((chunk) => {
    joined.set(chunk, offset);
    offset += chunk.length;
  });
  return joined;
}

function makeVectorPrintPdf(paths, background) {
  const encoder = new TextEncoder();
  const ascii = (value) => encoder.encode(value);
  const header = new Uint8Array([
    ...ascii('%PDF-1.4\n%'), 0xe2, 0xe3, 0xcf, 0xd3, ...ascii('\n'),
  ]);
  const backgroundCommand = `${background.map((value) => value.toFixed(4)).join(' ')} rg\n`
    + `0 0 ${A3_WIDTH_POINTS} ${A3_HEIGHT_POINTS} re f\n`;
  const lineCommands = paths.map((path) => {
    const colorCommand = `${path.color.map((value) => value.toFixed(4)).join(' ')} RG`;
    const [first, ...rest] = path.points;
    const pointCommands = [
      `${first.x.toFixed(2)} ${first.y.toFixed(2)} m`,
      ...rest.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)} l`),
    ].join('\n');
    return `${colorCommand}\n${path.width.toFixed(2)} w\n${pointCommands}\nS`;
  }).join('\n');
  const content = ascii(`${backgroundCommand}1 J\n1 j\n${lineCommands}\n`);
  const objects = [
    ascii('<< /Type /Catalog /Pages 2 0 R >>'),
    ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A3_WIDTH_POINTS} ${A3_HEIGHT_POINTS}] /Resources << >> /Contents 4 0 R >>`),
    joinByteArrays([
      ascii(`<< /Length ${content.length} >>\nstream\n`),
      content,
      ascii('endstream'),
    ]),
  ];
  const chunks = [header];
  const offsets = [0];
  let byteOffset = header.length;

  objects.forEach((object, index) => {
    const wrapped = joinByteArrays([
      ascii(`${index + 1} 0 obj\n`),
      object,
      ascii('\nendobj\n'),
    ]);
    offsets.push(byteOffset);
    chunks.push(wrapped);
    byteOffset += wrapped.length;
  });

  const xrefOffset = byteOffset;
  const xrefRows = offsets.slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  chunks.push(ascii(
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xrefRows}`
    + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
    + `startxref\n${xrefOffset}\n%%EOF\n`,
  ));
  return new Blob(chunks, { type: 'application/pdf' });
}

function colorToSrgbComponents(color) {
  const srgb = color.clone().convertLinearToSRGB();
  return [srgb.r, srgb.g, srgb.b];
}

function createVectorPrintArtwork() {
  scene.updateMatrixWorld(true);
  const printCamera = new THREE.PerspectiveCamera(
    42,
    A3_WIDTH_POINTS / A3_HEIGHT_POINTS,
    0.1,
    180,
  );
  printCamera.position.set(5.5, 1.4, 28);
  printCamera.lookAt(controls.target);
  printCamera.updateProjectionMatrix();
  printCamera.updateMatrixWorld(true);
  const projectedPaths = [];
  let minimumX = Infinity;
  let minimumY = Infinity;
  let maximumX = -Infinity;
  let maximumY = -Infinity;

  freeLines.forEach((line, index) => {
    line.updateWorldMatrix(true, false);
    const points = line.userData.positions.map((point) => {
      const projected = point.clone().applyMatrix4(line.matrixWorld).project(printCamera);
      minimumX = Math.min(minimumX, projected.x);
      minimumY = Math.min(minimumY, projected.y);
      maximumX = Math.max(maximumX, projected.x);
      maximumY = Math.max(maximumY, projected.y);
      return projected;
    });
    projectedPaths.push({
      points,
      color: colorToSrgbComponents(line.material.color),
      opacity: THREE.MathUtils.clamp(line.material.opacity * 1.8, 0.34, 1),
      width: index === 0 ? 0.9 : 0.68,
    });
  });

  const centerX = (minimumX + maximumX) / 2;
  const centerY = (minimumY + maximumY) / 2;
  const sourceWidth = Math.max(0.001, maximumX - minimumX);
  const sourceHeight = Math.max(0.001, maximumY - minimumY);
  const scale = Math.min(
    A3_WIDTH_POINTS * 0.78 / sourceWidth,
    A3_HEIGHT_POINTS * 0.68 / sourceHeight,
  );
  const background = colorToSrgbComponents(scene.background);
  const paths = projectedPaths.map((path) => ({
    width: path.width,
    color: path.color.map((value, channel) => THREE.MathUtils.lerp(
      background[channel],
      value,
      path.opacity,
    )),
    points: path.points.map((point) => ({
      x: A3_WIDTH_POINTS / 2 + (point.x - centerX) * scale,
      y: A3_HEIGHT_POINTS / 2 + (point.y - centerY) * scale,
    })),
  }));

  return { paths, background };
}

async function exportPrintPdf() {
  if (!isFree || !freeLines.length) return;
  printButtons.forEach((button) => {
    button.disabled = true;
    button.dataset.label = button.textContent;
    button.textContent = t('printSettling');
  });

  try {
    const remainingSettleTime = Math.max(
      0,
      freeStateStartedAt + PRINT_SCENE_SETTLE_MS - performance.now(),
    );
    if (remainingSettleTime > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remainingSettleTime));
    }
    if (!isFree || !freeLines.length) return;
    printButtons.forEach((button) => {
      button.textContent = t('printPreparing');
    });
    const artwork = createVectorPrintArtwork();
    const pdf = makeVectorPrintPdf(artwork.paths, artwork.background);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString()
      .slice(0, 19)
      .replaceAll(':', '')
      .replace('T', '-');
    link.href = URL.createObjectURL(pdf);
    link.download = `the-ways-we-bend-${timestamp}-a3.pdf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    document.body.dataset.printResolution = 'vector-a3';
  } catch (error) {
    console.error('The print PDF could not be created.', error);
    window.alert(t('printError'));
  } finally {
    printButtons.forEach((button) => {
      button.disabled = false;
      button.textContent = button.dataset.label || t('printFallback');
      delete button.dataset.label;
    });
  }
}

function showVerdict(evaluation) {
  verdictGrade.textContent = evaluation.grade;
  verdictScore.textContent = `${evaluation.score} / 100`;
  activeFeedbackKey = evaluation.feedbackKey;
  verdictCopy.textContent = t(activeFeedbackKey);
  verdict.classList.remove('is-visible');
  void verdict.offsetWidth;
  verdict.classList.add('is-visible');
  setMode(evaluation.retryRequired ? 'modeRetry' : 'modeAccepted');
}

function recordFinalLinePlacement() {
  finalContainmentRatio = evaluateBoundaryContainment(currentScreenPoints);
  document.body.dataset.finalLineContainment = finalContainmentRatio.toFixed(3);
  document.body.dataset.finalLinePlacement = finalContainmentRatio >= 0.95
    ? 'inside'
    : finalContainmentRatio <= 0.05
      ? 'outside'
      : 'crossing';
}

function prepareNextTrial() {
  isBusy = false;
  setStep(trial + 1);
  setDrawingBoundaryVisible(trial >= 1, trial === 2);
  setInstruction(...TRIAL_PROMPTS[trial]);
  setMode(trial === 3 ? 'modeShifting' : 'modeWaiting');
}

function liberateCurrentLine() {
  isBusy = true;
  instruction.classList.remove('is-visible');
  setDrawingBoundaryVisible(false);
  verdict.classList.remove('is-visible');
  recordStoryLine(currentScreenPoints, null, {
    duration: performance.now() - currentDrawStartedAt,
    containmentRatio: finalContainmentRatio,
  });
  const source = resamplePoints(currentPoints, 64);
  drawGroup.remove(currentLine);
  currentLine.geometry.dispose();
  currentLine.material.dispose();
  currentLine = null;

  const palette = createLinePalette(ACTIVE_LINE_COLOR);
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

    const center = new THREE.Box3()
      .setFromPoints(positions)
      .getCenter(new THREE.Vector3());
    const centeredPositions = positions.map((point) => point.clone().sub(center));
    const geometry = createLineGeometry(centeredPositions);
    const material = new LineMaterial({
      color: palette[index % palette.length],
      linewidth: DRAWING_LINE_WIDTH,
      transparent: true,
      opacity: index === 0 ? 1 : 0,
    });
    const line = new Line2(geometry, material);
    line.position.copy(center);
    line.scale.setScalar(MIN_FREE_LINE_SCALE);
    const driftDirection = new THREE.Vector3(
      Math.cos(seed * 1.13),
      Math.sin(seed * 0.91) * 0.65,
      Math.sin(seed * 1.47) * 0.8,
    ).normalize();
    const crossDirection = new THREE.Vector3(
      -driftDirection.y,
      driftDirection.x,
      Math.cos(seed * 0.77) * 0.4,
    ).normalize();
    line.userData = {
      positions: centeredPositions,
      basePosition: center.clone(),
      driftDirection,
      crossDirection,
      driftAmplitude: 0.45 + spread * 0.85,
      driftSpeed: 0.00017 + (index % 5) * 0.000026,
      seed,
      spread,
      targetScale,
      targetOpacity,
      lengthScale: MIN_FREE_LINE_SCALE,
    };
    freeLines.push(line);
    freeGroup.add(line);
  }

  const startedAt = performance.now();
  animations.push((time) => {
    const raw = Math.min(1, (time - startedAt) / LIBERATION_DURATION_MS);
    const transitionMix = THREE.MathUtils.smootherstep(raw, 0, 1);
    freeMix = transitionMix;
    scene.background.lerpColors(
      new THREE.Color(COLORS.paper),
      new THREE.Color(COLORS.finalPaper),
      transitionMix,
    );
    scene.fog.color.copy(scene.background);

    freeLines.forEach((line, index) => {
      const delay = Math.min(1, Math.max(0, raw * 1.45 - index * 0.012));
      const lengthMix = THREE.MathUtils.smoothstep(delay, 0, 1);
      line.userData.lengthScale = THREE.MathUtils.lerp(
        MIN_FREE_LINE_SCALE,
        line.userData.targetScale,
        lengthMix,
      );
      line.scale.setScalar(line.userData.lengthScale);
      line.material.opacity = delay * line.userData.targetOpacity;
      line.material.linewidth = THREE.MathUtils.lerp(
        DRAWING_LINE_WIDTH,
        FREE_LINE_WIDTH,
        transitionMix,
      );
    });

    acceptedLines.forEach((line, index) => {
      line.material.opacity = THREE.MathUtils.lerp(1, 0, transitionMix);
      line.position.y = THREE.MathUtils.lerp(0, 3.4 + index * 1.1, transitionMix);
      line.position.x = THREE.MathUtils.lerp(0, index === 0 ? -1.4 : 1.2, transitionMix);
      line.rotation.z = THREE.MathUtils.lerp(
        0,
        index === 0 ? -0.08 : 0.1,
        transitionMix,
      );
    });

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
  setDrawingBoundaryVisible(false);
  finale.classList.remove('is-condensed');
  finale.classList.add('is-visible');
  window.clearTimeout(finaleCondenseTimer);
  finaleCondenseTimer = window.setTimeout(() => {
    finale.classList.add('is-condensed');
  }, 5000);
  document.body.classList.add('is-free');
  updateStoryArtifacts();
  setMode('modeFree');
  document.querySelector('.desktop-help').textContent = t('desktopHelpFree');
  setStep(4);
  controls.enabled = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0;
  freeStateStartedAt = performance.now();
}

function restart() {
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.clearTimeout(finaleCondenseTimer);
  finaleCondenseTimer = null;
  pencilAudio.end();
  for (const object of [...acceptedLines, ...freeLines]) {
    object.geometry.dispose();
    object.material.dispose();
    object.parent?.remove(object);
  }
  acceptedLines.length = 0;
  freeLines.length = 0;
  storyLines.length = 0;
  activeFeedbackKey = null;
  storyDeviationValue = null;
  storyNarrativeKeys = {
    closerTitle: 'closerTitle',
    closerCopy: 'closerCopy',
    attemptsCopy: 'attemptsCopy',
    turnTitle: 'turnTitle',
    turnCopy: 'turnCopy',
  };
  animations.length = 0;
  drawGroup.clear();
  freeGroup.clear();

  trial = 0;
  isDrawing = false;
  isBusy = false;
  isFree = false;
  freeMix = 0;
  freeStateStartedAt = null;
  currentLine = null;
  currentPoints = [];
  currentScreenPoints = [];
  currentDrawStartedAt = null;
  traceGuideConfig = null;
  finalContainmentRatio = null;
  delete document.body.dataset.finalLineContainment;
  delete document.body.dataset.finalLinePlacement;
  controls.enabled = false;
  controls.autoRotate = false;
  camera.position.set(0, 0, 28);
  camera.lookAt(0, 0, 0);
  scene.background.set(COLORS.paper);
  scene.fog.color.set(COLORS.paper);
  document.body.classList.remove('is-free', 'is-story-reading');
  document.body.classList.add('is-started');
  finale.classList.remove('is-visible', 'is-condensed');
  instruction.classList.add('is-visible');
  setDrawingBoundaryVisible(false);
  setInstruction('instructionFirst', 'hintFirst');
  setMode('modeWaiting');
  document.querySelector('.desktop-help').textContent = t('desktopHelp');
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
  soundButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(audioOn));
    if (!button.hasAttribute('data-compact-control')) {
      button.textContent = t(audioOn ? 'soundOn' : 'soundOff');
    }
    button.setAttribute('aria-label', t(audioOn ? 'soundOn' : 'soundOff'));
  });
  audio.volume = 0.28;
  if (audioOn) {
    try {
      await Promise.all([
        audio.play(),
        pencilAudio.setEnabled(true),
      ]);
    } catch {
      audioOn = false;
      soundButtons.forEach((button) => {
        button.setAttribute('aria-pressed', 'false');
        if (!button.hasAttribute('data-compact-control')) button.textContent = t('soundOff');
        button.setAttribute('aria-label', t('soundOff'));
      });
      audio.pause();
      pencilAudio.setEnabled(false);
    }
  } else {
    audio.pause();
    pencilAudio.setEnabled(false);
  }
}

function animate(time) {
  const delta = Math.min(0.05, (time - lastTime) / 1000);
  lastTime = time;

  for (let index = animations.length - 1; index >= 0; index -= 1) {
    if (!animations[index](time)) animations.splice(index, 1);
  }

  if (isFree) {
    const cameraMotionMix = THREE.MathUtils.smootherstep(
      Math.min(1, (time - freeStateStartedAt) / CAMERA_MOTION_RAMP_MS),
      0,
      1,
    );
    controls.autoRotateSpeed = CAMERA_AUTO_ROTATE_SPEED * cameraMotionMix;
    freeLines.forEach((line, lineIndex) => {
      line.userData.lengthScale += delta * FREE_LINE_GROWTH_PER_SECOND;
      line.scale.setScalar(line.userData.lengthScale);
      const driftPhase = time * line.userData.driftSpeed + line.userData.seed;
      line.position
        .copy(line.userData.basePosition)
        .addScaledVector(
          line.userData.driftDirection,
          Math.sin(driftPhase) * line.userData.driftAmplitude,
        )
        .addScaledVector(
          line.userData.crossDirection,
          Math.cos(driftPhase * 0.67) * line.userData.driftAmplitude * 0.55,
        );
      line.rotation.x = Math.sin(driftPhase * 0.73) * (0.035 + line.userData.spread * 0.055);
      line.rotation.y = Math.cos(driftPhase * 0.61) * (0.05 + line.userData.spread * 0.07);
      line.rotation.z = Math.sin(driftPhase * 0.89) * (0.025 + line.userData.spread * 0.045);
      const originals = line.userData.positions;
      const positions = new Float32Array(originals.length * 3);
      for (let index = 0; index < originals.length; index += 1) {
        const original = originals[index];
        const phase = time * .00035 + line.userData.seed + index * .085;
        positions[index * 3] = original.x + Math.sin(phase * 1.1) * .06 * line.userData.spread;
        positions[index * 3 + 1] = original.y + Math.cos(phase * 1.4) * .05 * line.userData.spread;
        positions[index * 3 + 2] = original.z + Math.sin(phase + lineIndex * .17) * .08;
      }
      line.geometry.setPositions(positions);
    });
    controls.update();
  }

  renderer.render(scene, camera);
}

const storyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('is-in-view', entry.isIntersecting);
  });
}, { threshold: 0.28 });

document.querySelectorAll('[data-story-scene]').forEach((panel) => storyObserver.observe(panel));

function updateStoryProgress() {
  if (!document.body.classList.contains('is-free')) return;
  const story = document.querySelector('#story');
  const storyTop = story.getBoundingClientRect().top;
  const start = window.scrollY + storyTop;
  const distance = Math.max(1, story.scrollHeight - window.innerHeight);
  const progress = THREE.MathUtils.clamp((window.scrollY - start) / distance, 0, 1);
  storyProgress.style.width = `${progress * 100}%`;
  document.body.classList.toggle('is-story-reading', storyTop <= 0);
}

startButton.addEventListener('click', beginExperience);
restartButton.addEventListener('click', restart);
returnToSceneLink.addEventListener('click', returnToScene);
restartExperienceLink.addEventListener('click', restartFromStory);
soundButtons.forEach((button) => button.addEventListener('click', toggleSound));
printButtons.forEach((button) => button.addEventListener('click', exportPrintPdf));
renderer.domElement.addEventListener('pointerdown', beginLine);
renderer.domElement.addEventListener('pointermove', extendLine);
renderer.domElement.addEventListener('pointerup', finishLine);
renderer.domElement.addEventListener('pointercancel', finishLine);
window.addEventListener('resize', resize);
window.addEventListener('scroll', updateStoryProgress, { passive: true });

resize();
applyCopy();
renderer.setAnimationLoop(animate);
