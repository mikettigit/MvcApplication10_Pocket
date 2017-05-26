jQuery_pocket(document).ready(function () {

    window.onhashchange = onHashChange;
    onHashChange();

});

function onHashChange() {
    if (location.hash.toLowerCase() == "#admin") {
        //jQuery_pocket.ajax({
        //    url: location.href,
        //    data: {"NeedAuth": true},
        //    cache: false,
        //    type: 'GET'
        //});
    }
}