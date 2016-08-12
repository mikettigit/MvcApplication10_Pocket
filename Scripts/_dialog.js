jQuery_pocket(document).ready(function () {

    jQuery_pocket("#dialog").dialog(
            {
                autoOpen: true,
                create: function (event, ui) {
                    jQuery_pocket(event.target).parent().css("position", "fixed");
                },
                resizeStop: function (event, ui) {
                    //jqueryui bug fix
                    jQuery_pocket(this).height(jQuery_pocket(this).parent().height() - jQuery_pocket(this).prev('.ui-dialog-titlebar').height() - jQuery_pocket(this).next('.ui-dialog-buttonpane').height() - 44);
                    jQuery_pocket(this).width(jQuery_pocket(this).prev('.ui-dialog-titlebar').width() + 2);
                },
                open: function (event, ui) {
                    jQuery_pocket(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                },
                buttons: {
                    "\u21BB": function () {
                        Update();
                    },
                    "+": function () {
                        AddRow();
                        jQuery_pocket(this).scrollTop(jQuery_pocket(this)[0].scrollHeight);
                    },
                    "OK": function() {
                    }

                }
            }
        );

    function Update() {
        jQuery_pocket.ajax({
            url: "/Pocket/GetConfig",
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (data) {
                FillDialog(data);
            }
        });
    }

    function FillDialog(data) {

        var dialoglastheight = jQuery_pocket("#dialog").height();

        jQuery_pocket(".configrow:not(.template)").remove();
        for (var key in data) {
            var row = data[key];
            if ("what" in row && "by" in row) {
                var configrow = AddRow();
                configrow.find(".what").text(row.what);
                configrow.find(".by").text(row.by);
            }
        }

        jQuery_pocket("#dialog").height(dialoglastheight);

    }

    function AddRow()
    {
        var configrow = jQuery_pocket(".configrow.template").clone()
                                .removeClass("template")
                                .appendTo(".configtable tbody")
                                .show();
        configrow.find(".id").text(jQuery_pocket(".configrow:not(.template)").length);
        return configrow;
    }

    //remove
    jQuery_pocket(".configtable").on('click', ".removerow", function(){
        jQuery_pocket(this).parents("tr").remove();
        Renumber();
        return false;
    })

    //sort
    jQuery_pocket(".configtable tbody").sortable({
        stop: function (event, ui) {
            Renumber();
        }
    });

    //edit
    //jQuery_pocket(".configtable").on('click', ".what", function () {
    //    var thistext = jQuery_pocket(this).text();
    //    jQuery_pocket(this).empty();
    //    jQuery_pocket(this).append("<textarea class=\"editor\" style=\"width:100%;\">" + thistext + "</textarea>")
    //});

    function Renumber() {
        var i = 1;
        jQuery_pocket(".configrow:not(.template)").each(function () {
            jQuery_pocket(this).find(".id").text(i);
            i++;
        })
    }

    Update();

});