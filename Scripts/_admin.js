jQuery_pocket(document).ready(function () {

    window.onhashchange = onHashChange;
    onHashChange();

});

function onHashChange() {
    if (location.hash.toLowerCase() == "#admin") {
        location.href = "/admin?url=" + encodeURIComponent(location.pathname);
    }
}