define(["require", "exports", "dojo/window"], function (require, exports, win) {
    "use strict";
    var Bootstrap = (function () {
        function Bootstrap() {
        }
        Bootstrap.modal = function (id, title, body, footer) {
            try {
                var width = win.getBox().w + 'px';
                var _modal = void 0, modalDlg = void 0, modalContent = void 0, modalHeader = void 0, modalBody = void 0, modalFooter = void 0;
                _modal = document.createElement('div');
                _modal.classList.add('modal', 'fade');
                _modal.id = id;
                _modal.setAttribute('tabindex', '-1');
                _modal.setAttribute('role', 'dialog');
                _modal.setAttribute('aria-labelledby', 'myModalLabel');
                _modal.setAttribute('aria-hidden', 'true');
                modalDlg = document.createElement('div');
                modalDlg.classList.add('modal-dialog');
                modalContent = document.createElement('div');
                modalContent.classList.add('modal-content');
                modalContent.style.maxWidth = width;
                modalContent.style.width = 'fit-content';
                modalHeader = document.createElement('div');
                modalHeader.classList.add('modal-header');
                var closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.classList.add('close');
                closeBtn.setAttribute('data-dismiss', 'modal');
                closeBtn.innerHTML = '<span aria-hidden="true">×</span><span class="sr-only">Đóng</span>';
                modalHeader.appendChild(closeBtn);
                modalHeader.innerHTML += "<h4 class=\"modal-title\">" + title + "</h4>";
                modalBody = document.createElement('div');
                modalBody.classList.add('modal-body');
                modalBody.appendChild(body);
                if (footer) {
                    modalFooter = document.createElement('div');
                    modalFooter.classList.add('modal-footer');
                    modalFooter.appendChild(footer);
                }
                modalContent.appendChild(modalHeader);
                modalContent.appendChild(modalBody);
                if (modalFooter)
                    modalContent.appendChild(modalFooter);
                modalDlg.appendChild(modalContent);
                _modal.appendChild(modalDlg);
                document.body.appendChild(_modal);
                var $modal_1 = $("#" + id);
                if ($modal_1) {
                    $modal_1.on('hidden.bs.modal', function () {
                        $modal_1.remove();
                    });
                    return $modal_1;
                }
                else {
                    return null;
                }
            }
            catch (error) {
                throw error;
            }
        };
        return Bootstrap;
    }());
    return Bootstrap;
});
