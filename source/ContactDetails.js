
enyo.kind({
  name: "ContactDetails",

  components: [
    { tag: 'label', content: 'Name: ' },
    { name: 'displayName' }
  ],

  setContact: function(contact) {
    this.$.displayName.setContent(contact.fn);
  }
});
