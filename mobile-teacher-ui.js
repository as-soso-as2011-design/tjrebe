(function(){
  const isPhone = window.matchMedia('(max-width: 768px)').matches;
  if(!isPhone) return;
  const STORAGE_KEY = 'teacher_dashboard_rebuilt_v3';
  const ar = n => String(n ?? 0).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const fmt = n => Number(n||0).toLocaleString('ar-SA');
  const load = () => { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return {};}};
  const save = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    try{ window.mathBankFirebase?.push?.(state); }catch(e){}
    window.dispatchEvent(new CustomEvent('mathbank:state-updated',{detail:{source:'mobile-teacher'}}));
  };
  const classNameById = (state,id) => (state.classes||[]).find(c=>c.id===id)?.name || '—';
  const levelChip = level => ({'الماسي':'gold','ماسي':'gold','ذهبي':'gold','فضي':'blue','برونزي':'red'})[level] || 'blue';
  let activeClass = '';

  document.body.classList.add('mb-mobile-active');
  const shell = document.createElement('div');
  shell.className = 'mb-mobile-shell';
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
  document.body.appendChild(shell);

  function renderHome(state){
    const students = state.students||[]; const classes = state.classes||[]; const ops = state.operations||[];
    const totalBalance = students.reduce((a,s)=>a+Number(s.balance||0),0);
    const totalPoints = students.reduce((a,s)=>a+Number(s.points||0),0);
    const pending = (state.honorWeekly?.pendingWhatsApp||[]).length;
    const recentStudents = [...students].sort((a,b)=>Number(b.points||0)-Number(a.points||0)).slice(0,3);
    shell.querySelector('[data-screen="home"]').innerHTML = `
      <section class="mb-hero"><h2>${state.auth?.teacher?.name || 'أ. سارة'}</h2><p>إدارة سريعة من الجوال بنفس بيانات النظام الحالي، مع واجهة مستقلة عن الآيباد والكمبيوتر.</p><div class="mb-balance">${fmt(totalBalance)}</div></section>
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
    shell.querySelector('#mbOpenHonor')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove(); try{window.switchTab?.('honorTab')}catch(e){}});
    shell.querySelector('#mbOpenRoulette')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove(); try{window.switchTab?.('rouletteTab')}catch(e){}});
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
        <div class="mb-surface"><div class="mb-row"><strong>رسائل واتساب</strong><span class="mb-chip green">${ar(waCount)} جاهزة</span></div><div class="mb-mini">فتح رسائل التهنئة والتواصل مع أولياء الأمور.</div><div class="mb-inline-actions"><button class="mb-linkbtn" onclick="window.location.href='supervision.html'">لوحة الإشراف</button></div></div>
        <button class="mb-softbtn mb-switch-desktop" id="mbDesktopModeBtn">فتح الواجهة الأصلية لهذا الجهاز</button>
      </div></section>`;
    shell.querySelector('#mbHonorDesk')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove(); try{window.switchTab?.('honorTab')}catch(e){}});
    shell.querySelector('#mbRouletteDesk')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove(); try{window.switchTab?.('rouletteTab')}catch(e){}});
    shell.querySelector('#mbDesktopModeBtn')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove();});
  }

  function quickOperation(state, type){
    const students = state.students||[]; if(!students.length) return alert('لا يوجد طلاب بعد.');
    const name = prompt('اكتبي اسم الطالب/ة كما هو ظاهر في النظام'); if(!name) return;
    const student = students.find(s=>String(s.name).trim()===String(name).trim()); if(!student) return alert('الاسم غير موجود.');
    const amountRaw = prompt(type==='deposit' ? 'قيمة الإيداع' : 'قيمة السحب');
    const amount = Number(amountRaw||0); if(!amount) return;
    applyStudentAmount(student.id, type==='deposit'? amount : -Math.abs(amount), type==='deposit'?'إيداع سريع من الجوال':'سحب سريع من الجوال');
  }

  function applyStudentAmount(studentId, signedAmount, reason){
    const state = load(); const student = (state.students||[]).find(s=>s.id===studentId); if(!student) return;
    student.balance = Number(student.balance||0) + Number(signedAmount||0);
    if(Number(signedAmount) > 0) student.points = Number(student.points||0) + 1;
    if(Number(signedAmount) < 0) student.withdrawals = Number(student.withdrawals||0) + 1;
    if(!Array.isArray(state.operations)) state.operations = [];
    const now = new Date();
    state.operations.unshift({date: now.toLocaleDateString('en-CA'), day: now.toLocaleDateString('ar-SA',{weekday:'long'}), studentName: student.name, className: classNameById(state,student.classId), amount: Number(signedAmount), reason});
    save(state); renderAll();
  }

  function renderAll(){ const state = load(); renderHome(state); renderStudents(state); renderOps(state); renderMore(state); }

  shell.querySelectorAll('.mb-tab').forEach(btn=>btn.addEventListener('click',()=>{
    shell.querySelectorAll('.mb-tab').forEach(b=>b.classList.remove('active'));
    shell.querySelectorAll('.mb-screen').forEach(s=>s.classList.remove('active'));
    btn.classList.add('active'); shell.querySelector(`[data-screen="${btn.dataset.tab}"]`)?.classList.add('active');
  }));
  window.addEventListener('storage', ev=>{ if(ev.key===STORAGE_KEY) renderAll(); });
  window.addEventListener('mathbank:state-updated', renderAll);
  renderAll();
})();
