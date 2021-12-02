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
const copyButtonClass = 'copy-button fas fa-play btn-primary';
const deleteButtonClass = 'delete-button fas fa-trash-alt btn-primary';
const switchDeleteButtonClass = 'switch-button fas fa-trash-alt btn-primary';
const switchCopyButtonClass = 'switch-button fas fa-play btn-primary';

const cardClass = 'card';
const cardContentClass = 'card-content';

const settingsId = 'settings';
const addButtonId = 'add-button';
const switchButtonId = 'switch-button';
const helpButtonId = 'help-button';
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
    currentButton = copyButtonClass;

    document.getElementById(helpButtonId).addEventListener('click', function() {
        document.getElementById('help-dialog').showModal();
    }, false);

    document.getElementById(addButtonId).addEventListener('click', function() {
        onAdd();
    }, false);

    document.getElementsByClassName(switchButtonId)[0].addEventListener('click', function() {
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
        // Connects to tab port to enable communication with inContent.js
        chrome.storage.sync.get([getKeyFromURL(tab.url)], function(items){
            if (items[getKeyFromURL(tab.url)] !== undefined) {
                savedMessages = getItems(items[getKeyFromURL(tab.url)]);
                updateList();
            }
        })
    });
};

//TODO put in an utils (used in popup and content)
function getKeyFromURL(url) {
    //TODO: A voir avec les squads
    if (url.match(/^https:\/\/www.twitch.tv\/(moderator\/)?[^\/]+$/)) {
        return url.split('?')[0].split('/')[url.split('/').length-1];
    }
    return url;
}

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
    const helpButton = document.getElementById(helpButtonId);
    child = settingsDiv.lastElementChild
    while (child) {
        settingsDiv.removeChild(child);
        child = settingsDiv.lastElementChild;
    }

    var switchButton = getButtonElement(switchCopyButtonClass);
    if (currentButton === copyButtonClass) {
        switchButton = getButtonElement(switchDeleteButtonClass);
    }
    switchButton.addEventListener('click', function() {
        onSwitch();
    });
    settingsDiv.appendChild(switchButton);
    settingsDiv.appendChild(helpButton);

    for (var i = 0; i < savedMessages.length; ++i) {
        const item = savedMessages[i];
        listDiv.appendChild(createCardElement(item));

    }
    updateButtons();
}

function createCardElement(item) {
    const element=document.createElement('div');
    element.setAttribute('class', cardClass);
    element.appendChild(getButtonElement(currentButton));
    const title = document.createElement('b');
    title.innerText = item.title;
    element.appendChild(title);
    bindFunctionToButtons(element, item);
    return element;
}

function sendMessageOnChat(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:'sendMessage', message: message});
        });
}

function bindFunctionToButtons(element, item) {
    if (currentButton === copyButtonClass) {
        element.addEventListener('click', function() {
            onCopy(element, item);
        }, false);
    } else if (currentButton === deleteButtonClass) {
        element.addEventListener('click', function() {
            onDelete(item);
        }, false);
    }

    const content = document.createElement('div');
    content.setAttribute('class', cardContentClass);
    content.innerText = item.content;
    content.style.display = "none";
    element.appendChild(content);

    element.addEventListener('mouseover', function() {
        getChild(element, cardContentClass).style.display = "block";

    });

    element.addEventListener('mouseout', function() {
        getChild(element, cardContentClass).style.display = "none";

    });
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
    if (currentButton === copyButtonClass) {
        currentButton = deleteButtonClass;
    } else {
        currentButton = copyButtonClass;
    }
    updateList();
}

function onDelete(item) {
    const index = savedMessages.indexOf(item);
    if (index >= 0 && savedMessages.length > index) {
        savedMessages.splice(index, 1)
        save(getKeyFromURL(currentTab.url), JSON.stringify(savedMessages));
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
    newMessageTitle = newMessageTitle === undefined || newMessageTitle === '' ?  newMessage : newMessageTitle.trim().replace(/\s\s+/, ' ');
    
    if (checkTitleMessageNotExists(newMessageTitle)) {
        document.getElementsByClassName('error-div')[0].innerText = 'A message with the same title already exists';
    }
    else if (newMessage.length === 0) {
        document.getElementsByClassName('error-div')[0].innerText = 'You cannot save an empty message';
    }
    else if (currentTab?.url) {
        document.getElementsByClassName('error-div')[0].innerText = '';
        savedMessages.push({title: newMessageTitle, content: newMessage});
        save(getKeyFromURL(currentTab.url), JSON.stringify(savedMessages));
        updateList();
        document.getElementById(newMessageContentId).value = '';
        document.getElementById(newMessageTitleId).value = '';
    }
}

function checkTitleMessageNotExists(title) {
    return savedMessages.some(savedMessage => savedMessage.title === title);
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

function getButtonElement(classString) {
    const button = document.createElement('a');
    button.setAttribute('class', classString);
    return button;
} 

// Find the current active tab
function getTab() {
    return new Promise(resolve => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => resolve(tabs[0]));
    });
}

document.addEventListener('DOMContentLoaded', initPopupScript);