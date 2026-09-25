// First-party measurement interface for answerlore.com. Local only.
//
// Nothing here leaves the browser. There is no endpoint, no cookie, no storage,
// and no third-party script; the footer's "no tracking pixels" promise stays
// true. Pages call window.answerlore.track(name, props) at the moments listed
// in docs/MEASUREMENT.md. Events collect in window.answerlore.events and are
// re-broadcast as a DOM CustomEvent so a future first-party transport can
// subscribe without touching the pages. Switching a transport on is a
// deliberate, disclosed change (see the doc), never a default.
(function(){
  var NAMES = {
    demo_visit: 1,              // the walkthrough entered the viewport
    demo_start: 1,              // first interaction with the walkthrough
    demo_panel: 1,              // a walkthrough panel was chosen
    citation_open: 1,           // the source panel was opened
    trial_request_submitted: 1, // form delivery service confirmed acceptance
    pilot_request_submitted: 1,
    walkthrough_request_submitted: 1,
    guides_signup_submitted: 1,
    request_email_opened: 1,    // mailto fallback used; NOT a submission
    request_failed: 1           // delivery service rejected or unreachable
  };
  // Only these keys survive. Free text never does: no question bodies, no
  // names, no email addresses, no company names.
  var KEYS = {panel: 1, kind: 1, reason: 1, page: 1};
  var events = [];
  function track(name, props){
    if(!NAMES[name]) return false;
    var clean = {page: location.pathname};
    Object.keys(props || {}).forEach(function(k){
      if(KEYS[k] && (typeof props[k] === 'string' || typeof props[k] === 'number')){
        clean[k] = String(props[k]).slice(0, 40);
      }
    });
    var ev = {name: name, props: clean, at: Date.now()};
    events.push(ev);
    if(events.length > 200) events.shift();
    try{ document.dispatchEvent(new CustomEvent('answerlore:event', {detail: ev})); }catch(e){}
    return true;
  }
  window.answerlore = {track: track, events: events, names: Object.keys(NAMES)};
})();
