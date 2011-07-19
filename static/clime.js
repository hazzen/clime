$(document).ready(function() {
  var canvasElem = document.getElementById('game-canvas');
  var renderer = new Renderer(canvasElem);
  var game = new Game(renderer);
  var level = new Level(game);
  $(window).keydown(bind(game, game.keyDown));
  $(window).keyup(bind(game, game.keyUp));

  level.addLeftBound(new geom.Point(5, 0));
  level.addLeftBound(new geom.Point(15, 50));
  level.addRightBound(new geom.Point(400, 50));
  level.addRightBound(new geom.Point(500, 450));

  var lastFrame = new Date().getTime();
  var rope = new Rope(game, 300, 0, 200);
  (function renderLoop() {

    var now = new Date().getTime();
    var numFrames = Math.floor((now - lastFrame) / (1000 / 42));
    lastFrame = lastFrame + numFrames * (1000 / 42);
    if (numFrames > 1) {
      window.console.log(now, lastFrame, numFrames);
    }
    for (var i = 0; i < numFrames; i++) {
      game.tick(1 / 42.0);
    }
    renderer.render();
    game.render(renderer);
    level.render(renderer);
    requestAnimFrame(renderLoop, canvasElem);
  })();
});
