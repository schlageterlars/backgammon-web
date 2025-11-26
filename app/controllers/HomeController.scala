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

  def createLobby = Action.async {  implicit request: Request[AnyContent] =>
    val data = request.body.asFormUrlEncoded
    val usernameOpt = data.flatMap(_.get("username").flatMap(_.headOption))

    usernameOpt match {
      case Some(username) =>
        ws.url("http://localhost:9000/lobby").post(Json.obj("user" -> username)).map { response =>
          val lobbyId = (response.json \ "lobbyId").as[String]
          // Redirect to lobby page with query param for username
          Redirect(routes.HomeController.lobby(lobbyId)).withSession("username" -> username)
        }

      case None =>
        Future.successful(BadRequest("Missing username"))
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
