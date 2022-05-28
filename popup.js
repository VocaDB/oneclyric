const Config = {
  vocadb: new function () {
    this.BASE_URL = 'https://vocadb.net/'
    this.API_BASE_URL = this.BASE_URL + 'api'
  },
  youtube: new function () {
    this.BASE_URL = 'https://www.youtube.com/'
    this.VIDEO_BASE_URL = this.BASE_URL + 'watch'
  },
  niconico: new function () {
    this.BASE_URL = 'https://www.nicovideo.jp/'
    this.VIDEO_BASE_URL = this.BASE_URL + 'watch'
  },
}

function insert(html) {
  document.body.insertAdjacentHTML('beforeend', html)
}

function insertLyric(response) {
  if (response === undefined) { insert('歌詞が見つかりませんでした') }
  else {
    for (lyric of response['lyrics']) {
      if (lyric['translationType'] == 'Original') {
        insert(lyric['value'].replaceAll('\n', '<br>'))
        return
      }
    }
    insert('歌詞が見つかりませんでした')
  }
}

chrome.tabs.query({ 'active': true, 'currentWindow': true }, tabs => {
  const url = tabs[0].url
  if (url.startsWith(Config.youtube.VIDEO_BASE_URL) || url.startsWith(Config.niconico.VIDEO_BASE_URL)) {
    chrome.storage.local.get(url, function (result) {
      if (!Object.keys(result).length) {
        fetch(Config.vocadb.API_BASE_URL + '/songs?query=' + url + '&fields=Lyrics', {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Oneclyric Chrome Extension'
          }
        })
          .then(response => response.json())
          .then(response => response['items'][0])
          .then(response => chrome.storage.local.set({ [url]: response }, function () {
            insertLyric(response)
          }))
      }
      else { insertLyric(result[url]) }
    })
  }
  else { insert('YouTubeとニコニコ動画のみ対応しています') }
})