(function(){
  // Minimal client-side password gate for tax-engines-clone
  // NOTE: Client-side protection is not secure. This only hides content from casual viewers.
  var PASSWORD = "T@xes2027!";
  var STORAGE_KEY = 'tec_unlocked_v1';

  function createModal(){
    var overlay = document.createElement('div');
    overlay.className = 'tb-modal-overlay';
    overlay.innerHTML = '\n      <div class="tb-modal" role="dialog" aria-modal="true" aria-label="Password required">\n        <h3>Enter password to view site</h3>\n        <p>Please enter the password to continue.</p>\n        <input id="tb-pass" type="password" autocomplete="current-password" placeholder="Password" />\n        <div class="actions">\n          <button id="tb-cancel" class="tb-btn tb-btn--secondary" type="button">Cancel</button>\n          <button id="tb-ok" class="tb-btn" type="button">Enter</button>\n        </div>\n        <p id="tb-error" style="color:#c00;display:none;margin-top:8px">Incorrect password</p>\n      </div>\n    ';

    // Prevent scrolling behind the modal
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);

    var input = document.getElementById('tb-pass');
    var ok = document.getElementById('tb-ok');
    var cancel = document.getElementById('tb-cancel');
    var err = document.getElementById('tb-error');

    input.focus();

    function closeModal(success){
      try{ document.body.removeChild(overlay); }catch(e){}
      document.body.style.overflow = '';
      if(!success){ /* leave user on page; they can reload */ }
    }

    ok.addEventListener('click', function(){
      var v = input.value || '';
      if(v === PASSWORD){
        try{ localStorage.setItem(STORAGE_KEY, '1'); }catch(e){}
        closeModal(true);
      } else {
        err.style.display = 'block';
        input.focus();
      }
    });

    cancel.addEventListener('click', function(){
      // simple behaviour: remove modal but keep content hidden behind overlay removed
      closeModal(false);
    });

    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter') ok.click();
    });
  }

  function init(){
    try{
      if(localStorage.getItem(STORAGE_KEY) === '1') return; // already unlocked
    }catch(e){}
    // show modal
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', createModal);
    } else {
      createModal();
    }
  }

  // Run
  init();
})();
