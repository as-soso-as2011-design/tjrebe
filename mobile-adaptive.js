(function(){
  function applyMobileMode(){
    var isMobile = window.innerWidth <= 900 || /iPhone|Android|Mobile|iPad|iPod/i.test(navigator.userAgent);
    document.body.classList.toggle('mobile-device', isMobile);
    document.documentElement.classList.toggle('mobile-device', isMobile);
  }
  window.addEventListener('resize', applyMobileMode);
  window.addEventListener('orientationchange', applyMobileMode);
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyMobileMode);
  } else {
    applyMobileMode();
  }
})();
