enyo.kind({
  name: "AddDialog",
  kind: "FittableRows",
  fit: true,

  components: [
    {kind: "InputDecorator", components: [
      {kind: "onyx.Input", name: "fn", placeholder: "Full name"}
    ]},
    {tag: "br"},
    {kind: "InputDecorator", components: [
      {kind: "onyx.Input", name: "email", placeholder: "Email"}
    ]}
  ],

  show: function() {
    this.inherited(arguments);
    this.$.fn.focus();
  },

  save: function() {
    return remoteStorage.util.getPromise(function(promise) {
      remoteStorage.contacts.add(this._inputValues()).
        then(promise.fulfill, promise.reject);
    }.bind(this)).then(this._clearInputs.bind(this), function(error) {
      this._displayErrors(error.errors);
      throw error;
    }.bind(this));
  },

  cancel: function() {
    console.log('CANCEL');
    this._clearInputs();
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
