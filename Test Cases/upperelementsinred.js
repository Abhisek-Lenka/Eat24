 //import locators
 var redelem = require('../Page Objects/uppeleinredlocators.js');
 var searchit = require('../Page Objects/SearchLocators.js');

//check working of upper elements in red portion after the location search
describe("working of elements in the upper red portion after location search",function() {
   
    
    //search New York location before each spec
    beforeEach(function() {

        browser.get("https://www.eat24.com/");

        //close the Popup   
        searchit.pageElements.popClose.click();

        //click on the searchbar
        searchit.pageElements.searchBar.click();

        //type "New York" and click findfood
        searchit.pageElements.searchBar.sendKeys('New York');

        searchit.pageElements.findFood.click();
    });

    
    it("Checks the Eat24 block directs to the homepage",function() {

    //clicks the Eat24 block
    redelem.Eat24block.click();

    //gets the title of the directed page
    var title = browser.getTitle();

    title.then(function(text) {

        //prints the title of the directed page
        console.log(text);

        //matches the title of the directed page with the homepage
        expect(title).toEqual("Eat24 Food Delivery | Order Online | Restaurants Delivery");
    })

    }) 

 it("validation gps button",function() {

        //clicks the gps button
        redelem.gpsbutton.click();
    })

it("click the clear input location icon and enter another location",function() {

    //clicks the clearinput icon
       redelem.clrinp.click();

    //click on the input bar of location
       redelem.inpsearch.click();

    //input a new location
       redelem.inpsearch.sendKeys('Los Angeles');

    //press enter to search
       browser.actions().sendKeys(protractor.Key.ENTER).perform();

    })

it("clicks on the restaurant/dish search and give a input and search",function() {

    //clicks on the dish search bar
    redelem.dishsearch.click();

    //gives an input
    redelem.dishsearch.sendKeys('Chinese');

    //press enter key
    browser.actions().sendKeys(protractor.Key.ENTER).perform();

})


it("Validation of Sign In button",function() {

    //clicks the sign in  button
    redelem.signin.click();

})

it("checks the cart button afte rsearching location",function() {
    
  //clicks on the cart button
    redelem.cart.click();

    //gets the message of cart empty
    var cartemp = element(by.css('h5.cart-error-title'));

    cartemp.getText().then(function(text) {

        //shows the message of cart empty
        console.log(text);
    })  

})


}) 