var Locale = {
    separator: {
        digit: (0.1).toLocaleString().replace(/[0-9]/g, ''),
        thousand: (1000).toLocaleString().replace(/[0-9]/g, '')
    }
};

function loop(data, func) {
    var i, result;
    switch (data.constructor) {
        case Array:
            result = [];
            for (i = 0; i < data.length; i++) {
                result.push(func(i, data[i]));
            }
            return result;
        case Object:
            var k,
                keys = Object.keys(data);
            result = {};
            for (i = 0; i < keys.length; i++) {
                k = keys[i];
                result[k] = func(k, data[k]);
            }
            return result;
        default:
            throw new Error("Cannot loop on " + data.constructor.name);
    }
}

function values(data) {
    if (data.constructor !== Object) {
        throw new Error("Cannot get values for " + data.constructor.name);
    }
    var result = [];
    loop(data, function (k, v) {
        result.push(v);
    });
    return result;
}



String.prototype.capitalize = function () {
    return this[0].toUpperCase() + this.slice(1).toLowerCase();
};
String.prototype.capitalizeWords = function () {
    var i,
        parts = this.split(" ");
    for (i = 0; i < parts.length; i++) {
        parts[i] = parts[i].capitalize();
    }
    return parts.join(" ");
};
String.prototype.pattern = null;
String.prototype.repr = function () {
    if ((this.pattern.constructor === RegExp) && (this.pattern.exec(this) === null)) {
        return null;
    }
    return this;
};

Number.prototype.zfill = function (n) {
    var str = String(this);
    while (str.length < n) {
        str = "0" + str;
    }
    return str;
};
Number.prototype.repr = function () {
    var digits = (arguments.length > 0)? arguments[0] : undefined;
    if (typeof digits !== "number") {
        return Number(this);
    }
    if (digits <= 0) {
        return Math.round(this);
    }
    var factor = Math.pow(10, digits);
    return Math.round(this * factor) / factor;
};
Number.prototype.reprLocale = function () {
    var result,
        digits = (arguments.length > 0)? arguments[0] : undefined,
        number = String(this.repr(digits)),
        int = number.split(".")[0],
        intparts = [],
        float = (number.indexOf(".") >= 0)? number.split(".")[1] : undefined;
    while (int.length > 0) {
        if (int.length <= 3) {
            intparts.unshift(int);
            int = "";
        } else {
            intparts.unshift(int.substr(-3,3));
            int = int.substr(0, int.length-3);
        }
    }
    result = intparts.join(Locale.separator.thousand);
    if (float) {
        result += Locale.separator.digit + float;
    }
    return result;
};

Date.prototype.date = function () {
    return String(this.getFullYear()) + "-" + (this.getMonth() + 1).zfill(2) + "-" + this.getDay().zfill(2);
};
Date.prototype.time = function () {
    return this.getHours().zfill(2) + ":" + this.getMinutes().zfill(2) + ":" + this.getSeconds().zfill(2);
};
Date.prototype.timestamp = function () {
    return this.date() + " " + this.time();
};
Date.prototype.iso8601 = function () {
    return this.getUTCFullYear() + '-' +
        (this.getUTCMonth() + 1).zfill(2) + '-' +
        this.getUTCDate().zfill(2) + 'T' +
        this.getUTCHours().zfill(2) + ':' +
        this.getUTCMinutes().zfill(2) + ':' +
        this.getUTCSeconds().zfill(2) + '.' +
        this.getUTCMilliseconds().zfill(3);
};
Date.prototype.type = "timestamp";
Date.prototype.repr = function () {
    switch (this.type) {
        case "time":
            return this.time();
        case "date":
            return this.date();
        default:
            return this.timestamp();
    }
};

function repr(data) {
    if ((data === undefined) || (data === null)) {
        return null;
    }
    var result;
    switch (data.constructor) {
        case Date:
        case Number:
        case String:
            return data.repr();
        case Array:
        case Object:
            return loop(data, function (k, v) { return repr(v); });
        default:
            return data;
    }
}

function uuid() {
    var i,
        s = [], itoh = '0123456789ABCDEF';

    // Make array of random hex digits. The UUID only has 32 digits in it, but we
    // allocate an extra items to make room for the '-'s we'll be inserting.
    for (i = 0; i <36; i++) {
        s[i] = Math.floor(Math.random()*0x10);
    }

    // Conform to RFC-4122, section 4.4
    s[14] = 4;  // Set 4 high bits of time_high field to version
    s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

    // Convert to hex chars
    for (i = 0; i <36; i++) {
        s[i] = itoh[s[i]];
    }

    // Insert '-'s
    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
}
eO.uuid = uuid;

function stringBytesLength(data) {
    var b = data.match(/[^\x00-\xff]/g);
    return (data.length + ((!b)? 0: b.length));
}

var Cookie = {
    create: function (name, value) {
        var date,
            days = (arguments.length > 2)? arguments[2] : undefined,
            expires = "";
        if (days) {
            date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    },

    read: function (name) {
        var i, c,
            nameEQ = name + "=",
            ca = document.cookie.split(';');
        for(i = 0; i < ca.length; i++) {
            c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return undefined;
    },

    update: function (name, value) {
        var days = (arguments.length > 2)? arguments[2] : undefined;
        this.create(name, value, days);
    },

    drop: function (name) {
        this.create(name, "", -1);
    }

};

if (!Cookie.read("Device")) {
    Cookie.create("Device", uuid());
}
