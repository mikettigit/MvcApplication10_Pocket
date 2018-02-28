var pocket_guid = "2fea14ff-d8e3-42c1-a230-3917b7a640c9";

jQuery_pocket(document).ready(function () {

    jQuery_pocket(document).on("submit", "form", function (e) {

        e.preventDefault();
        
        var form_data = new FormData();

        jQuery_pocket(this).find("input").each(function () {
            var input = jQuery_pocket(this);
            var name = input.attr("name");
            }
            form_data.append(name, comment + " " + input.val());
        })

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
