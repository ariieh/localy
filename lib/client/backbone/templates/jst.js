function hereDoc(f) {  
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

window.JST = {
  'page-modal': _.template(hereDoc(function() {/*!
  <form>
    Name. Plz?
    <input id='name-input' type='text' autofocus></input>
    <input type='submit'></input>
  </form>
*/})),

  'popup-header': _.template(hereDoc(function(username, socketID) {/*!
  <span class='popup-header <%= Localy._myName(socketID) %>' socket-id='<%= socketID %>' username='<%= username %>'>
    <%= username %>
  </span>
  <span class='icon-comment'></span>
*/})),

  'msg-content': _.template(hereDoc(function(username, msg, userSocketID, timestamp) {/*!
  <li>
    <span class='username <%= Localy._myName(userSocketID)%>'><%= username %> </span>: <span class='message'><%= msg %></span>
    <span class='timestamp'><%= timestamp %></span>
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
    <div class="nifty-box chatroom-button local-button" type='local'>
      Local
      <span class="notification-badge" id="local-badge">0</span>
    </div>

    <div class="nifty-box blue chatroom-button hood-button" hood='<%= window.place.get("currentLocation") %>' type='hood'>
      'Hood
      <span class="notification-badge" id="hood-badge">0</span>
    </div>
  </div>

  <div class="chatbox-scroll-fader top"></div>
  <div id="ul-wrapper">
    <ul class="active"></ul>
  </div>
  <div class="chatbox-scroll-fader bottom"></div>

  <form id="chat-form">
    <input type="text" id="chat-input" autocomplete="off"></input>
    <button id="send-chat-message" class="nifty-box blue">Send</button>
  </form>
*/})),

  'remote-button': _.template(hereDoc(function(lat, lon) {/*!
    <div class='nifty-box chatroom-button remote-button' lat=<%= lat %> lon=<%= lon %> type='remote'>
      Remote: <%= lat.toFixed(2) + ", " + lon.toFixed(2) %>
      <span style='display: inline' class='notification-badge'>1</span>
      <span class='close-button'>&#10006;</span>
    </div>
  */})),

  'other-hood-button': _.template(hereDoc(function(hood) {/*!
    <div class='nifty-box chatroom-button other-hood-button' hood='<%= hood %>' type='hood'>
      <%= hood %>
      <span style='display: inline' class='notification-badge'>0</span>
      <span class='close-button'>&#10006;</span>
    </div>
  */})),

  'individual-button': _.template(hereDoc(function(socketID, username) {/*!
    <div class='nifty-box chatroom-button individual-button' socket-id='<%= socketID %>' username='<%= username %>' type='individual'>
      <%= username %>
      <span style='display: inline' class='notification-badge'>1</span>
      <span class='close-button'>&#10006;</span>
    </div>
  */})),

  'about-me': _.template(hereDoc(function() {/*!
    <div id='about-me-modal'>
      <div id='about-me-modal-wrapper'>
        By yours truly, <a href="http://www.arieh.me/">Mr. Arieh Smith</a>.<br><br>
        Reach me at <a href="mailto:arieh.smith@gmail.com">arieh.smith@gmail.com</a>.<br><br>
        Made from scratch with <a href="http://nodejs.org/">Node</a>, <a href="http://expressjs.com/">Express</a>, <a href="http://socket.io/">Socket</a>, <a href="http://knexjs.org/">Knex</a>, <a href="http://bookshelfjs.org/">Bookshelf</a>, and <a href="http://backbonejs.org/">Backbone</a>.
      </div>
    </div>
  */}))

};
