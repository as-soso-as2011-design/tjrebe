(function(){
  const isPhone = window.matchMedia('(max-width: 768px)').matches;
  if(!isPhone) return;
  const STORAGE_KEY = 'teacher_dashboard_rebuilt_v3';
  const MOBILE_TEACHER_KEY = 'mathbank_mobile_teacher_login';
  const ar = n => String(n ?? 0).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const fmt = n => Number(n||0).toLocaleString('ar-SA');
  const load = () => { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return {};} };
  const save = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    try{ window.mathBankFirebase?.push?.(state); }catch(e){}
    window.dispatchEvent(new CustomEvent('mathbank:state-updated',{detail:{source:'mobile-teacher'}}));
  };
  const authNow = () => { try{return JSON.parse(sessionStorage.getItem('mathbank_auth')||'null');}catch(e){return null;} };
  const teacherLogin = () => { try{return JSON.parse(sessionStorage.getItem(MOBILE_TEACHER_KEY)||'null');}catch(e){return null;} };
  const validTeacherLogin = () => {
    const saved = teacherLogin();
    if(!saved) return null;
    const creds = teacherCreds(load());
    if(String(saved.user||'').trim().toLowerCase() === String(creds.username||'').trim().toLowerCase() && String(saved.pass||'') === String(creds.password||'')) return saved;
    sessionStorage.removeItem(MOBILE_TEACHER_KEY);
    return null;
  };
  const classNameById = (state,id) => (state.classes||[]).find(c=>c.id===id)?.name || '—';
  const levelChip = level => ({'الماسي':'gold','ماسي':'gold','ذهبي':'gold','فضي':'blue','برونزي':'red'})[level] || 'blue';
  let activeClass = '';

  document.body.classList.add('mb-mobile-active');
  const shell = document.createElement('div');
  shell.className = 'mb-mobile-shell';
  document.body.appendChild(shell);

  function teacherCreds(state){
    return state?.auth?.teacher || {username:'teacher', password:'1234', name:'أ. سارة'};
  }

  function renderLogin(){
    const state = load();
    const creds = teacherCreds(state);
    shell.innerHTML = `
      <div class="mb-header">
        <div class="mb-brand"><div class="mb-logo">🏦</div><div class="mb-title"><h1>لوحة المعلمة</h1><div class="mb-sub">نسخة الجوال البنكية</div></div></div>
        <span class="mb-pill">دخول آمن</span>
      </div>
      <section class="mb-hero"><h2>${creds.name || 'أ. سارة'}</h2><p>سجلي الدخول أولًا لفتح واجهة الجوال المستقلة للمعلمة.</p><div class="mb-balance">تسجيل دخول</div></section>
      <section class="mb-section"><div class="mb-section-head"><h3>بيانات المعلمة</h3></div>
        <div class="mb-form">
          <input id="mbTeacherUser" placeholder="اسم المستخدم" autocomplete="username">
          <input id="mbTeacherPass" type="password" placeholder="كلمة المرور" autocomplete="current-password">
        </div>
        <div class="mb-inline-actions" style="margin-top:14px">
          <button type="button" class="mb-btn" id="mbTeacherLoginBtn">دخول المعلمة</button>
          <a class="mb-softbtn" href="index.html">العودة للبداية</a>
        </div>
        <div class="mb-mini" style="margin-top:12px">واجهة الجوال مستقلة، لكن بيانات الحساب نفسها مرتبطة بالنظام الحالي.</div>
      </section>`;
    shell.querySelector('#mbTeacherLoginBtn')?.addEventListener('click',()=>{
      const user = shell.querySelector('#mbTeacherUser')?.value?.trim() || '';
      const pass = shell.querySelector('#mbTeacherPass')?.value?.trim() || '';
      if(!user || !pass) return alert('أدخلي اسم المستخدم وكلمة المرور.');
      if(String(user).trim().toLowerCase() !== String(creds.username||'').trim().toLowerCase() || String(pass) !== String(creds.password||'')){
        return alert('بيانات دخول المعلمة غير صحيحة.');
      }
      sessionStorage.setItem(MOBILE_TEACHER_KEY, JSON.stringify({user, pass}));
      sessionStorage.setItem('mathbank_auth', JSON.stringify({role:'teacher', user, mobile:true}));
      renderApp();
    });
  }

  function renderApp(){
    shell.innerHTML = `
      <div class="mb-header">
        <div class="mb-brand"><div class="mb-logo">🏦</div><div class="mb-title"><h1>لوحة المعلمة</h1><div class="mb-sub">نسخة الجوال البنكية</div></div></div>
        <span class="mb-pill" id="mbSyncBadge">📶 متصل</span>
      </div>
      <section class="mb-screen active" data-screen="home"></section>
      <section class="mb-screen" data-screen="students"></section>
      <section class="mb-screen" data-screen="ops"></section>
      <section class="mb-screen" data-screen="more"></section>
      <nav class="mb-tabs">
        <button class="mb-tab active" data-tab="home">🏠<span>الرئيسية</span></button>
        <button class="mb-tab" data-tab="students">👥<span>الطلاب</span></button>
        <button class="mb-tab" data-tab="ops">💸<span>العمليات</span></button>
        <button class="mb-tab" data-tab="more">⚙️<span>المزيد</span></button>
      </nav>`;
    shell.querySelectorAll('.mb-tab').forEach(btn=>btn.addEventListener('click',()=>activateTab(btn.dataset.tab)));
    renderAll();
  }

  function renderHome(state){
    const students = state.students||[]; const classes = state.classes||[]; const ops = state.operations||[];
    const totalBalance = students.reduce((a,s)=>a+Number(s.balance||0),0);
    const totalPoints = students.reduce((a,s)=>a+Number(s.points||0),0);
    const pending = (state.honorWeekly?.pendingWhatsApp||[]).length;
    const recentStudents = [...students].sort((a,b)=>Number(b.points||0)-Number(a.points||0)).slice(0,3);
    shell.querySelector('[data-screen="home"]').innerHTML = `
      <section class="mb-hero"><h2>${state.auth?.teacher?.name || 'أ. سارة'}</h2><p>إدارة سريعة من الجوال مع تحقق كامل لكلمة المرور وربط مباشر مع نفس البيانات الحالية.</p><div class="mb-balance">${fmt(totalBalance)}</div></section>
      <div class="mb-grid-2">
        <div class="mb-stat"><b>عدد الطلاب</b><span>${ar(students.length)}</span></div>
        <div class="mb-stat"><b>عدد الفصول</b><span>${ar(classes.length)}</span></div>
        <div class="mb-stat"><b>نقاط الأسبوع</b><span>${ar(totalPoints)}</span></div>
        <div class="mb-stat"><b>رسائل جاهزة</b><span>${ar(pending)}</span></div>
      </div>
      <section class="mb-section"><div class="mb-section-head"><h3>تنفيذ سريع</h3></div>
        <div class="mb-actions">
          <button class="mb-btn" id="mbQuickDeposit">➕ إيداع سريع</button>
          <button class="mb-softbtn" id="mbQuickWithdraw">➖ سحب سريع</button>
          <button class="mb-softbtn" id="mbOpenHonor">🏆 لوحة الشرف</button>
          <button class="mb-softbtn" id="mbOpenRoulette">🎰 الروليت</button>
        </div>
      </section>
      <section class="mb-section"><div class="mb-section-head"><h3>الأعلى نقاطًا</h3></div>
        <div class="mb-list">${recentStudents.map(s=>`<div class="mb-student"><div class="mb-student-top"><div><strong>${s.name}</strong><small>${classNameById(state,s.classId)} • ${s.level||'—'}</small></div><span class="mb-chip ${levelChip(s.level)}">${s.points||0} نقطة</span></div></div>`).join('') || '<div class="mb-empty">لا توجد بيانات بعد.</div>'}
        </div>
      </section>`;
    shell.querySelector('#mbQuickDeposit')?.addEventListener('click',()=>quickOperation(state,'deposit'));
    shell.querySelector('#mbQuickWithdraw')?.addEventListener('click',()=>quickOperation(state,'withdraw'));
    shell.querySelector('#mbOpenHonor')?.addEventListener('click',()=>openDesktopTab('honorTab'));
    shell.querySelector('#mbOpenRoulette')?.addEventListener('click',()=>openDesktopTab('rouletteTab'));
  }

  function renderStudents(state){
    const classes = state.classes||[];
    if(!activeClass && classes[0]) activeClass = classes[0].id;
    const list = (state.students||[]).filter(s=>!activeClass || s.classId===activeClass);
    shell.querySelector('[data-screen="students"]').innerHTML = `
      <section class="mb-section"><div class="mb-section-head"><h3>الفصول والطلاب</h3><span class="mb-pill">${ar(list.length)} طالب/ة</span></div>
        <div class="mb-h-scroll">${classes.map(c=>`<button class="mb-classchip ${c.id===activeClass?'active':''}" data-class="${c.id}">${c.name}</button>`).join('')}</div>
      </section>
      <section class="mb-section"><div class="mb-list">${list.map(s=>`<div class="mb-student"><div class="mb-student-top"><div><strong>${s.name}</strong><small>${classNameById(state,s.classId)} • ${s.username||'بدون مستخدم'}</small></div><span class="mb-chip ${String(s.status||'').includes('مفعل')?'green':'red'}">${s.status||'—'}</span></div><div class="mb-grid-3" style="margin-top:12px"><div class="mb-stat"><b>الرصيد</b><span style="font-size:18px">${fmt(s.balance||0)}</span></div><div class="mb-stat"><b>النقاط</b><span style="font-size:18px">${ar(s.points||0)}</span></div><div class="mb-stat"><b>الغياب</b><span style="font-size:18px">${ar(s.absences||0)}</span></div></div><div class="mb-inline-actions"><button class="mb-linkbtn" data-open="${s.id}">دخول الحساب</button><button class="mb-softbtn" data-reward="${s.id}">مكافأة</button><button class="mb-dangerbtn" data-cut="${s.id}">خصم</button></div></div>`).join('') || '<div class="mb-empty">لا يوجد طلاب في هذا الفصل.</div>'}</div></section>`;
    shell.querySelectorAll('[data-class]').forEach(btn=>btn.addEventListener('click',()=>{activeClass=btn.dataset.class; renderStudents(load());}));
    shell.querySelectorAll('[data-open]').forEach(btn=>btn.addEventListener('click',()=>{localStorage.setItem('currentStudentId',btn.dataset.open); window.location.href='student.html?student='+encodeURIComponent(btn.dataset.open);}));
    shell.querySelectorAll('[data-reward]').forEach(btn=>btn.addEventListener('click',()=>applyStudentAmount(btn.dataset.reward, 200, 'مكافأة سريعة')));
    shell.querySelectorAll('[data-cut]').forEach(btn=>btn.addEventListener('click',()=>applyStudentAmount(btn.dataset.cut, -50, 'خصم سريع')));
  }

  function renderOps(state){
    const ops = (state.operations||[]).slice(0,25);
    shell.querySelector('[data-screen="ops"]').innerHTML = `
      <section class="mb-section"><div class="mb-section-head"><h3>سجل العمليات</h3><span class="mb-pill">${ar(ops.length)} عملية</span></div>
      <div class="mb-list">${ops.map(op=>`<div class="mb-op"><div class="mb-row"><div><strong>${op.studentName || 'طالب/ة'}</strong><small>${op.reason || '—'}<br>${op.date || ''} • ${op.day || ''}</small></div><div class="mb-amount ${Number(op.amount||0)>=0?'mb-plus':'mb-minus'}">${Number(op.amount||0)>=0?'+':''}${fmt(op.amount||0)}</div></div></div>`).join('') || '<div class="mb-empty">لا توجد عمليات بعد.</div>'}</div></section>`;
  }

  function renderMore(state){
    const honorCount = (state.honorArchive||[]).length;
    const waCount = (state.honorWeekly?.pendingWhatsApp||[]).length;
    shell.querySelector('[data-screen="more"]').innerHTML = `
      <section class="mb-section"><div class="mb-list">
        <div class="mb-surface"><div class="mb-row"><strong>لوحة الشرف</strong><span class="mb-chip gold">${ar(honorCount)} أرشيف</span></div><div class="mb-mini">عرض النتائج والأرشيف الأسبوعي ورسائل التهنئة الجاهزة.</div><div class="mb-inline-actions"><button class="mb-linkbtn" id="mbHonorDesk">فتح القسم</button></div></div>
        <div class="mb-surface"><div class="mb-row"><strong>الروليت</strong><span class="mb-chip blue">${ar(state.roulette?.chances||0)} فرصة</span></div><div class="mb-mini">إعدادات الروليت وجوائزه الحالية محفوظة في نفس النظام.</div><div class="mb-inline-actions"><button class="mb-linkbtn" id="mbRouletteDesk">فتح القسم</button></div></div>
        <div class="mb-surface"><div class="mb-row"><strong>رسائل واتساب</strong><span class="mb-chip green">${ar(waCount)} جاهزة</span></div><div class="mb-mini">التواصل مع أولياء الأمور وفتح لوحة الإشراف.</div><div class="mb-inline-actions"><button class="mb-linkbtn" onclick="window.location.href='supervision.html'">لوحة الإشراف</button><a class="mb-softbtn" href="teacher-report.html">تقرير المعلمة</a></div></div>
        <div class="mb-surface"><div class="mb-row"><strong>اختصارات إضافية</strong><span class="mb-chip blue">جاهزة</span></div><div class="mb-mini">أزرار سريعة للجوال بدون الرجوع للواجهة الأصلية.</div><div class="mb-inline-actions"><a class="mb-softbtn" href="student-report.html">تقرير الطالب</a><button class="mb-softbtn" id="mbGoStudents">الطلاب</button><button class="mb-softbtn" id="mbGoOps">العمليات</button></div></div>
        <button class="mb-softbtn mb-switch-desktop" id="mbDesktopModeBtn">فتح الواجهة الأصلية لهذا الجهاز</button>
        <button class="mb-dangerbtn" id="mbTeacherLogoutBtn">تسجيل الخروج</button>
      </div></section>`;
    shell.querySelector('#mbHonorDesk')?.addEventListener('click',()=>openDesktopTab('honorTab'));
    shell.querySelector('#mbRouletteDesk')?.addEventListener('click',()=>openDesktopTab('rouletteTab'));
    shell.querySelector('#mbGoStudents')?.addEventListener('click',()=>activateTab('students'));
    shell.querySelector('#mbGoOps')?.addEventListener('click',()=>activateTab('ops'));
    shell.querySelector('#mbDesktopModeBtn')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove();});
    shell.querySelector('#mbTeacherLogoutBtn')?.addEventListener('click',()=>{sessionStorage.removeItem('mathbank_auth'); sessionStorage.removeItem(MOBILE_TEACHER_KEY); renderLogin();});
  }

  function openDesktopTab(tabId){
    document.body.classList.remove('mb-mobile-active');
    shell.remove();
    try{window.switchTab?.(tabId);}catch(e){}
  }

  function quickOperation(state, type){
    const students = state.students||[]; if(!students.length) return alert('لا يوجد طلاب بعد.');
    const name = prompt('اكتبي اسم الطالب/ة كما هو ظاهر في النظام'); if(!name) return;
    const student = students.find(s=>String(s.name).trim()===String(name).trim()); if(!student) return alert('الاسم غير موجود.');
    const amount = Number(prompt(type==='deposit' ? 'قيمة الإيداع' : 'قيمة الخصم', type==='deposit' ? '100' : '50')); if(!amount) return;
    applyStudentAmount(student.id, type==='deposit' ? Math.abs(amount) : -Math.abs(amount), type==='deposit' ? 'إيداع سريع من الجوال' : 'خصم سريع من الجوال');
  }

  function applyStudentAmount(studentId, amount, reason){
    const state = load();
    const student = (state.students||[]).find(s=>s.id===studentId); if(!student) return;
    student.balance = Number(student.balance||0) + Number(amount||0);
    if(Number(amount||0) > 0) student.points = Number(student.points||0) + 1;
    const now = new Date();
    const op = {studentName:student.name, amount:Number(amount||0), reason, date:now.toLocaleDateString('en-CA'), day:now.toLocaleDateString('ar-SA',{weekday:'long'}), time:now.toLocaleTimeString('ar-SA')};
    state.operations = [op].concat(state.operations||[]);
    student.logs = [{date:now.toLocaleString('ar-SA'), action:reason, details:`${amount}`}].concat(student.logs||[]);
    save(state); renderAll();
    alert('تم تنفيذ العملية بنجاح.');
  }

  function activateTab(tab){ shell.querySelectorAll('.mb-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); shell.querySelectorAll('.mb-screen').forEach(s=>s.classList.toggle('active', s.dataset.screen===tab)); }
  function renderAll(){ const state=load(); renderHome(state); renderStudents(state); renderOps(state); renderMore(state); }
  window.addEventListener('storage', ev=>{ if(ev.key===STORAGE_KEY && authNow()?.role==='teacher') renderAll(); });
  window.addEventListener('mathbank:state-updated', ()=>{ if(authNow()?.role==='teacher') renderAll(); });

  if(validTeacherLogin()) renderApp(); else renderLogin();
})();
