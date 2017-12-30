
$(document).ready(function(){
	
	var rv = new ResetValidator();
	
	$('#set-password-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){;
			rv.hideAlert();
			if (rv.validatePassword($('#pass-tf').val()) == false){
				return false;
			} 	else{
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			rv.showSuccess("Mật khẩu đã được thay đổi.");
			setTimeout(function(){ window.location.href = '/'; }, 3000);
		},
		error : function(){
			rv.showAlert("Vui lòng điền đầy đủ thông tin.");
		}
	});

	$('#set-password').modal('show');
	$('#set-password').on('shown', function(){ $('#pass-tf').focus(); })

});