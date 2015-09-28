var Wilddog = require('wilddog');
var RSVP = require('rsvp');
var args = process.argv

function usage() {
  console.log("USAGE: " + args[0] + " " + args[1] + " [--wilddog-secret <wilddog-secret>] --in-place <geodog-reference> ");
  console.log("       " + args[0] + " " + args[1] + " [--wilddog-secret <wilddog-secret>] <old-reference> <new-reference>")
  console.log("WARNING: --in-place deletes old references");
  console.log("The Wilddog secret is optional. By passing the secret you can override any security rules present");
  process.exit(1);
}

function setWithPromise(ref, value, priority) {
  return new RSVP.Promise(function(resolve, reject) {
    if (priority) {
      ref.setWithPriority(value, priority, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      ref.set(value, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }
  });
}

function runMigration(fromWilddog, toWilddog, inPlace) {
  console.log("Loading old data...");

  fromWilddog.child('i').once('value', function(snapshot) {
    console.log('Received old data, processing (this may take a while)...');
    var error = false;
    var promises = [];
    if (snapshot.val() === null) {
      console.log("Not a valid GeoDog v2 reference: " + fromWilddog);
      process.exit(1);
    } else {
      snapshot.forEach(function(child) {
        var parts = child.name().split(":");
        if (parts.length < 2) {
          console.log("Error transcribing key " + hashKeyPair + "! Not a valid GeoDog entry!");
          error = true;
        } else {
          var hash = parts[0];
          var key = parts.splice(1).join(":");
          (function(key, hash) {
            var promise = new RSVP.Promise(function(resolve, reject) {
              fromWilddog.child('l').child(key).once('value', function(snapshot) {
                resolve(snapshot.val());
              }, function(error) {
                reject(error);
              });
            }).then(function(value) {
              if (value != null) {
                var lat = value[0];
                var lng = value[1];
                if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
                  console.log("Error transcribing key " + key + "! Not a valid geolocation: [" + lat + ", " + lng + "]");
                  error = true;
                } else {
                  return new setWithPromise(toWilddog.child(key), { "g": hash, "l": [lat, lng] }, hash);
                }
              } else {
                console.log("Key was removed from GeoDog while migrating: " + key);
              }
            });
            promises.push(promise);
          })(key, hash);
        }
      });
      RSVP.all(promises).then(function(posts) {
        if (error) {
          console.log("There were errors migrating GeoDog, please check your data and the result manually");
          process.exit(1);
        } else {
          console.log("Migrated " + promises.length + " keys successfully!");
          if (inPlace) {
            console.log("Deleting old keys");
            return RSVP.all([
              setWithPromise(fromWilddog.child('l'), null),
              setWithPromise(fromWilddog.child('i'), null),
            ]);
          }
        }
      }).then(function() {
        console.log("All done...");
        process.exit(0);
      }).catch(function(reason) {
        console.log("There was an error running the migration: " + reason);
        process.exit(1);
      });
    }
  }, function(error) {
    console.log("There was an error getting the old GeoDog data: " + error);
  });
}

/***** Parse Arguments ******/
var progArgs = args.slice(2);

var secretIndex = progArgs.indexOf("--wilddog-secret");
var wilddogSecret;
if (secretIndex !== -1) {
  wilddogSecret = progArgs[secretIndex+1];
  progArgs.splice(secretIndex, 2);
} else {
  wilddogSecret == null;
}

if (progArgs.length !== 2) {
  usage();
}

var inPlace;
var fromWilddog;
var toWilddog;
if (progArgs[0] === "--in-place") {
  inPlace = true;
  fromWilddog = new Wilddog(progArgs[1]);
  toWilddog = new Wilddog(progArgs[1]);
} else {
  inPlace = false;
  fromWilddog = new Wilddog(progArgs[0]);
  toWilddog = new Wilddog(progArgs[1]);
}

if (wilddogSecret) {
  console.log("Authenticating...");
  toWilddog.auth(wilddogSecret, function() {
    //success
    console.log("Authentication successful.");
    runMigration(fromWilddog, toWilddog, inPlace);
  }, function() {
    //failure
    console.log("Error authenticating...");
    process.exit(1);
  });
} else {
  runMigration(fromWilddog, toWilddog, inPlace);
}