define(["require", "exports"], function (require, exports) {
    "use strict";
    var DateTimeDefine = (function () {
        function DateTimeDefine(date) {
            this.date = date;
        }
        DateTimeDefine.prototype.checkOutOfDate = function (date) {
            var today = new Date();
            return (today.getTime() - date) > 0 ? false : true;
        };
        DateTimeDefine.prototype.checkUnexpired = function (date) {
            return !this.checkOutOfDate(date);
        };
        DateTimeDefine.formatDateValue = function (date) {
            if (!date)
                return '';
            var day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear();
            if (day / 10 < 1)
                day = '0' + day;
            if (month / 10 < 1)
                month = '0' + month;
            var value = year + "-" + month + "-" + day;
            return value;
        };
        DateTimeDefine.formatNumberDate = function (number) {
            if (!number)
                return '';
            var date = new Date(number);
            var day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear();
            if (day / 10 < 1)
                day = '0' + day;
            if (month / 10 < 1)
                month = '0' + month;
            return day + "/" + month + "/" + year;
        };
        return DateTimeDefine;
    }());
    return DateTimeDefine;
});
