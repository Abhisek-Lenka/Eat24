'use strict'


//imported the locators 

var homepagelocator = require('../Page Objects/SearchLocators.js');

var filterlocator = require('../Page Objects/FiltersInSearchLocators.js');



//check working of various filters sections in the page

describe("Working of different filters after the location search",function() {
    
    //it will open https://www.eat24.com/ before each test case

    beforeEach(function() {

      browser.get("https://www.eat24.com/");
   
      
      //close the Popup   

      homepagelocator.homepage.popClose.click();


      //click on the searchbar

       homepagelocator.homepage.searchBar.click();

      //type "New York" and click findfood

       homepagelocator.homepage.searchBar.sendKeys('New York');


       homepagelocator.homepage.findFood.click();

    });
   
    

       it("checks the delivery,pickup,restaurants and catering filter",function() {

    
        //click delivery button

        filterlocator.modes.delivery.click();
    

        //click pickup button

        filterlocator.modes.pickup.click();
    

        //click restaurant radio button

        filterlocator.modes.restaurants.click();
       

        //refreshes the browser

        browser.refresh();
     

        //click catering radio button

        filterlocator.modes.catering.click();


    })



    it("checks the Ratings filter",function() {


    //click different Ratings

    filterlocator.Ratings.one.click();

    filterlocator.Ratings.two.click();

    filterlocator.Ratings.three.click();

    filterlocator.Ratings.four.click();

    filterlocator.Ratings.five.click();


    //clear all filters

    filterlocator.filters.clearall.click();


    })



    it("checks the Price filter",function() {

  
    //click different Price ranges

    filterlocator.Price.one.click();

    filterlocator.Price.two.click();

    filterlocator.Price.three.click();

    filterlocator.Price.four.click();

    filterlocator.Price.five.click();

  
    //clear all filters

    filterlocator.filters.clearall.click();


   })




    it("checks the feature filter",function() {
        

        //clicks the free delivery filter

        filterlocator.features.freedelivery.click();


        //clicks the coupons filter

        filterlocator.features.coupons.click();


        //clicks the openNow filter

        filterlocator.features.openNow.click();

        filterlocator.features.openNow.click();


        //clear all filters

        filterlocator.filters.clearall.click();


    })




    });
