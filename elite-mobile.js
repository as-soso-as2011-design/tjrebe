
const MB_KEY='teacher_dashboard_rebuilt_v3';
function mbState(){
  try{return JSON.parse(localStorage.getItem(MB_KEY)||'{}')}catch(e){return {}}
}
function t(v){return String(v||'').trim().toLowerCase()}
function teacherAuth(user,pass){
  const s=mbState(); const a=(s.auth&&s.auth.teacher)||{username:'teacher',password:'1234'};
  return t(user)===t(a.username) && String(pass)===String(a.password);
}
function studentAuth(user,pass){
  const s=mbState(); const arr=Array.isArray(s.students)?s.students:[];
  return arr.find(st=>(t(user)===t(st.username)||t(user)===t(st.name)) && String(pass)===String(st.password));
}
function roleAuth(role,user,pass){
  const s=mbState(); const auth=(s.auth&&s.auth[role]) || {username: role==='principal'?'principal':'supervisor', password:'1234'};
  return t(user)===t(auth.username) && String(pass)===String(auth.password);
}
function showMsg(id, kind, txt){
  const el=document.getElementById(id); if(!el) return;
  el.className='message show '+kind; el.textContent=txt;
}
function loginTeacher(){
  const u=document.getElementById('teacherUser').value;
  const p=document.getElementById('teacherPass').value;
  if(!teacherAuth(u,p)) return showMsg('teacherMsg','err','بيانات دخول المعلمة غير صحيحة.');
  sessionStorage.setItem('mathbank_auth', JSON.stringify({role:'teacher',user:u,mobile:true}));
  location.href='teacher.html?from=mobile';
}
function loginStudent(){
  const u=document.getElementById('studentUser').value;
  const p=document.getElementById('studentPass').value;
  const st=studentAuth(u,p);
  if(!st) return showMsg('studentMsg','err','بيانات دخول الطالب/ة غير صحيحة.');
  sessionStorage.setItem('mathbank_auth', JSON.stringify({role:'student',user:u,studentId:st.id,mobile:true}));
  location.href='student.html?from=mobile';
}
function loginPrincipal(){
  const u=document.getElementById('principalUser').value;
  const p=document.getElementById('principalPass').value;
  if(!roleAuth('principal',u,p)) return showMsg('superMsg','err','بيانات دخول المدير/ة غير صحيحة.');
  sessionStorage.setItem('mathbank_auth', JSON.stringify({role:'principal',user:u,mobile:true}));
  location.href='supervision.html?from=mobile';
}
function loginSupervisor(){
  const u=document.getElementById('supervisorUser').value;
  const p=document.getElementById('supervisorPass').value;
  if(!roleAuth('supervisor',u,p)) return showMsg('superMsg','err','بيانات دخول المشرف/ة غير صحيحة.');
  sessionStorage.setItem('mathbank_auth', JSON.stringify({role:'supervisor',user:u,mobile:true}));
  location.href='supervision.html?from=mobile';
}
