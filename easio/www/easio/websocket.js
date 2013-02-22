if (!window.SyntaxError) {
    window.SyntaxError = function (message) {
        this.name = "SyntaxError";
        this.message = message || "Syntax";
    };
    SyntaxError.prototype = new Error();
    SyntaxError.prototype.constructor = SyntaxError;
}
if (!window.InvalidStateError) {
    window.InvalidStateError = function (message) {
        this.name = "InvalidStateError";
        this.message = message || "Invalid state";
    };
    InvalidStateError.prototype = new Error();
    InvalidStateError.prototype.constructor = InvalidStateError;
}
if (!window.InvalidAccessError) {
    window.InvalidAccessError = function (message) {
        this.name = "InvalidAccessError";
        this.message = message || "Invalid access";
    };
    InvalidAccessError.prototype = new Error();
    InvalidAccessError.prototype.constructor = InvalidAccessError;
}

function WebSocket(url) {
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    this.url = url;
    this.readyState = 0;
    this.bufferedAmount = 0;
    this.extensions = "";
    this.protocol = "";
    this.binaryType = "blob";
    this.onopen = undefined;
    this.onerror = undefined;
    this.onclose = undefined;
    this.onmessage = undefined;

/* Check URL
        throw new SyntaxError("An invalid or illegal string was specified");
*/

    var parts = url.split("/"),
        protocol = parts.shift().split(":")[0].replace("ws", "http");
    parts.shift();
    if (parts.length > 1) {
        parts.pop();
    }
    parts.push("ajaxws");

    this.__debug = true;
    this.__url = protocol + "://" + parts.join("/");
    this.__protocols = (arguments.length > 1)? ((typeof arguments[1] === "string")? [arguments[1]] : arguments[1]) : [];
    this.__outbox = [];
    this.__inbox = [];
    this.__closingSent = false;
    this.__timeout = 500;
    this.__openSent = false;
    this.__get();
}
WebSocket.prototype.__get = function () {
    var
        protocol = (arguments.length > 1)? arguments[1] : "POST",
        req = new XMLHttpRequest();
    req.open(protocol, this.__url, true);
    req.setRequestHeader("AjaxWS-ID", $.cookie("Device"));
    req.setRequestHeader("Content-Type", "application/json");
    var ajaxWS = this;
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            var evt;
            if (req.status === 200) {
                if (ajaxWS.readyState === 0) {
                    ajaxWS.readyState = 1;
                }
                if ((!ajaxWS.__openSent) && (ajaxWS.onopen)) {
                    ajaxWS.__openSent = true;
                    try {
                        evt = document.createEvent('Event');
                        evt.initEvent("open", true, true);
                        evt.target = ajaxWS;
                        ajaxWS.onopen(evt);
                    } catch (eo) {}
                }
                var result = req.resultText || undefined;
                if (result) {
                    if (ajaxWS.__debug && window.console) {
                        console.log(["Ajax websocket: Receiving data", result]);
                    }
                    ajaxWS.__inbox.push(result);
                    if (ajaxWS.onmessage) {
                        while (ajaxWS.__inbox.length > 0) {
                            evt = document.createEvent('Event');
                            evt.initEvent("message", true, true);
                            evt.target = ajaxWS;
                            evt.data = ajaxWS.__inbox.shift();
                            try {
                                ajaxWS.onmessage(evt);
                            } catch (em) {}
                        }
                    }
                }
                if ((!ajaxWS.__closingSent) || (ajaxWS.__outbox.length > 0)) {
                    ajaxWS.__get();
                } else if (ajaxWS.__closingSent) {
                    if (ajaxWS.onclose) {
                        evt = document.createEvent('Event');
                        evt.initEvent("close", true, true);
                        evt.target = ajaxWS;
                        try {
                            ajaxWS.onclose(evt);
                        } catch (ecc) {}
                    }
                }
            } else {
                if (ajaxWS.__debug && window.console) {
                    console.log(["Ajax websocket: Bad code", req.status, req.statusText]);
                }
                ajaxWS.readyState = 3;
                if (ajaxWS.onerror) {
                    evt = document.createEvent('Event');
                    evt.initEvent("error", true, true);
                    evt.target = ajaxWS;
                    try {
                        ajaxWS.onerror(evt);
                    } catch (ee) {}
                }
                if (ajaxWS.onclose) {
                    evt = document.createEvent('Event');
                    evt.initEvent("close", true, true);
                    evt.target = ajaxWS;
                    try {
                        ajaxWS.onclose(evt);
                    } catch (ec) {}
                }
            }
        }
    };
    setTimeout(function () {
        var body = JSON.stringify(ajaxWS.__outbox);
        if (ajaxWS.__debug && window.console && (ajaxWS.__outbox.length > 0)) {
            console.log(["Ajax websocket: Sending data", body]);
        }
        req.send(body);
        ajaxWS.__outbox = [];
        ajaxWS.bufferedAmount = 0;

    }, this.__timeout);
};
WebSocket.prototype.close = function () {
    var code = (arguments.length > 0)? arguments[0] : undefined,
        reason = (arguments.length > 1)? arguments[1] : undefined,
        codeOK = true;
    if (code) {
        if (typeof code !== "number") {
            codeOK = false;
        }
        if ((code < 3000) && (code !== 1000)) {
            codeOK = false;
        }
        if (code >= 5000) {
            codeOK = false;
        }
        if (!codeOK) {
            throw new InvalidAccessError("Wrong code for close method on websocket");
        }
    }
    if (reason && (stringBytesLength(reason) > 123)) {
        throw new SyntaxError("Wrong reason for close method on websocket");
    }
    if ([2, 3].indexOf(this.readyState) >= 0) {
        return;
    }
    this.readyState = 2;
    if (!this.__closingSent) {
        this.__closingSent = true;
        var msg = {method: "close"};
        if (code) {
            msg.code = code;
        }
        if (reason) {
            msg.reason = reason;
        }
        this.__outbox.push(msg);
    }
};
WebSocket.prototype.send = function (data) {
    if (this.readyState !== 1) {
        throw new InvalidStateError("Trying to send data while websocket not ready");
    }

    var datatype =
            (typeof data === "string")? "DOMString" :
            (data.constructor.toString() === "[object Blob]")? "Blob" :
            (data.constructor.name === "ArrayBuffer")? "ArrayBuffer" :
            "ArrayBufferView";

    this.bufferedAmount += $.stringBytesLength(data);
    this.__outbox.push(data);
};
