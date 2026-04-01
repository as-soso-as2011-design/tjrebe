(function(){
  const isPhone = window.matchMedia('(max-width: 768px)').matches;
  if(!isPhone) return;
  const STORAGE_KEY = 'teacher_dashboard_rebuilt_v3';
  const MOBILE_STUDENT_KEY = 'mathbank_mobile_student_login';
  const ar = n => String(n ?? 0).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const fmt = n => Number(n||0).toLocaleString('ar-SA');
  const rewardsDefault = ['إعفاء واجب','إعفاء واجبين','زيادة درجات في الاختبار','وجبة ماكدونالدز'];
  const load = () => { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return {};} };
  const save = state => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    try{ window.mathBankFirebase?.push?.(state); }catch(e){}
    window.dispatchEvent(new CustomEvent('mathbank:state-updated',{detail:{source:'mobile-student'}}));
  };
  const authNow = () => { try{return JSON.parse(sessionStorage.getItem(MOBILE_STUDENT_KEY)||'null');}catch(e){return null;} };
  const savedLogin = () => { try{return JSON.parse(sessionStorage.getItem(MOBILE_STUDENT_KEY)||'null');}catch(e){return null;} };

  document.body.classList.add('mb-mobile-active');
  const shell = document.createElement('div');
  shell.className = 'mb-mobile-shell';
  document.body.appendChild(shell);

  function currentClass(state, student){ return (state.classes||[]).find(c=>c.id===student?.classId)?.name || '—'; }
  function studentFromState(state){
    const a = authNow(); const saved = savedLogin(); const params = new URLSearchParams(location.search);
    const id = a?.studentId || saved?.studentId || params.get('student') || localStorage.getItem('currentStudentId') || '';
    let student = (state.students||[]).find(s=>s.id===id);
    if(!student && a?.user) student = (state.students||[]).find(s=>String(s.username||'').trim().toLowerCase()===String(a.user).trim().toLowerCase());
    if(student) localStorage.setItem('currentStudentId', student.id);
    return student || null;
  }
  function allowedRoulette(student, state){
    const level = String(student?.level || '');
    const levelOk = ['ذهبي','بلاتيني','ماسي','الماسي','الماسيّ'].some(x => level.includes(x));
    if(!levelOk) return false;
    const r = state.roulette || {};
    if(!r.enabled) return false;
    if(r.visibleAll) return true;
    return !!(r.visibleStudentId && r.visibleStudentId === student.id);
  }
  function validateStudent(user, pass){
    const state = load();
    return (state.students||[]).find(s => (String(s.username||'').trim().toLowerCase()===String(user).trim().toLowerCase() || String(s.name||'').trim().toLowerCase()===String(user).trim().toLowerCase()) && String(s.password||'')===String(pass||''));
  }

  function renderLogin(){
    shell.innerHTML = `
      <div class="mb-header"><div class="mb-brand"><div class="mb-logo">💳</div><div class="mb-title"><h1>لوحة الطالب</h1><div class="mb-sub">نسخة الجوال البنكية</div></div></div><span class="mb-pill">دخول الطالب</span></div>
      <section class="mb-hero"><h2>الحساب الشخصي</h2><p>سجل دخولك باسم المستخدم أو الاسم، مع كلمة المرور المحفوظة في النظام.</p><div class="mb-balance">دخول آمن</div></section>
      <section class="mb-section"><div class="mb-section-head"><h3>تسجيل الدخول</h3></div>
        <div class="mb-form">
          <input id="mbStudentUser" placeholder="اسم المستخدم أو اسم الطالب/ة" autocomplete="username">
          <input id="mbStudentPass" type="password" placeholder="كلمة المرور" autocomplete="current-password">
        </div>
        <div class="mb-inline-actions" style="margin-top:14px"><button type="button" class="mb-btn" id="mbStudentLoginBtn">دخول الطالب/ة</button><a class="mb-softbtn" href="index.html">العودة للبداية</a></div>
        <div class="mb-mini" style="margin-top:12px">يمكن استخدام اسم المستخدم أو اسم الطالب/ة كما هو محفوظ في لوحة المعلمة.</div>
      </section>`;
    shell.querySelector('#mbStudentLoginBtn')?.addEventListener('click',()=>{
      const user = shell.querySelector('#mbStudentUser')?.value?.trim() || '';
      const pass = shell.querySelector('#mbStudentPass')?.value?.trim() || '';
      if(!user || !pass) return alert('أدخلي اسم المستخدم وكلمة المرور.');
      const student = validateStudent(user, pass);
      if(!student) return alert('بيانات دخول الطالب/ة غير صحيحة.');
      sessionStorage.setItem(MOBILE_STUDENT_KEY, JSON.stringify({role:'student', user, pass, studentId: student.id, mobile:true}));
      localStorage.setItem('currentStudentId', student.id);
      renderApp();
    });
  }

  function renderApp(){
    shell.innerHTML = `
      <div class="mb-header"><div class="mb-brand"><div class="mb-logo">💳</div><div class="mb-title"><h1>لوحة الطالب</h1><div class="mb-sub">نسخة الجوال البنكية</div></div></div><span class="mb-pill">حسابي</span></div>
      <section class="mb-screen active" data-screen="home"></section>
      <section class="mb-screen" data-screen="ops"></section>
      <section class="mb-screen" data-screen="rewards"></section>
      <section class="mb-screen" data-screen="more"></section>
      <nav class="mb-tabs">
        <button class="mb-tab active" data-tab="home">🏠<span>الرئيسية</span></button>
        <button class="mb-tab" data-tab="ops">📜<span>العمليات</span></button>
        <button class="mb-tab" data-tab="rewards">🎁<span>الجوائز</span></button>
        <button class="mb-tab" data-tab="more">⚙️<span>المزيد</span></button>
      </nav>`;
    shell.querySelectorAll('.mb-tab').forEach(btn=>btn.addEventListener('click',()=>activateTab(btn.dataset.tab)));
    renderAll();
  }

  function renderHome(state, student){
    const opCount = (state.operations||[]).filter(op=>op.studentName===student?.name).length;
    shell.querySelector('[data-screen="home"]').innerHTML = `
      <section class="mb-hero"><h2>${student?.name || 'الطالب/ة'}</h2><p>${currentClass(state, student)} • ${student?.level || '—'}</p><div class="mb-balance">${fmt(student?.balance||0)}</div></section>
      <div class="mb-grid-2"><div class="mb-stat"><b>النقاط</b><span>${ar(student?.points||0)}</span></div><div class="mb-stat"><b>العمليات</b><span>${ar(opCount)}</span></div><div class="mb-stat"><b>الغياب</b><span>${ar(student?.absences||0)}</span></div><div class="mb-stat"><b>المستوى</b><span>${student?.level||'—'}</span></div></div>
      <section class="mb-section"><div class="mb-section-head"><h3>خدمات سريعة</h3></div><div class="mb-actions"><button class="mb-btn" id="mbProfileBtn">👤 بياناتي</button><button class="mb-softbtn" id="mbNotifBtn">🔔 إشعاراتي</button><button class="mb-softbtn" id="mbCredsBtn">🔐 تغيير البيانات</button></div></section>
      <section class="mb-section"><div class="mb-section-head"><h3>آخر تنبيه</h3></div><div class="mb-alert">${state.honorWeekly?.pendingWhatsApp?.find(x=>x.studentId===student?.id)?.message || 'لا توجد رسائل جديدة حالياً.'}</div></section>`;
    shell.querySelector('#mbProfileBtn')?.addEventListener('click',()=>alert(`الاسم: ${student?.name}\nالفصل: ${currentClass(state,student)}\nالمستوى: ${student?.level||'—'}\nاسم المستخدم: ${student?.username||'—'}`));
    shell.querySelector('#mbNotifBtn')?.addEventListener('click',()=>alert(state.honorWeekly?.pendingWhatsApp?.find(x=>x.studentId===student?.id)?.message || 'لا توجد إشعارات جديدة حالياً.'));
    shell.querySelector('#mbCredsBtn')?.addEventListener('click',()=>changeCreds(student.id));
  }

  function renderOps(state, student){
    const ops = (state.operations||[]).filter(op=>op.studentName===student?.name).slice(0,20);
    shell.querySelector('[data-screen="ops"]').innerHTML = `
      <section class="mb-section"><div class="mb-section-head"><h3>سجل العمليات</h3><span class="mb-pill">${ar(ops.length)} عملية</span></div>
      <div class="mb-list">${ops.map(op=>`<div class="mb-op"><div class="mb-row"><div><strong>${op.reason || 'عملية'}</strong><small>${op.date || ''} • ${op.day || ''}<br>${op.time || ''}</small></div><div class="mb-amount ${Number(op.amount||0)>=0?'mb-plus':'mb-minus'}">${Number(op.amount||0)>=0?'+':''}${fmt(op.amount||0)}</div></div></div>`).join('') || '<div class="mb-empty">لا توجد عمليات بعد.</div>'}</div></section>`;
  }

  function renderRewards(state, student){
    const enabled = allowedRoulette(student, state);
    const chances = Number(state.roulette?.chances||0);
    const last = state.roulette?.lastResult || 'لم يتم التدوير بعد.';
    shell.querySelector('[data-screen="rewards"]').innerHTML = `
      <section class="mb-section"><div class="mb-section-head"><h3>الروليت والجوائز</h3><span class="mb-pill">${ar(chances)} فرصة</span></div>
        <div class="mb-surface"><div class="mb-alert">${enabled ? 'الروليت متاح لهذا الحساب في الجوال.' : 'الروليت غير متاح لهذا الحساب حاليًا أو لم يتم تفعيله من لوحة المعلمة.'}</div><div class="mb-inline-actions" style="margin-top:12px"><button class="mb-btn" id="mbSpinNow" ${enabled&&chances>0?'':'disabled'} style="${enabled&&chances>0?'':'opacity:.55;pointer-events:none'}">🎰 تدوير الآن</button></div><div class="mb-mini" style="margin-top:12px">${last}</div></div>
        <div class="mb-list" style="margin-top:12px">${(state.roulette?.rewardNames||rewardsDefault).map(r=>`<div class="mb-op"><strong>${r}</strong></div>`).join('')}</div>
      </section>`;
    shell.querySelector('#mbSpinNow')?.addEventListener('click',()=>spinNow(student.id));
  }

  function renderMore(state,student){
    shell.querySelector('[data-screen="more"]').innerHTML = `
      <section class="mb-section"><div class="mb-list">
        <div class="mb-surface"><strong>اسم المستخدم</strong><div class="mb-mini">${student?.username||'—'}</div></div>
        <div class="mb-surface"><strong>الفصل</strong><div class="mb-mini">${currentClass(state,student)}</div></div>
        <div class="mb-surface"><strong>حالة الحساب</strong><div class="mb-mini">${student?.status||'—'}</div></div>
        <div class="mb-surface"><strong>آخر رسالة تهنئة</strong><div class="mb-mini">${state.honorWeekly?.pendingWhatsApp?.find(x=>x.studentId===student?.id)?.message || 'لا توجد رسائل حالياً'}</div></div>
        <a class="mb-softbtn" href="student-report.html">📄 تقرير الطالب</a>
        <button class="mb-softbtn" id="mbStudentGoOps">سجل العمليات</button>
        <button class="mb-softbtn" id="mbStudentGoRewards">الروليت</button>
        <button class="mb-softbtn mb-switch-desktop" id="mbStudentDesktop">فتح الواجهة الأصلية لهذا الجهاز</button>
        <button class="mb-dangerbtn" id="mbStudentLogout">تسجيل الخروج</button>
      </div></section>`;
    shell.querySelector('#mbStudentGoOps')?.addEventListener('click',()=>activateTab('ops'));
    shell.querySelector('#mbStudentGoRewards')?.addEventListener('click',()=>activateTab('rewards'));
    shell.querySelector('#mbStudentDesktop')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove();});
    shell.querySelector('#mbStudentLogout')?.addEventListener('click',()=>{sessionStorage.removeItem(MOBILE_STUDENT_KEY); renderLogin();});
  }

  function changeCreds(studentId){
    const state = load(); const student = (state.students||[]).find(s=>s.id===studentId); if(!student) return;
    const username = prompt('اسم المستخدم الجديد', student.username||''); if(username===null) return;
    const password = prompt('كلمة المرور الجديدة', student.password||''); if(password===null) return;
    student.username = username.trim() || student.username;
    student.password = password.trim() || student.password;
    save(state);
    sessionStorage.setItem('mathbank_student_login', JSON.stringify({user: student.username, pass: student.password, studentId: student.id}));
    sessionStorage.setItem('mathbank_auth', JSON.stringify({role:'student', user: student.username, studentId: student.id}));
    renderAll();
    alert('تم حفظ بيانات الدخول الجديدة.');
  }

  function spinNow(studentId){
    const state = load(); const student = (state.students||[]).find(s=>s.id===studentId); if(!student) return;
    if(!allowedRoulette(student, state)) return alert('الروليت غير متاح لهذا الحساب حالياً.');
    if(Number(state.roulette?.chances||0)<=0) return alert('انتهت الفرص المتاحة لهذا الأسبوع.');
    const rewards = (state.roulette?.rewardNames||rewardsDefault).filter(Boolean);
    const idx = Math.floor(Math.random()*rewards.length);
    state.roulette = state.roulette || {};
    state.roulette.chances = Math.max(0, Number(state.roulette.chances||0)-1);
    state.roulette.lastResult = 'مبروك فزتِ بالجائزة: ' + rewards[idx];
    save(state); renderAll(); alert(state.roulette.lastResult);
  }

  function activateTab(tab){ shell.querySelectorAll('.mb-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); shell.querySelectorAll('.mb-screen').forEach(s=>s.classList.toggle('active', s.dataset.screen===tab)); }
  function renderAll(){ const state=load(); const student=studentFromState(state); if(!student) return renderLogin(); renderHome(state,student); renderOps(state,student); renderRewards(state,student); renderMore(state,student); }
  window.addEventListener('storage', ev=>{ if(ev.key===STORAGE_KEY && (authNow()?.role==='student' || savedLogin())) renderAll(); });
  window.addEventListener('mathbank:state-updated', ()=>{ if(authNow()?.role==='student' || savedLogin()) renderAll(); });

  if(savedLogin()) renderApp(); else renderLogin();
})();
