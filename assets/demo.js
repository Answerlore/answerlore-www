// The illustrative walkthrough on the home page. Static content, no network.
// Chips choose a panel; the question types itself unless the visitor prefers
// reduced motion. The source panel toggles open. Every interaction is reported
// to window.answerlore.track (local only, see assets/measure.js).
(function(){
  var walk = document.getElementById('walkthrough');
  if(!walk) return;
  var chips = walk.querySelectorAll('.chips button');
  var panels = walk.querySelectorAll('.answer[data-panel]');
  var qtext = walk.querySelector('#qtext');
  var qcaret = walk.querySelector('#qcaret');
  var track = (window.answerlore && window.answerlore.track) || function(){};
  var reduced = false, timer = null, started = false;
  try{ reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}

  function show(id, animate){
    chips.forEach(function(c){ c.setAttribute('aria-pressed', String(c.dataset.panel === id)); });
    panels.forEach(function(p){ p.hidden = p.dataset.panel !== id; });
    var panel = walk.querySelector('.answer[data-panel="' + id + '"]');
    var q = panel ? panel.dataset.question : '';
    clearTimeout(timer);
    if(!animate || reduced){ qtext.textContent = q; qcaret.hidden = true; panel.classList.remove('hide'); return; }
    var i = 0; qtext.textContent = ''; qcaret.hidden = false; panel.classList.add('hide');
    (function step(){
      if(i <= q.length){ qtext.textContent = q.slice(0, i); i += 2; timer = setTimeout(step, 16); }
      else { qtext.textContent = q; qcaret.hidden = true; panel.classList.remove('hide'); }
    })();
  }

  chips.forEach(function(c){
    c.addEventListener('click', function(){
      if(!started){ started = true; track('demo_start', {panel: c.dataset.panel}); }
      track('demo_panel', {panel: c.dataset.panel});
      show(c.dataset.panel, true);
    });
  });

  walk.querySelectorAll('.src-toggle').forEach(function(btn){
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if(!target) return;
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      target.hidden = open;
      if(!open) track('citation_open', {panel: btn.dataset.panel});
    });
  });

  // Report the walkthrough coming into view once. Not an interaction.
  if('IntersectionObserver' in window){
    var seen = false;
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting && !seen){ seen = true; track('demo_visit'); io.disconnect(); } });
    }, {threshold: .3});
    io.observe(walk);
  }

  // Without JS every panel renders stacked. With JS, start on the first chip.
  show(chips[0].dataset.panel, false);
})();
