

var search = {


    Eat24block : element(by.css('a[class = "mainNavBrand-logo"]')),

    locationIcon : element(by.css('button[class="ghs-geolocate s-btn s-btn-tertiary s-iconBtn"]')),

    clrinp : element.all(by.css('i[class = "ghs-clearInput-icon u-flex-center-center"]')).first(),

    search : element(by.css('input[name = searchTerm]')),

    dishsearch : element(by.xpath('//div[@class = "s-input-group s-input-group--hasLeftAddon s-input-group--hasRightAddon s-has-feedback navbar-menu-search s-input-group--transparent-nav"]//input[@type = "search"]')),

    signin : element(by.buttonText('Sign in')),

    cart : element(by.css('button[class="ghs-toggleCart s-btn s-iconBtn s-iconBtn--small mainNavMenu-cartBtn u-flex-center-center s-btn-tertiary--inverted s-iconBtn--large"]')),

    cartMessage : element(by.css('h5.cart-error-title')),
};



module.exports = search ;