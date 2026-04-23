(function() {
  const videoId = document.currentScript?.getAttribute('data-video-id');
  if (!videoId) return;

  const sessionId = crypto.randomUUID();
  const apiUrl = 'https://yourdomain.com/api/analytics/track';

  function sendEvent(event, data = {}) {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, sessionId, event, data }),
    }).catch(console.error);
  }

  // Find the video element (assuming Mux player or standard <video>)
  const video = document.querySelector(`video[data-video-id="${videoId}"]`) || document.querySelector('video');
  if (!video) return;

  let hasReportedComplete = false;
  let lastProgress = 0;

  video.addEventListener('play', () => sendEvent('view_start', { currentTime: video.currentTime }));
  video.addEventListener('pause', () => sendEvent('view_pause', { currentTime: video.currentTime, progress: video.currentTime / video.duration * 100 }));
  video.addEventListener('ended', () => { if (!hasReportedComplete) { sendEvent('view_complete'); hasReportedComplete = true; } });
  video.addEventListener('timeupdate', () => {
    const progress = video.currentTime / video.duration * 100;
    if (Math.floor(progress / 10) > Math.floor(lastProgress / 10)) {
      sendEvent('view_progress', { progress, currentTime: video.currentTime });
      lastProgress = progress;
    }
  });
  video.addEventListener('click', () => sendEvent('click'));

  // Send initial load
  sendEvent('view_load');
})();