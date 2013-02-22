require([
    "easio.js",
    ], function () {

    eO.ready(function () {
        function section (data) {
            var uuid = eO.uuid();
            $("body").append('<h1>' + data + '</h1><table id="' + uuid + '"><thead><tr><th>&nbsp;</th><th>Result</th></tr></thead><tbody></tbody></table>');
            return uuid;
        }
        function test (sID, data) {
            var uuid = eO.uuid();
            $("table#" + sID + " tbody").append('<tr id="' + uuid + '"><th>' + data + '</th><td>X</td></tr>');
            return uuid;
        }
        function result (tID, result) {
            $("tr#" + tID + " td").attr("class", (result)? "ok" : "no");
        }

        var sectionID;

        sectionID = section("WebSocket on localhost:8585");
        var
            wsOpenID = test(sectionID, "open"),
            wsMessID = test(sectionID, "message"),
            wsClosID = test(sectionID, "close"),
            wsErroID = test(sectionID, "error");
        ws = new WebSocket("ws://localhost:8585/ws");
        ws.onclose = function () { result(wsClosID, true); };
        ws.onopen = function () { result(wsOpenID, true); ws.send("ws not identified"); ws.send("SESSID=" + Cookie.read("Device")); ws.send("ws identified"); ws.close(); };
        ws.onerror = function () { result(wsErroID, true); };
        ws.onmessage = function (e) { result(wsMessID, false); };
    });

});
