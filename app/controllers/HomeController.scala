package controllers

import javax.inject._
import play.api.Logging
import org.apache.pekko.NotUsed
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl.{Source, BroadcastHub, Keep, SourceQueueWithComplete}
import play.api.libs.EventSource
import play.api.mvc._
import play.api.http.ContentTypes
import play.api.data._
import play.api.data.Forms._
import de.htwg.se.backgammon.controller.IController
import de.htwg.se.backgammon.view.TUI
import scala.concurrent.Future
import scala.concurrent.ExecutionContext
import org.apache.pekko.stream.OverflowStrategy
import de.htwg.se.backgammon.util.PrettyPrint
import org.apache.commons.text.StringEscapeUtils.escapeHtml4
import de.htwg.se.backgammon.util.Event
import de.htwg.se.backgammon.view.GUI
import de.htwg.se.backgammon.model.base.Game
import play.api.libs.json._
import scala.util.{Success, Failure}
import de.htwg.se.backgammon.model.base.Move

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents, val gameController: IController)(implicit mat: Materializer, ec: ExecutionContext) extends BaseController with Logging {

  def index = Action {implicit request: Request[AnyContent] =>
    Ok(views.html.index(gameController))
  }

  def undo = Action {implicit request: Request[AnyContent] =>
    gameController.undoAndPublish(gameController.undo)
    Redirect(routes.HomeController.index())
  }

  // AJAX endpoint for undo (returns JSON)
  def apiUndo = Action { implicit request: Request[AnyContent] =>
    gameController.undoAndPublish(gameController.undo)
    // Return updated board fragment and some basic state as JSON
    val boardHtml = views.html.components.board(gameController).toString()
    Ok(Json.obj(
      "ok" -> true,
      "boardHtml" -> boardHtml,
      "currentPlayer" -> gameController.currentPlayer.toString,
      "dice" -> Json.toJson(gameController.dice)
    ))
  }

  def rules = Action {
    Ok(views.html.rules())
  }

  def setBoardSize(size: String) = Action { implicit request: Request[AnyContent] =>
    val game: Game = size match {
      case "small"   => new Game(12, 10)
      case "medium"  => new Game(16, 12)
      case "classic" => new Game(24, 15)
      case _         => new Game(24, 15)
    }

    // Über das Model das Game setzen
    val model = gameController.data
    model.game = game

    Redirect(routes.HomeController.index())
      .flashing("success" -> s"Board size set to $size")
  }

  // AJAX version to set board size without a redirect
  def apiSetBoardSize(size: String) = Action { implicit request: Request[AnyContent] =>
    val game: Game = size match {
      case "small"   => new Game(12, 10)
      case "medium"  => new Game(16, 12)
      case "classic" => new Game(24, 15)
      case _         => new Game(24, 15)
    }
    val model = gameController.data
    model.game = game
    // Return updated board fragment and basic state so client can update without reload
    val boardHtml = views.html.components.board(gameController).toString()
    Ok(Json.obj(
      "success" -> true,
      "size" -> size,
      "boardHtml" -> boardHtml,
      "currentPlayer" -> gameController.currentPlayer.toString,
      "dice" -> Json.toJson(gameController.dice)
    ))
  }

  // AJAX endpoint to perform a move: expects JSON { "from": Int, "to": Int }
  def apiMove = Action(parse.json) { (request: Request[JsValue]) =>
    val js: JsValue = request.body
    logger.info(s"apiMove called. body=${js.toString()} headers=${request.headers.headers.mkString(",")}")
    val fromOpt: Option[Int] = (js \ "from").asOpt[Int]
    val toOpt: Option[Int] = (js \ "to").asOpt[Int]

    (fromOpt, toOpt) match {
      case (Some(from), Some(to)) =>
        val move = Move.create(gameController.game, gameController.currentPlayer, from, to)
        gameController.put(move) match {
          case Success(_) =>
            // Return updated board and state
            val boardHtml = views.html.components.board(gameController).toString()
            Ok(Json.obj(
              "ok" -> true,
              "boardHtml" -> boardHtml,
              "currentPlayer" -> gameController.currentPlayer.toString,
              "dice" -> Json.toJson(gameController.dice)
            ))
          case Failure(ex) =>
            BadRequest(Json.obj("ok" -> false, "error" -> ex.getMessage))
        }
      case _ => BadRequest(Json.obj("ok" -> false, "error" -> "missing from/to or invalid types"))
    }
  }

}
