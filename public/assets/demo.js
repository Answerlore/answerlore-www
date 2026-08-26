(function(){
  /* demo: type the question (Originkit type-sequence pattern), then reveal the answer */
  var QS = {
    1: "Customer has an X250 throwing E04 and the flow looks normal",
    2: "Flow is down about 20% since winter. Is that a fault?",
    3: "What pretreatment do we recommend for a site running above 5 NTU?",
    4: "Draft a reply I can send about the E04"
  };
  var qtext = document.getElementById('qtext'),
      qcaret = document.getElementById('qcaret'),
      answer = document.getElementById('answer'),
      chips = document.querySelectorAll('.chips button'),
      timer = null,
      reduced = false;
  try{reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  function pick(x){
    if(!qtext) return;
    chips.forEach(function(c){c.setAttribute('aria-pressed', String(c.dataset.x === String(x)));});
    answer.querySelectorAll('[data-a]').forEach(function(d){d.hidden = d.dataset.a !== String(x);});
    clearTimeout(timer);
    if(reduced){ qtext.textContent = QS[x]; qcaret.hidden = true; answer.classList.remove('hide'); return; }
    var s = QS[x], i = 0;
    qtext.textContent = '';
    qcaret.hidden = false;
    answer.classList.add('hide');
    (function step(){
      if(i <= s.length){
        qtext.textContent = s.slice(0, i);
        i += 2;
        timer = setTimeout(step, 18);
      } else {
        qcaret.hidden = true;
        answer.classList.remove('hide');
      }
    })();
  }
  chips.forEach(function(c){c.addEventListener('click', function(){pick(c.dataset.x);});});
})();
