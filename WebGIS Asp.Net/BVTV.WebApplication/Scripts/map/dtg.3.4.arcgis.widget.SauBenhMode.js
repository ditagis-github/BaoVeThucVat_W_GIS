SauBenhMode = class SauBenhMode {

    constructor(options, domElement) {
        this.options = {
            normalCSS: 'glyphicon glyphicon-eye-open',
            heatmapCSS: 'glyphicon glyphicon-eye-close',
            defaultMode: 'normal'
        };
        for (var i in options) {
            this.options[i] = options[i] || this.options[i];
        }
        this.options.defaultMode = this.options.defaultMode == 'normal' ? 'heatmap' : 'normal';
        this.normalLayer = this.options.normalLayer,
        this.heatmapLayer = this.options.heatmapLayer;
        this.mode = this.options.defaultMode;
        this.div = $('<button/>');
        $('#' + domElement).append(this.div);
        let that = this,
        _change = this.change;
        this.div.click(function () {
            _change(that);
        });
    }
    change(that) {
        that = that || this;
        if (that.mode === 'heatmap') {
            that.heatmapLayer.hide();
            that.normalLayer.show();
            that.mode = 'normal';
            that.div.attr('class', that.options.normalCSS);
        } else {
            that.heatmapLayer.show();
            that.normalLayer.hide();
            that.mode = 'heatmap';
            that.div.attr('class', that.options.heatmapCSS);
        }
    }
}
