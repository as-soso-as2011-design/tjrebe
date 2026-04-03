
(function(){
  function setupMobilePage(currentKey){
    document.documentElement.classList.add('mobile-bank-page');
    if (window.innerWidth > 900 && !location.search.includes('mobile=1')) {
      const backMap = {
        'mobile-index.html':'index.html',
        'mobile-teacher.html':'teacher.html',
        'mobile-student.html':'student.html',
        'mobile-supervision.html':'supervision.html'
      };
      const target = backMap[location.pathname.split('/').pop()];
      if(target){ location.replace(target + location.search + location.hash); }
      return;
    }
    if (!document.querySelector('.mobile-top-chip')) {
      const chip = document.createElement('div');
      chip.className = 'mobile-top-chip';
      chip.innerHTML = '<b>بنك الرياضيات</b><span>نسخة الجوال البنكية</span>';
      const firstPanel = document.querySelector('.page, .app, body');
      if (firstPanel && firstPanel.firstChild) firstPanel.insertBefore(chip, firstPanel.firstChild);
      else if (firstPanel) firstPanel.appendChild(chip);
    }
    if (!document.querySelector('.mobile-bottom-nav')) {
      const nav = document.createElement('div');
      nav.className = 'mobile-bottom-nav';
      const items = [
        ['mobile-index.html','الرئيسية'],
        ['mobile-teacher.html','المعلمة'],
        ['mobile-student.html','الطالب'],
        ['mobile-supervision.html','الإشراف']
      ];
      nav.innerHTML = items.map(function(it){
        const active = it[0] === currentKey ? 'active' : '';
        return '<a class="'+active+'" href="'+it[0]+'">'+it[1]+'</a>';
      }).join('');
      document.body.appendChild(nav);
    }
  }
  window.__setupMathBankMobilePage = setupMobilePage;
})();
