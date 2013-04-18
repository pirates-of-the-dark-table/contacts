enyo.kind({

	name: "App",
	kind: "FittableRows",
	fit: true,

  /**
   ** VIEW
   **/

	components: [

    { id: "remotestorage-connect" },

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

	],

  /**
   ** CONTROLLER
   **/

  create: function() {
    this.inherited(arguments);
    remoteStorage.claimAccess('contacts', 'rw');
    remoteStorage.contacts.init();
    this.refreshContacts = this.refreshContacts.bind(this);
    remoteStorage.on('ready', this.refreshContacts);
    remoteStorage.on('disconnect', this.refreshContacts);
    this.refreshContacts();
    this._closeAddDialog();
  },

  rendered: function() {
    this.inherited(arguments);
    remoteStorage.displayWidget('remotestorage-connect');
  },

  selectContact: function(inSender, inEvent) {
    console.log('select', arguments);
  },

  showAddDialog: function() {
    this.$.contactList.hide();
    this.$.addDialog.show();
    this.$.contactsToolbar.setState('edit');
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
  },

  loadContact: function(inSender, inEvent) {
    this.$.contactList.loadContact(inSender, inEvent);
  },

  filterList: function(inSender, inEvent) {
    this.$.contactList.filter(inEvent.query);
  }

});
