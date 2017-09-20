
$(document).ready(function(){

	var lv = new LoginValidator();
	var lc = new LoginController();

// main login form //

	// $('#login').ajaxForm({
	// 	beforeSubmit : function(formData, jqForm, options){
	// 		if (lv.validateForm() == false){
	// 			return false;
	// 		} 	else{
	// 		// append 'remember-me' option to formData to write local cookie //
	// 			formData.push({name:'remember-me', value:$('.button-rememember-me-glyph').hasClass('glyphicon-ok')});
	// 			return true;
	// 		}
	// 	},
	// 	success	: function(responseText, status, xhr, $form){
	// 		if (status == 'success') window.location.href = '/map';
	// 	},
	// 	error : function(e){
	// 		lv.showLoginError('Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản và mật khẩu');
	// 	}
	// }); 
	$('#user-tf').focus();
	
// login retrieval form via email //
	
	var ev = new EmailValidator();
	
	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("<b>Lỗi!</b> Vui lòng nhập thư điện tử");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			$('#cancel').html('OK');
			$('#retrieve-password-submit').hide();
			ev.showEmailSuccess("Kiểm tra email để lấy lại mật khẩu.");
		},
		error : function(e){
			if (e.responseText == 'email-not-found'){
				ev.showEmailAlert("Email không tồn tại?");
			}	else{
				$('#cancel').html('OK');
				$('#retrieve-password-submit').hide();
				ev.showEmailAlert("Xin lỗi. Đã có vấn đề xảy ra, vui lòng kiểm tra lại.");
			}
		}
	});
	
});
