(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var videos = Array.prototype.slice.call(document.querySelectorAll("video.reel"));

  function arm(video) {
    var source = video.querySelector("source[data-src]");
    if (!source || source.getAttribute("src")) return;
    source.setAttribute("src", source.getAttribute("data-src"));
    video.load();
  }

  function play(video) {
    video.muted = true;
    var pending = video.play();
    if (pending && typeof pending.catch === "function") pending.catch(function () {});
  }

  if (reduce) {
    videos.forEach(function (video) {
      video.removeAttribute("autoplay");
      video.pause();
    });
    return;
  }

  function ratio(video) {
    var rect = video.getBoundingClientRect();
    if (!rect.width || !rect.height) return 0;
    var width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    var height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    return (width * height) / (rect.width * rect.height);
  }

  function near(video) {
    var rect = video.getBoundingClientRect();
    return rect.top < window.innerHeight + 520 && rect.bottom > -520;
  }

  var queued = false;
  function sync() {
    queued = false;
    if (document.hidden) {
      videos.forEach(function (video) {
        if (!video.paused) video.pause();
      });
      return;
    }
    videos.forEach(function (video) {
      if (!near(video)) {
        if (!video.paused) video.pause();
        return;
      }
      arm(video);
      var shown = ratio(video);
      if (shown > 0.42) {
        video.preload = "auto";
        if (video.paused) play(video);
      } else if (!video.paused) {
        video.pause();
      }
    });
  }

  function requestSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  }

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  document.addEventListener("visibilitychange", requestSync);
  requestSync();
  window.addEventListener("load", requestSync);
})();
