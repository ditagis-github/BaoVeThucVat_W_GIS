class DateTimeDefine {
    date:Date;
    constructor(date) {
        this.date = date;
    }
    checkOutOfDate(date) {
        var today = new Date();
        return (today.getTime() - date) > 0 ? false : true;
    }
    checkUnexpired(date) {
        return !this.checkOutOfDate(date);
    }
    static formatDateValue(date:Date):string {
        if (!date) return '';
        let day:any = date.getDate(),
            month:any = date.getMonth() + 1,
            year = date.getFullYear();
        if (day / 10 < 1)
            day = '0' + day;
        if (month / 10 < 1)
            month = '0' + month;
        let value = `${year}-${month}-${day}`;
        return value;
    }
    static formatNumberDate(number:number):string {
        if (!number) return '';
        var date = new Date(number);
        let day:any = date.getDate(),
            month:any = date.getMonth() + 1,
            year = date.getFullYear();
        if (day / 10 < 1)
            day = '0' + day;
        if (month / 10 < 1)
            month = '0' + month;

        return `${day}/${month}/${year}`;
    }
}
export = DateTimeDefine;