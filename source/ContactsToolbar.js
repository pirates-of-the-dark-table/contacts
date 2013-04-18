enyo.kind({
  name: "ContactsToolbar",
  kind: "onyx.Toolbar",
  components: [
    {kind: "onyx.InputDecorator", name: "searchBox", components: [
      {kind: "onyx.Input", placeholder: "Search...", oninput: "typeQuery"},
      {tag: "img", src: "../assets/search.png"}
    ]},
		{kind: "onyx.Button", content: "Add", ontap: "doAdd", name: "add"},
		{kind: "onyx.Button", content: "Save", ontap: "doSave", name: "save"},
		{kind: "onyx.Button", content: "Cancel", ontap: "doCancel", name: "cancel"}
	],

  events: {
    "onAdd": "",
    "onSave": "",
    "onCancel": "",
    "onSearch": ""
  },

  setState: function(state) {
    switch(state) {
    case "list":
      this._setVisible('add', 'searchBox');
      break;
    case "edit":
      this._setVisible('save', 'cancel');
      break;
    default:
      throw "Unknown state: " + state;
    }
  },

  _setVisible: function() {
    this.children.forEach(function(child) { child.hide(); });
    Array.prototype.slice.call(arguments).forEach(function(name) {
      this[name].show();
    }.bind(this.$));
  },

  typeQuery: function(inSender, inEvent) {
    this.doSearch({ query: inEvent.target.value });
  }

});
