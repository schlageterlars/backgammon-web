$(document).ready(function() {
  $(".board-size-action").on("click", function() {
    var size = $(this).data("size");

    var url = "/setBoardSize?size=" + size; 
    $.ajax({
      url: url,
      type: 'GET', 
      success: function(boardHtml) {
        $("#board-area").html(boardHtml); 
      },
      error: function() {
        alert("Fehler beim Ändern der Brettgröße.");
      }
    });
  });
});