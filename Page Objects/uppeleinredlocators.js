var search = {

    Eat24block : element(by.css('.mainNavBrand-logo')),
    gpsbutton : element(by.xpath('//*[@id="Site"]/ghs-site-container/div/ghs-preact[2]/ghs-main-nav/div[2]/form/div/div[1]/ghs-address-input/div/div/div/span[2]/ghs-popover/button')),
    clrinp : element(by.xpath('//*[@id="Site"]/ghs-site-container/div/ghs-preact[2]/ghs-main-nav/div[2]/form/div/div[1]/ghs-address-input/div/div/div/span[1]/i')),
    inpsearch : element(by.css('input[name = searchTerm]')),
    dishsearch : element(by.xpath('//*[@id="Site"]/ghs-site-container/div/ghs-preact[2]/ghs-main-nav/div[2]/form/div/div[2]/div/input')),
    signin : element(by.buttonText('Sign in')),
    cart : element(by.xpath('//*[@id="Site"]/ghs-site-container/div/ghs-preact[2]/ghs-main-nav/ghs-fixed-bag-launcher/button')),
};

module.exports = search ;