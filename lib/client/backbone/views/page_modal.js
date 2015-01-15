LocalyBackbone.Views.PageModal = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.eventManager = options.eventManager;
  },

  events: {
    "submit form": "submit"
  },

  global_events: {
    "submitRandomName": "submitRandomName"
  },

  className: "modal-text",

  template: JST["page-modal"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  },

  submit: function(event) {
    event.preventDefault();
    var inputLength = $("#name-input").val().length;

    if (inputLength > 0 && inputLength < 60) {
      Helper.pageLoaderShow();
      LocalyBackbone.Routers.router.navigate("chat", {trigger: true});
    }
  },

  submitRandomName: function() {
    var randomName = Math.random().toString(36).substring(7);
    $("#name-input").val(randomName);
    $("#page-modal form").submit();
  }
});
