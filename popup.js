/* popup.js
 *
 * This file initializes its scripts after the popup has loaded.
 *
 * It shows how to access global variables from background.js.
 * Note that getViews could be used instead to access other scripts.
 *
 * A port to the active tab is open to send messages to its in-content.js script.
 *
 */

/* CONST */
const copyButtonHTML = '<a class="copy-button fas fa-play btn-primary"></a> ';
const deleteButtonHTML = '<a class="delete-button fas fa-trash-alt btn-primary"></a> ';
const switchDeleteButtonHTML = '<a id="switch-button" class="switch-button fas fa-trash-alt btn-primary"></a>';
const switchCopyButtonHTML = '<a id="switch-button" class="switch-button fas fa-play btn-primary"></a>';

const cardClass = 'card';
const cardContentClass = 'card-content';

const settingsId = 'settings';
const addButtonId = 'add-button';
const switchButtonId = 'switch-button';
const deleteButtonId = 'delete-button';
const playButtonId = 'play-button';
const listContainerId = 'list-container';
const newMessageTitleId = 'new-message-title';
const newMessageContentId = 'new-message-content'

//TODO Avoid global declaration -> save const in an util or something
var currentTab;
var savedMessages = [];
var currentButton;

// Start the popup script, this could be anything from a simple script to a webapp
function initPopupScript() {
    currentButton = copyButtonHTML;

    // Find the current active tab
    const getTab = () => new Promise(resolve => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => resolve(tabs[0]));
    });

    document.getElementById(addButtonId).addEventListener('click', function() {
        onAdd();
    }, false);

    document.getElementById(switchButtonId).addEventListener('click', function() {
        onSwitch();
    }, false);

    document.getElementById(newMessageContentId).addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.key === 'Enter') {
            document.getElementById(addButtonId).click();
        }
    });
    document.getElementById(newMessageTitleId).addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.key === 'Enter') {
            document.getElementById(addButtonId).click();
        }
    });

    // Find the current active tab, then open a port to it
    getTab().then(tab => {
        currentTab = tab;

        // TODO bizarre de devoir l'exec comme ça
        // voir versions précédentes avec connection via un port ?
        chrome.tabs.executeScript(
            tab.id,
            {
                file: 'content-test.js'
            }
        );    
        // Connects to tab port to enable communication with inContent.js
        chrome.storage.sync.get([tab.url], function(items){
            if (items[tab.url] !== undefined) {
                savedMessages = getItems(items[tab.url]);
                updateList();
            }
        })
    });
};

function updateButtons() {
    if (document.getElementById(deleteButtonId)) {
        document.getElementById(deleteButtonId).addEventListener('click', function() {
            onDelete();
        }, false);
    }

    if (document.getElementById(playButtonId)) {
        document.getElementById(playButtonId).addEventListener('click', function() {
            onCopy();
        }, false);
    }
}

function updateList() {
    const listDiv = document.getElementById(listContainerId);
        
    var child = listDiv.lastElementChild; 
    while (child) {
        listDiv.removeChild(child);
        child = listDiv.lastElementChild;
    }

    const settingsDiv = document.getElementById(settingsId);
    settingsDiv.removeChild(settingsDiv.lastElementChild);

    var switchButton = document.createElement('div');
    switchButton.innerHTML = switchCopyButtonHTML;
    if (currentButton === copyButtonHTML) {
        switchButton.innerHTML = switchDeleteButtonHTML;
    }
    switchButton.firstChild.addEventListener('click', function() {
        onSwitch();
    });
    settingsDiv.appendChild(switchButton);
    console.log(savedMessages);
    for (var i = 0; i < savedMessages.length; ++i) {
        const item = savedMessages[i];
        var element=document.createElement('div');
        element.setAttribute('class', cardClass);
        const messageHTML = currentButton + '<b>' + item.title + '</b>';
        element.innerHTML = messageHTML;
        listDiv.appendChild(element);
        bindFunctionToButtons(element, item);
    }
    updateButtons();
}

function sendMessageOnChat(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:'sendMessage', message: message});
        });
}

function bindFunctionToButtons(element, item) {
    if (currentButton === copyButtonHTML) {
        element.addEventListener('click', function() {
            onCopy(element, item);
        }, false);
    } else if (currentButton === deleteButtonHTML) {
        element.addEventListener('click', function() {
            onDelete(item);
        }, false);
    }

    element.addEventListener('mouseover', function() {
        const content = document.createElement('div');
        content.setAttribute('class', cardContentClass);
        content.innerHTML = item.content;
        element.appendChild(content);
    });

    element.addEventListener('mouseout', function() {
        element.removeChild(getChild(element, cardContentClass));

    });
}

function onMouseLeave(e)
{
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
}

function getChild(element, childClass) {
    var foundChild = undefined;
    if(element.children.length > 0) {
        var child = element.lastElementChild;
        while (child) {
            if (child.getAttribute('class') === childClass) {
                foundChild = child;
                break;
            }
        }
    }

    return foundChild;
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

function onSwitch() {
    if (currentButton === copyButtonHTML) {
        currentButton = deleteButtonHTML;
    } else {
        currentButton = copyButtonHTML;
    }
    updateList();
}

function onDelete(item) {
    const index = savedMessages.indexOf(item);
    if (index >= 0 && savedMessages.length > index) {
        savedMessages.splice(index, 1)
        save(currentTab.url, JSON.stringify(savedMessages));
        updateList();
    }
}

function onCopy(element, item) {
    copyToClipboard(item.content);
    fade(element)
    sendMessageOnChat(item)
}

function fade(element) {
    var op = 1;  // initial opacity
    var fadeOut = setInterval(function () {
        if (op <= 0.5){
            op = 0.5;
            clearInterval(fadeOut);
            var fadeIn = setInterval(function () {
                if (op >= 0.5){
                    op = 1
                    clearInterval(fadeIn);
                }
                element.style.opacity = op;
                element.style.filter = 'alpha(opacity=' + op * 100 + ')';
                op += op * 0.1;
            }, 50);        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ')';
        op -= op * 0.3;
    }, 50);
    
}

function onAdd() {
    const newMessage = document.getElementById(newMessageContentId).value;
    var newMessageTitle = document.getElementById(newMessageTitleId).value;
    newMessageTitle = newMessageTitle === undefined || newMessageTitle === '' ?  newMessage : newMessageTitle;
    
    // TODO: function to check if content already exists
    if (currentTab?.url && newMessage.length > 0 /*&& !savedMessages.includes(newMessage)*/) {
        savedMessages.push({title: newMessageTitle, content: newMessage});
        save(currentTab.url, JSON.stringify(savedMessages));
        updateList();
        document.getElementById(newMessageContentId).value = '';
        document.getElementById(newMessageTitleId).value = '';
    }
}

function copyToClipboard(text) {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
  };

function save(url, messages) {
    var entry = {};
    entry[url] = messages;
    chrome.storage.sync.set(entry, function(){
    });

};

// Fire scripts after page has loaded
document.addEventListener('DOMContentLoaded', initPopupScript);
