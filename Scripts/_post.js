var pocket_guid = "2fea14ff-d8e3-42c1-a230-3917b7a640c9";

jQuery_pocket(document).ready(function () {

    var onsubmitname = "onsubmit_" + pocket_guid;
    jQuery_pocket("form").each(function() {
        $(this).attr(onsubmitname, $(this).attr("onsubmit")).removeAttr("onsubmit");
    })

    jQuery_pocket(document).on("submit", "form", function (e) {

        e.preventDefault();
        
        var code = jQuery(this).attr(onsubmitname);
        if (code) {
            this[onsubmitname] = function () {
                return new Function(code)();
            }
            if (this[onsubmitname]() == false) {
                return false;
            }
        }

        var form_data = new FormData(this);

        form_data.append("from URL", location.href);
        form_data.append(pocket_guid, pocket_guid);

        jQuery_pocket.ajax({
            url: "/Pocket/Index",
            data: form_data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST'
        });

        return false;

    });

    if (jQuery && jQuery.ajaxPrefilter) {
        jQuery.ajaxPrefilter(function (options, originalOptions, jqXHR) {

            jqXHR.abort();

            isForm = false;
            if (typeof originalOptions.data != "string") {
                for (var key in originalOptions.data) {
                    if (typeof originalOptions.data[key] == "string") {
                        jQuery.each(jQuery("input,textarea"), function () {
                            if (jQuery(this).val() == originalOptions.data[key]) {
                                isForm = true;
                                return false;
                            }
                        });
                    }
                    if (isForm) {
                        break;
                    }
                }
            }

            if (isForm) {
                $.extend(originalOptions.data, { "from URL": location.href });
                $.extend(originalOptions.data, { pocket_guid: pocket_guid });
                originalOptions["type"] = "POST";
                jQuery_pocket.ajax(originalOptions);
            }

        })
    }

    jQuery_pocket(document).ajaxSuccess(function (event, xhr, settings) {
        data = JSON.parse(xhr.responseText);
        alert(data.Message);
    });

});

jQuery_pocket(document).ready(function () {
    jQuery_pocket("form").attr("action", document.location.href);
    jQuery_pocket("button[type='submit']").click(function () {

        isError = false;

        var form = jQuery_pocket(this).parents("form");

        var clientNameFields = form.find("input[placeholder='Имя']:visible");
        clientNameFields.removeClass("error");
        for (var i = 0; i < clientNameFields.length; i++) {
            clientNameField = jQuery_pocket(clientNameFields[i]);
            nameChars = " -ёйцукенгшщзхъфывапролджэячсмитьбюЁЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ";
            nameString = clientNameField.val();
            if (nameString.length < 3) {
                clientNameField.addClass("error");
                isError = true;
            }
            else {
                i = 0;
                while (ch = nameString.substr(i, 1)) {
                    if (nameChars.indexOf(ch) == -1) {
                        clientNameField.addClass("error");
                        isError = true;
                        break;
                    }
                    i++;
                }
            }
        }

        clientPhoneFields = form.find("input[placeholder='Телефон']:visible,input[placeholder='Phone']:visible");
        clientPhoneFields.removeClass("error");
        for (var i = 0; i < clientPhoneFields.length; i++) {
            clientPhoneField = jQuery_pocket(clientPhoneFields[i]);
            phoneChars = " +-()1234567890";
            phoneString = clientPhoneField.val();
            if (phoneString.length < 5) {
                clientPhoneField.addClass("error");
                isError = true;
            }
            else {
                i = 0;
                while (ch = phoneString.substr(i, 1)) {
                    if (phoneChars.indexOf(ch) == -1) {
                        clientPhoneField.addClass("error");
                        isError = true;
                        break;
                    }
                    i++;
                }
            }
           
        }

        clientEmailFields = form.find("input[placeholder='E-mail']:visible,input[placeholder='Email']:visible");
        clientEmailFields.removeClass("error");
        for (var i = 0; i < clientEmailFields.length; i++) {
            clientEmailField = jQuery_pocket(clientEmailFields[i]);
            emailChars = "_-.@~qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789";
            emailString = clientEmailField.val();
            if (emailString.length < 6) {
                clientEmailField.addClass("error");
                isError = true;
            }
            else {
                i = 0;
                HasAt = false;
                while (ch = emailString.substr(i, 1)) {
                    if (emailChars.indexOf(ch) == -1) {
                        clientEmailField.addClass("error");
                        isError = true;
                        break;
                    }
                    if (ch == "@") {
                        HasAt = true;
                    }
                    i++;
                }
                if (!HasAt) {
                    clientEmailField.addClass("error");
                    isError = true;
                }
            }
        }

        if (!isError) {
            form.submit();
        }

        return false;
    })
})