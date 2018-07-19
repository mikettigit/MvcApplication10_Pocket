jQuery_pocket.noConflict();

jQuery_pocket(document).ready(function () {
    window.onhashchange = onHashChange;
    onHashChange();
})

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
    if (location.hash.toLowerCase().indexOf("#switch=") > -1) {
        var domain = location.hash.toLowerCase().replace("#switch=", "");
        jQuery_pocket.ajax({
            url: "/Admin/SwitchPocket",
            data: { domain: domain },
            success: function (data) {
                if (data.Result) {
                    location.href = data.Object;
                }
            },
            type: 'POST'
        })
    }
}