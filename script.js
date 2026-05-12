document.addEventListener('DOMContentLoaded', function() {

var isPreview = window.location.search.indexOf('preview=1') !== -1;

var dial = document.getElementById('dial');
var dialImg = dial.querySelector('img');
var busy = false;
var currentAngle = 0;
var dragging = false;
var startAngle = 0;
var startRotation = 0;

// ── Base transform — reads from CSS so it works with any left/top ──
var BASE_TRANSFORM = 'translate(-50%, -50%)';

var isReturn = window.location.search.indexOf('return=1') !== -1;

// Clear the return param from URL so a refresh starts fresh
if (isReturn) {
  var cleanUrl = window.location.pathname;
  window.history.replaceState({}, '', cleanUrl);
}
var questionMode = true;
var LETTERS = {
  1: 'Y', 2: 'E', 3: 'S',
  4: '',
  5: 'O', 6: 'R',
  7: '',
  8: 'N', 9: 'O', 10: '?'
};
var yesSequence = [1, 2, 3];
var noSequence = [8, 9];
var currentYesIndex = 0;
var currentNoIndex = 0;

var HOLES = [
  { section:  1, fx: 0.669, fy: 0.229 },
  { section:  2, fx: 0.569, fy: 0.153 },
  { section:  3, fx: 0.454, fy: 0.142 },
  { section:  4, fx: 0.350, fy: 0.203 },
  { section:  5, fx: 0.272, fy: 0.320 },
  { section:  6, fx: 0.238, fy: 0.476 },
  { section:  7, fx: 0.255, fy: 0.638 },
  { section:  8, fx: 0.322, fy: 0.774 },
  { section:  9, fx: 0.426, fy: 0.855 },
  { section: 10, fx: 0.545, fy: 0.866 },
];

var ROTATIONS = {
  1: 32, 2: 58, 3: 85, 4: 110, 5: 138,
  6: 168, 7: 200, 8: 232, 9: 262, 10: 290
};

function positionHoles() {
  var w = dialImg.offsetWidth;
  var h = dialImg.offsetHeight;
  if (w === 0 || h === 0) return;
  var circleSize = w * 0.1;
  var holes = document.querySelectorAll('.hole');
  holes.forEach(function(el) {
    var s = parseInt(el.dataset.section);
    var data = HOLES.find(function(d) { return d.section === s; });
    if (!data) return;
    el.style.left = (data.fx * w) + 'px';
    el.style.top = (data.fy * h) + 'px';
    el.style.width = circleSize + 'px';
    el.style.height = circleSize + 'px';
  });

  var nav = document.querySelector('.bottom-nav');
  if (nav) {
    var centerSize = w * 0.24;
    nav.style.position = 'absolute';
    nav.style.left = (0.500 * w) + 'px';
    nav.style.top = (0.493 * h) + 'px';
    nav.style.transform = 'translate(-50%, -50%)';
    nav.style.width = centerSize + 'px';
    nav.style.height = centerSize + 'px';
  }
}

dialImg.addEventListener('load', positionHoles);
window.addEventListener('resize', positionHoles);
if (dialImg.complete) positionHoles();

function setupLetters() {
  var holes = document.querySelectorAll('.hole');
  holes.forEach(function(hole) {
    var section = parseInt(hole.dataset.section);
    var letter = LETTERS[section] || '';
    var span = hole.querySelector('.hole-letter');
    if (span) {
      span.textContent = letter;
    }
    if (letter) {
      hole.classList.add('letter-active');
    }
  });
}

if (questionMode) setupLetters();

if (isPreview) return;

var holeColors = [
  'rgba(40, 22, 12, 0.9)', 'rgba(40, 22, 12, 0.9)',
  'rgba(40, 22, 12, 0.9)', 'rgba(40, 22, 12, 0.9)',
  'rgba(40, 22, 12, 0.9)', 'rgba(40, 22, 12, 0.9)',
  'rgba(40, 22, 12, 0.9)', 'rgba(40, 22, 12, 0.9)',
  'rgba(40, 22, 12, 0.9)', 'rgba(40, 22, 12, 0.9)'
];

var holeColorsHover = [
  'rgba(200, 180, 60, 0.6)', 'rgba(200, 180, 60, 0.6)',
  'rgba(200, 180, 60, 0.6)', 'rgba(200, 180, 60, 0.6)',
  'rgba(200, 180, 60, 0.6)', 'rgba(200, 180, 60, 0.6)',
  'rgba(200, 180, 60, 0.6)', 'rgba(200, 180, 60, 0.6)',
  'rgba(200, 180, 60, 0.6)', 'rgba(200, 180, 60, 0.6)'
];

var allHoles = document.querySelectorAll('.hole');
allHoles.forEach(function(hole, i) {
  var color = holeColors[i];
  var colorHover = holeColorsHover[i];
  hole.style.boxShadow = 'inset 0 0 60px 35px ' + color;
  hole.addEventListener('mouseenter', function() {
    hole.style.boxShadow = 'inset 0 0 70px 40px ' + colorHover;
  });
  hole.addEventListener('mouseleave', function() {
    hole.style.boxShadow = 'inset 0 0 60px 35px ' + color;
  });
});

function rotaryDial(num, callback) {
  if (busy) return;
  busy = true;
  initAudio();
  var rot = ROTATIONS[num];

  tick(1100, 0.025);

  var forwardTime = 0.35 + (rot / 360) * 0.8;
  dial.style.transition = 'transform ' + forwardTime + 's cubic-bezier(0.22, 0.03, 0.35, 1)';
  dial.style.transform = BASE_TRANSFORM + ' rotate(' + rot + 'deg)';

  var numTicks = Math.ceil(rot / 28);
  for (var i = 0; i < numTicks; i++) {
    (function(i) { setTimeout(function() { tick(650 + Math.random() * 450, 0.015); }, (forwardTime * 1000 / numTicks) * i); })(i);
  }

  setTimeout(function() {
    tick(350, 0.07);

    var returnTime = 0.3 + (rot / 360) * 0.65;
    dial.style.transition = 'transform ' + returnTime + 's cubic-bezier(0.08, 0.5, 0.25, 1)';
    dial.style.transform = BASE_TRANSFORM + ' rotate(0deg)';

    var returnTicks = Math.ceil(rot / 18);
    for (var j = 0; j < returnTicks; j++) {
      (function(j) { setTimeout(function() { tick(300 + Math.random() * 350, 0.008); }, (returnTime * 1000 / returnTicks) * j); })(j);
    }

    setTimeout(function() {
      currentAngle = 0;
      busy = false;
      if (callback) callback();
    }, returnTime * 1000 + 100);
  }, forwardTime * 1000 + 200);
}

function handleLetterClick(section) {
  if (!questionMode || busy) return;

  var expectedYes = yesSequence[currentYesIndex];
  var expectedNo = noSequence[currentNoIndex];

  if (section === expectedYes) {
    var hole = document.querySelector('.hole[data-section="' + section + '"]');
    hole.classList.add('letter-clicked');

    rotaryDial(section, function() {
      currentYesIndex++;
      resetNoProgress();

      if (currentYesIndex >= yesSequence.length) {
        onYesComplete();
      }
    });
    return;
  }

  if (section === expectedNo) {
    var hole = document.querySelector('.hole[data-section="' + section + '"]');
    hole.classList.add('letter-clicked');

    rotaryDial(section, function() {
      currentNoIndex++;
      resetYesProgress();

      if (currentNoIndex >= noSequence.length) {
        onNoComplete();
      }
    });
    return;
  }

  var hole = document.querySelector('.hole[data-section="' + section + '"]');
  if (LETTERS[section]) {
    hole.classList.add('letter-wrong');
    setTimeout(function() { hole.classList.remove('letter-wrong'); }, 600);
  }
}

function resetYesProgress() {
  currentYesIndex = 0;
  yesSequence.forEach(function(s) {
    var h = document.querySelector('.hole[data-section="' + s + '"]');
    if (h) h.classList.remove('letter-clicked');
  });
}

function resetNoProgress() {
  currentNoIndex = 0;
  noSequence.forEach(function(s) {
    var h = document.querySelector('.hole[data-section="' + s + '"]');
    if (h) h.classList.remove('letter-clicked');
  });
}

function onYesComplete() {
  if (isReturn) {
    // Return mode — unlock dial to pick next section
    questionMode = false;
    var question = document.getElementById('center-question');
    if (question) {
      question.classList.add('fade-out');
      setTimeout(function() { question.remove(); }, 800);
    }
    var holes = document.querySelectorAll('.hole');
    holes.forEach(function(hole) {
      hole.classList.remove('letter-active', 'letter-clicked');
      hole.style.boxShadow = 'inset 0 0 60px 35px rgba(40, 22, 12, 0.9)';
      var span = hole.querySelector('.hole-letter');
      if (span) {
        var section = parseInt(hole.dataset.section);
        span.textContent = section;
        span.classList.remove('flip-h');
        span.classList.add('unlocked');
        span.style.color = '';
      }
    });
    try {
      var lastVisited = localStorage.getItem('lastVisitedSection');
      if (lastVisited) {
        var lastHole = document.querySelector('.hole[data-section="' + lastVisited + '"]');
        if (lastHole) lastHole.classList.add('hole-visited');
      }
    } catch(e) {}

    var navStack = document.querySelector('.nav-stack');
    if (navStack) {
      var pickText = document.createElement('div');
      pickText.className = 'center-question';
      pickText.id = 'center-question';
      pickText.innerHTML = 'Wander<br>the ruins';
      pickText.style.opacity = '0';
      pickText.style.fontSize = '2.3vw';
      pickText.style.fontFamily = '"DaVinci", cursive';
      navStack.appendChild(pickText);
      setTimeout(function() { pickText.style.opacity = '1'; }, 900);
    }

    bindNormalClicks();
  } else {
    // First visit — go directly to section 1
    setTimeout(function() {
      window.location.href = '1/index.html';
    }, 500);
  }
}

function onNoComplete() {
  // Fade the dial away, stay on page
  var question = document.getElementById('center-question');
  if (question) {
    question.classList.add('fade-out');
  }
  dial.style.transition = 'opacity 2s ease, filter 2s ease';
  dial.style.opacity = '0';
  dial.style.filter = 'blur(10px)';
}

var areYouSureMode = false;

// ── Cursor smoke ──
var mouseMoveCounter = 0;
var maxSmoke = 15;
var colors = [
  'rgba(255, 80, 0, 0.7)',
  'rgba(255, 140, 0, 0.6)',
  'rgba(200, 50, 0, 0.7)',
  'rgba(255, 200, 50, 0.5)',
  'rgba(120, 30, 0, 0.6)',
  'rgba(80, 20, 0, 0.5)',
  'rgba(60, 60, 60, 0.4)'
];

function createSmoke(x, y) {
  var smoke = document.createElement('div');
  smoke.className = 'smoke';
  var size = 50 + Math.random() * 70;
  smoke.style.width = size + 'px';
  smoke.style.height = size + 'px';
  var color = colors[Math.floor(Math.random() * colors.length)];
  smoke.style.background = 'radial-gradient(circle, ' + color + ' 0%, transparent 70%)';
  var offsetX = (Math.random() - 0.5) * 20;
  var offsetY = (Math.random() - 0.5) * 20;
  smoke.style.left = (x + offsetX) + 'px';
  smoke.style.top = (y + offsetY) + 'px';
  document.body.appendChild(smoke);
  setTimeout(function() {
    smoke.style.transition = 'opacity 1.5s, transform 1.5s, filter 1.5s';
    smoke.style.opacity = '0';
    smoke.style.transform = 'translateY(-30px) scale(2)';
    smoke.style.filter = 'blur(20px)';
    setTimeout(function() { if (smoke.parentNode) smoke.remove(); }, 1500);
  }, 50);
  var allSmoke = document.querySelectorAll('.smoke');
  if (allSmoke.length > maxSmoke) allSmoke[0].remove();
}

document.addEventListener('mousemove', function(e) {
  mouseMoveCounter++;
  if (mouseMoveCounter % 3 === 0) createSmoke(e.clientX + window.scrollX, e.clientY + window.scrollY);
});

// ── Wiggle on hover ──
var wiggling = false;
dial.addEventListener('mouseenter', function() {
  if (busy || wiggling || isPreview) return;
  wiggling = true;
  dial.style.transition = 'transform 0.15s ease';
  dial.style.transform = BASE_TRANSFORM + ' rotate(3deg)';
  setTimeout(function() { dial.style.transform = BASE_TRANSFORM + ' rotate(-3deg)'; }, 150);
  setTimeout(function() { dial.style.transform = BASE_TRANSFORM + ' rotate(2deg)'; }, 300);
  setTimeout(function() { dial.style.transform = BASE_TRANSFORM + ' rotate(-1deg)'; }, 450);
  setTimeout(function() {
    dial.style.transition = 'transform 0.2s ease';
    dial.style.transform = BASE_TRANSFORM + ' rotate(0deg)';
    currentAngle = 0;
    wiggling = false;
  }, 600);
});

// ── Drag to rotate ──
function getAngleFromCenter(e) {
  var rect = dial.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var x = (e.clientX || e.touches[0].clientX) - cx;
  var y = (e.clientY || e.touches[0].clientY) - cy;
  return Math.atan2(y, x) * (180 / Math.PI);
}

function onDragStart(e) {
  if (busy) return;
  e.preventDefault();
  dragging = true;
  startAngle = getAngleFromCenter(e);
  startRotation = currentAngle;
  dial.style.transition = 'none';
}
function onDragMove(e) {
  if (!dragging) return;
  e.preventDefault();
  var angle = getAngleFromCenter(e);
  var delta = angle - startAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  currentAngle = startRotation + delta;
  dial.style.transform = BASE_TRANSFORM + ' rotate(' + currentAngle + 'deg)';
}
function onDragEnd(e) {
  if (!dragging) return;
  dragging = false;
  dial.style.transition = 'transform 0.6s cubic-bezier(0.08, 0.5, 0.25, 1)';
  dial.style.transform = BASE_TRANSFORM + ' rotate(0deg)';
  currentAngle = 0;
}

dial.addEventListener('mousedown', onDragStart);
window.addEventListener('mousemove', onDragMove);
window.addEventListener('mouseup', onDragEnd);
dial.addEventListener('touchstart', onDragStart, { passive: false });
window.addEventListener('touchmove', onDragMove, { passive: false });
window.addEventListener('touchend', onDragEnd);

// ── Audio ──
var ac = null;
function initAudio() { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); }
function tick(freq, dur) {
  if (!ac) return;
  try {
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.frequency.value = freq; osc.type = 'square';
    gain.gain.value = 0.025;
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.start(); osc.stop(ac.currentTime + dur);
  } catch (e) {}
}

function dialSection(num) {
  if (busy) return;
  busy = true;
  initAudio();

  try { localStorage.setItem('lastVisitedSection', num); } catch(e) {}

  var rot = ROTATIONS[num];
  tick(1100, 0.025);
  var forwardTime = 0.35 + (rot / 360) * 0.8;
  dial.style.transition = 'transform ' + forwardTime + 's cubic-bezier(0.22, 0.03, 0.35, 1)';
  dial.style.transform = BASE_TRANSFORM + ' rotate(' + rot + 'deg)';
  var numTicks = Math.ceil(rot / 28);
  for (var i = 0; i < numTicks; i++) {
    (function(i) { setTimeout(function() { tick(650 + Math.random() * 450, 0.015); }, (forwardTime * 1000 / numTicks) * i); })(i);
  }
  setTimeout(function() {
    tick(350, 0.07);
    setTimeout(function() {
      var returnTime = 0.3 + (rot / 360) * 0.65;
      dial.style.transition = 'transform ' + returnTime + 's cubic-bezier(0.08, 0.5, 0.25, 1)';
      dial.style.transform = BASE_TRANSFORM + ' rotate(0deg)';
      var returnTicks = Math.ceil(rot / 18);
      for (var j = 0; j < returnTicks; j++) {
        (function(j) { setTimeout(function() { tick(300 + Math.random() * 350, 0.008); }, (returnTime * 1000 / returnTicks) * j); })(j);
      }
      setTimeout(function() { window.location.href = num + '/index.html'; }, returnTime * 1000 + 200);
    }, 300);
  }, forwardTime * 1000 + 60);
}

function unlockDial() {
  questionMode = false;
  var question = document.getElementById('center-question');
  if (question) {
    question.classList.add('fade-out');
    setTimeout(function() { question.remove(); }, 800);
  }
  var holes = document.querySelectorAll('.hole');
  holes.forEach(function(hole) {
    hole.classList.remove('letter-active', 'letter-clicked');
    hole.style.boxShadow = 'inset 0 0 60px 35px rgba(40, 22, 12, 0.9)';
    var span = hole.querySelector('.hole-letter');
    if (span) {
      var section = parseInt(hole.dataset.section);
      span.textContent = section;
      span.classList.remove('flip-h');
      span.classList.add('unlocked');
      span.style.color = '';
    }
  });
  var navStack = document.querySelector('.nav-stack');
  if (navStack) {
    navStack.style.boxShadow = 'inset 0 0 60px 35px rgba(40, 22, 12, 0.9)';
    var seekText = document.createElement('div');
    seekText.className = 'center-question';
    seekText.id = 'center-question';
    seekText.innerHTML = 'What do<br>you seek?';
    seekText.style.opacity = '0';
    navStack.appendChild(seekText);
    setTimeout(function() { seekText.style.opacity = '1'; }, 900);
  }
  bindNormalClicks();
}

function bindNormalClicks() {
  var holeElements = document.querySelectorAll('.hole');
  holeElements.forEach(function(hole) {
    var newHole = hole.cloneNode(true);
    hole.parentNode.replaceChild(newHole, hole);

    newHole.addEventListener('click', function(e) {
      e.stopPropagation();
      if (questionMode) return;
      dialSection(parseInt(this.dataset.section));
    });
    newHole.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    newHole.addEventListener('touchstart', function(e) { e.stopPropagation(); });

    var darkColor = 'rgba(40, 22, 12, 0.9)';
    var hoverColor = 'rgba(200, 180, 60, 0.6)';
    newHole.style.boxShadow = 'inset 0 0 60px 35px ' + darkColor;
    newHole.addEventListener('mouseenter', function() {
      newHole.style.boxShadow = 'inset 0 0 70px 40px ' + hoverColor;
    });
    newHole.addEventListener('mouseleave', function() {
      newHole.style.boxShadow = 'inset 0 0 60px 35px ' + darkColor;
    });
  });
}

var holeElements = document.querySelectorAll('.hole');
holeElements.forEach(function(hole) {
  hole.addEventListener('click', function(e) {
    e.stopPropagation();
    var section = parseInt(this.dataset.section);
    if (questionMode) {
      handleLetterClick(section);
    } else {
      dialSection(section);
    }
  });
  hole.addEventListener('mousedown', function(e) { e.stopPropagation(); });
  hole.addEventListener('touchstart', function(e) { e.stopPropagation(); });
});

if (isReturn) {
  var q = document.getElementById('center-question');
  if (q) {
    q.innerHTML = 'Continue?';
    q.style.fontSize = '2.3vw';
    q.style.fontFamily = '"DaVinci", cursive';
  }
}

});