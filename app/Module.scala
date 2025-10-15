import de.htwg.se.backgammon.controller.IController
import de.htwg.se.backgammon.controller.base.Controller
import com.google.inject.AbstractModule
import de.htwg.se.backgammon.model.base.Model
import de.htwg.se.backgammon.model.base.Game
import de.htwg.se.backgammon.model.base.DefaultSetup
import de.htwg.se.backgammon.model.base.Dice

class Module extends AbstractModule {
  override def configure(): Unit = {
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