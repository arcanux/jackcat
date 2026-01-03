// Lightweight deferred helpers kept intentionally minimal
document.addEventListener('DOMContentLoaded', function(){
  // set copyright year
  var y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
  // simple client-side include pattern for header/footer (optional)
  // Not required — pages include full markup for now.
});
