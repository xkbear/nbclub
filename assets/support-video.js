(() => {
  const video = document.querySelector('video[data-hls]');
  const button = document.querySelector('[data-stream-start]');
  const status = document.getElementById('video-status');
  if (!video || !button || !status) return;
  const english = document.documentElement.lang.startsWith('en');
  const message = (en, zh) => english ? en : zh;
  let hls = null, loading = false, recoveryCount = 0;
  const fail = errorMessage => {
    loading = false;
    button.disabled = false;
    button.hidden = false;
    button.textContent = message("↻ Retry playback", '↻ 重试播放');
    status.textContent = errorMessage;
  };
  const play = () => {
    button.hidden = true;
    button.disabled = false;
    loading = false;
    status.textContent = message("720p · 55:52 · Seek, adjust volume or watch full screen.", '720p · 55:52 · 可拖动进度条、调节音量或全屏观看。');
    video.play().catch(() => {
      if (button.hidden && !video.error) {
        status.textContent = message("The video is ready. Press play in the player.", '视频已就绪，请点击播放器中的播放按钮。');
      }
    });
  };
  button.addEventListener('click', () => {
    if (loading) return;
    loading = true;
    recoveryCount = 0;
    button.disabled = true;
    button.textContent = message("Loading…", '正在加载…');
    status.textContent = message("Loading the video. First playback may take a few seconds.", '正在加载视频，首次播放可能需要几秒。');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = video.dataset.hls;
      play();
    } else if (window.Hls?.isSupported()) {
      if (hls) hls.destroy();
      hls = new Hls({maxBufferLength:30, maxMaxBufferLength:60, backBufferLength:30});
      hls.loadSource(video.dataset.hls);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && recoveryCount++ < 1) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hls = null;
          fail(message("The video could not load. Check your connection and retry. The recap and report remain available.", '视频暂时未能加载，请检查网络后重试。图文与结案报告可继续阅读。'));
        }
      });
    } else {
      fail(message("This browser does not support the stream. Try a recent Safari, Chrome, Edge or Firefox.", '当前浏览器不支持此分段视频，请使用新版 Safari、Chrome、Edge 或 Firefox。'));
    }
  });
  video.addEventListener('error', () => fail(message("Playback failed. Check your connection and retry.", '播放遇到问题，请检查网络后重试。')));
  window.addEventListener('pagehide', () => { if (hls) hls.destroy(); });
})();
