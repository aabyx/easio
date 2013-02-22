(function( $ ){

    $.locale = {
        separator: {
            digit: (0.1).toLocaleString().replace(/[0-9]/g, ''),
            thousand: (1000).toLocaleString().replace(/[0-9]/g, '')
        }
    };

//    $.repr = function (data) {
//        if ((data === undefined) || (data === null)) {
//            return null;
//        }
//        var result;
//        switch (data.constructor) {
//            case Date:
//            case Number:
//            case String:
//                return data.repr();
//            case Array:
//                result = [];
//                $.each(data, function (i, v) { return result.push($.repr(v)); });
//                return result;
//            case Object:
//                result = {};
//                $.each(data, function (k, v) { return result[k] = $.repr(v); });
//                return result;
//            default:
//                return data;
//        }
//    };

    $.uuid = function () {
        /*!
        * JavaScript UUID Generator, v0.0.1
        *
        * Copyright (c) 2009 Massimo Lombardo.
        * Dual licensed under the MIT and the GNU GPL licenses.
        */
        var i,
            c = "89ab",
            u = [];
        for (i = 0; i < 36; i += 1) {
            u[i] = (Math.random() * 16 | 0).toString(16);
        }
        u[8] = u[13] = u[18] = u[23] = "-";
        u[14] = "4";
        u[19] = c.charAt(Math.random() * 4 | 0);
        return u.join("");
    };

    $.stringBytesLength = function (data) {
        var b = data.match(/[^\x00-\xff]/g);
        return (data.length + ((!b)? 0: b.length));
    };

    $.values = function (data) {
        if (data.constructor !== Object) {
            throw new Error("Cannot get values for " + data.constructor.name);
        }
        var result = [];
        $.each(data, function (k, v) {
            result.push(v);
        });
        return result;
    };

})( jQuery );

if (!$.cookie("Device")) {
    $.cookie("Device", $.uuid());
}
