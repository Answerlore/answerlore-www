// Shared page script. Inline scripts are gone so the site can ship a
// Content-Security-Policy without 'unsafe-inline' for scripts.

// Sticky nav and the machine animations on the home page.
(function(){
  var reduce=false;
  try{reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  var nav=document.querySelector('nav.site');
  if(nav){
    var stick=function(){nav.classList.toggle('is-stuck',window.scrollY>8)};
    stick();window.addEventListener('scroll',stick,{passive:true});
  }
  var machines=document.querySelectorAll('.machine');
  if(!('IntersectionObserver' in window)||reduce){
    machines.forEach(function(m){m.classList.add('run')});return;
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){e.target.classList.toggle('run',e.isIntersecting)});
  },{threshold:.35});
  machines.forEach(function(m){io.observe(m)});
})();

// Contact forms: Web3Forms when a key is set, mailto fallback otherwise.
(function(){
  var PLACEHOLDER = 'REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY';
  var EMAIL = 'hello@answerlore.com';
  document.querySelectorAll('form.form').forEach(function(f){
    var key = f.querySelector('[name=access_key]');
    var note = f.querySelector('[data-fallback]');
    var live = key && key.value !== PLACEHOLDER;
    if(!live && note){
      note.hidden = false;
      note.innerHTML = 'Form delivery isn\'t switched on yet. This button opens your email app ' +
        'instead, pre-filled. Or write to <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> directly.';
    }
    f.addEventListener('submit', function(ev){
      if(live) return;                       /* real submission to Web3Forms */
      ev.preventDefault();
      var lines = [];
      f.querySelectorAll('input[name], textarea[name]').forEach(function(el){
        if(el.type === 'hidden' || el.type === 'checkbox' || !el.value) return;
        var lab = f.querySelector('label[for="' + el.id + '"]');
        lines.push((lab ? lab.textContent : el.name) + ': ' + el.value);
      });
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(f.dataset.subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  });
})();
