/* ================================================================
   AUTO-SCROLL PELAN buat kontainer "22 reasons"
   -----------------------------------------------------------
   Kontainernya otomatis scroll ke bawah pelan-pelan (kayak
   credits film), biar ada animasi kecil & dia nggak perlu
   scroll manual buat baca semuanya. Begitu dia coba interaksi
   sendiri (hover, sentuh, atau scroll manual), auto-scroll-nya
   berhenti sebentar, lalu lanjut lagi otomatis kalau didiemin.

   EDIT DI SINI kalau mau ubah kecepatannya: makin besar angka
   di `scrollSpeed`, makin cepat scroll-nya (default: pelan banget).
================================================================= */
const reasonsBox = document.getElementById('reasonsBox');

if (reasonsBox){
  const scrollSpeed = 0.35; // px per frame — kecil = pelan
  let isPaused = false;
  let resumeTimeout = null;
  let loopScheduled = false;

  function pauseAutoScroll(){
    isPaused = true;
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => { isPaused = false; }, 1800);
  }

  ['mouseenter', 'touchstart', 'wheel'].forEach(evt => {
    reasonsBox.addEventListener(evt, pauseAutoScroll, { passive: true });
  });

  function autoScrollStep(){
    if (!isPaused){
      reasonsBox.scrollTop += scrollSpeed;

      const atBottom = reasonsBox.scrollTop + reasonsBox.clientHeight >= reasonsBox.scrollHeight - 1;
      if (atBottom && !loopScheduled){
        loopScheduled = true;
        setTimeout(() => {
          reasonsBox.scrollTop = 0;
          loopScheduled = false;
        }, 1800);
      }
    }
    requestAnimationFrame(autoScrollStep);
  }

  requestAnimationFrame(autoScrollStep);
}
