var eO = (function () {
    var easio = {};

    easio.__readyCallbacks__ = [];
    easio.ready = function (callback) {
        this.__readyCallbacks__.push(callback);
    };
    easio.__ready__ = function () {
        var i;
        for (i = 0; i < easio.__readyCallbacks__.length; i++) {
            easio.__readyCallbacks__[i]();
        }
    }

    return easio;
}());

require([
    "resources/jquery.js",
    "resources/jsrender.js",
    "resources/jquery.observable.js"
    ], function () {
        require([
            "resources/jquery.views.js",
        ], function () {
            require([
                "easio/utils.js"
            ], function () {
                if (!window.Websocket) {
                    require([
                        "easio/websocket.js"
                    ], function () {
                        eO.__ready__();
                    })
                } else {
                    eO.__ready__();
                }
            });
        })
});
