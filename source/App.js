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
      classes: "app-panels",
      kind: "Scroller",
      components: [
        { kind: "ContactList", onSetupItem: "loadContact", onSelect: "selectContact" },
        { kind: "AddDialog", onSaved: "contactSaved" },
        { kind: "ContactDetails" }
      ]
    },

    /* BOTTOM TOOLBAR(s) */
		{
      kind: "ContactsToolbar",

      onAdd: "showAddDialog",
      onSave: "saveAddDialog",
      onDone: "cancelAddDialog",
      onSearch: "filterList",
      onClose: "closeContactDetails"
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
    this.closeAddDialog();
  },

  rendered: function() {
    this.inherited(arguments);
    remoteStorage.displayWidget('remotestorage-connect');
  },

  selectContact: function(inSender, inEvent) {
    this.$.contactDetails.setContact(this.$.contactList.selectedContact);
    this.showContactDetails();
  },

  showAddDialog: function() {
    this.$.contactList.hide();
    this.$.addDialog.show();
    this.$.contactsToolbar.setState('edit');
  },

  saveAddDialog: function() {
    this.$.addDialog.save();
  },

  contactSaved: function() {
    this.refreshContacts();
  },

  refreshContacts: function() {
    this.$.contactList.reload();
  },

  cancelAddDialog: function() {
    this.$.addDialog.cancel();
    this.closeAddDialog();
  },

  closeAddDialog: function() {
    this.$.contactList.show();
    this.$.addDialog.hide();
    this.$.contactsToolbar.setState('list');
    this.refreshContacts();
  },

  showContactDetails: function() {
    this.$.contactList.hide();
    this.$.contactDetails.show();
    this.$.contactsToolbar.setState('details');
  },

  closeContactDetails: function() {
    this.$.contactList.show();
    this.$.contactDetails.hide();
    this.$.contactsToolbar.setState('list');
    this.refreshContacts();
  },

  loadContact: function(inSender, inEvent) {
    this.$.contactList.loadContact(inSender, inEvent);
  },

  filterList: function(inSender, inEvent) {
    this.$.contactList.filter(inEvent.query);
  }

});
