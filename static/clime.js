$(document).ready(function() {
  var canvasElem = document.getElementById('game-canvas');
  var renderer = new Renderer(canvasElem);
  var game = new Game(renderer);

  var lastFrame = new Date().getTime();
  (function renderLoop() {

    var now = new Date().getTime();
    var numFrames = Math.floor((now - lastFrame) / (1000 / 42));
    lastFrame = lastFrame + numFrames * (1000 / 42);
    if (numFrames > 1) {
      window.console.log(now, lastFrame, numFrames);
    }
    for (var i = 0; i < numFrames; i++) {
      game.tick();
    }
    renderer.render();
    game.render();
    requestAnimFrame(renderLoop, canvasElem);
  })();
});
