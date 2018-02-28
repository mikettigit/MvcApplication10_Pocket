jQuery_pocket(document).ready(function () {

    window.onhashchange = onHashChange;
    onHashChange();

    if (jQuery_pocket("#2fea14ff-d8e3-42c1-a230-3917b7a640c9 [name='adminmode']").length > 0) {

        var highlight = true;

        var panel_main = jQuery_pocket("<div style='position:fixed; z-index:99999; top: 0px; left: 0px;'></div>");
        var button_stub = jQuery_pocket("<input type='button' value='&#8596;' style='padding: 10px !important; margin: 1px !important;'/>");
        button_stub.appendTo(panel_main);
        var button_onoff = jQuery_pocket("<input type='button' value='&#9745;' style='padding: 10px !important; margin: 1px !important;'/>");
        button_onoff.appendTo(panel_main);
        var button_ok = jQuery_pocket("<input type='button' value='Сохранить [Ctrl + Enter]' style='padding: 10px !important; margin: 1px !important;'/>");
        button_ok.appendTo(panel_main);
        var button_x = jQuery_pocket("<input type='button' value='x' style='padding: 10px !important; margin: 1px !important;'/>");
        button_x.appendTo(panel_main);
        panel_main.appendTo("#2fea14ff-d8e3-42c1-a230-3917b7a640c9");

        var $dragging = null;
        jQuery_pocket(button_stub).mousedown(function (e) {
            $dragging = panel_main;
        })
        jQuery_pocket(document).on("mousemove", function (e) {
            if ($dragging) {
                $dragging.offset({
                    top: e.pageY,
                    left: e.pageX
                });
            }
        });
        jQuery_pocket(document).on("mouseup", function (e) {
            $dragging = null;
        });

        jQuery_pocket(button_ok).click(function () {
                     
            var form_data = new FormData();
            form_data.append("from URL", location.href);
            form_data.append("content", btoa(unescape(encodeURIComponent(jQuery_pocket('html').html()))));

            jQuery_pocket.ajax({
                url: "/Admin/SaveAll",
                data: form_data,
                dataType: "json",
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST'
            });
            
        })

        jQuery_pocket(button_onoff).click(function () {

            highlight = !highlight;
            if (highlight) {
                jQuery_pocket(this).val("\u2611");
            } else {
                jQuery_pocket(this).val("\u2610");
            }

        })

        jQuery_pocket(button_x).click(function () {

            jQuery_pocket.ajax({
                url: "/Admin/Logout",
                success: function () {
                    window.location.href = window.location.pathname + window.location.search + window.location.hash;
                },
                type: 'POST'
            });

        })

        jQuery_pocket(
            "<style>\
                [contenteditable] {\
                    box-shadow: inset 0 0 5px 3px rgba(255, 0, 0, 0.8);\
                }\
            </style>").appendTo("#2fea14ff-d8e3-42c1-a230-3917b7a640c9");

        jQuery_pocket(document).on("mouseover", "*",
            function () {

                var current = jQuery_pocket(this);

                if (current.is(panel_main) || current.is(panel_main.children())) {
                    return false;
                }

                if (current.find("[contenteditable]").length == 0) {

                    jQuery_pocket("[contenteditable]").each(function () {
                        var old = jQuery_pocket(this);
                        old.removeAttr("contenteditable");
                    })

                    if (highlight) {
                        current.attr("contenteditable", "true")
                    }
                }
            })
    }

});

function onHashChange() {
    if (location.hash.toLowerCase() == "#admin") {
        location.href = "/admin?url=" + encodeURIComponent(location.pathname);
    }
    if (location.hash.toLowerCase() == "#reset") {
        jQuery_pocket.ajax({
            url: "/Admin/Reset",
            success: function () {
                location.href = location.href.split('#')[0];
            },
            type: 'POST'
        });
    }
}

