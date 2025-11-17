// jQuery-based AJAX client: uses $.post / $.ajax and updates UI from JSON
$(function() {
  // Read CSRF token from meta and configure jQuery to send it on requests
  var csrfToken = $('meta[name="csrf-token"]').attr('content') || '';
  if (csrfToken) {
    $.ajaxSetup({
      headers: {
        'Csrf-Token': csrfToken
      }
    });
  }

  function updateUI(data) {
    if (!data) return;
    if (data.boardHtml) {
      $('#board-area').html(data.boardHtml);
    }
    if (data.currentPlayer) {
      $('#current-player').text(data.currentPlayer);
      $('#current-player-badge').text(data.currentPlayer + "'s turn");
    }
    if (data.dice && Array.isArray(data.dice)) {
      var $ul = $('.dice-panel ul');
      if ($ul.length) {
        $ul.empty();
        data.dice.forEach(function(d) {
          var src = '/assets/images/dice-' + d + '.png';
          var $li = $("<li class='list-inline-item' aria-label='Würfel'></li>");
          $li.append("<img src='" + src + "' alt='Würfel mit Zahl " + d + "' class='dice-img'>");
          $ul.append($li);
        });
      }
    }

    // If other JS needs to re-bind handlers on board cells, call a hook here.
    if (window.onBoardUpdated && typeof window.onBoardUpdated === 'function') {
      window.onBoardUpdated();
    }
  }

  // simple toast helper (bootstrap alerts)
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
    setTimeout(function() { $el.alert('close'); }, 6000);
  }

  // Board size links
  $(document).on('click', 'a[data-ajax="set-board"]', function(ev) {
    ev.preventDefault();
    var size = $(this).data('size');
    if (!size) return;
    $.ajax({
      url: '/api/setBoardSize/' + encodeURIComponent(size),
      method: 'POST',
      dataType: 'json'
    }).done(function(data) {
      if (data && data.success) {
        updateUI(data);
      } else {
        console.error('setBoardSize returned error', data);
      }
    }).fail(function(xhr, status, err) {
      console.error('setBoardSize ajax failed', status, err);
    });
  });

  // Interactive move: click source cell/checker, then destination cell
  var selectedFrom = null;
  function clearSelection() {
    selectedFrom = null;
    $('.cell.selected').removeClass('selected');
  }

  $(document).on('click', '.cell, .checker', function(ev) {
    ev.preventDefault();
    // find the nearest .cell element
    var $cell = $(this).closest('.cell');
    var point = $cell.data('point');
    if (point === undefined) return;

    // If no source selected yet -> try to select this one (only if occupied)
    if (selectedFrom === null) {
      // cell contains checker-stack? select if occupied by current player
      if ($cell.find('.checker-stack').length > 0) {
        // mark selection
        selectedFrom = point;
        $cell.addClass('selected');
      }
      return;
    }

    // If source already selected and user clicked same cell -> unselect
    if (selectedFrom === point) {
      clearSelection();
      return;
    }

    // We have a source and a destination -> send move to server
    var payload = JSON.stringify({ from: selectedFrom, to: point });
    console.log('Sending move', payload, 'csrf=', csrfToken);
    $.ajax({
      url: '/api/move',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: payload
    }).done(function(data) {
      console.log('move response', data);
      if (data && data.ok) {
        updateUI(data);
      } else {
        console.error('move returned error', data);
        showToast('Fehler beim Zug: ' + (data && data.error ? data.error : 'unbekannter Fehler'), 'danger');
      }
    }).fail(function(xhr, status, err) {
      var msg = 'move ajax failed: ' + status + ' ' + err;
      console.error(msg, xhr.responseText);
      var parsed = null;
      try { parsed = xhr.responseJSON || JSON.parse(xhr.responseText); } catch(e) { parsed = null; }
      var serverMsg = parsed && parsed.error ? parsed.error : (xhr.responseText || status);
      showToast('Serverfehler: ' + serverMsg, 'danger');
    }).always(function() {
      clearSelection();
    });
  });

  // Undo button
  $(document).on('click', '#undo-btn', function(ev) {
    ev.preventDefault();
    $.ajax({
      url: '/api/undo',
      method: 'POST',
      dataType: 'json'
    }).done(function(data) {
      if (data && data.ok) {
        updateUI(data);
      } else {
        console.error('undo returned error', data);
      }
    }).fail(function(xhr, status, err) {
      console.error('undo ajax failed', status, err);
    });
  });

});
