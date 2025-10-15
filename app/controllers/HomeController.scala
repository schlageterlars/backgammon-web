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

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(cc: MessagesControllerComponents, val gameController: IController)(implicit mat: Materializer, ec: ExecutionContext) extends MessagesAbstractController(cc) {

  private val (queue: SourceQueueWithComplete[String], broadcast: Source[String, NotUsed]) = {
    val (q, src) = Source.queue[String](bufferSize = 128, OverflowStrategy.dropHead).preMaterialize()
    val hub = src.toMat(BroadcastHub.sink[String])(Keep.right).run()
    (q, hub)
  }
  
  private val tui: TUI = new TUI(gameController, out = (msg: String) => queue.offer(msg))

  PrettyPrint.out = (msg: String) => queue.offer(msg)
  PrettyPrint.bold = (msg: String) => s"<b>${escapeHtml4(msg)}</b>"
  PrettyPrint.underline = (msg: String) => s"<u>${escapeHtml4(msg)}</u>"
  PrettyPrint.clean = () => queue.offer("<clear/>")

  val myForm: Form[String] = Form(
    "command" -> text
  )

  def tuiStream = Action {
    Ok.chunked(broadcast.via(EventSource.flow[String])).as(ContentTypes.EVENT_STREAM)
  }

  def index = Action { implicit request: MessagesRequest[AnyContent] =>
    Ok(views.html.index(myForm))
  }

  def submitForm = Action { implicit request: MessagesRequest[AnyContent] =>
    myForm.bindFromRequest().fold(
      formWithErrors => BadRequest(views.html.index(formWithErrors)),
      command => {
        scala.concurrent.Future { 
          if (command.isEmpty) { 
            import de.htwg.se.backgammon.util.PrettyPrint.printNew
            printNew(gameController.game)
            tui.update(Event.DiceRolled)
          } else {
            tui.execute(tui.analyseInput(command)) 
          }
        }
        NoContent 
      }
    )
  }
}
