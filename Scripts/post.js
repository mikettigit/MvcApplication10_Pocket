jQuery_pocket(document).ready(function () {

    jQuery_pocket("form").submit(function () {

        var form_data = new FormData(this);

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

    if (jQuery) {
        jQuery.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            jqXHR.abort();
            jQuery_pocket.ajax(originalOptions);
            //убрать success от jQuery
        })
    }

    jQuery_pocket(document).ajaxSuccess(function (event, xhr, settings) {
        data = JSON.parse(xhr.responseText);
        alert(data.Message);
    });

});

