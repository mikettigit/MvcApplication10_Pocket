jQuery_pocket(document).ready(function () {

        var highlight = true;

        var panel_main = jQuery_pocket("<div style='position:fixed; z-index:99999; top: 0px; left: 0px;'></div>");
        var button_stub = jQuery_pocket("<input type='button' value='&#8596;' style='padding: 10px !important; margin: 1px !important;'/>");
        button_stub.appendTo(panel_main);
        var button_onoff = jQuery_pocket("<input type='button' value='&#9745;' style='padding: 10px !important; margin: 1px !important;'/>");
        button_onoff.appendTo(panel_main);
        var button_ok = jQuery_pocket("<input type='button' value='Сохранить' style='padding: 10px !important; margin: 1px !important;'/>");
        button_ok.appendTo(panel_main);
        var button_x = jQuery_pocket("<input type='button' value='x' style='padding: 10px !important; margin: 1px !important;'/>");
        button_x.appendTo(panel_main);
        var container_images = jQuery_pocket("<div style='display:inline-block;'><form style='display:none;'><input type='hidden' name='target'/><input type='file' name='file' accept='image/jpeg,image/png,image/gif'/></form></div>");
        container_images.appendTo(panel_main);
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
                
            jQuery_pocket("[contenteditable]").removeAttr("contenteditable");

            var form_data = new FormData();
            form_data.append("from URL", location.href);
            form_data.append("content", btoa(unescape(encodeURIComponent(jQuery_pocket('html').html()))));

            jQuery_pocket.ajax({
                url: "/Admin/SaveAll",
                data: form_data,
                dataType: "json",
                success: function (data) {
                    alert(data.Message);
                },
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

        jQuery_pocket(container_images).on("click", "img", function () {
            jQuery_pocket(container_images).find("form").find("input[name='target']").val(jQuery_pocket(this).attr("src"));
            jQuery_pocket(container_images).find("input[type='file']").click();
        })

        jQuery_pocket(container_images).find("input[type='file']").change(function () {
            var oldname = jQuery_pocket(container_images).find("form").find("input[name='target']").val();
            var form_data = new FormData(jQuery_pocket(container_images).find("form")[0]);
            jQuery_pocket.ajax({
                url: '/Admin/UploadImage',
                data: form_data,
                success: function (data) {
                    if (data.Result) {
                        var newname = data.Message;
                        jQuery_pocket("img[src='" + oldname + "']").attr("src", newname);
                        BackgroundImageContainers(jQuery_pocket(document), oldname).each(function() {
                            var CurrentElement = jQuery_pocket(this);
                            var style = CurrentElement.attr("style");
                            CurrentElement.attr("style", (typeof style !== typeof undefined && style !== false && style !== "" ? style : "") + ";background-image:url(" + newname + ") !important;");
                        })
                    }
                },
                cache: false,
                contentType: false,
                processData: false,
                type: "POST"
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

                if (current.is(panel_main) || current.is(panel_main.children()) || current.is(container_images) || current.is(container_images.children())) {
                    return false;
                }

                if (current.find("[contenteditable]").length == 0) {

                    jQuery_pocket("[contenteditable]").removeAttr("contenteditable");

                    if (highlight) {

                        current.attr("contenteditable", "true");
                        
                        var ImgSrcCollection = [];
                        //img
                        jQuery_pocket.each(current.find("img").addBack("img"), function () {
                            ImgSrcCollection.push(jQuery_pocket(this).attr("src"));
                        })
                        //background-image
                        jQuery_pocket.each(BackgroundImageContainers(current, "url(\""), function () {
                            ImgSrcCollection.push(jQuery_pocket(this).css("background-image").replace("url(\"","").replace("\")",""));
                        })
                        jQuery_pocket.each(ImgSrcCollection, function () {
                            var AlreadyExisting = container_images.find("img[src='" + this + "']");
                            if (AlreadyExisting.length > 0) {
                                container_images.prepend(AlreadyExisting);
                            }
                            else {
                                var image = jQuery_pocket("<img src='" + this + "' style='margin: 0 1px !important;'/>");
                                image.height(button_stub.outerHeight());
                                container_images.prepend(image);
                                container_images.find("img").slice(8).remove();
                            }
                        })

                    }
                }
            })

});

function BackgroundImageContainers(element, searchingString) {

    var result = element.find("*").addBack("*")

    result = result.filter(function () {
        return jQuery_pocket(this).css("background-image").indexOf(searchingString) > -1
    })

    return result;

}