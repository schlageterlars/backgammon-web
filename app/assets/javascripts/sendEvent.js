$(document).ready(function () {

  $(".board-size-action").on("click", function () {
    var size = $(this).data("size");

    $.ajax({
      url: "/setBoardSize?size=" + size,
      type: "GET",
      success: function (boardHtml) {
        $("#board-area").html(boardHtml);
      },
      error: function () {
        alert("Fehler beim Ändern der Brettgröße.");
      }
    });
  });

  let $currentActiveChecker = null;
  let currentSourcePoint = null;

  $(document).on("click", "#board-area .checker", function (e) {
    e.stopPropagation();

    const $clickedChecker = $(this);
    const $sourceCell = $clickedChecker.closest(".cell");
    const clickedPoint = $sourceCell.data("point");

    if ($currentActiveChecker && $currentActiveChecker.is($clickedChecker)) {
      $clickedChecker.removeClass("active");
      $("#game").removeClass("active-move");
      $currentActiveChecker = null;
      currentSourcePoint = null;
      return;
    }

    if ($currentActiveChecker) {
      $currentActiveChecker.removeClass("active");
    }

    $clickedChecker.addClass("active");
    $("#game").addClass("active-move");

    $currentActiveChecker = $clickedChecker;
    currentSourcePoint = clickedPoint;

    console.log(`Source point selected: ${currentSourcePoint}`);
  });


  $(document).on("click", "#board-area .cell", function () {
    if (!$currentActiveChecker) return;

    const $targetCell = $(this);
    const targetPoint = $targetCell.data("point");

    console.log(`Move attempt from: ${currentSourcePoint} to: ${targetPoint}`);

    $.ajax({
      url: "/move?from=" + currentSourcePoint + "&to=" + targetPoint,
      type: "GET",
      success: function (boardHtml) {
        $("#board-area").html(boardHtml);
      },
      error: function () {
        alert("Fehler beim Verschieben.");
      }
    });

    // Reset selection
    $currentActiveChecker.removeClass("active");
    $("#game").removeClass("active-move");
    $currentActiveChecker = null;
    currentSourcePoint = null;
  });

});
