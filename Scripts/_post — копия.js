var pocket_guid = "2fea14ff-d8e3-42c1-a230-3917b7a640c9";

jQuery_pocket(document).ready(function () {

    var onsubmitname = "onsubmit_" + pocket_guid;
    jQuery_pocket("form").each(function() {
        jQuery_pocket(this).attr(onsubmitname, jQuery_pocket(this).attr("onsubmit")).removeAttr("onsubmit");
    })

    jQuery_pocket(".submit-button").click(function () {
        $(this).click();
        sbmt(jQuery_pocket(this).parents("form"));
    })

    function sbmt(_this) {

        var form_data = new FormData(_this);
        var inputs = jQuery_pocket(_this).find("input");
        for (var i = 0; i < inputs.length; i++) {

            if ($(inputs[i]).attr("placeholder").indexOf("телефон") > -1) {
                clientPhoneField = $(inputs[i]);
                clientPhoneField.removeClass("error");
                phoneChars = " +-()1234567890";
                phoneString = clientPhoneField.val();
                    if (phoneString.length < 5) {
                        clientPhoneField.addClass("error");
                        return false;
                    }
                    else {
                        j = 0;
                        while (ch = phoneString.substr(j, 1)) {
                            if (phoneChars.indexOf(ch) == -1) {
                                clientPhoneField.addClass("error");
                                return false;
                            }
                            j++;
                        }
                    }
            }

            form_data.append(jQuery_pocket(inputs[i]).attr("name"), jQuery_pocket(inputs[i]).val());
        }

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
    }

    jQuery_pocket(document).on("submit", "form", function (e) {

        e.preventDefault();
        
        //sbmt(this);

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
                var extendOptions = {"from URL": location.href};
                extendOptions["" + pocket_guid] = pocket_guid;
                $.extend(originalOptions.data, extendOptions);
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
