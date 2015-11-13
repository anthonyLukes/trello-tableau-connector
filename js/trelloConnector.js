(function() {
    var myConnector = tableau.makeConnector();

    myConnector.getColumnHeaders = function() {
        var fieldNames = ['Id', 'Name', 'Url'];
        var fieldTypes = ['string', 'string', 'string'];
        tableau.headersCallback(fieldNames, fieldTypes);
    }

    myConnector.getTableData = function(lastRecordToken) {
        var dataToReturn = [];
        var hasMoreData = false;

        var connectionUri = tableau.connectionData;

        var xhr = $.ajax({
            url: connectionUri,
            dataType: 'json',
            success: function (data) {
              if (data) {
                  var ii;
                  for (ii = 0; ii < data.length; ++ii) {
                      var entry = {'Id': data[ii].id,
                                   'Name': data[ii].name,
                                   'Url': data[ii].url};
                      dataToReturn.push(entry);
                  }
                  tableau.dataCallback(dataToReturn, lastRecordToken, false);
                }
                else {
                  tableau.abortWithError("No results found for: " + connectionUri);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
              // If the connection fails, log the error and return an empty set.
              tableau.log("Connection error: " + xhr.responseText + "\n" + thrownError);
              tableau.abortWithError("Error while trying to connecto to Trello.");
            }
        });
    }

    tableau.registerConnector(myConnector);
})();
(function($, Trello, tableau) {
    var appKey = '2d15ae0a9765d34c2ca6fe0d4aadfce9';
    var token = '';
    var callApi = function(url, success, error) {
        $.ajax({
            dataType: "json",
            url: url,
            success: success,
            error: error
        });
    };

    var setCardData = function(e) {
        token = Trello.token();
        var $currentTarget = $(e.currentTarget);
        var boardId = $currentTarget.attr('data-board-id');
        var boardName = $currentTarget.text();
        e.preventDefault();
        var url = 'https://api.trello.com/1/boards/' + boardId + '/cards?fields=name,idList,url&key=';
            url += appKey;
            url += '&token=';
            url += token;
            url += '&callback=?';
        var handleSuccess = function(response) {
            console.log(response);
        };
        var handleError = function(response) {
            console.log(response);
        }

        tableau.connectionName = "Card Data for " + boardName;
        tableau.connectionData = url;
        tableau.submit();
    };
    var getBoards = function() {
        var url = 'https://api.trello.com/1/members/me/boards?key=';
            url += appKey;
            url += '&token=';
            url += token;
            url += '&callback=?';

        var handleSuccess = function(response) {
            $boards = $('<div>');
            $boardsHdg = $('<h2>Boards</h2>');
            $boardsList = $('<ul>');
            for (var i = response.length - 1; i >= 0; i--) {
                var board = response[i];
                $boardsList.append('<li><a href="#" data-board-id="' + board.id + '">' + board.name + '</a></li>');
            };
            $boards.append($boardsHdg)
                   .append($boardsList)
                   .appendTo('#js-boards');
        };

        var handleError = function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Status: " + textStatus + " Error: " + errorThrown);
        }
        callApi(url, handleSuccess, handleError);
    };
    var authenticationSuccess = function() {
        console.log("Successful authentication");
        token = Trello.token();
        getBoards(token);
    };

    var authenticationFailure = function() {
        console.log("Failed authentication");
    };

    function authorizeTrello() {
        Trello.authorize({
            type: "redirect",
            name: "Getting Started Application",
            scope: {
                read: true,
                write: false
            },
            expiration: "1hour",
            success: function() {
                authenticationSuccess();
            },
            failure: function() {
                authenticationFailure();
            }
        });
    }

    $('#js-authorize').on('click', authorizeTrello);
    $('#js-boards').on('click', '[data-board-id]', function(e) {
        setCardData(e)
    });

})(jQuery, Trello, tableau);