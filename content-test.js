var twitchChat = getAllElementsWithAttribute('data-a-target', 'chat-input')[0];
    var chatButton = getAllElementsWithAttribute('data-a-target', 'chat-send-button')[0];    //Creating Elements
        console.log(twitchChat)
        // twitchChat.focus();
        // var e = new Event("keypress");
        // e.which = 13; //enter keycode
        // e.keyCode = 13;
        // document.trigger(e);
        // // chatButton.click();
        twitchChat.focus();
        // alert(twitchChat.value);
        twitchChat.value = 'Bienvenue tout le monde maechiHI';
        twitchChat.dispatchEvent(new Event('input', { bubbles: true }));

        chatButton.click();
  
    // var btn = document.createElement("BUTTON")
    // var t = document.createTextNode("CLICK ME");
    // btn.appendChild(t);
    // //Appending to DOM 
    // document.body.appendChild(btn);
    


    function getAllElementsWithAttribute(attribute, value)
    {
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