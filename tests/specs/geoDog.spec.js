describe("GeoDog Tests:", function() {
  // Reset the Wilddog before each test
  beforeEach(function(done) {
    beforeEachHelper(done);
  });

  afterEach(function(done) {
    afterEachHelper(done);
  });

  describe("Constructor:", function() {
    it("Constructor throws errors given invalid Wilddog references", function() {
      invalidWilddogRefs.forEach(function(invalidWilddogRef) {
        expect(function() { new GeoDog(invalidWilddogRef); }).toThrow();
      });
    });

    it("Constructor does not throw errors given valid Wilddog references", function() {
      expect(function() { new GeoDog(wilddogRef); }).not.toThrow();
    });
  });

  describe("ref():", function() {
    it("ref() returns the Wilddog reference used to create a GeoDog instance", function() {
      expect(geoDog.ref()).toBe(wilddogRef);
    });
  });

  describe("Adding a single location via set():", function() {
    it("set() returns a promise", function(done) {

      var cl = new Checklist(["p1"], expect, done);

      geoDog.set("loc1", [0, 0]).then(function() {
        cl.x("p1");
      });
    });

    it("set() updates Wilddog when adding new locations", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4"], expect, done);

      geoDog.set("loc1", [0, 0]).then(function() {
        cl.x("p1");

        return geoDog.set("loc2", [50, 50]);
      }).then(function() {
        cl.x("p2");

        return geoDog.set("loc3", [-90, -90]);
      }).then(function() {
        cl.x("p3");

        return getWilddogData();
      }).then(function(wilddogData) {
        expect(wilddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc2": { ".priority": "v0gs3y0zh7", "l": { "0": 50, "1": 50 }, "g": "v0gs3y0zh7" },
          "loc3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" }
        });

        cl.x("p4");
      }).catch(failTestOnCaughtError);
    });

    it("set() handles decimal latitudes and longitudes", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4"], expect, done);

      geoDog.set("loc1", [0.254, 0]).then(function() {
        cl.x("p1");

        return geoDog.set("loc2", [50, 50.293403]);
      }).then(function() {
        cl.x("p2");

        return geoDog.set("loc3", [-82.614, -90.938]);
      }).then(function() {
        cl.x("p3");

        return getWilddogData();
      }).then(function(wilddogData) {
        expect(wilddogData).toEqual({
          "loc1": { ".priority": "ebpcrypzxv", "l": { "0": 0.254, "1": 0 }, "g": "ebpcrypzxv" },
          "loc2": { ".priority": "v0gu2qnx15", "l": { "0": 50, "1": 50.293403 }, "g": "v0gu2qnx15" },
          "loc3": { ".priority": "1cr648sfx4", "l": { "0": -82.614, "1": -90.938 }, "g": "1cr648sfx4" }
        });

        cl.x("p4");
      }).catch(failTestOnCaughtError);
    });

    it("set() updates wilddog when changing a pre-existing key", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5"], expect, done);

      geoDog.set("loc1", [0, 0]).then(function() {
        cl.x("p1");

        return geoDog.set("loc2", [50, 50]);
      }).then(function() {
        cl.x("p2");

        return geoDog.set("loc3", [-90, -90]);
      }).then(function() {
        cl.x("p3");

        return geoDog.set("loc1", [2, 3]);
      }).then(function() {
        cl.x("p4");

        return getWilddogData();
      }).then(function(wilddogData) {
        expect(wilddogData).toEqual({
          "loc1": { ".priority": "s065kk0dc5", "l": { "0": 2, "1": 3 }, "g": "s065kk0dc5" },
          "loc2": { ".priority": "v0gs3y0zh7", "l": { "0": 50, "1": 50 }, "g": "v0gs3y0zh7" },
          "loc3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" }
        });

        cl.x("p5");
      }).catch(failTestOnCaughtError);
    });

    it("set() updates wilddog when changing a pre-existing key to the same location", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5"], expect, done);

      geoDog.set("loc1", [0, 0]).then(function() {
        cl.x("p1");

        return geoDog.set("loc2", [50, 50]);
      }).then(function() {
        cl.x("p2");

        return geoDog.set("loc3", [-90, -90]);
      }).then(function() {
        cl.x("p3");

        return geoDog.set("loc1", [0, 0]);
      }).then(function() {
        cl.x("p4");

        return getWilddogData();
      }).then(function(wilddogData) {
        expect(wilddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc2": { ".priority": "v0gs3y0zh7", "l": { "0": 50, "1": 50 }, "g": "v0gs3y0zh7" },
          "loc3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" }
        });

        cl.x("p5");
      }).catch(failTestOnCaughtError);
    });

    it("set() handles multiple keys at the same location", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4"], expect, done);

      geoDog.set("loc1", [0, 0]).then(function() {
        cl.x("p1");

        return geoDog.set("loc2", [0, 0]);
      }).then(function() {
        cl.x("p2");

        return geoDog.set("loc3", [0, 0]);
      }).then(function() {
        cl.x("p3");

        return getWilddogData();
      }).then(function(wilddogData) {
        expect(wilddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc2": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc3": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" }
        });

        cl.x("p4");
      }).catch(failTestOnCaughtError);
    });

    it("set() updates wilddog after complex operations", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11"], expect, done);

      geoDog.set("loc:1", [0, 0]).then(function() {
        cl.x("p1");

        return geoDog.set("loc2", [50, 50]);
      }).then(function() {
        cl.x("p2");

        return geoDog.set("loc%!A72f()3", [-90, -90]);
      }).then(function() {
        cl.x("p3");

        return geoDog.remove("loc2");
      }).then(function() {
        cl.x("p4");

        return geoDog.set("loc2", [0.2358, -72.621]);
      }).then(function() {
        cl.x("p5");

        return geoDog.set("loc4", [87.6, -130]);
      }).then(function() {
        cl.x("p6");

        return geoDog.set("loc5", [5, 55.555]);
      }).then(function() {
        cl.x("p7");

        return geoDog.set("loc5", null);
      }).then(function() {
        cl.x("p8");

        return geoDog.set("loc:1", [87.6, -130]);
      }).then(function() {
        cl.x("p9");

        return geoDog.set("loc6", [-72.258, 0.953215]);
      }).then(function() {
        cl.x("p10");

        return getWilddogData();
      }).then(function(wilddogData) {
        expect(wilddogData).toEqual({
          "loc:1": { ".priority": "cped3g0fur", "l": { "0": 87.6, "1": -130 }, "g": "cped3g0fur" },
          "loc2": { ".priority": "d2h376zj8h", "l": { "0": 0.2358, "1": -72.621 }, "g": "d2h376zj8h" },
          "loc%!A72f()3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" },
          "loc4": { ".priority": "cped3g0fur", "l": { "0": 87.6, "1": -130 }, "g": "cped3g0fur" },
          "loc6": { ".priority": "h50svty4es", "l": { "0": -72.258, "1": 0.953215 }, "g": "h50svty4es" }
        });

        cl.x("p11");
      }).catch(failTestOnCaughtError);
    });

    it("set() does not throw errors given valid keys", function() {
      validKeys.forEach(function(validKey) {
        expect(function() {
          geoDog.set(validKey, [0, 0]);
        }).not.toThrow();
      });
    });

    it("set() throws errors given invalid keys", function() {
      invalidKeys.forEach(function(invalidKey) {
        expect(function() {
          geoDog.set(invalidKey, [0, 0]);
        }).toThrow();
      });
    });

    it("set() does not throw errors given valid locations", function() {
      validLocations.forEach(function(validLocation, i) {
        expect(function() {
          geoDog.set("loc", validLocation);
        }).not.toThrow();
      });
    });

    it("set() throws errors given invalid locations", function() {
      invalidLocations.forEach(function(invalidLocation, i) {
        // Setting location to null is valid since it will remove the key
        if (invalidLocation !== null) {
          expect(function() {
            geoDog.set("loc", invalidLocation);
          }).toThrow();
        }
      });
    });
  });

  describe("Adding multiple locations via set():", function() {
    it("set() returns a promise", function(done) {

      var cl = new Checklist(["p1"], expect, done);

      geoDog.set({
        "loc1": [0, 0]
      }).then(function() {
        cl.x("p1");
      });
    });

    it("set() updates Wilddog when adding new locations", function(done) {
      var cl = new Checklist(["p1", "p2"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [50, 50],
        "loc3": [-90, -90]
      }).then(function() {
        cl.x("p1");

        return getWilddogData();
      }).then(function(wilddogData) {
        expect(wilddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc2": { ".priority": "v0gs3y0zh7", "l": { "0": 50, "1": 50 }, "g": "v0gs3y0zh7" },
          "loc3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" }
        });

        cl.x("p2");
      }).catch(failTestOnCaughtError);
    });

    it("set() handles decimal latitudes and longitudes", function(done) {
      var cl = new Checklist(["p1", "p2"], expect, done);

      geoDog.set({
        "loc1": [0.254, 0],
        "loc2": [50, 50.293403],
        "loc3": [-82.614, -90.938]
      }).then(function() {
        cl.x("p1");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc1": { ".priority": "ebpcrypzxv", "l": { "0": 0.254, "1": 0 }, "g": "ebpcrypzxv" },
          "loc2": { ".priority": "v0gu2qnx15", "l": { "0": 50, "1": 50.293403 }, "g": "v0gu2qnx15" },
          "loc3": { ".priority": "1cr648sfx4", "l": { "0": -82.614, "1": -90.938 }, "g": "1cr648sfx4" }
        });

        cl.x("p2");
      }).catch(failTestOnCaughtError);
    });

    it("set() updates Willddog when changing a pre-existing key", function(done) {
      var cl = new Checklist(["p1", "p2", "p3"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [50, 50],
        "loc3": [-90, -90]
      }).then(function() {
        cl.x("p1");

        return geoDog.set({
          "loc1": [2, 3]
        });
      }).then(function() {
        cl.x("p2");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc1": { ".priority": "s065kk0dc5", "l": { "0": 2, "1": 3 }, "g": "s065kk0dc5" },
          "loc2": { ".priority": "v0gs3y0zh7", "l": { "0": 50, "1": 50 }, "g": "v0gs3y0zh7" },
          "loc3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" }
        });

        cl.x("p3");
      }).catch(failTestOnCaughtError);
    });

    it("set() updates willddog when changing a pre-existing key to the same location", function(done) {
      var cl = new Checklist(["p1", "p2", "p3"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [50, 50],
        "loc3": [-90, -90]
      }).then(function() {
        cl.x("p1");

        return geoDog.set({
          "loc1": [0, 0]
        });
      }).then(function() {
        cl.x("p2");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc2": { ".priority": "v0gs3y0zh7", "l": { "0": 50, "1": 50 }, "g": "v0gs3y0zh7" },
          "loc3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" }
        });

        cl.x("p3");
      }).catch(failTestOnCaughtError);
    });

    it("set() handles multiple keys at the same location", function(done) {
      var cl = new Checklist(["p1", "p2"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [0, 0],
        "loc3": [0, 0]
      }).then(function() {
        cl.x("p1");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc2": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" },
          "loc3": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" }
        });

        cl.x("p2");
      }).catch(failTestOnCaughtError);
    });

    it("set() updates willddog after complex operations", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5", "p6"], expect, done);

      geoDog.set({
        "loc:1": [0, 0],
        "loc2": [50, 50],
        "loc%!A72f()3": [-90, -90]
      }).then(function() {
        cl.x("p1");

        return geoDog.remove("loc2");
      }).then(function() {
        cl.x("p2");

        return geoDog.set({
          "loc2": [0.2358, -72.621],
          "loc4": [87.6, -130],
          "loc5": [5, 55.555]
        });
      }).then(function() {
        cl.x("p3");

        return geoDog.set({
          "loc5": null
        });
      }).then(function() {
        cl.x("p4");

        return geoDog.set({
          "loc:1": [87.6, -130],
          "loc6": [-72.258, 0.953215]
        });
      }).then(function() {
        cl.x("p5");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc:1": { ".priority": "cped3g0fur", "l": { "0": 87.6, "1": -130 }, "g": "cped3g0fur" },
          "loc2": { ".priority": "d2h376zj8h", "l": { "0": 0.2358, "1": -72.621 }, "g": "d2h376zj8h" },
          "loc%!A72f()3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" },
          "loc4": { ".priority": "cped3g0fur", "l": { "0": 87.6, "1": -130 }, "g": "cped3g0fur" },
          "loc6": { ".priority": "h50svty4es", "l": { "0": -72.258, "1": 0.953215 }, "g": "h50svty4es" }
        });

        cl.x("p6");
      }).catch(failTestOnCaughtError);
    });

    it("set() does not throw errors given valid keys", function() {
      validKeys.forEach(function(validKey) {
        expect(function() {
          var locations = {};
          locations[validKey] = [0, 0];
          geoDog.set(locations);
        }).not.toThrow();
      });
    });

    it("set() throws errors given invalid keys", function() {
      invalidKeys.forEach(function(invalidKey) {
        if (invalidKey !== null && invalidKey !== undefined && typeof invalidKey !== "boolean") {
          expect(function() {
              var locations = {};
              locations[invalidKey] = [0, 0];
              geoDog.set(locations);
          }).toThrow();
        }
      });
    });

    it("set() throws errors given a location argument in combination with an object", function() {
      expect(function() {
        geoDog.set({
          "loc": [0, 0]
        }, [0, 0]);
      }).toThrow();
    });

    it("set() does not throw errors given valid locations", function() {
      validLocations.forEach(function(validLocation, i) {
        expect(function() {
          geoDog.set({
            "loc": validLocation
          });
        }).not.toThrow();
      });
    });

    it("set() throws errors given invalid locations", function() {
      invalidLocations.forEach(function(invalidLocation, i) {
        // Setting location to null is valid since it will remove the key
        if (invalidLocation !== null) {
          expect(function() {
            geoDog.set({
              "loc": invalidLocation
            });
          }).toThrow();
        }
      });
    });
  });

  describe("Retrieving locations:", function() {
    it("get() returns a promise", function(done) {
      var cl = new Checklist(["p1"], expect, done);

      geoDog.get("loc1").then(function() {
        cl.x("p1");
      });
    });

    it("get() returns null for non-existent keys", function(done) {
      var cl = new Checklist(["p1"], expect, done);

      geoDog.get("loc1").then(function(location) {
        expect(location).toBeNull();

        cl.x("p1");
      });
    });

    it("get() retrieves locations given existing keys", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [50, 50],
        "loc3": [-90, -90]
      }).then(function() {
        cl.x("p1");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toEqual([0, 0]);
        cl.x("p2");

        return geoDog.get("loc2");
      }).then(function(location) {
        expect(location).toEqual([50, 50]);
        cl.x("p3");

        return geoDog.get("loc3");
      }).then(function(location) {
        expect(location).toEqual([-90, -90]);
        cl.x("p4");
      }).catch(failTestOnCaughtError);
    });

    it("get() does not throw errors given valid keys", function() {
      validKeys.forEach(function(validKey) {
        expect(function() { geoDog.get(validKey); }).not.toThrow();
      });
    });

    it("get() throws errors given invalid keys", function() {
      invalidKeys.forEach(function(invalidKey) {
        expect(function() { geoDog.get(invalidKey); }).toThrow();
      });
    });
  });

  describe("Removing locations:", function() {
    it("set() removes existing location given null", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [2, 3]
      }).then(function() {
        cl.x("p1");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toEqual([0, 0]);

        cl.x("p2");

        return geoDog.set("loc1", null);
      }).then(function() {
        cl.x("p3");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toBeNull();

        cl.x("p4");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc2": { ".priority": "s065kk0dc5", "l": { "0": 2, "1": 3 }, "g": "s065kk0dc5" }
        });

        cl.x("p5");
      }).catch(failTestOnCaughtError);
    });

    it("set() does nothing given a non-existent location and null", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5"], expect, done);

      geoDog.set("loc1", [0, 0]).then(function() {
        cl.x("p1");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toEqual([0, 0]);

        cl.x("p2");

        return geoDog.set("loc2", null);
      }).then(function() {
        cl.x("p3");

        return geoDog.get("loc2");
      }).then(function(location) {
        expect(location).toBeNull();

        cl.x("p4");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" }
        });

        cl.x("p5");
      }).catch(failTestOnCaughtError);
    });

    it("set() removes existing location given null", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [2, 3]
      }).then(function() {
        cl.x("p1");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toEqual([0, 0]);

        cl.x("p2");

        return geoDog.set({
          "loc1": null,
          "loc3": [-90, -90]
        });
      }).then(function() {
        cl.x("p3");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toBeNull();

        cl.x("p4");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc2": { ".priority": "s065kk0dc5", "l": { "0": 2, "1": 3 }, "g": "s065kk0dc5" },
          "loc3": { ".priority": "1bpbpbpbpb", "l": { "0": -90, "1": -90 }, "g": "1bpbpbpbpb" }
        });

        cl.x("p5");
      }).catch(failTestOnCaughtError);
    });

    it("set() does nothing given a non-existent location and null", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": null
      }).then(function() {
        cl.x("p1");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toEqual([0, 0]);

        cl.x("p2");

        return geoDog.get("loc2");
      }).then(function(location) {
        expect(location).toBeNull();

        cl.x("p3");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" }
        });

        cl.x("p4");
      }).catch(failTestOnCaughtError);
    });

    it("remove() removes existing location", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5"], expect, done);

      geoDog.set({
        "loc:^%*1": [0, 0],
        "loc2": [2, 3]
      }).then(function() {
        cl.x("p1");

        return geoDog.get("loc:^%*1");
      }).then(function(location) {
        expect(location).toEqual([0, 0]);

        cl.x("p2");

        return geoDog.remove("loc:^%*1");
      }).then(function() {
        cl.x("p3");

        return geoDog.get("loc:^%*1");
      }).then(function(location) {
        expect(location).toBeNull();

        cl.x("p4");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc2": { ".priority": "s065kk0dc5", "l": { "0": 2, "1": 3 }, "g": "s065kk0dc5" }
        });

        cl.x("p5");
      }).catch(failTestOnCaughtError);
    });

    it("remove() does nothing given a non-existent location", function(done) {
      var cl = new Checklist(["p1", "p2", "p3", "p4", "p5"], expect, done);

      geoDog.set("loc1", [0, 0]).then(function() {
        cl.x("p1");

        return geoDog.get("loc1");
      }).then(function(location) {
        expect(location).toEqual([0, 0]);

        cl.x("p2");

        return geoDog.remove("loc2");
      }).then(function() {
        cl.x("p3");

        return geoDog.get("loc2");
      }).then(function(location) {
        expect(location).toBeNull();

        cl.x("p4");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc1": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" }
        });

        cl.x("p5");
      }).catch(failTestOnCaughtError);
    });

    it("remove() only removes one key if multiple keys are at the same location", function(done) {
      var cl = new Checklist(["p1", "p2", "p3"], expect, done);

      geoDog.set({
        "loc1": [0, 0],
        "loc2": [2, 3],
        "loc3": [0, 0]
      }).then(function() {
        cl.x("p1");

        return geoDog.remove("loc1");
      }).then(function() {
        cl.x("p2");

        return getWillddogData();
      }).then(function(willddogData) {
        expect(willddogData).toEqual({
          "loc2": { ".priority": "s065kk0dc5", "l": { "0": 2, "1": 3 }, "g": "s065kk0dc5" },
          "loc3": { ".priority": "7zzzzzzzzz", "l": { "0": 0, "1": 0 }, "g": "7zzzzzzzzz" }
        });

        cl.x("p3");
      }).catch(failTestOnCaughtError);
    });

    it("remove() does not throw errors given valid keys", function() {
      validKeys.forEach(function(validKey) {
        expect(function() { geoDog.remove(validKey); }).not.toThrow();
      });
    });

    it("remove() throws errors given invalid keys", function() {
      invalidKeys.forEach(function(invalidKey) {
        expect(function() { geoDog.remove(invalidKey); }).toThrow();
      });
    });
  });

  describe("query():", function() {
    it("query() returns GeoQuery instance", function() {
      geoQueries.push(geoDog.query({center: [1,2], radius: 1000}));

      expect(geoQueries[0] instanceof GeoQuery).toBeTruthy();
    });

    it("query() does not throw errors given valid query criteria", function() {
      validQueryCriterias.forEach(function(validQueryCriteria) {
        if (typeof validQueryCriteria.center !== "undefined" && typeof validQueryCriteria.radius !== "undefined") {
          expect(function() { geoDog.query(validQueryCriteria); }).not.toThrow();
        }
      });
    });

    it("query() throws errors given invalid query criteria", function() {
      invalidQueryCriterias.forEach(function(invalidQueryCriteria) {
        expect(function() { geoDog.query(invalidQueryCriteria); }).toThrow();
      });
    });
  });
});