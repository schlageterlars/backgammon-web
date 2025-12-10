package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.ws._
import play.api.libs.json._
import scala.concurrent.{ExecutionContext, Future}
import play.filters.csrf.CSRFCheck
import scala.util.Random
import play.filters.csrf.CSRF

@Singleton
class HomeController @Inject() (cc: ControllerComponents, ws: WSClient)(implicit
    ec: ExecutionContext
) extends AbstractController(cc) {

  def getCsrfToken() = Action { implicit request: Request[AnyContent] =>
    Ok(CSRF.getToken.get.value)
  }

  def getLobbyCount() = Action.async { implicit request: Request[AnyContent] =>
    ws.url("http://localhost:9000/matchmaking/count")
      .post("")
      .map { response =>
        Ok(response.body)
      }
  }

  def updateUsername() = Action { implicit request: Request[AnyContent] =>
    request.body.asFormUrlEncoded.flatMap(
      _.get("username").flatMap(_.headOption)
    ) match {
      case Some(username) =>
        Ok("Username updated").withSession(
          request.session + ("username" -> username)
        )
      case None =>
        BadRequest("No username provided")
    }
  }

  def getUsername() = Action { implicit request: Request[AnyContent] =>
    request.session.get("username") match {
      case Some(username) => Ok(username)
      case None           => Ok("")
    }
  }

  def createLobby: Action[AnyContent] = Action.async { implicit request =>
    val data = request.body.asFormUrlEncoded.getOrElse(Map.empty)

    val json: JsObject = JsObject(
      data.map { case (key, values) =>
        key -> JsString(values.headOption.getOrElse(""))
      }
    )

    print(s"Create new lobby with ${data}")

    ws.url("http://localhost:9000/lobby")
      .post(json)
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
  }

  def lobby(lobbyId: String) = Action { implicit request: Request[AnyContent] =>
    request.session.get("username") match {
      case Some(username) =>
        Ok(Json.obj("lobbyId" -> lobbyId, "username" -> username))
      case None =>
        Forbidden(Json.obj("error" -> "Missing username"))
    }
  }
}
