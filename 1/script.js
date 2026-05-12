// Audio — preload but don't play yet
var audio = new Audio('../ambience.mp3');
audio.loop = true;
var audioStart = 162; // 2:42
var audioEnd = 198;   // 3:18
audio.currentTime = audioStart;
audio.volume = 0.4;
audio.addEventListener('timeupdate', function() {
  if (audio.currentTime >= audioEnd) audio.currentTime = audioStart;
});
var audioStarted = false;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  audio.play().catch(function() {});
}

var sentences = [
  "No one saw him disembark in the unanimous night,",
  "no one saw the bamboo canoe sink into the sacred mud,",
  "but in a few days there was no one who did not know",
  "that the taciturn man came from the South",
  "and that his home had been one of those numberless villages upstream in the deeply cleft side of the mountain,",
  "where the Zend language has not been contaminated by Greek",
  "and where leprosy is infrequent.",
  "What is certain is that the grey man kissed the mud,",
  "climbed up the bank with pushing aside the blades",
  "which were lacerating his flesh,",
  "and crawled, nauseated and bloodstained,",
  "up to the circular enclosure crowned with a stone tiger or horse,",
  "which sometimes was the color of flame and now was that of ashes.",
  "This circle was a temple devoured by ancient fires,",
  "profaned by the miasmal jungle, and whose god no longer received the homage of men.",
  "The stranger stretched himself out beneath the pedestal.",
  "He was awakened by the sun high overhead.",
  "He was not astonished to find that his wounds had healed;",
  "he closed his pallid eyes and slept,",
  "not through weakness of flesh but through determination of will.",
  "He knew that this temple was the place required for his invincible intent;",
  "he knew that the incessant trees had not succeeded",
  "in strangling the ruins of another propitious temple",
  "which had once belonged to gods now burned and dead; he knew that his immediate obligation was to dream. ",
  "Toward midnight he was awakened by the inconsolable shriek of a bird.",
  "Tracks of bare feet, some figs and a jug",
  "warned him that the men of the region had been spying respectfully on his sleep,",
  "soliciting his protection or afraid of his magic.",
  "He felt a chill of fear,",
  "and sought out a sepulchral niche in the dilapidated wall",
  "where he concealed himself among unfamiliar leaves."
];

var swapAt = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30];

// Sentence index 6 contains "leprosy"
var leprosySentence = 6;

var container = document.querySelector('.text-container');
var currentIndex = 0;
var activeBlocks = [];

var occupiedRects = [];
var PADDING = 20;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function chance(p) {
  return Math.random() < p;
}

function rectsOverlap(a, b) {
  return !(a.right + PADDING < b.left ||
           b.right + PADDING < a.left ||
           a.bottom + PADDING < b.top ||
           b.bottom + PADDING < a.top);
}

function findFreePosition(el) {
  el.style.left = '-9999px';
  el.style.top = '-9999px';
  el.style.opacity = '0';
  container.appendChild(el);

  var w = el.offsetWidth;
  var h = el.offsetHeight;

  var screenW = window.innerWidth;
  var screenH = window.innerHeight;

  var maxAttempts = 80;
  var bestPos = null;

  for (var i = 0; i < maxAttempts; i++) {
    var x = rand(20, Math.max(40, screenW - w - 20));
    var y = rand(50, Math.max(60, screenH - h - 30));

    var candidate = {
      left: x,
      top: y,
      right: x + w,
      bottom: y + h
    };

    var overlaps = false;
    for (var j = 0; j < occupiedRects.length; j++) {
      if (rectsOverlap(candidate, occupiedRects[j])) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      bestPos = { x: x, y: y, rect: candidate };
      break;
    }
  }

  if (!bestPos) {
    var x = rand(20, Math.max(40, screenW - w - 20));
    var y = rand(50, Math.max(60, screenH - h - 30));
    bestPos = {
      x: x,
      y: y,
      rect: { left: x, top: y, right: x + w, bottom: y + h }
    };
  }

  container.removeChild(el);
  return bestPos;
}

function removeOccupiedRect(rect) {
  occupiedRects = occupiedRects.filter(function(r) { return r !== rect; });
}

function doSwap() {
  if (activeBlocks.length < 2) return;

  var idxA = randInt(0, activeBlocks.length - 1);
  var idxB;
  do { idxB = randInt(0, activeBlocks.length - 1); } while (idxB === idxA);

  var blockA = activeBlocks[idxA];
  var blockB = activeBlocks[idxB];

  if (!blockA.el.parentNode || !blockB.el.parentNode) return;

  if (chance(0.5)) {
    var rectA = blockA.el.getBoundingClientRect();
    var rectB = blockB.el.getBoundingClientRect();

    var dx = rectB.left - rectA.left;
    var dy = rectB.top - rectA.top;

    blockA.el.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.5s ease';
    blockB.el.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.5s ease';

    blockA.el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    blockB.el.style.transform = 'translate(' + (-dx) + 'px, ' + (-dy) + 'px)';

    setTimeout(function() {
      blockA.el.style.opacity = '0';
      blockB.el.style.opacity = '0';
      setTimeout(function() {
        if (blockA.el.parentNode) blockA.el.remove();
        if (blockB.el.parentNode) blockB.el.remove();
        removeOccupiedRect(blockA.rect);
        removeOccupiedRect(blockB.rect);
        activeBlocks = activeBlocks.filter(function(b) {
          return b !== blockA && b !== blockB;
        });
      }, 1500);
    }, 1800);

  } else {
    var textA = blockA.el.textContent;
    var textB = blockB.el.textContent;
    var wordsA = textA.split(' ');
    var wordsB = textB.split(' ');

    if (wordsA.length < 2 || wordsB.length < 2) return;

    var wordIdxA = randInt(0, wordsA.length - 1);
    var wordIdxB = randInt(0, wordsB.length - 1);
    var wordA = wordsA[wordIdxA];
    var wordB = wordsB[wordIdxB];

    wordsA[wordIdxA] = '<span class="swap-word" data-swap="a">' + wordA + '</span>';
    wordsB[wordIdxB] = '<span class="swap-word" data-swap="b">' + wordB + '</span>';
    blockA.el.innerHTML = wordsA.join(' ');
    blockB.el.innerHTML = wordsB.join(' ');

    var spanA = blockA.el.querySelector('[data-swap="a"]');
    var spanB = blockB.el.querySelector('[data-swap="b"]');

    if (!spanA || !spanB) return;

    var rA = spanA.getBoundingClientRect();
    var rB = spanB.getBoundingClientRect();

    var floatA = document.createElement('div');
    floatA.className = 'float-word';
    floatA.textContent = wordA;
    floatA.style.fontSize = blockA.el.style.fontSize;
    floatA.style.left = rA.left + 'px';
    floatA.style.top = rA.top + 'px';
    document.body.appendChild(floatA);

    var floatB = document.createElement('div');
    floatB.className = 'float-word';
    floatB.textContent = wordB;
    floatB.style.fontSize = blockB.el.style.fontSize;
    floatB.style.left = rB.left + 'px';
    floatB.style.top = rB.top + 'px';
    document.body.appendChild(floatB);

    spanA.style.opacity = '0';
    spanB.style.opacity = '0';

    requestAnimationFrame(function() {
      floatA.style.left = rB.left + 'px';
      floatA.style.top = rB.top + 'px';
      floatB.style.left = rA.left + 'px';
      floatB.style.top = rA.top + 'px';
    });

    setTimeout(function() {
      floatA.style.opacity = '0';
      floatB.style.opacity = '0';
      blockA.el.style.opacity = '0';
      blockB.el.style.opacity = '0';

      setTimeout(function() {
        if (floatA.parentNode) floatA.remove();
        if (floatB.parentNode) floatB.remove();
        if (blockA.el.parentNode) blockA.el.remove();
        if (blockB.el.parentNode) blockB.el.remove();
        removeOccupiedRect(blockA.rect);
        removeOccupiedRect(blockB.rect);
        activeBlocks = activeBlocks.filter(function(b) {
          return b !== blockA && b !== blockB;
        });
      }, 1500);
    }, 1800);
  }
}

function triggerLeprosyEcho(el) {
  setTimeout(function() {
    var words = el.textContent.split(' ');
    var html = [];
    for (var i = 0; i < words.length; i++) {
      if (words[i].indexOf('leprosy') !== -1) {
        html.push('<span class="leprosy-word">' + words[i] + '</span>');
      } else {
        html.push(words[i]);
      }
    }
    el.innerHTML = html.join(' ');

    var span = el.querySelector('.leprosy-word');
    if (!span) return;

    var rect = span.getBoundingClientRect();

    for (var e = 0; e < 3; e++) {
      var echo = document.createElement('div');
      echo.className = 'leprosy-echo';
      echo.textContent = 'leprosy';
      echo.style.fontSize = el.style.fontSize;
      echo.style.left = (rect.left + rand(-4, 4)) + 'px';
      echo.style.top = (rect.top + rand(-4, 4)) + 'px';
      echo.style.animationDelay = (e * 0.4) + 's';
      document.body.appendChild(echo);

      (function(echoEl) {
        setTimeout(function() {
          if (echoEl.parentNode) echoEl.remove();
        }, 5000);
      })(echo);
    }
  }, 1800);
}

// ── Flower GIFs ──
var flowerFiles = [3,4,5,6,7,11,14,16,19,20,21,23,26,27,29];

function placeFlower() {
  var img = document.createElement('img');
  var num = flowerFiles[Math.floor(Math.random() * flowerFiles.length)];
  img.src = '../flowers/flowers_' + num + '.gif';
  img.className = 'flower-img';

  var size = rand(400, 800);
  img.style.width = size + 'px';
  img.style.height = 'auto';
  img.style.position = 'absolute';
  img.style.opacity = '0';
  img.style.transition = 'opacity 2s ease';
  img.style.pointerEvents = 'none';
  img.style.zIndex = Math.floor(rand(1, 15));
  var filters = [
    'sepia(1) saturate(2) hue-rotate(45deg) brightness(1.1)',
    'sepia(1) saturate(4) hue-rotate(180deg) brightness(0.9)'
  ];
  img.style.filter = filters[Math.floor(Math.random() * filters.length)];

  var x = rand(-50, window.innerWidth - 100);
  var y = rand(-50, window.innerHeight - 100);
  img.style.left = x + 'px';
  img.style.top = y + 'px';

  container.appendChild(img);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      img.style.opacity = '1';
    });
  });

  // Fade out and remove
  var lifespan = rand(12000, 22000);
  setTimeout(function() {
    img.style.opacity = '0';
    setTimeout(function() {
      if (img.parentNode) img.remove();
    }, 2000);
  }, lifespan);
}

function placeSentence() {
  if (currentIndex >= sentences.length) {
    // All sentences done — activate the arrow
    setTimeout(function() {
      activeBlocks.forEach(function(b) {
        b.el.style.opacity = '0';
      });
      // Fade out flowers too
      var flowers = document.querySelectorAll('.flower-img');
      flowers.forEach(function(f) { f.style.opacity = '0'; });
      // Fade out audio
      var fadeOut = setInterval(function() {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeOut);
        }
      }, 200);
      setTimeout(function() {
        var dialReturn = document.getElementById('dial-return');
        if (dialReturn) dialReturn.classList.add('glow');
      }, 2500);
    }, 4000);
    return;
  }

  var el = document.createElement('div');
  el.className = 'text-block' + (chance(0.08) ? ' breathing' : '');
  el.textContent = sentences[currentIndex];

  var size = rand(0.9, 2.0);
  el.style.fontSize = size + 'vw';

  var pos = findFreePosition(el);

  el.style.left = pos.x + 'px';
  el.style.top = pos.y + 'px';
  el.style.zIndex = '50';

  container.appendChild(el);

  // Start audio with first sentence
  startAudio();

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      el.style.opacity = '1';
    });
  });

  var block = { el: el, rect: pos.rect };
  activeBlocks.push(block);
  occupiedRects.push(pos.rect);

  // Trigger swap at specified sentences
  if (swapAt.indexOf(currentIndex) !== -1) {
    setTimeout(function() {
      doSwap();
    }, 2500);
  }

  // Trigger leprosy echo
  if (currentIndex === leprosySentence) {
    triggerLeprosyEcho(el);
  }

  currentIndex++;

  // Place flowers frequently
  if (chance(0.75)) {
    setTimeout(function() { placeFlower(); }, rand(200, 800));
    if (chance(0.5)) {
      setTimeout(function() { placeFlower(); }, rand(1000, 2500));
    }
  }

  var lifespan = rand(7000, 14000);
  setTimeout(function() {
    el.style.opacity = '0';
    setTimeout(function() {
      if (el.parentNode) el.remove();
      removeOccupiedRect(block.rect);
      activeBlocks = activeBlocks.filter(function(b) { return b !== block; });
    }, 1500);
  }, lifespan);
}

function startDreaming() {
  function next() {
    if (currentIndex >= sentences.length) {
      placeSentence();
      return;
    }

    placeSentence();

    if (chance(0.2) && currentIndex < sentences.length) {
      setTimeout(function() {
        placeSentence();
      }, rand(600, 1500));
    }

    var delay = rand(4000, 7000);
    setTimeout(next, delay);
  }

  setTimeout(next, 1500);
}

startDreaming();

// Smoke cursor — fire/ember/ash colors
var mouseMoveCounter = 0;
var maxSmoke = 10;
var smokeColors = [
  'rgba(255, 80, 0, 0.5)',
  'rgba(255, 140, 0, 0.4)',
  'rgba(200, 50, 0, 0.5)',
  'rgba(255, 200, 50, 0.35)',
  'rgba(120, 30, 0, 0.4)',
  'rgba(80, 20, 0, 0.35)',
  'rgba(60, 60, 60, 0.3)'
];

function createSmoke(x, y) {
  var smoke = document.createElement('div');
  smoke.className = 'smoke';
  var size = 40 + Math.random() * 50;
  smoke.style.width = size + 'px';
  smoke.style.height = size + 'px';
  var color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
  smoke.style.background = 'radial-gradient(circle, ' + color + ' 0%, transparent 70%)';
  smoke.style.left = (x + (Math.random() - 0.5) * 15) + 'px';
  smoke.style.top = (y + (Math.random() - 0.5) * 15) + 'px';
  document.body.appendChild(smoke);
  setTimeout(function() {
    smoke.style.transition = 'opacity 1.5s, transform 1.5s, filter 1.5s';
    smoke.style.opacity = '0';
    smoke.style.transform = 'translateY(-25px) scale(1.8)';
    smoke.style.filter = 'blur(18px)';
    setTimeout(function() { if (smoke.parentNode) smoke.remove(); }, 1500);
  }, 50);
  var allSmoke = document.querySelectorAll('.smoke');
  if (allSmoke.length > maxSmoke) allSmoke[0].remove();
}

document.addEventListener('mousemove', function(e) {
  mouseMoveCounter++;
  if (mouseMoveCounter % 4 === 0) createSmoke(e.clientX, e.clientY);
});