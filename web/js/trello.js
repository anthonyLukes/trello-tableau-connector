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

        var submitToTableau = function(jsonData) {
            var jsonString = JSON.stringify(jsonData);
            console.log("_submitToJsonToTableau", _submitToJsonToTableau);
            _submitToJsonToTableau(jsonString);
        };
        Trello.get('boards/' + boardId + '/actions', function(cards) {
            console.log("cards", cards);
            submitToTableau(cards);
            // var cardsLength = cards.length;
            // for (var i = cards.length - 1; i >= 0; i--) {

            //     var getCardActions = function() {
            //         var card = cards[i];
            //         Trello.get('/cards/' + card.shortLink + '/actions', function(actions) {
            //             card['actions'] = actions;
            //             cardsLength--;
            //             if (cardsLength === 0) {
            //                 console.log('cards', cards);
            //                 submitToTableau(cards);
            //             }
            //         });
            //     };

            //     getCardActions(i);
            // };
        });
    };

    var getBoards = function() {
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

        Trello.get("members/me/boards", function(boards) {
            console.log('boards', boards);
            handleSuccess(boards);
        });
    };
    var authenticationSuccess = function() {
        //console.log("Successful authentication");
        token = Trello.token();
        getBoards(token);
    };

    var authenticationFailure = function() {
        //console.log("Failed authentication");
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