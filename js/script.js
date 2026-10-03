/* ================================================================
   PAGE-TO-PAGE BLUR TRANSITION — jalan di SEMUA halaman
================================================================= */
(function(){
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('blur-in-start');
    });
  });
})();

document.body.addEventListener('click', function(e){
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http')) return;

  e.preventDefault();
  document.body.classList.add('blur-out');
  if (typeof saveMusicState === 'function') saveMusicState();
  setTimeout(() => { window.location.href = href; }, 550);
});

/* ================================================================
   HER LITTLE NOTE — tombol catatan kecil yang bisa diedit
   -----------------------------------------------------------
   Jalan di SEMUA halaman. Disimpan pakai localStorage (BUKAN
   sessionStorage), jadi tetap ada walau browser ditutup total.
================================================================= */
const NOTE_STORAGE_KEY = 'gfNoteContent';

let noteBtn = document.getElementById('noteBtn');
if (!noteBtn){
  noteBtn = document.createElement('button');
  noteBtn.id = 'noteBtn';
  noteBtn.className = 'note-btn';
  noteBtn.setAttribute('aria-label', 'write a little note');
  noteBtn.title = 'tulis catatan kecil';
  noteBtn.innerHTML = '<span class="note-icon">📝</span>';
  document.body.appendChild(noteBtn);
}

let noteOverlay = document.getElementById('noteOverlay');
if (!noteOverlay){
  noteOverlay = document.createElement('div');
  noteOverlay.id = 'noteOverlay';
  noteOverlay.className = 'note-overlay';
  noteOverlay.innerHTML = `
    <div class="note-paper" id="notePaper">
      <button class="note-close" id="noteClose" aria-label="close note">✕</button>
      <h3 class="note-title">To my beloved Ying 💌</h3>
      <p class="note-hint">Favorite memory of us?</p>
      <textarea id="noteTextarea" class="note-textarea" placeholder="you're too..."></textarea>
      <span class="note-saved" id="noteSaved">saved ✓</span>
    </div>
  `;
  document.body.appendChild(noteOverlay);
}

const noteTextarea = document.getElementById('noteTextarea');
const noteClose    = document.getElementById('noteClose');
const noteSavedTag = document.getElementById('noteSaved');

try {
  noteTextarea.value = localStorage.getItem(NOTE_STORAGE_KEY) || '';
} catch (error) {
  console.warn('Note storage is unavailable:', error);
}

function openNote(){
  noteOverlay.classList.add('open');
  setTimeout(() => noteTextarea.focus(), 200);
}

function closeNote(){
  noteOverlay.classList.remove('open');
}

noteBtn.addEventListener('click', openNote);
noteClose.addEventListener('click', closeNote);

noteOverlay.addEventListener('click', (e) => {
  if (e.target === noteOverlay) closeNote();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && noteOverlay.classList.contains('open')) closeNote();
});

let noteSaveTimeout = null;
noteTextarea.addEventListener('input', () => {
  clearTimeout(noteSaveTimeout);
  noteSavedTag.classList.remove('show');
  noteSaveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(NOTE_STORAGE_KEY, noteTextarea.value);
    } catch (error) {
      console.warn('Could not save the note:', error);
      return;
    }
    noteSavedTag.classList.add('show');
    setTimeout(() => noteSavedTag.classList.remove('show'), 1400);
  }, 500);
});

/* ================================================================
   PERSISTENT BACKGROUND MUSIC — jalan di SEMUA halaman
   -----------------------------------------------------------
   EDIT DI SINI kalau mau ganti file lagu: cukup timpa file
   assets/music.mp3 dengan lagu asli kamu (nama file sama persis).
================================================================= */
const MUSIC_STORAGE_KEY = 'bgMusicState';

let bgMusic = document.getElementById('bgMusic');
if (!bgMusic){
  bgMusic = document.createElement('audio');
  bgMusic.id = 'bgMusic';
  bgMusic.loop = true;
  bgMusic.preload = 'auto';
  bgMusic.src = 'assets/music.mp3';
  document.body.appendChild(bgMusic);
}

let musicBtn = document.getElementById('musicBtn');
if (!musicBtn){
  musicBtn = document.createElement('button');
  musicBtn.id = 'musicBtn';
  musicBtn.className = 'music-btn';
  musicBtn.setAttribute('aria-label', 'play music');
  musicBtn.title = 'play our song';
  musicBtn.innerHTML = '<span class="music-icon">🎵</span>';
  document.body.appendChild(musicBtn);
}

const musicIcon = musicBtn.querySelector('.music-icon');
const musicStatus = document.createElement('div');
musicStatus.setAttribute('role', 'status');
musicStatus.style.cssText = 'position:fixed;bottom:88px;right:24px;max-width:280px;padding:12px;border-radius:12px;background:#fff;color:#333;box-shadow:0 4px 20px #0002;z-index:61;font-size:13px;';
musicStatus.hidden = true;
document.body.appendChild(musicStatus);
let noteInterval = null;

function spawnMusicNote(){
  const notes = ['🎵', '🎶', '💫'];
  const note = document.createElement('span');
  note.className = 'music-note';
  note.textContent = notes[Math.floor(Math.random() * notes.length)];
  note.style.setProperty('--drift', (Math.random() * 40 - 20) + 'px');
  musicBtn.appendChild(note);
  setTimeout(() => note.remove(), 1400);
}

function setMusicUI(isPlaying){
  musicBtn.classList.toggle('playing', isPlaying);
  musicBtn.setAttribute('aria-label', isPlaying ? 'pause music' : 'play music');
  musicBtn.setAttribute('aria-pressed', String(isPlaying));
  musicBtn.title = isPlaying ? 'pause our song' : 'play our song';
  musicIcon.textContent = isPlaying ? '🎶' : '🎵';
  clearInterval(noteInterval);
  if (isPlaying) noteInterval = setInterval(spawnMusicNote, 500);
}

function saveMusicState(){
  try {
    sessionStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify({
      playing: !bgMusic.paused,
      time: bgMusic.currentTime || 0
    }));
  } catch (error) {
    console.warn('Could not save music state:', error);
  }
}

let savedMusicState = null;
try {
  savedMusicState = JSON.parse(sessionStorage.getItem(MUSIC_STORAGE_KEY) || 'null');
} catch (error) {
  console.warn('Could not restore music state:', error);
}

function reportMusicError(error){
  setMusicUI(false);
  saveMusicState();
  musicBtn.title = error?.name === 'NotAllowedError'
    ? 'click to play our song'
    : 'could not play our song — click to retry';
  console.error('Music playback failed:', error, bgMusic.error);
  const messages = {
    2: 'The song could not be downloaded. Check your connection, then click the music button to retry.',
    3: 'The browser could not decode this song. Try replacing assets/music.mp3 with another MP3 export.',
    4: 'The song is missing or its format is unsupported. Check assets/music.mp3.'
  };
  musicStatus.textContent = error?.name === 'NotAllowedError'
    ? 'Click the music button to start the song.'
    : messages[bgMusic.error?.code] || 'Music could not start. Click the music button to retry.';
  musicStatus.hidden = false;
}

function playMusic(){
  musicStatus.hidden = true;
  bgMusic.muted = false;
  bgMusic.volume = 1;
  // Reload after a failed download so the button can retry playback.
  if (bgMusic.error) bgMusic.load();
  return bgMusic.play().then(() => {
    musicStatus.hidden = true;
    setMusicUI(true);
    saveMusicState();
  }).catch(reportMusicError);
}

function resumeMusic(){
  if (!savedMusicState || !savedMusicState.playing) return;
  const savedTime = Number(savedMusicState.time);
  if (Number.isFinite(savedTime) && savedTime >= 0) bgMusic.currentTime = savedTime;
  playMusic();
}

if (savedMusicState){
  if (bgMusic.readyState >= 1){
    resumeMusic();
  } else {
    bgMusic.addEventListener('loadedmetadata', resumeMusic, { once: true });
  }
}

musicBtn.addEventListener('click', () => {
  startOnInteraction = false;
  if (bgMusic.paused){
    playMusic();
  } else {
    bgMusic.pause();
    setMusicUI(false);
  }
  saveMusicState();
});

// Start on the first interaction, or resume after a browser blocks autoplay.
// Keep an explicitly paused song paused when navigating between pages.
let startOnInteraction = !savedMusicState || savedMusicState.playing === true;
document.addEventListener('click', (event) => {
  if (!startOnInteraction || musicBtn.contains(event.target)) return;
  startOnInteraction = false;
  if (bgMusic.paused) playMusic();
}, true);

bgMusic.addEventListener('playing', () => setMusicUI(true));
bgMusic.addEventListener('pause', () => {
  setMusicUI(false);
  saveMusicState();
});
bgMusic.addEventListener('error', () => reportMusicError(bgMusic.error));
setMusicUI(false);

bgMusic.addEventListener('timeupdate', () => {
  if (!bgMusic.paused) saveMusicState();
});

window.addEventListener('beforeunload', saveMusicState);

/* ================================================================
   FLOATING HEARTS & STARS BACKGROUND
   Jalan otomatis di SEMUA halaman selama ada
   <div id="floating-bg"></div> di HTML-nya.
================================================================= */
const floatingBg = document.getElementById('floating-bg');
const floatEmojis = ['💖', '✨', '🩷', '💫', '💙', '💜'];

if (floatingBg){
  function spawnFloaty(){
    const el = document.createElement('div');
    el.className = 'floaty';
    el.textContent = floatEmojis[Math.floor(Math.random() * floatEmojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (16 + Math.random() * 18) + 'px';
    const duration = 8 + Math.random() * 8;
    el.style.animationDuration = duration + 's';
    floatingBg.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000);
  }
  setInterval(spawnFloaty, 700);
}

/* ================================================================
   TYPEWRITER EFFECT — hanya jalan di letter.html
   -----------------------------------------------------------
   EDIT DI SINI: ganti isi teks di bawah (letterMessage) untuk
   menulis surat ulang tahunmu sendiri. Pakai \n\n untuk ganti
   paragraf baru.
================================================================= */
const letterMessage =
`My love,

Happy birthday to the most beautiful person I know. I don't think words can fully describe how grateful I am to have you in my life, but I'm going to try anyway.

You make every  day feel special just by being in it. Your smile, your laugh, the way you care about me, the way I get lost in your eyes... it all makes me fall for you more and more each and every day.

I hope this year brings you everything you've always hoped for, and so much more. I promise to be right beside you for all of it — the big and small moments life thows our way. I can't wait to see what the future holds for us, and I know that as long as we're together, it will be amazing.

Happy birthday, babe. Here's to your birthday!!!! 🎂`;

const letterEl = document.getElementById('letter-text');
let typeIndex = 0;

function typeWriter(){
  if (!letterEl) return;
  if (typeIndex < letterMessage.length){
    const chunk = letterMessage.slice(0, typeIndex + 1).replace(/\n/g, '<br>');
    letterEl.innerHTML = chunk + '<span class="cursor">&nbsp;</span>';
    typeIndex++;
    setTimeout(typeWriter, 22);
  } else {
    letterEl.innerHTML = letterMessage.replace(/\n/g, '<br>');
  }
}

/* ================================================================
   CONFETTI EXPLOSION — hanya jalan di letter.html
================================================================= */
const canvas = document.getElementById('confetti-canvas');

if (canvas){
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];
  const confettiColors = ['#ffd6e8', '#ff9fc7', '#d6ecff', '#a8d8ff', '#e6d9ff', '#c7a9ff', '#ffffff'];

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function createConfetti(){
    confettiPieces = [];
    const count = 140;
    for (let i = 0; i < count; i++){
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        size: 6 + Math.random() * 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.5 ? 'circle' : 'rect'
      });
    }
  }

  let confettiActive = false;
  let confettiFrames = 0;
  const maxConfettiFrames = 260;

  function animateConfetti(){
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle'){
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
      }
      ctx.restore();
    });

    confettiFrames++;
    if (confettiFrames < maxConfettiFrames){
      requestAnimationFrame(animateConfetti);
    } else {
      confettiActive = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function fireConfetti(){
    createConfetti();
    confettiActive = true;
    confettiFrames = 0;
    animateConfetti();
  }

  window.addEventListener('load', () => {
    typeWriter();
    fireConfetti();
  });
}
