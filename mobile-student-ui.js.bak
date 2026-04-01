(function(){
  const isPhone = window.matchMedia('(max-width: 768px)').matches;
  if(!isPhone) return;
  const STORAGE_KEY = 'teacher_dashboard_rebuilt_v3';
  const ar = n => String(n ?? 0).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const fmt = n => Number(n||0).toLocaleString('ar-SA');
  const load = () => { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return {};}};
  function getStudent(state){
    const params = new URLSearchParams(location.search);
    const q = params.get('student');
    const auth = (()=>{ try{return JSON.parse(sessionStorage.getItem('mathbank_auth')||'null');}catch(e){return null;} })();
    let student = null;
    if(q) student = (state.students||[]).find(s=>s.id===q);
    if(!student && auth?.role==='student') student = (state.students||[]).find(s=>s.id===auth.studentId || s.username===auth.user);
    if(!student){ const saved = localStorage.getItem('currentStudentId'); student = (state.students||[]).find(s=>s.id===saved); }
    if(!student) student = (state.students||[])[0] || null;
    if(student) localStorage.setItem('currentStudentId', student.id);
    return student;
  }
  const save = state => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); try{window.mathBankFirebase?.push?.(state);}catch(e){}; window.dispatchEvent(new CustomEvent('mathbank:state-updated')); };
  const currentClass = (state,student) => (state.classes||[]).find(c=>c.id===student?.classId)?.name || '—';
  const allowedRoulette = (student, state) => {
    if(!student || !state.roulette?.enabled) return false;
    const level = String(student.level||'');
    const eligible = ['ذهبي','ماسي','الماسي','بلاتيني'].includes(level);
    const visible = state.roulette.visibleAll || !state.roulette.visibleStudentId || state.roulette.visibleStudentId===student.id;
    return eligible && visible;
  };
  const rewardsDefault = ['إعفاء واجب','إعفاء واجبان','هدية','زيادة درجات'];

  document.body.classList.add('mb-mobile-active');
  const shell = document.createElement('div');
  shell.className = 'mb-mobile-shell';
  shell.innerHTML = `
    <div class="mb-header">
      <div class="mb-brand"><div class="mb-logo">💳</div><div class="mb-title"><h1>لوحة الطالب</h1><div class="mb-sub">واجهة الجوال المستقلة</div></div></div>
      <span class="mb-pill" id="mbStudentStatus">حساب</span>
    </div>
    <section class="mb-screen active" data-screen="home"></section>
    <section class="mb-screen" data-screen="ops"></section>
    <section class="mb-screen" data-screen="rewards"></section>
    <section class="mb-screen" data-screen="more"></section>
    <nav class="mb-tabs">
      <button class="mb-tab active" data-tab="home">🏠<span>الرئيسية</span></button>
      <button class="mb-tab" data-tab="ops">📄<span>العمليات</span></button>
      <button class="mb-tab" data-tab="rewards">🎁<span>الجوائز</span></button>
      <button class="mb-tab" data-tab="more">⚙️<span>المزيد</span></button>
    </nav>`;
  document.body.appendChild(shell);

  function renderHome(state,student){
    if(!student){ shell.querySelector('[data-screen="home"]').innerHTML = '<div class="mb-empty">لا توجد بيانات طالب مرتبطة بعد.</div>'; return; }
    document.getElementById('mbStudentStatus').textContent = student.status || 'حساب';
    shell.querySelector('[data-screen="home"]').innerHTML = `
      <div class="mb-bankcard"><div class="mb-row"><div><strong style="font-size:20px">${student.name}</strong><div class="mb-mini" style="color:rgba(255,255,255,.86)">${currentClass(state,student)} • ${student.level||'—'}</div></div><span class="mb-pill" style="background:rgba(255,255,255,.16);color:#fff;border-color:rgba(255,255,255,.22)">${student.username||'بدون مستخدم'}</span></div><div class="mb-banknum">${String(student.id||'0000').padEnd(16,'0').slice(0,16).replace(/(.{4})/g,'$1 ').trim()}</div><div class="mb-row"><div><div class="mb-mini" style="color:rgba(255,255,255,.86)">الرصيد الحالي</div><div style="font-size:30px;font-weight:900">${fmt(student.balance||0)}</div></div><button class="mb-softbtn" id="mbCopyStudent" style="background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.22)">نسخ الرقم</button></div></div>
      <section class="mb-section"><div class="mb-grid-2"><div class="mb-stat"><b>النقاط</b><span>${ar(student.points||0)}</span></div><div class="mb-stat"><b>الغياب</b><span>${ar(student.absences||0)}</span></div><div class="mb-stat"><b>الواجبات</b><span>${ar(student.submittedTasks||0)}</span></div><div class="mb-stat"><b>المستوى</b><span style="font-size:18px">${student.level||'—'}</span></div></div></section>
      <section class="mb-section"><div class="mb-section-head"><h3>الخدمات السريعة</h3></div><div class="mb-actions"><button class="mb-btn" id="mbOpenReport">📄 تقرير PDF</button><button class="mb-softbtn" id="mbOpenRouletteBtn">🎰 الروليت</button><button class="mb-softbtn" id="mbChangeCreds">🔐 بياناتي</button><button class="mb-softbtn" id="mbLogoutBtn">🚪 خروج</button></div></section>`;
    shell.querySelector('#mbCopyStudent')?.addEventListener('click',()=>navigator.clipboard?.writeText(student.id||''));
    shell.querySelector('#mbOpenReport')?.addEventListener('click',()=>window.location.href='student-report.html');
    shell.querySelector('#mbOpenRouletteBtn')?.addEventListener('click',()=>activateTab('rewards'));
    shell.querySelector('#mbLogoutBtn')?.addEventListener('click',()=>{sessionStorage.removeItem('mathbank_auth'); location.reload();});
    shell.querySelector('#mbChangeCreds')?.addEventListener('click',()=>changeCreds(student.id));
  }

  function renderOps(state,student){
    const ops = (state.operations||[]).filter(op=>op.studentName===student?.name).slice(0,20);
    shell.querySelector('[data-screen="ops"]').innerHTML = `
      <section class="mb-section"><div class="mb-section-head"><h3>كشف الحساب</h3><span class="mb-pill">${ar(ops.length)} عملية</span></div><div class="mb-list">${ops.map(op=>`<div class="mb-op"><div class="mb-row"><div><strong>${op.reason||'عملية'}</strong><small>${op.date||''} • ${op.day||''}</small></div><div class="mb-amount ${Number(op.amount||0)>=0?'mb-plus':'mb-minus'}">${Number(op.amount||0)>=0?'+':''}${fmt(op.amount||0)}</div></div></div>`).join('') || '<div class="mb-empty">لا توجد عمليات حتى الآن.</div>'}</div></section>`;
  }

  function renderRewards(state,student){
    const enabled = allowedRoulette(student,state);
    const chances = Number(state.roulette?.chances||0);
    const last = state.roulette?.lastResult || 'لم يتم تدوير الروليت بعد.';
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
        <div class="mb-surface"><strong>آخر رسالة تهنئة</strong><div class="mb-mini">${state.honorWeekly?.pendingWhatsApp?.find(x=>x.studentId===student?.id)?.message || 'لا توجد رسائل حالياً'}</div></div>
        <button class="mb-softbtn mb-switch-desktop" id="mbStudentDesktop">فتح الواجهة الأصلية لهذا الجهاز</button>
      </div></section>`;
    shell.querySelector('#mbStudentDesktop')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove();});
  }

  function changeCreds(studentId){
    const state = load(); const student = (state.students||[]).find(s=>s.id===studentId); if(!student) return;
    const username = prompt('اسم المستخدم الجديد', student.username||''); if(username===null) return;
    const password = prompt('كلمة المرور الجديدة', student.password||''); if(password===null) return;
    student.username = username.trim() || student.username;
    student.password = password.trim() || student.password;
    save(state); renderAll();
    alert('تم حفظ بيانات الدخول الجديدة.');
  }

  function spinNow(studentId){
    const state = load(); const student = (state.students||[]).find(s=>s.id===studentId); if(!student) return;
    if(!allowedRoulette(student, state)) return alert('الروليت غير متاح لهذا الحساب حالياً.');
    if(Number(state.roulette?.chances||0)<=0) return alert('انتهت الفرص المتاحة لهذا الأسبوع.');
    const rewards = (state.roulette?.rewardNames||rewardsDefault).filter(Boolean);
    const idx = Math.floor(Math.random()*rewards.length);
    state.roulette.chances = Math.max(0, Number(state.roulette.chances||0)-1);
    state.roulette.lastResult = 'مبروك فزتِ بالجائزة: ' + rewards[idx];
    save(state); renderAll(); alert(state.roulette.lastResult);
  }

  function activateTab(tab){ shell.querySelectorAll('.mb-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); shell.querySelectorAll('.mb-screen').forEach(s=>s.classList.toggle('active', s.dataset.screen===tab)); }
  function renderAll(){ const state=load(); const student=getStudent(state); renderHome(state,student); renderOps(state,student); renderRewards(state,student); renderMore(state,student); }
  shell.querySelectorAll('.mb-tab').forEach(btn=>btn.addEventListener('click',()=>activateTab(btn.dataset.tab)));
  window.addEventListener('storage', ev=>{ if(ev.key===STORAGE_KEY) renderAll(); });
  window.addEventListener('mathbank:state-updated', renderAll);
  renderAll();
})();
