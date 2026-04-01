(function(){
  const isPhone = window.matchMedia('(max-width: 768px)').matches;
  if(!isPhone) return;
  const STORAGE_KEY = 'teacher_dashboard_rebuilt_v3';
  const ar = n => String(n ?? 0).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const fmt = n => Number(n||0).toLocaleString('ar-SA');
  const load = () => { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return {};}};
  const auth = () => { try{return JSON.parse(sessionStorage.getItem('mathbank_auth')||'null');}catch(e){return null;} };
  const saveAuth = obj => sessionStorage.setItem('mathbank_auth', JSON.stringify(obj));
  const getClass = (state,id) => (state.classes||[]).find(c=>c.id===id)?.name || '—';

  document.body.classList.add('mb-mobile-active');
  const shell = document.createElement('div');
  shell.className = 'mb-mobile-shell';
  shell.innerHTML = `<div id="mbSupRoot"></div>`;
  document.body.appendChild(shell);

  function renderLogin(role='principal'){
    const rTitle = role==='principal' ? 'المدير/ة' : 'المشرف/ة';
    document.getElementById('mbSupRoot').innerHTML = `
      <div class="mb-header"><div class="mb-brand"><div class="mb-logo">🏫</div><div class="mb-title"><h1>لوحة الإشراف</h1><div class="mb-sub">نسخة الجوال البنكية</div></div></div><span class="mb-pill">دخول رقابي</span></div>
      <section class="mb-hero"><h2>${rTitle}</h2><p>واجهة جوال مستقلة للإشراف المدرسي مع نفس بيانات النظام الأساسية.</p><div class="mb-balance">دخول آمن</div></section>
      <div class="mb-card mb-login-card">
        <div class="mb-login-seg"><button class="${role==='principal'?'active':''}" data-role="principal">المدير/ة</button><button class="${role==='supervisor'?'active':''}" data-role="supervisor">المشرف/ة</button></div>
        <h3>تسجيل الدخول</h3><p>أدخلي اسم المستخدم وكلمة المرور للحساب الرقابي.</p>
        <div class="mb-form"><input id="mbSupUser" placeholder="اسم المستخدم"><input id="mbSupPass" type="password" placeholder="كلمة المرور"></div>
        <div class="mb-inline-actions" style="margin-top:14px"><button class="mb-btn" id="mbSupLogin">دخول ${rTitle}</button><a class="mb-softbtn" href="index.html">العودة للبداية</a></div>
      </div>`;
    document.querySelectorAll('[data-role]').forEach(b=>b.addEventListener('click',()=>renderLogin(b.dataset.role)));
    document.getElementById('mbSupLogin')?.addEventListener('click',()=>doLogin(role));
  }

  function doLogin(role){
    const state = load();
    const user = document.getElementById('mbSupUser')?.value?.trim();
    const pass = document.getElementById('mbSupPass')?.value?.trim();
    const bucket = role==='principal' ? state.auth?.principal : state.auth?.supervisor;
    if(user === (bucket?.username||'') && pass === (bucket?.password||'')){
      saveAuth({role, user}); renderDashboard();
    }else alert('بيانات الدخول غير صحيحة.');
  }

  function renderDashboard(){
    const state = load();
    const a = auth();
    if(!a || !['principal','supervisor'].includes(a.role)) return renderLogin();
    const students = state.students||[]; const ops = state.operations||[]; const totalBalance = students.reduce((x,s)=>x+Number(s.balance||0),0);
    const pending = state.honorWeekly?.pendingWhatsApp||[];
    const alerts = [
      `طلاب بدون حركة: ${ar(students.filter(s=>(s.logs||[]).length<=1).length)}`,
      `خصومات متكررة: ${ar(students.filter(s=>Number(s.withdrawals||0)>=3).length)}`,
      `رسائل جاهزة: ${ar(pending.length)}`
    ];
    document.getElementById('mbSupRoot').innerHTML = `
      <div class="mb-header"><div class="mb-brand"><div class="mb-logo">🏫</div><div class="mb-title"><h1>الحساب الرقابي</h1><div class="mb-sub">${a.role==='principal'?'المدير/ة':'المشرف/ة'}</div></div></div><span class="mb-pill">${students.length} طالب/ة</span></div>
      <section class="mb-hero"><h2>ملخص رقابي سريع</h2><p>واجهة إشراف مختصرة للجوال مع قراءة مباشرة من بيانات النظام الحالية.</p><div class="mb-balance">${fmt(totalBalance)}</div></section>
      <div class="mb-grid-2"><div class="mb-stat"><b>الطلاب</b><span>${ar(students.length)}</span></div><div class="mb-stat"><b>العمليات</b><span>${ar(ops.length)}</span></div><div class="mb-stat"><b>الفصول</b><span>${ar((state.classes||[]).length)}</span></div><div class="mb-stat"><b>رسائل جاهزة</b><span>${ar(pending.length)}</span></div></div>
      <section class="mb-section"><div class="mb-section-head"><h3>التنبيهات الرقابية</h3></div><div class="mb-list">${alerts.map(t=>`<div class="mb-alert">${t}</div>`).join('')}</div></section>
      <section class="mb-section"><div class="mb-section-head"><h3>آخر العمليات</h3></div><div class="mb-list">${ops.slice(0,12).map(op=>{ const st=(students.find(s=>s.name===op.studentName)||{}); return `<div class="mb-op"><div class="mb-row"><div><strong>${op.studentName||'طالب/ة'}</strong><small>${getClass(state, st.classId)} • ${op.reason||'—'}<br>${op.date||''}</small></div><div class="mb-inline-actions"><a class="mb-linkbtn" href="student.html?student=${encodeURIComponent(st.id||'')}" onclick="localStorage.setItem('currentStudentId','${st.id||''}')">فتح الحساب</a></div></div></div>`;}).join('') || '<div class="mb-empty">لا توجد عمليات بعد.</div>'}</div></section>
      <section class="mb-section"><div class="mb-section-head"><h3>التقارير والاتصال</h3></div><div class="mb-actions"><a class="mb-btn" href="teacher-report.html">📄 تقرير المعلمة</a><a class="mb-softbtn" href="student-report.html">📄 تقرير الطالب</a><a class="mb-softbtn" href="teacher.html">👩‍🏫 لوحة المعلمة</a><button class="mb-dangerbtn" id="mbSupLogout">🚪 خروج</button></div></section>
      <section class="mb-section"><button class="mb-softbtn mb-switch-desktop" id="mbSupDesktop">فتح الواجهة الأصلية لهذا الجهاز</button></section>`;
    document.getElementById('mbSupLogout')?.addEventListener('click',()=>{sessionStorage.removeItem('mathbank_auth'); renderLogin();});
    document.getElementById('mbSupDesktop')?.addEventListener('click',()=>{document.body.classList.remove('mb-mobile-active'); shell.remove();});
  }

  window.addEventListener('storage', ev=>{ if(ev.key===STORAGE_KEY) renderDashboard(); });
  window.addEventListener('mathbank:state-updated', renderDashboard);
  if(auth() && ['principal','supervisor'].includes(auth().role)) renderDashboard(); else renderLogin();
})();
