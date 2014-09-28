LocalyBackbone.Views.PageModal = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
  },

  events: {
    "submit form": "submit"
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

    Helper.pageLoaderShow();

    LocalyBackbone.Routers.router.navigate("chat", {trigger: true});    
  }
});
