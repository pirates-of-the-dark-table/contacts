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

    /* MAIN */
		{
      fit: true,
      name: "main",
      classes: "nice-padding app-panels",
      kind: "Scroller",
      components: [
        { kind: "ContactList", onSetupItem: "loadContact", onSelect: "selectContact" },
        { kind: "AddDialog" }
      ]
    },

    /* BOTTOM TOOLBAR(s) */
		{
      kind: "ContactsToolbar",
      onAdd: "showAddDialog",
      onSave: "saveAddDialog",
      onCancel: "cancelAddDialog",
      onSearch: "filterList"
    }

		// {
    //   kind: "onyx.Toolbar",
    //   name: "addContactToolbar",
    //   components: [
		// 	  { kind: "onyx.Button", content: "Save", ontap: "saveAddDialog" },
		// 	  { kind: "onyx.Button", content: "Cancel", ontap: "cancelAddDialog" }
		//   ]
    // }

	],

  /**
   ** CONTROLLER
   **/

  create: function() {
    this.inherited(arguments);
    console.log('creating, this', this);
    remoteStorage.claimAccess('contacts', 'rw');
    remoteStorage.contacts.init();
    remoteStorage.displayWidget();
    this.refreshContacts = this.refreshContacts.bind(this);
    remoteStorage.on('ready', this.refreshContacts);
    remoteStorage.on('disconnect', this.refreshContacts);
    this.refreshContacts();
    this._closeAddDialog();
  },

  selectContact: function(inSender, inEvent) {
    console.log('select', arguments);
  },

  showAddDialog: function() {
    this.$.contactList.hide();
    this.$.addDialog.show();
    this.$.contactsToolbar.setState('edit');
    //this.$.mainToolbar.hide();
    //this.$.addContactToolbar.show();
  },

  saveAddDialog: function() {
    this.$.addDialog.save().
      then(this._closeAddDialog.bind(this)).
      then(this.refreshContacts.bind(this));
  },

  refreshContacts: function() {
    this.$.contactList.reload();
  },

  cancelAddDialog: function() {
    this.$.addDialog.cancel();
    this._closeAddDialog();
  },

  _closeAddDialog: function() {
    this.$.contactList.show();
    this.$.addDialog.hide();
    this.$.contactsToolbar.setState('list');
    //this.$.addContactToolbar.hide();
    //this.$.mainToolbar.show();
  },

  loadContact: function(inSender, inEvent) {
    this.$.contactList.loadContact(inSender, inEvent);
  },

  filterList: function(inSender, inEvent) {
    this.$.contactList.filter(inEvent.query);
  }

});
