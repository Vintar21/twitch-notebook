window.addEventListener ("load", onReady, false);

function onReady() {

  console.log('READY bitch');
  const twitchChat = getAllElementsWithAttribute('data-a-target', 'chat-input')[0];
  const chatButton = getAllElementsWithAttribute('data-a-target', 'chat-send-button')[0];

  // twitchChat.addEventListener('keyup', function(event) {
  //   event.preventDefault();
  //   console.log('aaaaaaaa')
  //   sendMessageInTwitchChat(savedMessages[0].content);
  //   // chrome.runtime.sendMessage({type: 'keyCallback', event: event.key})
    
  // });

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