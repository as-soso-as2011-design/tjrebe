(function(){
  const isPhone = window.matchMedia('(max-width: 768px)').matches;
  if(!isPhone) return;
  document.body.classList.add('mb-mobile-active');
  const shell = document.createElement('div');
  shell.className = 'mb-mobile-shell';
  shell.innerHTML = `
    <div class="mb-header">
      <div class="mb-brand"><div class="mb-logo">MB</div><div class="mb-title"><h1>بنك الرياضيات</h1><div class="mb-sub">نسخة الجوال المستقلة</div></div></div>
      <span class="mb-pill">📱 واجهة جوال احترافية</span>
    </div>
    <section class="mb-hero">
      <h2>أهلًا بك في مصرف التعليم</h2>
      <p>اختاري بوابتك بسرعة من الواجهة البنكية المخصصة للجوال. تم الإبقاء على نسخة الآيباد والكمبيوتر كما هي، مع تبديل تلقائي حسب الجهاز.</p>
      <div class="mb-balance">واجهة دخول ذكية</div>
    </section>
    <section class="mb-section">
      <div class="mb-section-head"><h3>الدخول السريع</h3></div>
      <div class="mb-list">
        <a class="mb-bankcard" href="teacher.html" style="text-decoration:none;color:#fff;display:block">
          <div class="mb-row"><strong style="font-size:20px">لوحة المعلمة</strong><span class="mb-pill" style="background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.22)">إدارة كاملة</span></div>
          <div class="mb-mini" style="color:rgba(255,255,255,.88);margin-top:10px">الفصول، الطلاب، العمليات، لوحة الشرف، الروليت، والإعدادات.</div>
        </a>
        <a class="mb-bankcard" href="student.html" style="text-decoration:none;color:#fff;display:block;background:linear-gradient(135deg,#0b2942,#164a6d 42%,#38bdf8)">
          <div class="mb-row"><strong style="font-size:20px">لوحة الطالب</strong><span class="mb-pill" style="background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.22)">حساب شخصي</span></div>
          <div class="mb-mini" style="color:rgba(255,255,255,.88);margin-top:10px">عرض الرصيد والنقاط والجوائز وسجل العمليات والروليت.</div>
        </a>
        <a class="mb-bankcard" href="supervision.html" style="text-decoration:none;color:#fff;display:block;background:linear-gradient(135deg,#17324d,#2d5f85 42%,#65c9ff)">
          <div class="mb-row"><strong style="font-size:20px">لوحة الإشراف</strong><span class="mb-pill" style="background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.22)">رقابة وتحليل</span></div>
          <div class="mb-mini" style="color:rgba(255,255,255,.88);margin-top:10px">التقارير والتنبيهات والتحليل الرقابي وكشف الحركة.</div>
        </a>
      </div>
    </section>
    <section class="mb-section">
      <div class="mb-section-head"><h3>اختصارات مفيدة</h3></div>
      <div class="mb-grid-2">
        <a class="mb-tile mb-linkbtn" href="teacher-report.html">📄 تقرير المعلمة</a>
        <a class="mb-tile mb-linkbtn" href="student-report.html">📄 تقرير الطالب</a>
      </div>
      <button class="mb-softbtn mb-switch-desktop" id="mbDesktopModeBtn">فتح الواجهة الأصلية لهذا الجهاز</button>
    </section>`;
  document.body.appendChild(shell);
  document.getElementById('mbDesktopModeBtn')?.addEventListener('click', function(){
    document.body.classList.remove('mb-mobile-active');
    shell.remove();
  });
})();
