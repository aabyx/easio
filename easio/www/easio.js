(function( $ ) {
    var easioCallbacks = [];

    $.easIOready = function (callback) {
        easioCallbacks.push(callback);
    };
    $.__easIOready__ = function () {
        $.each(easioCallbacks, function (idx, callback) {
            callback();
        });
    };
})( jQuery );

require([
    "resources/jsrender.js",
    "resources/jquery.observable.js",
    ], function () {
        require([
            "resources/jquery.cookie.js",
            "resources/jquery.views.js",
        ], function () {
            require([
                "easio/overload.js",
                "easio/jquery.utils.js",
            ], function () {
                if (!window.WebSocket) {
                    require([
                        "easio/websocket.js"
                    ], function () {
                        $.__easIOready__();
                    })
                } else {
                    $.__easIOready__();
                }
            });
        })
});
