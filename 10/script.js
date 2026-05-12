// Audio — 3:40 to 3:42 loop
var audio = new Audio('../ambience.mp3');
audio.loop = true;
var audioStart = 220;
var audioEnd = 222;
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

var fullText = "His end came abruptly, but not without certain forewarnings. First (after a long drought) a remote cloud, as light as a bird, appeared on a hill; then, toward the South, the sky took on the rose color of leopard's gums; then came clouds of smoke which rusted the metal of the nights; afterwards came the panic-stricken flight of wild animals. For what had happened many centuries before was repeating itself. The ruins of the sanctuary of the god of Fire was destroyed by fire. In a dawn without birds, the wizard saw the concentric fire licking the walls. For a moment, he thought of taking refuge in the water, but then he understood that death was coming to crown his old age and absolve him from his labors. He walked toward the sheets of flame. They did not bite his flesh, they caressed him and flooded him without heat or combustion. With relief, with humiliation, with terror, he understood that he also was an illusion, that someone else was dreaming him.";

var allWords = fullText.split(' ');

var ovalWords = [];
for (var i = 0; i < allWords.length; i += 3) {
  ovalWords.push(allWords[i]);
}

var scatterWords = [];
for (var i = 0; i < allWords.length; i += 4) {
  scatterWords.push(allWords[i]);
}

var container = document.getElementById('textContainer');
var ovalEls = [];
var scatterEls = [];

var ASSEMBLED_SIZE = 1.0;
var PARA_WIDTH = 50;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function chance(p) {
  return Math.random() < p;
}

var imageFiles = [];
[3,4,5,6,7,11,14,16,19,20,21,23,26,27,29].forEach(function(n) {
  imageFiles.push('../flowers/flowers_' + n + '.gif');
});

var imageFilters = [
  'sepia(1) saturate(1.5) hue-rotate(10deg) brightness(0.6)',
  'sepia(1) saturate(1.2) hue-rotate(20deg) brightness(0.5)'
];

var activeImages = [];

function placeImage() {
  var img = document.createElement('img');
  img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  img.className = 'section-img';
  var size = rand(300, 650);
  img.style.width = size + 'px';
  img.style.height = 'auto';
  img.style.position = 'absolute';
  img.style.opacity = '0';
  img.style.transition = 'opacity 1.5s ease, left 2s ease, top 2s ease';
  img.style.pointerEvents = 'none';
  img.style.zIndex = Math.floor(rand(1, 10));
  img.style.filter = imageFilters[Math.floor(Math.random() * imageFilters.length)];
  img.style.mixBlendMode = 'difference';
  img.style.left = rand(-30, window.innerWidth - 120) + 'px';
  img.style.top = rand(-30, window.innerHeight - 120) + 'px';
  container.appendChild(img);
  activeImages.push(img);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { img.style.opacity = '1'; });
  });
}

function placeImageNearOval(wordIndex) {
  var img = document.createElement('img');
  img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  img.className = 'section-img';
  var size = rand(200, 500);
  img.style.width = size + 'px';
  img.style.height = 'auto';
  img.style.position = 'absolute';
  img.style.opacity = '0';
  img.style.transition = 'opacity 1.5s ease, left 2s ease, top 2s ease';
  img.style.pointerEvents = 'none';
  img.style.zIndex = Math.floor(rand(1, 10));
  img.style.filter = imageFilters[Math.floor(Math.random() * imageFilters.length)];
  img.style.mixBlendMode = 'difference';
  var t = (wordIndex / ovalWords.length) * Math.PI * 2 + rand(-0.5, 0.5);
  var ovalCX = window.innerWidth * 0.50;
  var ovalCY = window.innerHeight * 0.48;
  var rX = window.innerWidth * 0.34 * rand(0.5, 1.2);
  var rY = window.innerHeight * 0.28 * rand(0.5, 1.2);
  var x = ovalCX + Math.cos(t) * rX - size / 2;
  var y = ovalCY + Math.sin(t) * rY - size / 2;
  img.style.left = x + 'px';
  img.style.top = y + 'px';
  container.appendChild(img);
  activeImages.push(img);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { img.style.opacity = '1'; });
  });
}

function fadeOutAllImages() {
  activeImages.forEach(function(img) { img.style.opacity = '0'; });
  setTimeout(function() {
    activeImages.forEach(function(img) { if (img.parentNode) img.remove(); });
    activeImages = [];
  }, 2000);
}

var ovalCenterX = 50;
var ovalCenterY = 48;
var ovalRadiusX = 34;
var ovalRadiusY = 28;

ovalWords.forEach(function(word, i) {
  var el = document.createElement('div');
  el.className = 'word';
  el.textContent = word;
  el.style.fontSize = rand(1.0, 1.6) + 'vw';
  var t = (i / ovalWords.length) * Math.PI * 2;
  var radiusWobble = rand(0.9, 1.1);
  var angleJitter = rand(-0.15, 0.15);
  var x = ovalCenterX + Math.cos(t + angleJitter) * ovalRadiusX * radiusWobble + rand(-3, 3);
  var y = ovalCenterY + Math.sin(t + angleJitter) * ovalRadiusY * radiusWobble + rand(-2, 2);
  x = Math.max(3, Math.min(93, x));
  y = Math.max(5, Math.min(92, y));
  el.style.left = x + 'vw';
  el.style.top = y + 'vh';
  container.appendChild(el);
  ovalEls.push({ el: el, index: i });
});

var ovalStagger = 400;
var ovalStartTime = 1000;

ovalEls.forEach(function(item, i) {
  setTimeout(function() {
    item.el.classList.add('visible');
    item.el.style.opacity = '1';
    if (i === 0) startAudio();
    if (chance(0.3)) {
      setTimeout(function() {
        if (chance(0.6)) { placeImageNearOval(i); } else { placeImage(); }
      }, rand(100, 500));
    }
    if (i > 3 && i % 2 === 0) {
      setTimeout(function() { doSwapOn(ovalEls); }, 800);
    }
  }, ovalStartTime + i * ovalStagger);
});

var ovalDoneTime = ovalStartTime + ovalWords.length * ovalStagger + 1000;

var imgSwapInterval = setInterval(function() {
  if (activeImages.length >= 2) {
    var idxA = randInt(0, activeImages.length - 1);
    var idxB;
    do { idxB = randInt(0, activeImages.length - 1); } while (idxB === idxA);
    var imgA = activeImages[idxA];
    var imgB = activeImages[idxB];
    var leftA = imgA.style.left;
    var topA = imgA.style.top;
    imgA.style.left = imgB.style.left;
    imgA.style.top = imgB.style.top;
    imgB.style.left = leftA;
    imgB.style.top = topA;
  }
  if (chance(0.25) && activeImages.length < 10) { placeImage(); }
  if (chance(0.2) && activeImages.length > 4) {
    var removeIdx = randInt(0, activeImages.length - 1);
    var toRemove = activeImages[removeIdx];
    toRemove.style.opacity = '0';
    activeImages.splice(removeIdx, 1);
    setTimeout(function() { if (toRemove.parentNode) toRemove.remove(); }, 1500);
  }
}, 4000);

var ovalSwapCount = 12;
for (var s = 0; s < ovalSwapCount; s++) {
  (function(delay) {
    setTimeout(function() { doSwapOn(ovalEls); }, ovalDoneTime + delay);
  })(s * 1000);
}

function doSwapOn(els) {
  var visible = els.filter(function(w) { return w.el.classList.contains('visible') && w.el.parentNode; });
  if (visible.length < 2) return;
  var idxA = randInt(0, visible.length - 1);
  var idxB;
  do { idxB = randInt(0, visible.length - 1); } while (idxB === idxA);
  var a = visible[idxA].el;
  var b = visible[idxB].el;
  var rectA = a.getBoundingClientRect();
  var rectB = b.getBoundingClientRect();
  var floatA = document.createElement('div');
  floatA.className = 'float-word';
  floatA.textContent = a.textContent;
  floatA.style.fontSize = a.style.fontSize;
  floatA.style.left = rectA.left + 'px';
  floatA.style.top = rectA.top + 'px';
  document.body.appendChild(floatA);
  var floatB = document.createElement('div');
  floatB.className = 'float-word';
  floatB.textContent = b.textContent;
  floatB.style.fontSize = b.style.fontSize;
  floatB.style.left = rectB.left + 'px';
  floatB.style.top = rectB.top + 'px';
  document.body.appendChild(floatB);
  a.style.visibility = 'hidden';
  b.style.visibility = 'hidden';
  requestAnimationFrame(function() {
    floatA.style.left = rectB.left + 'px';
    floatA.style.top = rectB.top + 'px';
    floatB.style.left = rectA.left + 'px';
    floatB.style.top = rectA.top + 'px';
  });
  setTimeout(function() {
    a.style.left = rectB.left + 'px';
    a.style.top = rectB.top + 'px';
    b.style.left = rectA.left + 'px';
    b.style.top = rectA.top + 'px';
    a.style.visibility = 'visible';
    b.style.visibility = 'visible';
    floatA.style.opacity = '0';
    floatB.style.opacity = '0';
    setTimeout(function() {
      if (floatA.parentNode) floatA.remove();
      if (floatB.parentNode) floatB.remove();
    }, 800);
  }, 1600);
}

// Scatter phase
var scatterStartTime = ovalDoneTime + ovalSwapCount * 1000 + 2000;

setTimeout(function() {
  ovalEls.forEach(function(item, i) {
    if (i % 3 !== 0) {
      setTimeout(function() {
        item.el.style.opacity = '0';
        setTimeout(function() { if (item.el.parentNode) item.el.remove(); }, 1500);
      }, rand(0, 3000));
    }
  });

  scatterWords.forEach(function(word, i) {
    var el = document.createElement('div');
    el.className = 'word';
    el.textContent = word;
    el.style.fontSize = rand(0.9, 1.8) + 'vw';
    el.style.left = rand(3, 90) + 'vw';
    el.style.top = rand(8, 90) + 'vh';
    container.appendChild(el);
    scatterEls.push({ el: el, index: i });
  });

  var scatterStagger = 300;
  scatterEls.forEach(function(item, i) {
    setTimeout(function() {
      item.el.classList.add('visible');
      item.el.style.opacity = '1';
      if (i % 5 === 0) { setTimeout(function() { doSwapOn(scatterEls); }, 600); }
    }, i * scatterStagger);
  });

  var remainingOvalFadeTime = scatterWords.length * scatterStagger * 0.6;
  setTimeout(function() {
    ovalEls.forEach(function(item) {
      if (item.el.parentNode && item.el.classList.contains('visible')) {
        item.el.style.opacity = '0';
        setTimeout(function() { if (item.el.parentNode) item.el.remove(); }, 1500);
      }
    });
  }, remainingOvalFadeTime);

  var assembleTime = scatterWords.length * scatterStagger + 4000;
  setTimeout(function() { assembleIntoParagraph(); }, assembleTime);
}, scatterStartTime);

// Assembly — centered paragraph
function assembleIntoParagraph() {
  clearInterval(imgSwapInterval);
  fadeOutAllImages();

  scatterEls.forEach(function(item, i) {
    setTimeout(function() {
      item.el.style.transition = 'opacity 1.5s ease';
      item.el.style.opacity = '0';
      setTimeout(function() { if (item.el.parentNode) item.el.remove(); }, 1500);
    }, i * 30);
  });

  var fadeTime = scatterEls.length * 30 + 2500;

  setTimeout(function() {
    var sw = window.innerWidth;
    var sh = window.innerHeight;

    var measurer = document.createElement('div');
    measurer.style.position = 'absolute';
    measurer.style.visibility = 'hidden';
    measurer.style.fontFamily = '"Apple Chancery", cursive';
    measurer.style.fontStyle = 'italic';
    measurer.style.fontSize = ASSEMBLED_SIZE + 'vw';
    measurer.style.lineHeight = '2.2';
    measurer.style.whiteSpace = 'normal';
    measurer.style.textAlign = 'justify';
    document.body.appendChild(measurer);

    allWords.forEach(function(word) {
      var span = document.createElement('span');
      span.textContent = word + ' ';
      measurer.appendChild(span);
    });

    var paraWidthPx = PARA_WIDTH / 100 * sw;
    var offsetX = (sw - paraWidthPx) / 2;
    measurer.style.width = paraWidthPx + 'px';
    measurer.style.left = offsetX + 'px';
    measurer.style.top = '0px';

    void measurer.offsetHeight;
    var paraHeight = Math.max(measurer.getBoundingClientRect().height, measurer.scrollHeight);
    var offsetY = Math.max(20, Math.floor((sh - paraHeight) / 2));

    measurer.style.top = offsetY + 'px';
    measurer.style.visibility = 'visible';

    var spans = measurer.querySelectorAll('span');
    var targetPositions = [];
    spans.forEach(function(span) {
      var rect = span.getBoundingClientRect();
      targetPositions.push({ left: rect.left, top: rect.top });
    });
    document.body.removeChild(measurer);

    var indices = [];
    for (var ii = 0; ii < allWords.length; ii++) {
      if (targetPositions[ii]) indices.push(ii);
    }
    for (var r = indices.length - 1; r > 0; r--) {
      var s = Math.floor(Math.random() * (r + 1));
      var tmp = indices[r];
      indices[r] = indices[s];
      indices[s] = tmp;
    }

    indices.forEach(function(idx, seq) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'word';
        el.textContent = allWords[idx];
        el.style.fontSize = ASSEMBLED_SIZE + 'vw';
        el.style.left = targetPositions[idx].left + 'px';
        el.style.top = targetPositions[idx].top + 'px';
        el.style.pointerEvents = 'auto';
        container.appendChild(el);
        requestAnimationFrame(function() { el.classList.add('visible'); });
      }, seq * 30);
    });

    var fillTime = indices.length * 30 + 3000;
    setTimeout(function() {
      var dialReturn = document.getElementById('dial-return');
      if (dialReturn) dialReturn.classList.add('glow');
      setTimeout(function() {
        var audioFade = setInterval(function() {
          if (audio.volume > 0.05) { audio.volume -= 0.05; } else { audio.volume = 0; audio.pause(); clearInterval(audioFade); }
        }, 200);
        container.style.transition = 'opacity 2s ease';
        container.style.opacity = '0';
      }, 10000);
    }, fillTime);
  }, fadeTime);
}

// Smoke cursor
var mouseMoveCounter = 0;
var maxSmoke = 10;
var smokeColors = [
  'rgba(255, 80, 0, 0.5)', 'rgba(255, 140, 0, 0.4)',
  'rgba(200, 50, 0, 0.5)', 'rgba(255, 200, 50, 0.35)',
  'rgba(120, 30, 0, 0.4)', 'rgba(80, 20, 0, 0.35)'
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