chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
      // read changeInfo data and do something with it (like read the url)
      if (changeInfo.url) {
        chrome.tabs.sendMessage( tabId, {
            message: 'urlChanged',
            url: changeInfo.url
          })      }
    }
  );