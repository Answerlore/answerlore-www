(function(){
  /* demo: type the question (Originkit type-sequence pattern), then reveal the answer */
  var QS = {
    1: "Customer's unit shows code 49 and the bottom outdoor fan isn't spinning",
    2: "Is code 18 a fault or normal protection?",
    3: "Which capacities have two outdoor fans?",
    4: "Draft a reply I can send about code 49"
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
