
(function(){
  const links = document.querySelectorAll('.bottom-nav a');
  const current = location.pathname.split('/').pop();
  links.forEach(a=>{
    if(a.getAttribute('href') === current){ a.classList.add('active'); }
  });
})();
