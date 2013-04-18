
enyo.kind({
  name: "ContactList",
  kind: "List",
  count: 0,
  classes: "list",
  components: [
    {
      classes: "item", ontap: "doSelect", components: [
        { name: "displayName" }
      ]
    }
  ],

  events: {
    "onSelect": ""
  },

  create: function() {
    this.inherited(arguments);
    this.renderCache = {};
  },

  loadContact: function(inSender, inEvent) {
    var contact = this.renderCache[inEvent.index];
    if(contact) {
      this.$.displayName.setContent(contact.fn);
      delete this.renderCache[inEvent.index];
    } else {
      var id = this.contactIdList[inEvent.index];
      remoteStorage.contacts.get(id).then(function(contact) {
        this.renderCache[inEvent.index] = contact;
        this.renderRow(inEvent.index);
      }.bind(this));
    }
  },

  rendered: function() {
    this.inherited(arguments);
    console.log('rendered done');
  },

  reload: function() {
    this.setCount(0);
    this.reset();

    var setIds = function(ids) {
      this.contactIdList = ids;
      this.setCount(ids.length);
      this.reset();
    }.bind(this);

    if(this.filterQuery) {
      remoteStorage.contacts.search(this.filterQuery).then(setIds);
    } else {
      remoteStorage.contacts.list().then(setIds);
    }
  },

  filter: function(query) {
    if(query.length < 2) {
      delete this.filterQuery;
    } else {
      this.filterQuery = query;
    }
    this.reload();
  }

});
