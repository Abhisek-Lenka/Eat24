var search = {

    modes : {

        delivery : element(by.buttonText('Delivery')),

        pickup : element(by.buttonText('Pickup')),

        restaurants : element(by.cssContainingText('span.h6','Restaurants')),

        catering : element(by.cssContainingText('span.h6','Catering')),

     },


    features  : {

        freedelivery : element(by.xpath('//label[@class = "s-checkbox-label u-flex-inline"]')),//will find many elements but will choose the first element

        coupons : element.all(by.xpath('//label[@class = "s-checkbox-label u-flex-inline"]')).get(1),//choose the second element

        openNow: element.all(by.xpath('//label[@class = "s-checkbox-label u-flex-inline"]')).last(),//choose the third element

    }, 


    Ratings : {

        one : element(by.css("button[title = '1 And Above']")),

        two : element(by.css("button[title = '2 And Above']")),

        three : element(by.css("button[title = '3 And Above']")),

        four : element(by.css("button[title = '4 And Above']")),

        five : element(by.css("button[title = '5 Only']")),

    },


    filters: {

        clearall : element(by.css('.facetContainer-titleClear')),

    },


    Price : {

       one : element(by.css("button[title = '1 Only']")),

       two : element(by.css("button[title = '2 And Below']")),

       three : element(by.css("button[title = '3 And Below']")),

       four : element(by.css("button[title = '4 And Below']")),

       five : element(by.css("button[title = '5 And Below']")),

    },


    deliveryTime : {

        slider : element(by.xpath('//div[@class="facetContainer-content"]//input[@class = "s-slider"]')),
    }

    };
    

    module.exports = search ;