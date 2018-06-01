var pocket_guid = "2fea14ff-d8e3-42c1-a230-3917b7a640c9";

jQuery_pocket(document).ready(function () {

    jQuery_pocket("<style>")
    .prop("type", "text/css")
    .html(".error {border: 1px solid #eb4848 !important; box-shadow: 0 0 10px #f00 !important;}")
    .appendTo("head");
    jQuery_pocket("#form-submit-btn").attr("type", "button").removeClass("disabled").click(function ()
    {
        var isError = false;
        jQuery_pocket(this).parents("form").find("textarea:visible[required],input:visible[required]").each(function () {
            jQuery_pocket(this).removeClass("error");
            if (jQuery_pocket(this).val() == "") {
                jQuery_pocket(this).addClass("error");
                isError = true;
            }
        })
        if (!isError) {
            jQuery_pocket(this).parents("form").submit();
        }
    })

    jQuery_pocket(document).on("submit", "form", function (e) {

        e.preventDefault();
        
        var form_data = new FormData(this);

        //var form_data = new FormData();
        //jQuery_pocket(this).find("input:not([type='submit']),textarea").each(function () {
        //    var input = jQuery_pocket(this);
        //    var name = input.attr("name");
        //    var comment = "";
        //    var placeholder = input.attr("placeholder");
        //    if (placeholder) {
        //        comment += "[" + placeholder.trim() + "]";
        //    }
        //    var label = jQuery_pocket("label[for=" + input.attr("id") + "]");
        //    if (label.length > 0) {
        //        comment += "[" + label.text().trim() + "]";
        //    }
        //    form_data.append(name, comment + " " + input.val());
        //})

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

    var jQueryExists = true;
    try
    {
        eval(jQuery)
    }
    catch(e)
    {
        jQueryExists = false;
    }
    if (jQueryExists) {
        if (jQuery.ajaxPrefilter) {
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

                if (isForm || originalOptions.url.toLowerCase() == "/ajax/loan.php") {
                    var extendOptions = { "from URL": location.href };
                    extendOptions["" + pocket_guid] = pocket_guid;
                    $.extend(originalOptions.data, extendOptions);
                    originalOptions["type"] = "POST";
                    jQuery_pocket.ajax(originalOptions);
                }

            })
        }
    }

    jQuery_pocket(document).ajaxSuccess(function (event, xhr, settings) {
        data = JSON.parse(xhr.responseText);
        if (data.Object == "LoanResult") {
            jQuery_pocket('#money-calc').html(data.Message);
        }
        else {
            alert(data.Message);
        }
    });

});
