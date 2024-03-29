$(document).ready(function() {
    // Initialize Popover
    $('[data-toggle="popover"]').popover();
    
    $("#user_dob_picker").datetimepicker({
	    locale: 'ru',
	    format: 'YYYY-MM-DD',
	    useCurrent: false
	});
    // This functions modify the carousel elements on home page
    var tags = new Array(
        "Providing necessary support to the homeless and less previleged",
        "Connect with assistance centres and facilities near your locality",
        "Raise support to your cause or volunteer providing support",
        "Donate your used items directly or through assitance centres",
    );
    var current = 0;

    function nextBackground() {
        current++;
        current = current % tags.length;
        $(".image-slider").removeClass("hover").css({
            '-webkit-animation': 'bg 30s linear infinite',
        })
        $(".image-slider h2").text(tags[current]);
        setTimeout(function() {
            $(".image-slider").addClass("hover");
        }, 9500);
    }
    setInterval(nextBackground, 10000);
    
    //This is used for carousels to move items to the left
    $(".scroll-left").click(function(){
    	var scrollWrapper = $(this).next(),
		scrollElements = $(".scroll-item", scrollWrapper),
		scrollWidth = scrollElements.width() + 6,
		currentScrollPosition = parseInt(scrollWrapper.attr("scroll-position")),
		scrollNumber = Math.floor(scrollWrapper.width()/scrollWidth),
		finalScrollPosition = currentScrollPosition+scrollNumber; 
    	
		if(finalScrollPosition<=0){
	    	$.each(scrollElements, function(index, item) {
	    		$(item).css({left: finalScrollPosition*scrollWidth, transistion:'2s'});
			})
			scrollWrapper.attr("scroll-position", finalScrollPosition);
		}else if(finalScrollPosition>0 && finalScrollPosition<scrollNumber) {
			$.each(scrollElements, function(index, item) {
	    		$(item).css({left: 0, transistion:'2s'});
			})
			scrollWrapper.attr("scroll-position", 0);
		}
    })
    
    //This is used for carousels to move items to the right
    $(".scroll-right").click(function(){
    	var scrollWrapper = $(this).prev(),
		scrollElements = $(".scroll-item", scrollWrapper),
		scrollWidth = scrollElements.width() + 6,
		currentScrollPosition = parseInt(scrollWrapper.attr("scroll-position")),
		scrollNumber = Math.floor(scrollWrapper.width()/scrollWidth),
		finalScrollPosition = currentScrollPosition-scrollNumber; 
    	
		if(finalScrollPosition>-scrollElements.length){
			$.each(scrollElements, function(index, item) {
	    		$(item).css({left: finalScrollPosition*scrollWidth, transistion:'2s'});
			})
			scrollWrapper.attr("scroll-position", finalScrollPosition);
		}
    })
    
    // This is used to read browser cookie information
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    $(".item-add").click(function(){
    	$("#itemModal").modal('show');
    	$("#item-form")[0].reset();
    })
    
    // This functions are used to submit contact us form
    $("#contact-form-submit").click(function(e) {
        e.preventDefault();
        if ($(this).hasClass("disabled")) {
            return;
        }
        var validator = $("#contact-form").validate();
        if ($("#contact-form").valid()) {
            var formData = {
            	"data": JSON.stringify({
            		"user_name": $("#user_name").val(),
                    "user_email": $("#user_email").val(),
                    "user_phone": $("#user_phone").val(),
                    "user_subject": $("#user_subject").val(),
                    "user_message": $("#user_message").val()
            	}),	
                "csrfmiddlewaretoken": getCookie("csrftoken")
            }
            $.ajax({
                type: "POST",
                url: "/contact/",
                data: formData,
                beforeSend: function() {
                    $(".fa-spinner", $("#contact-form-submit")).css('display', 'inline-block');
                    $("#contact-form-submit").addClass("disabled");
                },
                success: function() {
                    $("#contact-form .valid-feedback").show();
                    validator.resetForm();
                    $("#contact-form")[0].reset();
                    setTimeout(function() {
                        $(".valid-feedback").hide();
                    }, 2000);
                },
                error: function(xhr) {
                    json_data = JSON.parse(xhr.responseText)
                    $("#contact-form .invalid-feedback").show();
                    $("#contact-form .invalid-feedback").html(json_data["error_reason"]);
                    setTimeout(function() {
                        $(".invalid-feedback").hide();
                    }, 3000);
                },
                complete: function() {
                    $(".fa-spinner", $("#contact-form-submit")).css('display', 'none');
                    $("#contact-form-submit").removeClass("disabled");
                }
            });
        }
    });
    
    // This functions are used to submit sign up form
    $("#sign-up-form-submit").click(function(e) {
        e.preventDefault();
        if ($(this).hasClass("disabled")) {
            return;
        }
        var validator = $("#sign-up-form").validate();
        if ($("#sign-up-form").valid()) {
            var formData = {
        		"data": JSON.stringify({	
	                "user_first_name": $("#user_first_name").val(),
	                "user_last_name": $("#user_last_name").val(),
	                "user_type": $("#user_type").val(),
	                "user_email": $("#user_email").val(),
	                "user_password": $("#user_password").val(),
	                "user_phone": $("#user_phone").val()
        		}),
                "csrfmiddlewaretoken": getCookie("csrftoken")
            }
            $.ajax({
                type: "POST",
                url: "/signup/",
                data: formData,
                beforeSend: function() {
                    $(".fa-spinner", $("#sign-up-form-submit")).css('display', 'inline-block');
                    $("#sign-up-form-submit").addClass("disabled");
                },
                success: function() {
                    $("#sign-up-form .valid-feedback").show();
                    window.location.href = "/login/";
                },
                error: function(xhr) {
                    json_data = JSON.parse(xhr.responseText)
                    $("#sign-up-form .invalid-feedback").show();
                    $("#sign-up-form .invalid-feedback").text(json_data["error_reason"]);
                    setTimeout(function() {
                        $(".invalid-feedback").hide();
                    }, 3000);
                },
                complete: function() {
                    $(".fa-spinner", $("#sign-up-form-submit")).css('display', 'none');
                    $("#sign-up-form-submit").removeClass("disabled");
                }
            });
        }
    });
    
    
    if($('.user-images-wrapper').length>0){
    	var user_id = $('.user-images-wrapper').attr("id");
    	
    	$.ajax({
            type: "GET",
            url: "/user/" + user_id + "/images/",
            beforeSend: function() {
            },
            success: function(data) {
            	$('.user-images-wrapper').html(data);
            },
            error: function(response) {
            },
            complete: function() {
            }
        });
    }
    
    $(".user-profile-edit-form-submit").click(function(e) {
        e.preventDefault();
        var validator = $("#user-profile-edit-form").validate();
        if ($("#user-profile-edit-form").valid()) {
            var formData = {
        		"data": JSON.stringify({
        			"user_desc": $("#user_desc").val(),
	                "user_first_name": $("#user_first_name").val(),
	                "user_last_name": $("#user_last_name").val(),
	                "user_unique_name": $("#user_unique_name").val(),
	                "user_birthday": $("#user_birthday").val(),
	                "user_email": $("#user_email").val(),
	                "user_phone" : $("#user_phone").val(),
	                "user_password": $("#user_password").val(),
	    		}),
                "csrfmiddlewaretoken": getCookie("csrftoken")
            }
            $.ajax({
                type: "POST",
                url: "/user/" + $("#user_id").val() + "/edit/",
                data: formData,
                beforeSend: function() {
                    $(".fa-spinner", $("#user-profile-edit-form-submit")).css('display', 'inline-block');
                    $("#user-profile-edit-form-submit").addClass("disabled");
                },
                success: function(data) {
                	$("#user-profile-edit-form .valid-feedback").show();
                	setTimeout(function() {
                        $(".valid-feedback").hide();
                    }, 3000);
                },
                error: function(response) {
                    json_data = JSON.parse(response.responseText)
                    $("#user-profile-edit-form .invalid-feedback").show();
                    $("#user-profile-edit-form .invalid-feedback").html(json_data["error_reason"]);
                    setTimeout(function() {
                        $(".invalid-feedback").hide();
                    }, 3000);
                },
                complete: function() {
                    $(".fa-spinner", $("#user-profile-edit-form-submit")).css('display', 'none');
                    $("#user-profile-edit-form-submit").removeClass("disabled");
                }
            });
        }
    });
    
    
    // This function is used to submit login form
    $("#login-form-submit").click(function(e) {
        e.preventDefault();
        if ($(this).hasClass("disabled")) {
            return;
        }
        var validator = $("#login-form").validate();
        if ($("#login-form").valid()) {
            var formData = {
                "user_login_email": $("#user_login_email").val(),
                "user_login_password": $("#user_login_password").val(),
                "csrfmiddlewaretoken": getCookie("csrftoken")
            }
            $.ajax({
                type: "POST",
                url: "/login/",
                data: formData,
                beforeSend: function() {
                    $(".fa-spinner", $("#login-form-submit")).css('display', 'inline-block');
                    $("#login-form-submit").addClass("disabled");
                },
                success: function() {
                    window.location.href = "/";
                },
                error: function(xhr) {
                    json_data = JSON.parse(xhr.responseText)
                    $("#login-form .invalid-feedback").show();
                    $("#login-form .invalid-feedback").html(json_data["error_reason"]);
                    setTimeout(function() {
                        $(".invalid-feedback").hide();
                    }, 3000);
                },
                complete: function() {
                    $(".fa-spinner", $("#login-form-submit")).css('display', 'none');
                    $("#login-form-submit").removeClass("disabled");
                }
            });
        }
    });
    
    // This will mimic the image change functionality
    $(".profile-img").click(function(e) {
        e.preventDefault();
        $("#imageUpload").click();
    });
    $('.file-field input[type="file"]').change(function(e) {
        var fileName = e.target.files[0].name;
        $(this).closest(".file-field").find(".file-path").val(fileName);
    });
    $("#imageUpload").change(function() {
        var profileImage = $("#imageUpload")[0].files[0],
            user_id = $(this).attr("logged_in_user");
        if (profileImage) {
            var formData = new FormData();
            formData.append("user_id", user_id);
            formData.append("profile_image", profileImage);
            formData.append("csrfmiddlewaretoken", getCookie("csrftoken"));
            $.ajax({
                url: "/user/" + user_id + "/images/",
                data: formData,
                type: 'POST',
                contentType: false,
                processData: false,
                success: function(data) {
                	$('.user-images-wrapper').html(data);
                    $(".profile-img div").css("background-image", 'url(' + window.URL.createObjectURL($("#imageUpload")[0].files[0]) + ')');
                }
            });
        }
    });
    
});