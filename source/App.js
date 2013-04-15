enyo.kind({

	name: "App",
	kind: "FittableRows",
	fit: true,

  /**
   ** VIEW
   **/

	components: [

    /* TOP TOOLBAR */
		{ kind: "onyx.Toolbar", content: "Contacts" },

    /* SCROLLER */
		{
      kind: "enyo.Scroller",
      fit: true,
      components: [
        /* MAIN */
			  {
          name: "main",
          classes: "nice-padding",
          allowHtml: true,
          components: [
            /* CONTACT LIST */
            {
              kind: "List",
              count: 0,
              onSetupItem: "loadContact",
              classes: "list",
              components: [
                /* LIST ITEM */
                {
                  classes: "item", ontap: "contactTap", components: [
                    { name: "displayName" }
                  ]
                }
              ]
            },

            {
              kind: "AddDialog"
            }
          ]
        }
		  ]
    },

    /* BOTTOM TOOLBAR(s) */
		{
      kind: "onyx.Toolbar",
      name: "mainToolbar",
      components: [
			  { kind: "onyx.Button", content: "Add", ontap: "showAddDialog" }
		  ]
    },

		{
      kind: "onyx.Toolbar",
      name: "addContactToolbar",
      components: [
			  { kind: "onyx.Button", content: "Save", ontap: "saveAddDialog" },
			  { kind: "onyx.Button", content: "Cancel", ontap: "cancelAddDialog" }
		  ]
    }

	],

  /**
   ** CONTROLLER
   **/

  create: function() {
    this.inherited(arguments);
    this.$.addDialog.hide();
    this.$.addContactToolbar.hide();
  },

  rendered: function() {
    this.inherited(arguments);

    remoteStorage.claimAccess('contacts', 'rw');
    remoteStorage.contacts.init();
    remoteStorage.displayWidget();
    this.refreshContacts = this.refreshContacts.bind(this);
    remoteStorage.on('ready', this.refreshContacts);
    remoteStorage.on('disconnect', this.refreshContacts);
    this.refreshContacts();
  },

  loadContact: function(inSender, inEvent) {
    var path = this.contactPathList[inEvent.index];
    remoteStorage.contacts.get(path).then(function(contact) {
      console.log('setContent', contact.fn);
      this.setContent(contact.fn);
    }.bind(this.$.displayName));
  },

  contactTap: function(inSender, inEvent) {
    console.log("clicked: " + this.$.displayName.content);
  },

  refreshContacts: function() {
    var $ = this.$;
    $.list.setCount(0);
    $.list.reset();
    remoteStorage.contacts.list().
      then(function(paths) {
        console.log('paths', paths);
        this.contactPathList = paths;
        $.list.setCount(paths.length);
        $.list.reset();
      }.bind(this));
  },

  showAddDialog: function() {
    this.$.list.hide();
    this.$.addDialog.show();
    this.$.mainToolbar.hide();
    this.$.addContactToolbar.show();
  },

  saveAddDialog: function() {
    this.$.addDialog.save().
      then(this._closeAddDialog.bind(this)).
      then(this.refreshContacts.bind(this));
  },

  cancelAddDialog: function() {
    this.$.addDialog.cancel();
    this._closeAddDialog();
  },

  _closeAddDialog: function() {
    this.$.list.show();
    this.$.addDialog.hide();
    this.$.addContactToolbar.hide();
    this.$.mainToolbar.show();
  }

});
