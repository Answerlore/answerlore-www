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

// Request forms.
//
// The HTML is written for the state that is true today: no delivery service is
// configured, so the button says it opens the visitor's email app, and the
// address is printed next to it with a copy control. When a Web3Forms access
// key replaces the placeholder, this script switches the same form to a real
// submission with loading, success, retry and failure states. Nothing is
// reported as delivered until the service answers {success:true}. Fields are
// never cleared on failure.
(function(){
  var PLACEHOLDER = 'REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY';
  var EMAIL = 'hello@answerlore.com';
  var track = (window.answerlore && window.answerlore.track) || function(){};

  function subjectFor(f){
    var checked = f.querySelector('input[name=request_type]:checked');
    return (checked && checked.dataset.subject) || f.dataset.subject || 'Answerlore request';
  }
  function eventFor(f){
    var checked = f.querySelector('input[name=request_type]:checked');
    return (checked && checked.dataset.event) || f.dataset.event || 'trial_request_submitted';
  }
  function bodyLines(f){
    var lines = [];
    f.querySelectorAll('input[name], textarea[name]').forEach(function(el){
      if(el.type === 'hidden' || el.type === 'checkbox') return;
      if(el.type === 'radio'){ if(!el.checked) return; lines.push('Request: ' + el.dataset.label); return; }
      if(!el.value) return;
      var lab = f.querySelector('label[for="' + el.id + '"]');
      lines.push((lab ? lab.textContent.replace(/\s+/g,' ').trim() : el.name) + ': ' + el.value);
    });
    return lines;
  }
  function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function setStatus(box, state, html){
    box.hidden = false; box.dataset.state = state; box.innerHTML = html;
    box.setAttribute('role', state === 'error' ? 'alert' : 'status');
  }
  function validate(f){
    var ok = true;
    f.querySelectorAll('input[required]').forEach(function(el){
      var err = f.querySelector('#' + el.id + '-err');
      var bad = !el.value.trim() || (el.type === 'email' && !el.checkValidity());
      el.setAttribute('aria-invalid', String(bad));
      if(err){ err.hidden = !bad; }
      if(bad && ok){ el.focus(); }
      if(bad) ok = false;
    });
    return ok;
  }

  document.querySelectorAll('form.form').forEach(function(f){
    var key = f.querySelector('[name=access_key]');
    var live = key && key.value && key.value !== PLACEHOLDER;
    var button = f.querySelector('button[type=submit]');
    var status = f.querySelector('.form-status');
    var emailNote = f.querySelector('[data-email-note]');
    var subjectField = f.querySelector('input[name=subject]');

    // Preselect a request type from ?request=pilot, and keep the subject in step.
    var wanted = null;
    try{ wanted = new URLSearchParams(location.search).get('request'); }catch(e){}
    if(wanted){ var r = f.querySelector('input[name=request_type][value="' + wanted + '"]'); if(r) r.checked = true; }
    var syncSubject = function(){ if(subjectField) subjectField.value = subjectFor(f); };
    f.querySelectorAll('input[name=request_type]').forEach(function(r){ r.addEventListener('change', syncSubject); });
    syncSubject();

    if(live){
      // Delivery is switched on: the same form becomes a real submission.
      if(button && button.dataset.liveLabel) button.textContent = button.dataset.liveLabel;
      if(emailNote) emailNote.hidden = true;
      f.querySelectorAll('[data-live-note]').forEach(function(n){ n.hidden = false; });
    }

    // Copy-address control, useful in both modes.
    f.querySelectorAll('.copybtn').forEach(function(b){
      var out = f.querySelector('.copy-status');
      b.addEventListener('click', function(){
        var done = function(msg){ if(out){ out.textContent = msg; setTimeout(function(){ out.textContent = ''; }, 2500); } };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(EMAIL).then(function(){ done('Copied'); }, function(){ done('Select and copy: ' + EMAIL); });
        } else { done('Select and copy: ' + EMAIL); }
      });
    });

    f.addEventListener('submit', function(ev){
      ev.preventDefault();
      if(!validate(f)) return;
      var kind = eventFor(f);

      if(!live){
        // Email fallback. Labeled as such on the page before the click.
        track('request_email_opened', {kind: kind});
        window.location.href = 'mailto:' + EMAIL +
          '?subject=' + encodeURIComponent(subjectFor(f)) +
          '&body=' + encodeURIComponent(bodyLines(f).join('\n'));
        return;
      }

      // Real submission.
      var idle = button.textContent;
      button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Sending…';
      if(status){ status.hidden = true; }
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function(){ ctrl.abort(); }, 15000) : null;
      var data = new FormData(f);
      fetch(f.action, {method: 'POST', body: data, headers: {'Accept': 'application/json'}, signal: ctrl ? ctrl.signal : undefined})
        .then(function(res){ return res.json().then(function(j){ return {ok: res.ok, json: j}; }, function(){ return {ok: false, json: {}}; }); })
        .then(function(r){
          if(r.ok && r.json && r.json.success === true){
            track(kind);
            f.querySelectorAll('.field, fieldset, button[type=submit], .form-note').forEach(function(el){ el.hidden = true; });
            setStatus(status, 'success',
              '<p><b>Request received.</b> We reply from ' + EMAIL + '. ' +
              'If you do not hear back within a few business days, write to that address directly.</p>');
            status.focus();
          } else {
            fail((r.json && r.json.message) ? 'The form service said: ' + esc(String(r.json.message).slice(0, 160)) : 'The form service did not accept the request.');
          }
        })
        .catch(function(err){
          fail(err && err.name === 'AbortError' ? 'The form service did not answer within 15 seconds.' : 'The request could not reach the form service.');
        })
        .then(function(){ if(timer) clearTimeout(timer); button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = idle; });

      function fail(reason){
        track('request_failed', {kind: kind});
        setStatus(status, 'error',
          '<p><b>Not sent.</b> ' + reason + ' Your answers are still in the form: try again, or ' +
          '<a href="mailto:' + EMAIL + '?subject=' + encodeURIComponent(subjectFor(f)) +
          '&body=' + encodeURIComponent(bodyLines(f).join('\n')) + '">send them by email</a> to ' + EMAIL + '.</p>');
        status.focus();
      }
    });
  });
})();
