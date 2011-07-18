$(document).ready(function() {
  var canvasElem = document.getElementById('game-canvas');
  var renderer = new Renderer(canvasElem);
  var game = new Game(renderer);
  $(window).keydown(bind(game, game.keyDown));
  $(window).keyup(bind(game, game.keyUp));

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
    requestAnimFrame(renderLoop, canvasElem);
  })();
});
