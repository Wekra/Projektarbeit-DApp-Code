var SheetLibrary = artifacts.require("./SheetLibrary.sol");

contract("SheetLibrary", function(accounts) {
    var sheetLibraryInstance;

    it("initializes with one sample sheet", function() {
        return SheetLibrary.deployed().then(function(instance) {
            return instance.numSheets();
        }).then(function(count) {
            assert.equal(count, 1);
        });
    });

    it("initializes the sheet with the correct values", function() {
        return SheetLibrary.deployed().then(function(instance){
            sheetLibraryInstance = instance;
            return sheetLibraryInstance.getSheet(1);
        }).then(function(sheet) {
            assert.equal(sheet[0], "Example Sheet 1", "contains the right title");
            assert.equal(sheet[1], "0xAc10ac275aEa2aE5283cCAFE260d63624007fC0f", "the right owner is set");
            assert.equal(sheet[2], "0xAc10ac275aEa2aE5283cCAFE260d63624007fC0f", "the right current holder is set");
            assert.equal(sheet[3], 42, "the right amount of copies is set");
            assert.equal(sheet[4], 0, "the right state is set");
        });
    });
});