LocalyBackbone.Collections.Users = Backbone.Collection.extend({
  model: LocalyBackbone.Models.User,
  url: "/api/users"
});
