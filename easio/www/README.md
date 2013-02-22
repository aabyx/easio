EasIO web part
=====

Easy IO web part

__Status:__ draft

## Useful libraries:

### easio/jquery.utils.js

__$.locale.separator.digit__
Locale digits separator

__$.locale.separator.thousand__
Locale thousands separator

__$.uuid()__
Generates valid version 4 UUIDs as specified in RFC 4122
''(from Massimo Lombardo)''

__$.stringBytesLength(str)__
Returns string bytes length

__$.values(obj)__
Returns an array of obj values

### easio/overload.js

Improves new function to javascript main classes:

#### String
__.capitalize()__

__.capitalizeWords()__

__.repr(pattern)__:
Returns string only when it matches pattern, otherwise undefined.

#### Number
__.zfill(n)__:
Right padding with 0 until n size

__.repr(digits)__:
Returns a string with n digits.

__.reprLocale(digits)__:
Returns a string with n digits on locale format.

#### Date
__.date()__:
Returns YYYY-MM-DD date

__.time()__:
Returns HH:MM:SS time

__.timestamp()__:
Returns YYYY-MM-DD HH:MM:SS timestamp

__.iso8601()__:
Returns date on format ISO8601
