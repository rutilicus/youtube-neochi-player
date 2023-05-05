interface Window {
  onYouTubeIframeAPIReady(): void;
}

let intervalId = 0;
let fadeOutStartVolume = -1;
let player: YT.Player;
function intervalPlayerControl() {
  // 停止秒数取得
  let stopTimeSecond = 0;
  const stopTimeSecondRadio = document.getElementById('stopTimeChoice1') as HTMLInputElement;
  if (stopTimeSecond != null && stopTimeSecondRadio.checked) {
    const stopTimeSecondText = document.getElementById('stopTimeSecond') as HTMLInputElement;
    stopTimeSecond = parseInt(stopTimeSecondText.value, 10);
  } else {
    const stopTimeTimeText = document.getElementById('stopTimeTime') as HTMLInputElement;
    stopTimeSecond = hhmmss2Second(stopTimeTimeText.value);
  }
  
  // 停止制御
  const currentTime = player.getCurrentTime();
  if (currentTime >= stopTimeSecond) {
    player.pauseVideo();
  }

  // フェードアウト制御
  const fadeOutCheckbox = document.getElementById('enableFadeOut') as HTMLInputElement;
  if (fadeOutCheckbox != null && fadeOutCheckbox.checked) {
    const fadeOutSecondText = document.getElementById('fadeOutSecond') as HTMLInputElement;
    const fadeOutSecond = parseInt(fadeOutSecondText.value, 10);
    if (currentTime >=  stopTimeSecond - fadeOutSecond) {
      if (fadeOutStartVolume == -1) {
        fadeOutStartVolume = player.getVolume();
      }
      player.setVolume(Math.trunc((stopTimeSecond - currentTime) / fadeOutSecond * fadeOutStartVolume));
    }
  }
}
function onPlayerStateChange(event: YT.OnStateChangeEvent) {
  if (event.data != YT.PlayerState.PLAYING) {
    // 再生中以外の場合は定期実行を停止
    clearInterval(intervalId);
    intervalId = 0;
    fadeOutStartVolume = -1;
  } else {
    // 再生中の場合は機能有効をチェックの上定期実行開始
    const enableFunctionCheckbox = document.getElementById('enableFunction') as HTMLInputElement;
    if (enableFunctionCheckbox != null && enableFunctionCheckbox.checked) {
      intervalId = window.setInterval(intervalPlayerControl, 1000);
    }
  }
}
window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player('player', {
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

const loadButton = document.getElementById('loadButton') as HTMLButtonElement;
if (loadButton != null) {
  loadButton.onclick = () => {
    const movieIdUrl = document.getElementById('movieIdUrl') as HTMLInputElement;
    try {
      const url = new URL(movieIdUrl.value);
      switch (url.hostname) {
        case 'www.youtube.com':
          if (url.pathname == '/watch') {
              // https://www.youtube.com/watch?v=VIDEOID形式
              const id = url.searchParams.get('v')
              if (id != null) {
                player.loadVideoById(id)
              }
          } else if (url.pathname.match(/\/live\/[\w_-]{11}/g)) {
            // https://www.youtube.com/live/VIDEOID?feature=share形式
            const id = url.pathname.slice(-11);
            player.loadVideoById(id);
          }
          break;

        case 'youtu.be':
          // https://youtu.be/VIDEOID形式
          const id = url.pathname.slice(-11);
          player.loadVideoById(id);
          break;
      }
    } catch (e) {
      // ID指定を仮定して読み込む
      player.loadVideoById(movieIdUrl.value);
    }
  }
}

function hhmmss2Second(hhmmss: string): number {
  const re = /([0-9]{2}):([0-9]{2}):([0-9]{2})/;
  const found = hhmmss.match(re);
  if (found != null) {
    return parseInt(found[1], 10) * 3600 + parseInt(found[2], 10) * 60 + parseInt(found[3], 10);
  } else {
    return 0;
  }
}

const stopTimeSecondRadio = document.getElementById('stopTimeChoice1') as HTMLInputElement;
if (stopTimeSecondRadio != null) {
  stopTimeSecondRadio.onchange = () => {
    const stopTimeSecondText = document.getElementById('stopTimeSecond') as HTMLInputElement;
    const stopTimeTimeText = document.getElementById('stopTimeTime') as HTMLInputElement;
    if (stopTimeSecondText != null && stopTimeTimeText != null) {
      stopTimeSecondText.disabled = false;
      stopTimeSecondText.value = hhmmss2Second(stopTimeTimeText.value).toString();
      stopTimeTimeText.disabled = true;
    }
  }
}

const stopTimeTimeRadio = document.getElementById('stopTimeChoice2') as HTMLInputElement;
if (stopTimeTimeRadio != null) {
  stopTimeTimeRadio.onchange = () => {
    const stopTimeSecondText = document.getElementById('stopTimeSecond') as HTMLInputElement;
    const stopTimeTimeText = document.getElementById('stopTimeTime') as HTMLInputElement;
    if (stopTimeSecondText != null && stopTimeTimeText != null) {
      const second = parseInt(stopTimeSecondText.value, 10);
      stopTimeTimeText.disabled = false;
      stopTimeTimeText.value =
        ('0' + Math.trunc(second / 3600)).slice(-2) + ':' +
        ('0' + Math.trunc(second / 60) % 60).slice(-2) + ':' +
        ('0' + (second % 60)).slice(-2);
      stopTimeSecondText.disabled = true
    }
  }
}

const enableFunctionCheckbox = document.getElementById('enableFunction') as HTMLInputElement;
if (enableFunctionCheckbox != null) {
  enableFunctionCheckbox.onchange = () => {
    if (enableFunctionCheckbox.checked && player.getPlayerState() == YT.PlayerState.PLAYING) {
      intervalId = window.setInterval(intervalPlayerControl, 1000);
    } else {
      clearInterval(intervalId);
      intervalId = 0;
      fadeOutStartVolume = -1;
    }
  }
}

// IFrame Player API呼び出し
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
if (firstScriptTag.parentNode != null) {
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
