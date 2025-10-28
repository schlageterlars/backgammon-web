import scalafx.application.Platform
import scalafx.application.JFXApp3

import javax.inject._
import play.api.inject.ApplicationLifecycle
import scala.concurrent.{ExecutionContext, Future}
import scala.io.StdIn
import de.htwg.se.backgammon.controller.IController

import javax.inject._
import play.api.inject.ApplicationLifecycle
import play.api.{Environment, Logger}
import scala.concurrent.{ExecutionContext, Future}
import scala.io.StdIn
import de.htwg.se.backgammon.view.GUI

import javax.inject._
import play.api.inject.ApplicationLifecycle
import scala.concurrent.{ExecutionContext, Future}
import scalafx.application.Platform
import de.htwg.se.backgammon.view.GUI
import de.htwg.se.backgammon.controller.IController

@Singleton
class GUIStarter @Inject()(lifecycle: ApplicationLifecycle, gameController: IController)(implicit ec: ExecutionContext) {

  val gui = GUI(gameController)

  Future {
    if (!Platform.isFxApplicationThread) {
      new Thread(() => {
        try {
          println("🚀 Starting ScalaFX application...")
          gui.main(Array.empty)
        } catch {
          case _: IllegalStateException =>
            Platform.runLater(() => println("⚠️ ScalaFX already running, did not reload!"))
        }
      }).start()

    } else {
      Platform.runLater(() => println("⚠️ ScalaFX already running, did not reload!"))
    }
  }

  lifecycle.addStopHook(() => Future.successful {
    println("🧹 Stopping ScalaFX...")
  })

}
