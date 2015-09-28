(function() {
  // Generate a Wilddog location
  var wilddogUrl = "https://fish2.wilddogio.com/";
  var wilddogRef = new Wilddog(wilddogUrl);


  // Create a new GeoDog instance at the  Wilddog location
  var geoDog = new GeoDog(wilddogRef);

  // Create the locations for each fish
  var fishLocations = [
    [-40, 159],
    [90, 70],
    [-46, 160],
    [0, 0]
  ];

  // Create a GeoQuery centered at fish2
  var geoQuery = geoDog.query({
    center: fishLocations[2],
    radius: 3000
  });

  // Attach event callbacks to the query
  var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location) {
    log(key + " 进入查询范围. Hi " + key + "!");

    document.getElementById(key + "Inside").style.display = "block";
    document.getElementById(key + "Outside").style.display = "none";
  });

  var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location) {
    log(key + " 移出查询范围. Bye bye :(");

    document.getElementById(key + "Inside").style.display = "none";
    document.getElementById(key + "Outside").style.display = "block";
  });

  var onKeyMovedRegistration = geoQuery.on("key_moved", function(key, location) {
    log(key + " 在查询范围内移动到另一个地方");
  });

  // Set the initial locations of the fish in GeoDog
  log("*** Setting initial locations ***");
  var promises = fishLocations.map(function(location, index) {
    return geoDog.set("fish" + index, location);
  });

  // Once all the fish are in geoDog, log a message that the user can now move fish around
  RSVP.allSettled(promises).then(function() {
    log("*** Use the controls above to move the fish in and out of the query ***");
  });

  // Move the selected fish when the move fish button is clicked
  document.getElementById("moveFishButton").addEventListener("click", function() {
    var selectedFishKey = document.getElementById("fishSelect").value;
    var selectedLocation = document.getElementById("locationSelect").value;

    var newLocations = {
      fish0: {
        inside: [-40, 159],
        outside: [60, 80],
        within: [-40, 150]
      },
      fish1: {
        inside: [-44, 170],
        outside: [90, 70],
        within: [-42, 155]
      },
      fish2: {
        inside: [-46, 160],
        outside: [88, 88],
        within: [-47, 150]
      },
      fish3: {
        inside: [-43, 145],
        outside: [0, 0],
        within: [-43, 150]
      }
    };

    geoDog.set(selectedFishKey, newLocations[selectedFishKey][selectedLocation]);
  });

  // Cancel the "key_moved" callback when the corresponding button is clicked
  document.getElementById("cancelKeyMovedCallbackButton").addEventListener("click", function() {
    log("*** 'key_moved' 回调被取消 ***");
    onKeyMovedRegistration.cancel();
  });


  /*************/
  /*  HELPERS  */
  /*************/
  /* Returns a random string of the inputted length */
  function generateRandomString(length) {
      var text = "";
      var validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for(var i = 0; i < length; i++) {
          text += validChars.charAt(Math.floor(Math.random() * validChars.length));
      }

      return text;
  }

  /* Logs to the page instead of the console */
  function log(message) {
    var childDiv = document.createElement("div");
    var textNode = document.createTextNode(message);
    childDiv.appendChild(textNode);
    document.getElementById("log").appendChild(childDiv);
  }
})();
