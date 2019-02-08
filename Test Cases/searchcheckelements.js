//imported the locators 

var searchit = require('../Page Objects/SearchLocators.js');
var searchres = require('../Page Objects/searchcheckelementslocators.js');



//check working of various filters sections in the page

describe("Working of different filters after the location search",function(){
    
    //it will open https://www.eat24.com/ before each test case

    beforeEach(function(){
      browser.get("https://www.eat24.com/");
      
      //close the Popup   
      searchit.pageElements.popClose.click();

      //click on the searchbar
       searchit.pageElements.searchBar.click();

      // type "New York" and click findfood
       searchit.pageElements.searchBar.sendKeys('New York');

       searchit.pageElements.findFood.click();
    });
   
    

       it("checks the delivery,pickup,restaurants and catering filter",function(){
    
        //click delivery button
        searchres.pageElements.delivery.click();
    
        //click pickup button
        searchres.pageElements.pickup.click();
    
        //click restaurant radio button
        searchres.pageElements.restaurants.click();
       
        browser.refresh();
     
        //click catering radio button
        searchres.pageElements.catering.click();
    })


    it("checks the Ratings filter",function(){

    //click different Ratings
    searchres.Ratings.one.click();
    searchres.Ratings.two.click();
    searchres.Ratings.three.click();
    searchres.Ratings.four.click();
    searchres.Ratings.five.click();

    //clear all filters
    searchres.filters.clearall.click();
    })

    it("checks the Price filter",function(){
  
    //click different Price
    searchres.Price.one.click();
    searchres.Price.two.click();
    searchres.Price.three.click();
    searchres.Price.four.click();
    searchres.Price.five.click();
  
    //clear all filters
    searchres.filters.clearall.click();
       })


    it("checks the feature filter",function(){
        
        //clicks the free delivery filter
        searchres.features.freedelivery.click();

        //clicks the coupons filter
        searchres.features.coupons.click();

        //clicks the openNow filter
        searchres.features.openNow.click();
        searchres.features.openNow.click();

        //clear all filters
        searchres.filters.clearall.click();
    })


    it("checks delivery time filter",function(){
        
        //checks the slider of delivery time
        browser.actions().dragAndDrop(
            searchres.deliveryTime.slider,
            {x:1000, y:0}
        ).perform();
    })


    });
