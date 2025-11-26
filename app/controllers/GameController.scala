package controllers

import javax.inject._
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
import de.htwg.se.backgammon.model.base.Move
import de.htwg.se.backgammon.controller.strategy.ValidateMoveStrategy
import de.htwg.se.backgammon.model.IGame
import de.htwg.se.backgammon.model.base.BearInMove
import play.api.libs.json._
import scala.util.{Try, Success, Failure}
import play.filters.csrf._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class GameController @Inject()(val controllerComponents: ControllerComponents)(implicit mat: Materializer, ec: ExecutionContext) extends BaseController {

  def renderBoard(): Action[JsValue] = Action(parse.json) { implicit request =>
    request.body.validate[IGame].fold(
      errors => BadRequest("Invalid game JSON"),
      gameState => {
        val htmlFragment = views.html.components.board(gameState).toString()
        Ok(htmlFragment).as("text/html")
      }
    )
  }
}
