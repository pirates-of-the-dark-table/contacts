// custom InputDecorator, to add error support

enyo.kind({
  name: "InputError",
  classes: "error-message"
});

enyo.kind({
  name: "InputDecorator",
  kind: "onyx.InputDecorator",

  create: function() {
    this.inherited(arguments);
    this.inputError = new InputError();
    this.addChild(this.inputError);
  },

  clear: function() {
    this.children.forEach(function(child) {
      if(typeof(child.setValue) === 'function') {
        child.setValue('');
      }
    });
    this.clearError();
  },

  setError: function(message) {
    this.inputError.setContent(message);
    this.inputError.show();
    this.addClass('error');
  },

  clearError: function() {
    this.inputError.setContent('');
    this.inputError.hide();
    this.removeClass('error');
  }
});
