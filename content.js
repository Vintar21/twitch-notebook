window.addEventListener ("load", onReady, false);
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'urlChanged') {
      console.log(request.url)
      // should wait until ready
      onReady();
    }
});


function onReady() {

  console.log('Twitch notepad ready');
  const twitchChannel = getKeyFromURL(document.location.href);
  const twitchChat = getAllElementsWithAttribute('data-a-target', 'chat-input')[0];
  const chatButton = getAllElementsWithAttribute('data-a-target', 'chat-send-button')[0];

  twitchChat.addEventListener('keyup', function(event) {
    event.preventDefault();
    if (event.key === 'Control') {
      chrome.storage.sync.get([twitchChannel], function(items){
        if (items[twitchChannel] !== undefined) {
          var savedMessages = getItems(items[twitchChannel]);
          const title = twitchChat.value.trim().replace(/\s\s+/, ' ');
          const message = savedMessages.find(m => m.title === title);
          if (message) {
            sendMessageInTwitchChat(message.content);
          }
        }
      });
    }    
  });

  chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
          case 'sendMessage':
            sendMessageInTwitchChat(message.message.content);
          break;
        }
        return true;
    }
  );
  
  function sendMessageInTwitchChat(message) {
    twitchChat.focus();
    twitchChat.value = message;
    twitchChat.dispatchEvent(new Event('input', { bubbles: true }));
    chatButton.click();
  }
  
  function getAllElementsWithAttribute(attribute, value) {
    var matchingElements = [];
    var allElements = document.getElementsByTagName('*');
    for (var i = 0, n = allElements.length; i < n; i++)
    {
      if (allElements[i].getAttribute(attribute) === value)
      {
        // Element exists with attribute. Add to array.
        matchingElements.push(allElements[i]);
      }
    }
    return matchingElements;
  }
}


//TODO put in an utils (used in popup and content)
function getKeyFromURL(url) {
  //TODO: A voir avec les squads
  if (url.match(/^https:\/\/www.twitch.tv\/(moderator\/)?[^\/]+$/)) {
      return url.split('?')[0].split('/')[url.split('/').length-1];
  }
  return url;
}

function getItems(stringArray) {
  // FIX for saved messages before the title feature 
  var rawItems = JSON.parse(stringArray);
  for(var i = 0; i < rawItems.length; i++) {
      if (rawItems[i]?.title === undefined) {
          rawItems[i] = {title: rawItems[i], content: rawItems[i]};
      }
  }
  return rawItems;
}