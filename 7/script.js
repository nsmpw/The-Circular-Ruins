// Audio — 3:56 to 3:59 loop
var audio = new Audio('../ambience.mp3');
audio.loop = true;
var audioStart = 236; // 3:56
var audioEnd = 239;   // 3:59
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

var fullText = "In the Gnostic cosmosgonies, demiurges fashion a red Adam who cannot stand; as a clumsy, crude and elemental as this Adam of dust was the Adam of dreams forged by the wizard's nights. One afternoon, the man almost destroyed his entire work, but then changed his mind. (It would have been better had he destroyed it.) When he had exhausted all supplications to the deities of earth, he threw himself at the feet of the effigy which was perhaps a tiger or perhaps a colt and implored its unknown help. That evening, at twilight, he dreamt of the statue. He dreamt it was alive, tremulous: it was not an atrocious bastard of a tiger and a colt, but at the same time these two firey creatures and also a bull, a rose, and a storm. This multiple god revealed to him that his earthly name was Fire, and that in this circular temple (and in others like it) people had once made sacrifices to him and worshiped him, and that he would magically animate the dreamed phantom, in such a way that all creatures, except Fire itself and the dreamer, would believe to be a man of flesh and blood. He commanded that once this man had been instructed in all the rites, he should be sent to the other ruined temple whose pyramids were still standing downstream, so that some voice would glorify him in that deserted ediface. In the dream of the man that dreamed, the dreamed one awoke.";

var container = document.getElementById('textContainer');
var screenW = window.innerWidth;
var screenH = window.innerHeight;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

// Build paragraph with word glow
var paraBlock = document.createElement('div');
paraBlock.style.position = 'fixed';
paraBlock.style.fontFamily = '"DaVinci", cursive';
paraBlock.style.fontStyle = 'italic';
paraBlock.style.fontSize = '1.8vw';
paraBlock.style.lineHeight = '1.9';
paraBlock.style.width = '92vw';
paraBlock.style.left = '4vw';
paraBlock.style.top = '10vh';
paraBlock.style.textAlign = 'justify';
paraBlock.style.wordSpacing = '0.3em';
paraBlock.style.color = '#ffffff';

// Wrap each word in a span for glow detection
var allWordSpans = [];
var words = fullText.split(' ');
words.forEach(function(word, i) {
  var span = document.createElement('span');
  span.textContent = word + ' ';
  span.className = 'glow-word';
  span.style.transition = 'color 0.4s ease, text-shadow 0.4s ease';
  paraBlock.appendChild(span);
  allWordSpans.push(span);
});

container.appendChild(paraBlock);

// Start hidden
container.style.webkitMaskImage = 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%)';
container.style.maskImage = 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%)';

// Canvas for glow effects
var flameCanvas = document.createElement('canvas');
flameCanvas.id = 'flameCanvas';
flameCanvas.width = screenW;
flameCanvas.height = screenH;
flameCanvas.style.position = 'fixed';
flameCanvas.style.top = '0';
flameCanvas.style.left = '0';
flameCanvas.style.pointerEvents = 'none';
flameCanvas.style.zIndex = '10';
document.body.appendChild(flameCanvas);
var ctx = flameCanvas.getContext('2d');

function lerp(a, b, t) {
  return a * (1 - t) + b * t;
}

// ====================================
// Flame state
// ====================================

var flameRadius = 380;
var time = 0;
var lightX = screenW * 0.5;
var lightY = screenH * 0.15;

var waypoints = [
  { x: 0.5,  y: 0.15, size: 300 },
  { x: 0.75, y: 0.25, size: 450 },
  { x: 0.3,  y: 0.45, size: 250 },
  { x: 0.85, y: 0.6,  size: 500 },
  { x: 0.2,  y: 0.7,  size: 320 },
  { x: 0.65, y: 0.4,  size: 420 },
  { x: 0.4,  y: 0.2,  size: 280 },
  { x: 0.08, y: 0.07, size: 380 }
];

var currentWaypoint = 0;
var autoPhase = true;
var fullyRevealed = false;
var settleTimer = 0;

var mouseX = screenW / 2;
var mouseY = screenH / 2;
var cursorX = screenW / 2;
var cursorY = screenH / 2;

document.addEventListener('mousemove', function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

var userFlameBoost = 0;
var minBoost = -150;
var maxBoost = 400;

document.addEventListener('wheel', function(e) {
  if (!fullyRevealed) return;
  e.preventDefault();
  userFlameBoost -= e.deltaY * 0.8;
  userFlameBoost = Math.max(minBoost, Math.min(maxBoost, userFlameBoost));
}, { passive: false });

// ====================================
// Draw flame
// ====================================

function drawFlame(cx, cy, r) {
  var flicker = Math.sin(time * 6) * r * 0.04
              + Math.sin(time * 11) * r * 0.03
              + Math.sin(time * 17) * r * 0.02;
  var fr = r + flicker;
  var rx = fr * 0.9;
  var ry = fr * 1.1;

  container.style.webkitMaskImage = 'radial-gradient(ellipse ' + rx + 'px ' + ry + 'px at ' + cx + 'px ' + cy + 'px, black 0%, black 35%, transparent 100%)';
  container.style.maskImage = 'radial-gradient(ellipse ' + rx + 'px ' + ry + 'px at ' + cx + 'px ' + cy + 'px, black 0%, black 35%, transparent 100%)';

  ctx.clearRect(0, 0, screenW, screenH);

  var coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr * 0.6);
  coreGlow.addColorStop(0, 'rgba(255, 200, 120, 0.04)');
  coreGlow.addColorStop(0.5, 'rgba(255, 140, 60, 0.02)');
  coreGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGlow;
  ctx.fillRect(0, 0, screenW, screenH);

  // Glow words within entire visible flame area
  allWordSpans.forEach(function(span) {
    var rect = span.getBoundingClientRect();
    var wordCX = rect.left + rect.width / 2;
    var wordCY = rect.top + rect.height / 2;
    var dx = wordCX - cx;
    var dy = wordCY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < fr) {
      var intensity = 1 - (dist / fr);
      var rr = 255;
      var gg = Math.floor(80 + intensity * 120);
      var bb = Math.floor(intensity * 20);
      var shadowAlpha = 0.3 + intensity * 0.7;
      span.style.color = 'rgb(' + rr + ',' + gg + ',' + bb + ')';
      span.style.textShadow = '0 0 ' + (8 + intensity * 35) + 'px rgba(255, 140, 20, ' + shadowAlpha + '), 0 0 ' + (20 + intensity * 60) + 'px rgba(255, 80, 0, ' + (shadowAlpha * 0.6) + '), 0 0 ' + (40 + intensity * 80) + 'px rgba(200, 40, 0, ' + (shadowAlpha * 0.3) + ')';
    } else {
      span.style.color = '#ffffff';
      span.style.textShadow = 'none';
    }
  });
}

// ====================================
// Main animation loop
// ====================================

function animate() {
  time += 0.02;

  var effectiveRadius = flameRadius + userFlameBoost;

  if (autoPhase) {
    var target = waypoints[currentWaypoint];
    var tx = target.x * screenW;
    var ty = target.y * screenH;

    lightX = lerp(lightX, tx, 0.02);
    lightY = lerp(lightY, ty, 0.02);
    flameRadius = lerp(flameRadius, target.size, 0.015);

    var dist = Math.sqrt((lightX - tx) * (lightX - tx) + (lightY - ty) * (lightY - ty));

    if (dist < 30 && currentWaypoint < waypoints.length - 1) {
      currentWaypoint++;
    }

    if (currentWaypoint === waypoints.length - 1 && dist < 20) {
      settleTimer++;

      if (settleTimer > 60) {
        autoPhase = false;
        fullyRevealed = true;

        mouseX = lightX;
        mouseY = lightY;
        cursorX = lightX;
        cursorY = lightY;

        // Show return arrow
        var dialReturn = document.getElementById('dial-return');
        if (dialReturn) dialReturn.classList.add('glow');

        var scrollHint = document.createElement('div');
        scrollHint.innerHTML = 'scroll to adjust flame size';
        scrollHint.style.position = 'fixed';
        scrollHint.style.left = '50%';
        scrollHint.style.top = '50%';
        scrollHint.style.transform = 'translate(-50%, -50%)';
        scrollHint.style.fontFamily = '"DaVinci", cursive';
        scrollHint.style.fontStyle = 'italic';
        scrollHint.style.fontSize = '1.8vw';
        scrollHint.style.color = 'rgba(40, 22, 12, 0.5)';
        scrollHint.style.transition = 'color 0.3s ease, opacity 3s ease';
        scrollHint.style.zIndex = '20';
        document.body.appendChild(scrollHint);

        // Light up on scroll and disappear
        var scrollHintRemoved = false;
        document.addEventListener('wheel', function() {
          if (!scrollHint.parentNode || scrollHintRemoved) return;
          scrollHint.style.color = 'rgba(40, 22, 12, 0.9)';
          scrollHintRemoved = true;
          setTimeout(function() {
            scrollHint.style.transition = 'opacity 1s ease';
            scrollHint.style.opacity = '0';
            setTimeout(function() {
              if (scrollHint.parentNode) scrollHint.remove();
            }, 1000);
          }, 300);
        });

        setTimeout(function() {
          if (!scrollHintRemoved) {
            scrollHint.style.opacity = '0';
            setTimeout(function() {
              if (scrollHint.parentNode) scrollHint.remove();
            }, 3000);
          }
        }, 8000);
      }
    }

    drawFlame(lightX, lightY, effectiveRadius);
  }

  if (fullyRevealed) {
    cursorX = lerp(cursorX, mouseX, 0.1);
    cursorY = lerp(cursorY, mouseY, 0.1);

    drawFlame(cursorX, cursorY, effectiveRadius);
  }

  requestAnimationFrame(animate);
}

// ====================================
// Blow to start
// ====================================

var started = false;

var blowHint = document.createElement('div');
blowHint.innerHTML = 'blow to light the fire';
blowHint.style.position = 'fixed';
blowHint.style.left = '50%';
blowHint.style.top = '50%';
blowHint.style.transform = 'translate(-50%, -50%)';
blowHint.style.fontFamily = '"DaVinci", cursive';
blowHint.style.fontStyle = 'italic';
blowHint.style.fontSize = '1.8vw';
blowHint.style.color = 'rgba(40, 22, 12, 0.5)';
blowHint.style.textAlign = 'center';
blowHint.style.transition = 'opacity 2s ease';
blowHint.style.zIndex = '20';
document.body.appendChild(blowHint);

function startBlowDetection() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var analyser = audioContext.createAnalyser();
    var source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);

    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    var blowDuration = 0;
    var requiredDuration = 15;

    var calibrationFrames = 30;
    var calibrationSum = 0;
    var ambientLevel = 0;

    function calibrate() {
      analyser.getByteFrequencyData(dataArray);
      var lowFreqSum = 0;
      for (var i = 0; i < 10; i++) {
        lowFreqSum += dataArray[i];
      }
      calibrationSum += lowFreqSum / 10;
      calibrationFrames--;

      if (calibrationFrames <= 0) {
        ambientLevel = calibrationSum / 30;
        detectBlow();
        return;
      }
      requestAnimationFrame(calibrate);
    }

    function getThreshold() {
      return ambientLevel + 80;
    }

    calibrate();

    function detectBlow() {
      if (started) {
        stream.getTracks().forEach(function(t) { t.stop(); });
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      var lowFreqSum = 0;
      for (var i = 0; i < 10; i++) {
        lowFreqSum += dataArray[i];
      }
      var avgLowFreq = lowFreqSum / 10;
      var threshold = getThreshold();

      if (avgLowFreq > threshold) {
        blowDuration++;
        blowHint.style.color = 'rgba(40, 22, 12, ' + Math.min(0.9, 0.4 + blowDuration * 0.05) + ')';
      } else {
        blowDuration = Math.max(0, blowDuration - 2);
        blowHint.style.color = 'rgba(40, 22, 12, 0.5)';
      }

      if (blowDuration >= requiredDuration) {
        started = true;
        blowHint.style.opacity = '0';
        setTimeout(function() {
          if (blowHint.parentNode) blowHint.remove();
        }, 2000);
        stream.getTracks().forEach(function(t) { t.stop(); });
        startAudio();
        animate();
        return;
      }

      requestAnimationFrame(detectBlow);
    }
  }).catch(function() {
    blowHint.innerHTML = 'click to light the fire';

    document.addEventListener('click', function onClick(e) {
      if (started) return;
      // Don't trigger on return arrow click
      if (e.target.closest('.dial-return')) return;
      started = true;
      blowHint.style.opacity = '0';
      setTimeout(function() {
        if (blowHint.parentNode) blowHint.remove();
      }, 2000);
      document.removeEventListener('click', onClick);
      startAudio();
      animate();
    });
  });
}

startBlowDetection();

// Resize
window.addEventListener('resize', function() {
  screenW = window.innerWidth;
  screenH = window.innerHeight;
  flameCanvas.width = screenW;
  flameCanvas.height = screenH;
});