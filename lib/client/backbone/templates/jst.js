function hereDoc(f) {
  
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

window.JST = {
  'page-modal': _.template(hereDoc(function() {/*!
  <form>
    Name. Plz?
    <input id='name-input' type='text'></input>
    <input type='submit'></input>
  </form>
*/})),

  'popup-header': _.template(hereDoc(function(socketID) {/*!
  <span class='popup-header <%= Localy._myName(socketID) %>' id='popup-header-<%= socketID %>'>
    username
  </span>
*/})),

  'popup-content': _.template(hereDoc(function(username, msg, userSocketID) {/*!
  <li>
    <span class='username <%= Localy._myName(userSocketID)%>'><%= username %> </span>: <span class='message'><%= msg %></span>
  </li>
*/})),

  'legend-box': _.template(hereDoc(function() {/*!
  <div id="chatroom" class="nifty-box">
    <span id="chatroom-label"></span>
  </div>

  <div id="user-count" class="nifty-box"></div>
*/})),

  'main-flash': _.template(""),

  'chatbox': _.template(hereDoc(function() {/*!
  <div id="chatbox-button-wrapper">
    <div class="nifty-box chatroom-button local-button">
      Local
      <span class="notification-badge" id="local-badge">0</span>
    </div>

    <div class="nifty-box blue chatroom-button hood-button" hood='<%= window.place.get("currentLocation") %>'>
      'Hood
      <span class="notification-badge" id="hood-badge">0</span>
    </div>
  </div>

  <ul class="active"></ul>

  <form id="chat-form">
    <input type="text" id="chat-input" autocomplete="off"></input>
    <button id="send-chat-message" class="nifty-box blue">Send</button>
  </form>
*/})),

  'remote-button': _.template(hereDoc(function(lat, lon) {/*!
    <div class='nifty-box chatroom-button remote-button' lat=<%= lat %> lon=<%= lon %>>
      Remote: <%= lat.toFixed(2) + ", " + lon.toFixed(2) %>
      <span style='display: inline' class='notification-badge'>1</span>
    </div>
  */})),

  'hood-button': _.template(hereDoc(function(hood) {/*!
    <div class='nifty-box chatroom-button' hood='<%= hood %>'>
      <%= hood %>
      <span style='display: inline' class='notification-badge'>0</span>
    </div>
  */}))

};
