// Backgammon-Frontend: UX von deinem Kollegen + deine API-/Hint-/Toast-Logik
$(function () {
  // -----------------------------
  // CSRF-Setup (aus deinem Code)
  // -----------------------------
  var csrfToken = $('meta[name="csrf-token"]').attr('content') || '';
  if (csrfToken) {
    $.ajaxSetup({
      headers: {
        'Csrf-Token': csrfToken
      }
    });
  }

  // ---------------------------------
  // UI-Update für JSON-Antworten
  // (Board, Spieler, Würfel)
  // ---------------------------------
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
        data.dice.forEach(function (d) {
          var src = '/assets/images/dice-' + d + '.png';
          var $li = $("<li class='list-inline-item' aria-label='Würfel'></li>");
          $li.append(
            "<img src='" +
              src +
              "' alt='Würfel mit Zahl " +
              d +
              "' class='dice-img'>"
          );
          $ul.append($li);
        });
      }
    }

    // Hook für Re-Bind, falls du noch weitere JS-Initialisierung brauchst
    if (window.onBoardUpdated && typeof window.onBoardUpdated === 'function') {
      window.onBoardUpdated();
    }
  }

  // -----------------------------
  // Toast-Helfer (aus deinem Code)
  // -----------------------------
  function showToast(message, level) {
    level = level || 'info';
    var $container = $('#toast-container');
    if (!$container.length) {
      $container = $(
        "<div id='toast-container' style='position:fixed;top:1rem;right:1rem;z-index:1050;'></div>"
      );
      $('body').append($container);
    }
    var $el = $(
      "<div class='alert alert-" +
        level +
        " alert-dismissible fade show' role='alert'></div>"
    );
    $el.text(message);
    $el.append(
      "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>"
    );
    $container.append($el);
    setTimeout(function () {
      $el.alert('close');
    }, 6000);
  }

  // -----------------------------
  // Status-Widget (aus deinem Code)
  // -----------------------------
  function ensureStatusWidget() {
    if ($('#move-status').length) return $('#move-status');
    var $w = $(
      "<div id='move-status' style='position:fixed;bottom:1rem;left:1rem;z-index:1050;background:rgba(0,0,0,0.6);color:#fff;padding:.5rem .75rem;border-radius:.5rem;font-size:0.9rem;'></div>"
    );
    $('body').append($w);
    return $w;
  }

  function updateStatusWidget(selectedFrom) {
    var $w = ensureStatusWidget();
    var dice = $('.dice-panel ul img')
      .map(function () {
        var m = $(this)
          .attr('src')
          .match(/dice-(\d+)\.png/);
        return m ? m[1] : '?';
      })
      .get();
    $w.text(
      'Selected: ' +
        (selectedFrom === null || selectedFrom === undefined ? '-' : selectedFrom) +
        '  |  Dice: ' +
        dice.join(', ')
    );
  }

  // -----------------------------
  // Hint-Helfer (aus deinem Code)
  // -----------------------------
  function clearHints() {
    $('.cell.hint').removeClass('hint');
  }

  function applyHints(destinations) {
    clearHints();
    destinations.forEach(function (point) {
      $('.cell[data-point="' + point + '"]').addClass('hint');
    });
  }

  function resetHintsState() {
    clearHints();
    hintsActive = false;
    $('#hint-toggle')
      .removeClass('active')
      .attr('aria-pressed', 'false');
  }

  // -----------------------------
  // State-Variablen (kombiniert)
  // -----------------------------
  var $currentActiveChecker = null; // von deinem Kollegen
  var selectedFrom = null;          // dein „from“-State (alias currentSourcePoint)
  var requestInFlight = false;
  var lastClickAt = 0;
  var hintsActive = false;

  function clearSelection() {
    selectedFrom = null;
    if ($currentActiveChecker) {
      $currentActiveChecker.removeClass('active');
    }
    $('.cell.selected').removeClass('selected');
    $('#game').removeClass('active-move');
    $currentActiveChecker = null;
    updateStatusWidget(selectedFrom);
  }

  // -----------------------------
  // Board-Größe per API (deine Route)
  // Unterstützt sowohl a[data-ajax="set-board"] als auch .board-size-action
  // -----------------------------
  $(document).on('click', 'a[data-ajax="set-board"], .board-size-action', function (ev) {
    ev.preventDefault();
    var size = $(this).data('size');
    if (!size) return;

    $.ajax({
      url: '/api/setBoardSize/' + encodeURIComponent(size),
      method: 'POST',
      dataType: 'json'
    })
      .done(function (data) {
        if (data && data.success) {
          updateUI(data);
          clearSelection();
          resetHintsState();
        } else {
          console.error('setBoardSize returned error', data);
          showToast('Fehler beim Ändern der Brettgröße.', 'danger');
        }
      })
      .fail(function (xhr, status, err) {
        console.error('setBoardSize ajax failed', status, err);
        showToast('Fehler beim Ändern der Brettgröße.', 'danger');
      });
  });

  // -----------------------------
  // Klick auf Checker: Auswahl (UX vom Kollegen)
  // -----------------------------
  $(document).on('click', '#board-area .checker', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var now = Date.now();
    if (now - lastClickAt < 200) {
      lastClickAt = now;
      return;
    }
    lastClickAt = now;

    var $clickedChecker = $(this);
    var $sourceCell = $clickedChecker.closest('.cell');
    var clickedPoint = $sourceCell.data('point');

    // Gleicher Checker erneut -> Auswahl + Hints zurücksetzen
    if ($currentActiveChecker && $currentActiveChecker.is($clickedChecker)) {
      clearSelection();
      resetHintsState();
      console.log('selection cleared');
      return;
    }

    // vorherige Auswahl entfernen
    clearSelection();

    // neue Auswahl setzen
    $clickedChecker.addClass('active');
    $sourceCell.addClass('selected');
    $('#game').addClass('active-move');

    $currentActiveChecker = $clickedChecker;
    selectedFrom = clickedPoint;

    console.log('Source point selected:', selectedFrom);
    updateStatusWidget(selectedFrom);
  });

  // -----------------------------
  // Klick auf Zelle: Ziel & Move per /api/move (deine Route)
  // -----------------------------
  $(document).on('click', '#board-area .cell', function (ev) {
    ev.preventDefault();

    var now = Date.now();
    if (now - lastClickAt < 200) {
      lastClickAt = now;
      return;
    }
    lastClickAt = now;

    if (requestInFlight) {
      console.log('Move ignored: request in flight');
      return;
    }

    if (selectedFrom === null) {
      // keine Quelle ausgewählt -> nichts tun
      return;
    }

    var $targetCell = $(this);
    var targetPoint = $targetCell.data('point');
    if (targetPoint === undefined) return;

    // gleicher Punkt -> Auswahl behalten
    if (targetPoint === selectedFrom) {
      console.log('clicked selected cell again; keeping selection');
      updateStatusWidget(selectedFrom);
      return;
    }

    console.log('Move attempt from:', selectedFrom, 'to:', targetPoint);

    var payload = JSON.stringify({ from: selectedFrom, to: targetPoint });
    updateStatusWidget(selectedFrom);

    requestInFlight = true;
    $('#board-area').addClass('board-busy');

    $.ajax({
      url: '/api/move',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: payload
    })
      .done(function (data) {
        console.log('move response', data);
        if (data && data.ok) {
          updateUI(data);
        } else {
          console.error('move returned error', data);
          showToast(
            'Fehler beim Zug: ' +
              (data && data.error ? data.error : 'unbekannter Fehler'),
            'danger'
          );
        }
      })
      .fail(function (xhr, status, err) {
        var msg = 'move ajax failed: ' + status + ' ' + err;
        console.error(msg, xhr.responseText);
        var parsed = null;
        try {
          parsed = xhr.responseJSON || JSON.parse(xhr.responseText);
        } catch (e) {
          parsed = null;
        }
        var serverMsg =
          parsed && parsed.error ? parsed.error : xhr.responseText || status;
        showToast('Serverfehler: ' + serverMsg, 'danger');
      })
      .always(function () {
        clearSelection();
        requestInFlight = false;
        $('#board-area').removeClass('board-busy');

        // Hints nach Zug zurücksetzen
        resetHintsState();
      });
  });

  // -----------------------------
  // Undo per /api/undo (deine Route)
  // -----------------------------
  $(document).on('click', '#undo-btn', function (ev) {
    ev.preventDefault();
    $.ajax({
      url: '/api/undo',
      method: 'POST',
      dataType: 'json'
    })
      .done(function (data) {
        if (data && data.ok) {
          updateUI(data);
          clearSelection();
          resetHintsState();
        } else {
          console.error('undo returned error', data);
          showToast('Fehler beim Rückgängig machen.', 'danger');
        }
      })
      .fail(function (xhr, status, err) {
        console.error('undo ajax failed', status, err);
        showToast('Fehler beim Rückgängig machen.', 'danger');
      });
  });

  // -----------------------------
  // Hint / Glühbirne per /api/hints (deine Route)
  // -----------------------------
  $(document).on('click', '#hint-toggle', function (ev) {
    ev.preventDefault();

    // Toggle-State
    hintsActive = !hintsActive;
    $(this)
      .toggleClass('active', hintsActive)
      .attr('aria-pressed', hintsActive ? 'true' : 'false');

    if (!hintsActive) {
      clearHints();
      return;
    }

    if (selectedFrom === null) {
      showToast('Bitte zuerst ein Feld mit einem Stein auswählen.', 'info');
      resetHintsState();
      return;
    }

    var payload = JSON.stringify({ from: selectedFrom });

    $.ajax({
      url: '/api/hints',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: payload
    })
      .done(function (data) {
        console.log('hints response', data);
        if (data && data.ok && Array.isArray(data.destinations)) {
          applyHints(data.destinations);
        } else {
          showToast('Konnte keine Zughilfen berechnen.', 'warning');
        }
      })
      .fail(function (xhr, status, err) {
        console.error('hints ajax failed', status, err);
        showToast('Fehler beim Laden der Zughilfen.', 'danger');
      });
  });

  // -----------------------------
  // Bear-In per /api/bearIn (deine Route)
  // -----------------------------
  $(document).on('click', '.bar-slot', function (ev) {
    ev.preventDefault();

    $.ajax({
      url: '/api/bearIn',
      method: 'POST',
      dataType: 'json'
    })
      .done(function (data) {
        if (data && data.ok) {
          updateUI(data);
        } else {
          console.error('bearIn returned error', data);
          showToast(
            'Fehler beim Wiedereinsetzen: ' +
              (data && data.error ? data.error : 'unbekannter Fehler'),
            'danger'
          );
        }
      })
      .fail(function (xhr, status, err) {
        console.error('bearIn ajax failed', status, err);
        showToast('Serverfehler beim Wiedereinsetzen.', 'danger');
      });
  });
});
