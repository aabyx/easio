require([
    "easio.js",
    ], function () {

    $.easIOready(function () {
        function section (data) {
            var uuid = $.uuid();
            $("body").append('<h1>' + data + '</h1><table id="' + uuid + '"><thead><tr><th>&nbsp;</th><th>Result</th></tr></thead><tbody></tbody></table>');
            return uuid;
        }
        function test (sID, data) {
            var uuid = $.uuid();
            $("table#" + sID + " tbody").append('<tr id="' + uuid + '"><th>' + data + '</th><td>--</td></tr>');
            return uuid;
        }
        function result (tID, result) {
            var target = $("tr#" + tID + " td"),
                cls = (result)? "ok" : "no",
                body = (typeof result === "string")? result : cls.toUpperCase();
            target.attr("class", cls);
            target.html(body);
        }

        var sectionID;

        sectionID = section("WebSocket on localhost:8585");
        var
            wsErroID = test(sectionID, "error"),
            wsOpenID = test(sectionID, "open"),
            wsMessID = test(sectionID, "message"),
            wsClosID = test(sectionID, "close");
        try {
            var ws1 = new WebSocket("ws://null.none");
        } catch(e) {}
        ws1.onerror = function () { result(wsErroID, true); };
        var ws = new WebSocket("ws://localhost:8585/ws");
        ws.onclose = function () { result(wsClosID, true); };
        ws.onerror = function () { result(wsErroID, false); };
        ws.onmessage = function (evt) { result(wsMessID, true); ws.close(); };
        ws.onopen = function () {
            result(wsOpenID, true);
            ws.send("SESSID=" + $.cookie("Device"));
            };
    });

});
