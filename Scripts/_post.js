jQuery_pocket(document).ready(function () {

    jQuery_pocket(document).on("submit", "form", function (e) {

        e.preventDefault();
        
        var form_data = new FormData(this);

        form_data.append("from URL", location.href);
        form_data.append("2fea14ff-d8e3-42c1-a230-3917b7a640c9", "2fea14ff-d8e3-42c1-a230-3917b7a640c9");

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
                $.extend(originalOptions.data, { "2fea14ff-d8e3-42c1-a230-3917b7a640c9": "2fea14ff-d8e3-42c1-a230-3917b7a640c9" });
                originalOptions["type"] = "POST";
                jQuery_pocket.ajax(originalOptions);
            }

        })
    }

    jQuery_pocket(document).ajaxSuccess(function (event, xhr, settings) {
        if (settings.url.toLowerCase() != "/pocket/getconfig") {
            data = JSON.parse(xhr.responseText);
            alert(data.Message);
        }
    });

});
