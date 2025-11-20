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
import scala.util.{Try, Success, Failure}
import de.htwg.se.backgammon.model.base.Move
import de.htwg.se.backgammon.controller.strategy.ValidateMoveStrategy
import de.htwg.se.backgammon.model.IGame
import de.htwg.se.backgammon.model.base.BearInMove
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

  def rules = Action {
    Ok(views.html.rules())
  }

  def undo = Action { implicit request: Request[AnyContent] =>
    gameController.undoAndPublish(gameController.undo)

    Ok(Json.obj(
      "ok" -> true,
      "boardHtml" -> boardHtml,
      "currentPlayer" -> gameController.currentPlayer.toString,
      "dice" -> Json.toJson(gameController.dice)
    ))
  }

  def boardHtml: String = views.html.components.board(gameController.game).toString()

  def setBoardSize(size: String) = Action { implicit request: Request[AnyContent] =>
    val game: Game = size match {
      case "small"   => new Game(12, 10)
      case "medium"  => new Game(16, 12)
      case "classic" => new Game(24, 15)
      case _         => new Game(24, 15)
    }

    gameController.init(game)

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
    logger.info(s"apiMove called. body=${js.toString()}")
    val fromOpt: Option[Int] = (js \ "from").asOpt[Int]
    val toOpt: Option[Int] = (js \ "to").asOpt[Int]

    val result: Result = (fromOpt, toOpt) match {
      case (Some(from), Some(to)) =>
        try {
          val move = Move.create(gameController.game, gameController.currentPlayer, from, to)
          logger.info(s"Move created: $move from=$from to=$to")
          
          gameController.doAndPublish(gameController.put, move)
          
          logger.info(s"Move succeeded")
          Ok(Json.obj(
            "ok" -> true,
            "boardHtml" -> boardHtml,
            "currentPlayer" -> gameController.currentPlayer.toString,
            "dice" -> Json.toJson(gameController.dice)
          ))
        } catch {
          case ex: Exception =>
            logger.warn(s"Move failed: ${ex.getMessage}")
            BadRequest(Json.obj("ok" -> false, "error" -> ex.getMessage))
        }
      case _ => BadRequest(Json.obj("ok" -> false, "error" -> "missing from/to or invalid types"))
    }
    result
  }

  def hints = Action(parse.json) { (request: Request[JsValue]) =>
    val js = request.body
    logger.info(s"apiHints called. body=${js.toString()}")
    val fromOpt: Option[Int] = (js \ "from").asOpt[Int]

    val fields   = gameController.game.fields
    val maxIndex = fields.length - 1
    val current  = gameController.currentPlayer

    val destinations: Seq[Int] = fromOpt match {
      case Some(from) if from >= 0 && from <= maxIndex =>
        val fromField = fields(from)

        if (fromField.isEmpty() || !fromField.isOccupiedBy(current)) {
          Seq.empty
        } else {
          (0 to maxIndex).flatMap { to =>
            if (to == from) {
              None
            } else {
              val targetField = fields(to)

              if (!targetField.isEmpty() && !targetField.isOccupiedBy(current)) {
                None
              } else {
                val isValid = Try {
                  val move = Move.create(
                    gameController.game,
                    current,
                    from,
                    to
                  )
                  val validator = ValidateMoveStrategy(gameController, move)
                  validator.validate() 
                }.isSuccess

                if (isValid) Some(to) else None
              }
            }
          }
        }

      case _ =>
        Seq.empty
    }

    Ok(
      Json.obj(
        "ok" -> true,
        "from" -> fromOpt,
        "destinations" -> destinations
      )
    )
  }


  def bearIn = Action { implicit request: Request[AnyContent] =>
    logger.info("apiBearIn called")

    val move = BearInMove(
      gameController.currentPlayer,
      gameController.die
    )

    val result: Try[IGame] = gameController.put(move)

    result match {
      case Success(_) =>
        Ok(
          Json.obj(
            "ok"            -> true,
            "boardHtml"     -> boardHtml,
            "currentPlayer" -> gameController.currentPlayer.toString,
            "dice"          -> Json.toJson(gameController.dice)
          )
        )

      case Failure(ex) =>
        logger.warn(s"BearIn failed: ${ex.getMessage}")
        BadRequest(
          Json.obj(
            "ok"    -> false,
            "error" -> ex.getMessage
          )
        )
    }
  }
}