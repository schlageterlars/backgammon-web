import mill._
import $ivy.`com.lihaoyi::mill-contrib-playlib:`,  mill.playlib._

object test extends RootModule with PlayModule {

  def scalaVersion = "2.13.17"
  def playVersion = "3.0.9"
  def twirlVersion = "2.0.9"

  object test extends PlayTests
}
