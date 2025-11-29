  function showToast(message, level) {
    level = level || 'info';
    var $container = $('#toast-container');
    if (!$container.length) {
      $container = $("<div id='toast-container' style='position:fixed;top:1rem;right:1rem;z-index:1050;'></div>");
      $('body').append($container);
    }
    var $el = $("<div class='alert alert-" + level + " alert-dismissible fade show' role='alert'></div>");
    $el.text(message);
    $el.append("<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>");
    $container.append($el);
    setTimeout(function () { $el.alert('close'); }, 1500);
  }