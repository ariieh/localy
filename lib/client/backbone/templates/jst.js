function hereDoc(f) {
  
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

window.JST = {};

window.JST['page-modal'] = _.template(hereDoc(function() {/*!
  <form>
    Name. Plz?
    <input id='name-input' type='text'></input>
    <input type='submit'></input>
  </form>
*/}));

window.JST['map/popup-header'] = _.template(hereDoc(function(socketID) {/*!
  <span class='popup-header <%= Localy._myName(socketID) %>' id='popup-header-<%= socketID %>'>
    username
  </span>
*/}));

window.JST['legend-box'] = _.template(hereDoc(function() {/*!
  <div id="chatroom" class="nifty-box">
    <span id="chatroom-label"></span>
  </div>

  <div id="user-count" class="nifty-box"></div>
*/}));

window.JST['main-flash'] = _.template("");

window.JST['chatbox'] = _.template(hereDoc(function() {/*!
  <div id="chatbox-button-wrapper">
    <div class="nifty-box chatroom-button local-button">
      Local
      <span class="notification-badge" id="local-badge">0</span>
    </div>

    <div class="nifty-box blue chatroom-button hood-button">
      'Hood
      <span class="notification-badge" id="hood-badge">0</span>
      <span class="downward-select-triangle"></span>
    </div>
  </div>

  <ul class="active"></ul>

  <form id="chat-form">
    <input type="text" id="chat-input" autocomplete="off"></input>
    <button id="send-chat-message" class="nifty-box blue">Send</button>
  </form>
*/}));
