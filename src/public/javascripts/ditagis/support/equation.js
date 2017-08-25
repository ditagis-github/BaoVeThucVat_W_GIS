define([], function () {
    'use strict';
    return class {
        static cal(params) {
            const pr1 = params[0],
                pr2 = params[1],
                pr3 = params[2],
                x1 = pr1[0],
                y1 = pr1[1],
                x2 = pr2[0],
                y2 = pr2[1],
                x3 = pr3[0],
                y3 = pr3[1];
            var d, dx, dy;
            var
                a1 = -2 * x1 + 2 * x2,
                b1 = -2 * y1 + 2 * y2,
                c1 = -(Math.pow(x1, 2) + Math.pow(y1, 2) - Math.pow(x2, 2) - Math.pow(y2, 2)),

                a2 = -2 * x2 + 2 * x3,
                b2 = -2 * y2 + 2 * y3,
                c2 = -(Math.pow(x2, 2) + Math.pow(y2, 2) - Math.pow(x3, 2) - Math.pow(y3, 2));
            d = (a1 * b2 - b1 * a2);
            dx = (c1 * b2 - c2 * b1);
            dy = (a1 * c2 - c1 * a2);
            if ((d == dx) && (dx == dy) && (dy == 0)) {
                console.error('fail');
                return;
            }
            if (d != 0) {
                let x = parseFloat(dx / d),
                    y = parseFloat(dy / d);
                return [x, y];
            }
            if ((d == 0) && (dx != 0) || (dx == 0) && (dy != 0)) {
                return null;
            }

        }
    }
});