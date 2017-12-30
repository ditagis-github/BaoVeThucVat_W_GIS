
$(document).ready(function(){

	var hc = new HomeController();
	var av = new AccountValidator();
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (av.validateForm() == false){
				return false;
			} 	else{
			// push the disabled username field onto the form data array //
				formData.push({name:'user', value:$('#user-tf').val()})
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') hc.onUpdateSuccess();
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
				av.showInvalidEmail();
			}	else if (e.responseText == 'username-taken'){
				av.showInvalidUserName();
			}
		}
	});
	$('#name-tf').focus();

// customize the account settings form //
	
	$('#account-form h2').text('Chỉnh sửa tài khoản');
	$('#account-form #sub1').text('Chỉnh sửa tài khoản tại đây.');
	$('#user-tf').attr('disabled', 'disabled');
	$('#account-form-btn1').html('Xóa');
	$('#account-form-btn1').addClass('btn-danger');
	$('#account-form-btn2').html('Cập nhật');

// setup the confirm window that displays when the user chooses to delete their account //

	$('.modal-confirm').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-confirm .modal-header h4').text('Xóa tài khoản');
	$('.modal-confirm .modal-body p').html('Bạn có chắc chắn muốn xóa tài khoản?');
	$('.modal-confirm .cancel').html('Hủy');
	$('.modal-confirm .submit').html('Xóa');
	$('.modal-confirm .submit').addClass('btn-danger');

});
