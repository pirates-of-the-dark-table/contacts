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
		{kind: "onyx.Button", content: "Done", ontap: "doDone", name: "done"},
		{kind: "onyx.Button", content: "Close", ontap: "doClose", name: "close"}
	],

  events: {
    "onAdd": "", // switch to "add dialog"
    "onSave": "", // save current "add dialog"
    "onDone": "", // close "add dialog"
    "onSearch": "", // query changed
    "onClose": "" // close "details"
  },

  setState: function(state) {
    switch(state) {
    case "list":
      this._setVisible('add', 'searchBox');
      break;
    case "edit":
      this._setVisible('save', 'done');
      break;
    case 'details':
      this._setVisible('close');
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
