(function(){
  function applyMobileFlag(){
    var mobile = window.innerWidth <= 900;
    document.documentElement.classList.toggle('mobile-device-ui', mobile);
    document.body.classList.toggle('mobile-device-ui', mobile);
    if(document.title && document.title.indexOf('بنك الرياضيات المصرفي')!==-1){
      document.body.classList.add('index-mobile');
    }
  }

  function buildIndexMobileCards(){
    if(window.innerWidth > 900) return;
    var cards = document.querySelector('.cards');
    if(!cards || cards.dataset.mobileEnhanced === '1') return;
    cards.dataset.mobileEnhanced = '1';

    cards.querySelectorAll('button.btn').forEach(function(btn){
      var text = (btn.textContent || '').trim();
      if(text.indexOf('المعلمة') !== -1){ btn.onclick = function(){ location.href='teacher.html'; }; }
      if(text.indexOf('الطالب') !== -1){ btn.onclick = function(){ location.href='student.html'; }; }
    });

    var hasSupervision = Array.from(cards.querySelectorAll('h3')).some(function(h){ return (h.textContent||'').indexOf('الإشراف')!==-1; });
    if(!hasSupervision){
      var article = document.createElement('article');
      article.className = 'card mobile-bank-entry';
      article.innerHTML = '<div class="cardIcon">🏫</div><h3>دخول الإشراف</h3><p>الدخول إلى لوحة الإشراف المدرسي ومتابعة التقارير والتحليل الرقابي.</p><button class="btn" type="button">دخول الإشراف</button>';
      article.querySelector('button').onclick = function(){ location.href='supervision.html'; };
      cards.appendChild(article);
    }
  }

  function preserveAllButtons(){
    if(window.innerWidth > 900) return;
    document.querySelectorAll('.menu-item,.tab,.tab-btn,.super-tab-btn,.settings-subbtn,.mutabaa-subbtn').forEach(function(el){
      el.setAttribute('title', (el.textContent||'').trim());
    });
  }

  function init(){
    applyMobileFlag();
    buildIndexMobileCards();
    preserveAllButtons();
  }

  window.addEventListener('resize', applyMobileFlag, {passive:true});
  document.addEventListener('DOMContentLoaded', init);
})();
