// Backgammon Frontend: Basis von deinem Kollegen + Hint-Logik & Toaster von dir
$(document).ready(function () {
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
  }

  // --- Toaster ---
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
    setTimeout(function () { $el.alert('close'); }, 6000);
  }

  // --- Hint-Hilfen ---
  function clearHints() {
    $("#board-area .cell.hint").removeClass("hint");
  }

  function applyHints(destinations) {
    clearHints();
    destinations.forEach(function (point) {
      $("#board-area .cell[data-point='" + point + "']").addClass("hint");
    });
  }

  let $currentActiveChecker = null;
  let currentSourcePoint = null;
  let hintsActive = false;

  function clearSelection() {
    if ($currentActiveChecker) {
      $currentActiveChecker.removeClass("active");
    }
    $("#board-area .cell.selected").removeClass("selected");
    $("#game").removeClass("active-move");
    $currentActiveChecker = null;
    currentSourcePoint = null;
  }

  function resetHintsState() {
    clearHints();
    hintsActive = false;
    $("#hint-toggle")
      .removeClass("active")
      .attr("aria-pressed", "false");
  }

  // --- Boardgröße ---
  $(".board-size-action").on("click", function (e) {
    e.preventDefault();
    var size = $(this).data("size");

    $.ajax({
      url: "/setBoardSize?size=" + size,
      type: "GET",
      success: function (boardHtml) {
        $("#board-area").html(boardHtml);
        clearSelection();
        resetHintsState();
      },
      error: function () {
        showToast("Fehler beim Ändern der Brettgröße.", "danger");
      }
    });
  });
  function applyHints(destinations) {
    clearHints();
    destinations.forEach(function(point) {
      $('#board-area .cell[data-point="' + point + '"]').addClass('hint');
    });
  }

  function clearHints() {
    $('#board-area .cell.hint').removeClass('hint');
  }

  // --- Klick auf Checker ---
  $(document).on("click", "#board-area .checker", function (e) {
    e.stopPropagation();

    const $clickedChecker = $(this);
    const $sourceCell = $clickedChecker.closest(".cell");
    const clickedPoint = $sourceCell.data("point");

    if ($currentActiveChecker && $currentActiveChecker.is($clickedChecker)) {
      clearSelection();
      resetHintsState();
      return;
    }
    clearSelection();

    $clickedChecker.addClass("active");
    $sourceCell.addClass("selected");
    $("#game").addClass("active-move");

    $currentActiveChecker = $clickedChecker;
    currentSourcePoint = clickedPoint;

    console.log("Source point selected: " + currentSourcePoint);
  });

  // --- Move-Flow, plus Hints-Reset & Toast ---
  $(document).on("click", "#board-area .cell", function () {
    if (!$currentActiveChecker || currentSourcePoint == null) return;

    const $targetCell = $(this);
    const targetPoint = $targetCell.data("point");

    console.log("Move attempt from: " + currentSourcePoint + " to: " + targetPoint);
    
    ws.send(JSON.stringify({ type: "MoveMessage",   
          from: String(currentSourcePoint),
          to: String(targetPoint)
      }));
  });

  // --- Hint / Glühbirne --
  $(document).on("click", "#hint-toggle", function (e) {
    e.preventDefault();

    hintsActive = !hintsActive;
    $(this)
      .toggleClass("active", hintsActive)
      .attr("aria-pressed", hintsActive ? "true" : "false");

    if (!hintsActive) {
      clearHints();
      return;
    }

    if (currentSourcePoint == null) {
      showToast("Bitte zuerst ein Feld mit einem Stein auswählen.", "info");
      resetHintsState();
      return;
    }

    $.ajax({
      url: "/api/hints?from=" + currentSourcePoint,
      method: "GET",
      dataType: "json"
    })
      .done(function (data) {
        console.log("hints response", data);
        if (data && data.ok && Array.isArray(data.destinations)) {
          applyHints(data.destinations);
        } else {
          showToast("Konnte keine Zughilfen berechnen.", "warning");
        }
      })
      .fail(function (xhr, status, err) {
        console.error("hints ajax failed", status, err, xhr.responseText);
        showToast("Fehler beim Laden der Zughilfen.", "danger");
      });
  });
});
