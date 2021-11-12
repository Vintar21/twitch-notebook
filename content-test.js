//TODO: find a better way to load an unique listener in the content script
var unique = document.body.getAttribute('unique');
if ( !unique || unique !== 'true') {
  document.body.setAttribute('unique', 'true')

  chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "sendMessage":
              sendMessageInTwitchChat(message.message.content);
            break;
        }
        return true;
    }
  );
}

function sendMessageInTwitchChat(message) {
  var twitchChat = getAllElementsWithAttribute('data-a-target', 'chat-input')[0];
  var chatButton = getAllElementsWithAttribute('data-a-target', 'chat-send-button')[0];
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