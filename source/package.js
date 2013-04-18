enyo.depends(
	"$lib/layout",
	"$lib/onyx",	// To theme Onyx using Theme.less, change this line to $lib/onyx/source,
	//"Theme.less",	// uncomment this line, and follow the steps described in Theme.less

  // remotestorage stuff
  "remotestorage.min.js",
  "remotestorage-contacts.js",

  // custom kinds
  "InputDecorator.js",
  "ContactsToolbar.js",
	"AddDialog.js",
  "ContactList.js",

  // app
	"App.css",
	"App.js"
);
