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

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents, val gameController: IController)(implicit mat: Materializer, ec: ExecutionContext) extends BaseController {

  def index = Action {implicit request: Request[AnyContent] =>
    Ok(views.html.index(gameController))
  }

  def undo = Action {implicit request: Request[AnyContent] =>
    gameController.undoAndPublish(gameController.undo)
    Redirect(routes.HomeController.index())
  }

  def rules = Action {
    Ok(views.html.rules())
  }


}
