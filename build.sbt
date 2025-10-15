val scala3Version     = "3.7.3"

lazy val root = project
  .in(file("."))
  .enablePlugins(PlayScala)
  .settings(
    name := "backgammon-web",
    version := "0.1.0-SNAPSHOT",

    scalaVersion := scala3Version,
    libraryDependencies ++= Seq(
      guice,
      "backgammon"              %% "backgammon"         % "0.1.0-SNAPSHOT",
      "org.scalatestplus.play"  %% "scalatestplus-play" % "7.0.2" % Test,
      "org.apache.commons" % "commons-text" % "1.12.0"
    )
  )