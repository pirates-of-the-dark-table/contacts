remoteStorage.defineModule('contacts', function(privateClient, publicClient) {

  /**
   *
   * Apart from the "contacts" module, this file contains a
   * proof-of-concept ngrams based search index.
   *
   * The code is highly redundant and needs refactoring for real-world
   * usecases. However - it works!
   *
   */

  var util = remoteStorage.util;

  var indexPathPrefix = "index/";

  function rmRf(path) {
    if(util.isDir(path)) {
      return privateClient.getListing(path).then(function(items) {
        return util.asyncEach(items, function(item) {
          return rmRf(path + item);
        });
      });
    } else {
      return privateClient.remove(path);
    }
  }

  function ngramIndexPath(objectType, key, ngram, objectId) {
    return indexPathPrefix + objectType + '/' + key + '/' + ngram + '/' + encodeURIComponent(objectId);
  }

  function addToIndex(objectType, key, ngram, objectId, value) {
    return privateClient.storeFile('text/plain', ngramIndexPath(objectType, key, ngram, objectId), value);
  }

  function removeFromIndex(objectType, key, ngram, objectId, value) {
    return privateClient.remove(ngramIndexPath(objectType, key, ngram, objectId));
  }

  // splits given "string" in ngrams of given "size"
  function extractNgrams(string, size) {
    string = string.toLowerCase();
    if(string.length === size) {
      return [string];
    }
    var end = string.length - size + 1;
    var ngrams = [];
    for(var i=0;i<end;i++) {
      ngrams.push(string.slice(i, i + size));
    }
    return ngrams;
  }

  function splitWords(string) {
    return string.split(/\s+/);
  }

  function indexAttribute(objectType, objectId, key, value) {
    return util.asyncEach(ngramize(value), function(ngram) {
      return addToIndex(objectType, key, ngram, objectId, value);
    });
  }

  function unindexAttribute(objectType, objectId, key, value) {
    return util.asyncEach(ngramize(value), function(ngram) {
      return removeFromIndex(objectType, key, ngram, objectId);
    });
  }

  function ngramize(string) {
    return splitWords(string).map(function(word) {
      return extractNgrams(word, 2)
    }).reduce(function(a, b) {
      return a.concat(b);
    }, []);
  }

  function queryKeyNgram(objectType, key, ngram) {
    return privateClient.getListing(ngramIndexPath(objectType, key, ngram, '')).
      then(function(objectIds) {
        return objectIds.map(decodeURIComponent);
      });
  }

  function calcResultWeights(groups) {
    var weightedIds = {};
    groups.forEach(function(group) {
      group.forEach(function(id) {
        if(id in weightedIds) {
          weightedIds[id]++;
        } else {
          weightedIds[id] = 1;
        }
      });
    });
    return Object.keys(weightedIds).sort(function(_a, _b) {
      var a = weightedIds[_a], b = weightedIds[_b];
      return a < b ? 1 : a > b ? -1 : 0;
    });
  }

  function queryIndex(objectType, query, key) {
    return util.asyncMap(ngramize(query), function(ngram) {
      return queryKeyNgram(objectType, key, ngram);
    }).then(calcResultWeights);
  }

  
  // declaring data type "contact"
  privateClient.declareType('contact', 'http://json-schema.org/card', {
    "$schema": "http://json-schema.org/draft-03/schema#",
    "description": "A representation of a person, company, organization, or place",
    "type": "object",
    "properties": {
        "fn": {
          "description": "Formatted Name",
          "type": "string",
          "required": true
        },
        "familyName": { "type": "string" },
        "givenName": { "type": "string" },
        "additionalName": { "type": "array", "items": { "type": "string" } },
        "honorificPrefix": { "type": "array", "items": { "type": "string" } },
        "honorificSuffix": { "type": "array", "items": { "type": "string" } },
        "nickname": { "type": "string" },
        "url": { "type": "string", "format": "uri" },
        "email": {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "value": { "type": "string", "format": "email" }
            }
        },
        "tel": {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "value": { "type": "string", "format": "phone" }
            }
        },
        "adr": { "$ref": "http: //json-schema.org/address" },
        "geo": { "$ref": "http: //json-schema.org/geo" },
        "tz": { "type": "string" },
        "photo": { "type": "string" },
        "logo": { "type": "string" },
        "sound": { "type": "string" },
        "bday": { "type": "string", "format": "date" },
        "title": { "type": "string" },
        "role": { "type": "string" },
        "org": {
            "type": "object",
            "properties": {
                "organizationName": { "type": "string" },
                "organizationUnit": { "type": "string" }
            }
        }
    }
  });

  function indexContact(contact) {
    return indexAttribute('contact', contact.id, 'fn', contact.fn);
  }

  function unindexContact(contact) {
    return unindexAttribute('contact', contact.id, 'fn', contact.fn);
  }

  return {
    exports: {

      init: function() {
        publicClient.release('');
        privateClient.release('');
        privateClient.use('card/');
        privateClient.use('index/');
      },

      on: privateClient.on,

      all: function() {
        return privateClient.getListing('card/').then(function(ids) {
          return util.asyncMap(ids, function(id) {
            return privateClient.getObject('card/' + id);
          });
        });
      },
      
      list: function() {
        return privateClient.getListing('card/');
      },

      add: function (contact) {try{
        contact.id = privateClient.uuid();

        return privateClient.storeObject("contact", "card/" + contact.id, contact).
          then(function() {
            // add() doesn't have to wait until the contact is indexed, but can
            // return immediately.
            indexContact(contact);
          }, function(error) {
            console.log('error storing contact: ', error);
            throw error;
          })
      }catch(exc){console.log('exc', exc);}},

      validate: function(contact) {
        return privateClient.validateObject(
          "@context" in contact ?
            contact :
            privateClient.buildObject('contact', contact)
        );
      },

      get: function (uuid) {
        return privateClient.getObject("card/" + uuid);
      },

      remove: function(contact) {
        return privateClient.remove('card/' + contact.id).
          then(function() {
            unindexContact(contact);
          });
      },

      search: function (query) {
        return queryIndex('contact', query, 'fn');
      },

      highlightNgrams: function(query, text, highlighter) {
        return text.replace(new RegExp('(?:' + ngramize(query).join('|') + ')', 'gi'), highlighter);
      },

      rebuildIndex: function() {
        return this.clearIndex().
          then(this.all).
          then(function(contacts) {
            return util.asyncEach(contacts, indexContact);
          });
      },

      clearIndex: function() {
        return rmRf('index/');
      },

      c: privateClient
    }
  };
});
