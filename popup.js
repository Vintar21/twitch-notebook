/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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

var currentTab;
var savedMessages;
const console = chrome.extension.getBackgroundPage().console;

// Start the popup script, this could be anything from a simple script to a webapp
const initPopupScript = () => {
    // Access the background window object
    const backgroundWindow = chrome.extension.getBackgroundPage();
    // Do anything with the exposed variables from background.js
    console.log(backgroundWindow.sampleBackgroundGlobal);

    // This port enables a long-lived connection to in-content.js
    let port = null;

    // Send messages to the open port
    const sendPortMessage = message => port.postMessage(message);

    // Find the current active tab
    const getTab = () => new Promise(resolve => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => resolve(tabs[0]));
    });

    // Handle port messages
    const messageHandler = message => {
        console.log('popup.js - received message:', message);
    };

    document.getElementById('add-button').addEventListener('click', function() {
        onAdd();
    }, false);

    document.getElementById("new-message").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.key === 'Enter') {
            document.getElementById('add-button').click();
        }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.executeScript(
            tabs[0].id,
            { code: 'var s = document.documentElement.outerHTML; chrome.runtime.sendMessage({action: "getSource", source: s});' }
        );
    });

    console.log(document.getElementsByTagName('html')[0].innerHTML)

    // Find the current active tab, then open a port to it
    getTab().then(tab => {
        currentTab = tab;
        // Connects to tab port to enable communication with inContent.js
        chrome.storage.sync.get(/* String or Array */[tab.url], function(items){
            if (items[tab.url] !== undefined) {
                savedMessages = getItems(items[tab.url]);
                updateList();
            }
        })
        // save(tab.url, '["test", "test2"]');

        // port = chrome.tabs.connect(tab.id, { name: 'Twitch Notepad' });
        // // Set up the message listener
        // port.onMessage.addListener(messageHandler);
        // // Send a test message to in-content.js
        // sendPortMessage('Message from popup!');
    });
};

const updateList = () => {
    var listDiv = document.getElementById('list-container');
        
    var child = listDiv.lastElementChild; 
    while (child) {
        listDiv.removeChild(child);
        child = listDiv.lastElementChild;
    }

    for (var i = 0; i < savedMessages.length; ++i) {
        const item = savedMessages[i];
        var element=document.createElement('div');
        element.setAttribute('class', 'list-element');
        element.addEventListener('click', function() {
            onCopy(item);
        }, false);
        const messageHTML = '<a class="copy-button fas fa-copy btn-primary"></a> ' + item;
        element.innerHTML = messageHTML;   // Use innerHTML to set the text
        listDiv.appendChild(element);      
    }
}

const getItems= (stringArray) => {
    return JSON.parse(stringArray);
}

const onDelete = (item) => {
    const index = savedMessages.indexOf(item);
    if (index >= 0 && savedMessages.length > index) {
        console.log(index);
        console.log(item);
        console.log(savedMessages);
        copyToClipboard(item);
        savedMessages.splice(index, 1)
        console.log(savedMessages);
        save(currentTab.url, JSON.stringify(savedMessages));
        updateList();
    }
}

const onCopy = (item) => {
    copyToClipboard(item);
}

const onAdd = () => {
    // console.log(document.getElementsByClassName('text-area').value)
    const newMessage = document.getElementById('new-message').value;
    if (currentTab?.url && newMessage.length > 0 && !savedMessages.includes(newMessage)) {
        savedMessages.push(newMessage);
        save(currentTab.url, JSON.stringify(savedMessages));
        updateList();
        document.getElementById('new-message').value = '';
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

const save = (url, messages) => {
    var entry = {};
    entry[url] = messages;
    chrome.storage.sync.set(entry, function(){
        //  A data saved callback omg so fancy
    });

};

// Fire scripts after page has loaded
document.addEventListener('DOMContentLoaded', initPopupScript);

/***/ })
/******/ ]);
//# sourceMappingURL=popup.js.map