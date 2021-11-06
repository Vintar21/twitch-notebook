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

    // Find the current active tab, then open a port to it
    getTab().then(tab => {
        currentTab = tab;
        // Connects to tab port to enable communication with inContent.js
        chrome.storage.sync.get(/* String or Array */[tab.url], function(items){
            savedMessages = getItems(items[tab.url]);
            updateList();

        })
        // save(tab.url, '["test", "test2"]');

        // port = chrome.tabs.connect(tab.id, { name: 'Twitch NoteBook' });
        // // Set up the message listener
        // port.onMessage.addListener(messageHandler);
        // // Send a test message to in-content.js
        // sendPortMessage('Message from popup!');
    });
};

const updateList = () => {
    var listDiv = document.getElementById('list-container');
    var list = document.getElementById('list');
    var toAdd = [savedMessages[savedMessages.length-1]];
    
    chrome.extension.getBackgroundPage().console.log(listDiv.childElementCount);
    if (!list) {
        list=document.createElement('ul');
        toAdd = savedMessages;
    }
    for (var i = 0; i < toAdd.length; ++i) {
        const item = toAdd[i];
        var li=document.createElement('li');
        li.innerHTML = item;   // Use innerHTML to set the text
        list.appendChild(li);      
    }
    if (listDiv.childElementCount === 0) {
        list.setAttribute('id', 'list');
        listDiv.appendChild(list); 
    }
}

const getItems= (stringArray) => {
    return JSON.parse(stringArray);
}

const onAdd = () => {
    chrome.extension.getBackgroundPage().console.log(currentTab);
    const newMessage = document.getElementById('new-message').value;
    if (currentTab?.url && newMessage.length > 0) {
        savedMessages.push(newMessage);
        save(currentTab.url, JSON.stringify(savedMessages));
        updateList();
    }
}

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