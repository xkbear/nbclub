(() => {
  const video = document.querySelector('video[data-hls]');
  const button = document.querySelector('[data-stream-start]');
  const status = document.getElementById('video-status');
  if (!video || !button || !status) return;
  let hls = null, loading = false, recoveryCount = 0;
  const fail = message => {
    loading = false;
    button.disabled = false;
    button.hidden = false;
    button.textContent = '↻ 重试播放';
    status.textContent = message;
  };
  const play = () => {
    button.hidden = true;
    button.disabled = false;
    loading = false;
    status.textContent = '720p · 56:26 · 可拖动进度条、调节音量或全屏观看。';
    video.play().catch(() => {
      if (button.hidden && !video.error) {
        status.textContent = '视频已就绪，请点击播放器中的播放按钮。';
      }
    });
  };
  button.addEventListener('click', () => {
    if (loading) return;
    loading = true;
    recoveryCount = 0;
    button.disabled = true;
    button.textContent = '正在加载…';
    status.textContent = '正在加载视频，首次播放可能需要几秒。';
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
          fail('视频暂时未能加载，请检查网络后重试。图文与结案报告可继续阅读。');
        }
      });
    } else {
      fail('当前浏览器不支持此分段视频，请使用新版 Safari、Chrome、Edge 或 Firefox。');
    }
  });
  video.addEventListener('error', () => fail('播放遇到问题，请检查网络后重试。'));
  window.addEventListener('pagehide', () => { if (hls) hls.destroy(); });
})();
