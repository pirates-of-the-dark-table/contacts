enyo.kind({
  name: "AddDialog",
  kind: "FittableRows",
  fit: true,

  components: [
    {kind: enyo.Signals, onkeyup: "_handleKeyPress"},
    {kind: "InputDecorator", components: [
      {kind: "onyx.Input", name: "fn", placeholder: "Full name", onkeyup: "_handleKeyPress"}
    ]},
    {tag: "br"},
    {kind: "InputDecorator", components: [
      {kind: "onyx.Input", name: "email", placeholder: "Email", onkeyup: "_handleKeyPress"}
    ]}
  ],

  events: {
    "onSaved": ""
  },

  show: function() {
    this.inherited(arguments);
    this.$.fn.focus();
  },

  save: function() {
    var attributes = this._inputValues();
    var errors = remoteStorage.contacts.validate(attributes);
    console.log('errors', errors);
    if(errors) {
      this._displayErrors(errors);
    } else {
      this._clearInputs();
      return remoteStorage.contacts.add(attributes).then(this.doSaved.bind(this));
    }
  },

  cancel: function() {
    this._clearInputs();
  },

  _handleKeyPress: function(inSender, inEvent) {
    if(this.showing && inEvent.keyCode === 13) {
      this.save();
    }
  },

  _clearInputs: function() {
    this.$.fn.parent.clear();
    this.$.email.parent.clear();
  },

  _inputValues: function() {
    var values = {};
    var fn = this.$.fn.getValue();
    if(fn) {
      values.fn = fn;
    }
    var email = this.$.email.getValue();
    if(email) {
      values.email = {
        // what to use here? card schema only allows one address anyway...
        type: "home",
        value: email
      };
    }
    return values;
  },

  _displayErrors: function(errors) {
    errors.forEach(function(error) {
      var input = this.$[error.property];
      if(input) {
        input.parent.setError(error.message);
      }
    }.bind(this));
  }

});
