var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    return {
        capNhatTGSXTT: (edits) => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield $.post('/map/trongtrot/thoigian/edits', {
                    edits: JSON.stringify(edits)
                });
                return result;
            }
            catch (error) {
                throw error;
            }
        })
    };
});
