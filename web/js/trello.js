(function($, Trello, tableau) {
    var appKey = window.TRELLO_API_KEY;
    var token = '';
    var callApi = function(url, success, error) {
        $.ajax({
            dataType: "json",
            url: url,
            success: success,
            error: error
        });
    };

    var getCards = function(e) {
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
            var jsonString = JSON.stringify(response);
            _submitToJsonToTableau(jsonString);
        };

        var handleError = function(response) {
            console.log(response);
        }

        callApi(url, handleSuccess, handleError);
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
        getCards(e);
    });

})(jQuery, Trello, tableau);