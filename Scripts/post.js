var $ = jQuery.noConflict();

$(document).ready(function () {

    $("form").submit(function () {

        var form_data = new FormData(this);

        $.ajax({
            url: "/Pocket/Index",
            data: form_data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST'
        });

        return false;

    });

    $(document).ajaxSuccess(function (event, xhr, settings) {
        data = JSON.parse(xhr.responseText);
        alert(data.Message);
    });

});



