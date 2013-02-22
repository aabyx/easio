String.prototype.capitalize = function () {
    return this[0].toUpperCase() + this.slice(1).toLowerCase();
};
String.prototype.capitalizeWords = function () {
    return $.map(this.split(" "), function (e) { e.capitalize(); }).join(" ");
};
String.prototype.repr = function () {
    var pattern = (arguments.length > 0)? arguments[0] : undefined;

    if (pattern && (pattern.constructor === RegExp) && (pattern.exec(this) === null)) {
        return undefined;
    }
    return String(this);
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
