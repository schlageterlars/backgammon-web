import de.htwg.se.backgammon.controller.IController
import de.htwg.se.backgammon.controller.base.Controller
import com.google.inject.AbstractModule
import de.htwg.se.backgammon.model.base.Model
import de.htwg.se.backgammon.model.base.Game
import de.htwg.se.backgammon.model.base.DefaultSetup
import de.htwg.se.backgammon.model.base.Dice
import play.api.Logger

class Module extends AbstractModule {
  
  private val logger = Logger(this.getClass)
  
  override def configure(): Unit = {
    logger.info("✅ Custom Play Module loaded.")
    bind(classOf[GUIStarter]).asEagerSingleton()
    //bind(classOf[TerminalUI]).asEagerSingleton()
    bind(classOf[IController]).toInstance {
        val NUMBER_OF_FIELDS = 24
        val NUMBER_OF_FIGURES = 15
        val model = new Model(
            new Game(DefaultSetup(NUMBER_OF_FIELDS, NUMBER_OF_FIGURES)),
            new Dice()
            )
        Controller(model)
    }
  }
}