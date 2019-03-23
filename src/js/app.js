App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(App.web3Provider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
      web3 = new Web3(App.web3Provider);
    }
    web3.currentProvider.publicConfigStore.on("update", App.onAccountChange);
    return App.initContract();
  },

  onAccountChange: function () {
    App.initContract();
  },

  initContract: function () {
    $.getJSON("SheetLibrary.json", function (sheetLibrary) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.SheetLibrary = TruffleContract(sheetLibrary);
      // Connect provider to interact with contract
      App.contracts.SheetLibrary.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function () {
    var sheetLibraryInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    //Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });


    //Load contract data
    App.contracts.SheetLibrary.deployed().then(function (instance) {
      sheetLibraryInstance = instance;
      return sheetLibraryInstance.numSheets();
    }).then(function (sheetCount) {
      var availableSheets = $("#availableSheets");
      availableSheets.empty();

      var borrowSelect = $("#borrowSelect");
      borrowSelect.empty();

      for (var i = 1; i <= sheetCount; i++) {
        var counter = 1;
        sheetLibraryInstance.getSheet(i).then(function (sheet) {
          var title = sheet[0];
          var owner = sheet[1];
          var currentHolder = sheet[2];
          var copies = sheet[3];
          var state = App.stateToString(sheet[4]);

          var sheetTemplate = "<tr><th>" + counter + "</th><td>" + title + "</td><td>" + copies + "</td><td>" + owner + "</td><td>" + currentHolder + "</td><td>" + state + "</td>";
          availableSheets.append(sheetTemplate);

          var borrowOption = "<option value='" + counter + "'>" + title + "</option>";
          borrowSelect.append(borrowOption);
          counter++;
        });
      }

      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },

  stateToString: function (state) {
    var stateString = "";
    switch (parseInt(state)) {
      case 0:
        stateString = "atOwner";
        break;
      case 1:
        stateString = "borrowing";
        break;
      case 2:
        stateString = "returning";
        break;
      case 3:
        stateString = "returning";
        break;
      default:
        stateString = "invalid state";
        break;
    }
    return stateString;
  },

  submitSheet: function () {
    var sheetTitle = $("#sheetTitle").val();
    var numberOfCopies = $("#copies").val();
    App.contracts.SheetLibrary.deployed().then(function (instance) {
      return instance.addNewSheets(sheetTitle, numberOfCopies, {
        from: App.account
      });
    }).then(function (result) {
      $("#addSheet").reset();
      $("#content").hide();
      $("#loader").show();
      App.render();
    }).catch(function (error) {
      console.error(error);
    });
  },

  borrowSheet: function () {
    var sheetID = $("#borrowSelect").val();
    App.contracts.SheetLibrary.deployed().then(function (instance) {
      return instance.borrowSheet(sheetID, {
        from: App.account
      });
    }).then(function(result) {
      $("#borrowSelect").reset();
      $("#content").hide();
      $("#loader").show();
      App.render(); 
    }).catch(function (error) {
      console.error(error);
    });
  }
};


$("#addSheet").on("submit", function (event) {
  event.preventDefault();
  App.submitSheet();
});

$(function () {
  $(window).load(function () {
    App.init();
  });
});