
(function(){
  function isMobile(){ return window.innerWidth <= 768; }
  if(isMobile()) document.documentElement.classList.add('mobile-banking');
  window.addEventListener('resize', function(){
    document.documentElement.classList.toggle('mobile-banking', isMobile());
  });

  document.addEventListener('DOMContentLoaded', function(){
    if(!isMobile()) return;

    // Add supervision entry card to landing page if missing
    var entryCards = document.querySelector('#cbEntry .cards');
    if(entryCards && !document.getElementById('cbSuperCard')){
      var card = document.createElement('article');
      card.className = 'card';
      card.id = 'cbSuperCard';
      card.innerHTML = '<div class="cardIcon">🏫</div><h3>دخول الإشراف</h3><p>فتح لوحة الإشراف المدرسي والرقابة مباشرة من واجهة الجوال.</p><button class="btn" type="button" onclick="window.location.href='supervision.html'">دخول الإشراف</button>';
      entryCards.appendChild(card);
    }

    // Override mobile login on landing to direct pages instead of internal iframe legacy flow
    if(window.cbTeacherSubmit){
      window.cbTeacherSubmit = function(e){
        e.preventDefault();
        var user = document.getElementById('cbTeacherUser');
        var pass = document.getElementById('cbTeacherPass');
        var status = document.getElementById('cbTeacherStatus');
        if(!user || !pass || !user.value.trim() || !pass.value.trim()){
          if(status){ status.className='status show error'; status.textContent='يرجى تعبئة اسم المستخدم وكلمة المرور قبل المتابعة.'; }
          return;
        }
        try{ sessionStorage.setItem('mathbank_teacher_user', user.value.trim()); }catch(e){}
        window.location.href = 'teacher.html';
      }
    }
    if(window.cbStudentSubmit){
      window.cbStudentSubmit = function(e){
        e.preventDefault();
        var user = document.getElementById('cbStudentUser');
        var pass = document.getElementById('cbStudentPass');
        var status = document.getElementById('cbStudentStatus');
        if(!user || !pass || !user.value.trim() || !pass.value.trim()){
          if(status){ status.className='status show error'; status.textContent='يرجى تعبئة اسم الطالب/ـة وكلمة المرور قبل المتابعة.'; }
          return;
        }
        try{ sessionStorage.setItem('mathbank_student_user', user.value.trim()); }catch(e){}
        window.location.href = 'student.html';
      }
    }
  });
})();
