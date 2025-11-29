package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.ws._
import play.api.libs.json._
import scala.concurrent.{ExecutionContext, Future}
import play.filters.csrf.CSRFCheck

@Singleton
class HomeController @Inject()(cc: ControllerComponents, ws: WSClient)(implicit ec: ExecutionContext) extends AbstractController(cc) {

  def index = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.home(using request))
  }

  def updateUsername() = Action { implicit request: Request[AnyContent]  =>
    request.body.asFormUrlEncoded.flatMap(_.get("username").flatMap(_.headOption)) match {
      case Some(username) =>
        // Update session and return OK
        Ok("Username updated").withSession(request.session + ("username" -> username))
      case None =>
        BadRequest("No username provided")
    }
  }

  def createLobby: Action[AnyContent] = Action.async { implicit request =>
    val data = request.body.asFormUrlEncoded
    val boardSizeOpt = data.flatMap(_.get("boardSize").flatMap(_.headOption))
    val scopeOpt = data.flatMap(_.get("scope").flatMap(_.headOption))
    val colorDesicionOpt = data.flatMap(_.get("player").flatMap(_.headOption))

    print(s"Create new lobby with ${data}")

    (boardSizeOpt, scopeOpt, colorDesicionOpt) match {
      case (Some(boardSize), Some(scope), Some(colorDecision)) =>
        ws.url("http://localhost:9000/lobby")
          .post(Json.obj(
            "boardSize" -> boardSize,
            "scope" -> scope,
            "colorDesicion" -> colorDecision
          ))
          .map { response =>
            val lobbyId = (response.json \ "lobbyId").as[String]
            Redirect(routes.HomeController.lobby(lobbyId))
          }
          .recover {
            case _: java.net.ConnectException =>
              BadRequest("Server is not reachable")
            case ex =>
              InternalServerError(s"Unexpected error: ${ex.getMessage}")
          }

      case _ =>
        Future.successful(BadRequest("Missing board size, scope, or color decision"))
    }
  }

  def lobby(lobbyId: String) = Action { implicit request: Request[AnyContent] =>
    request.session.get("username") match {
      case Some(username) =>
        Ok(views.html.lobby(lobbyId, username))
      case None =>
        Redirect(routes.HomeController.index).flashing("error" -> "Missing username")
    }
  }
}
