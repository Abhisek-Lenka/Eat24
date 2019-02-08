'use strict'

//import locators

 var navbarlocator = require('../Page Objects/MainNavBarLocators.js');

 var locator = require('../Page Objects/SearchLocators.js');

 //import pre-defined functions

 var util = require('../Util');




describe("Validation of elements present in the main nav bar after searching for a location",function() {

   
    
    //search New York location before each spec

    beforeEach(function() {


        browser.get("https://www.eat24.com/");

        //close the Popup   

        locator.homepage.popClose.click();


        //click on the searchbar

        locator.homepage.searchBar.click();


        //type "New York" and click findfood button

        locator.homepage.searchBar.sendKeys('New York');


        locator.homepage.findFood.click();


    });

    


    it("Checks the Eat24 block directs to the homepage",function() {


    //clicks the Eat24 block

    navbarlocator.Eat24block.click();


    //gets the title of the directed page

    var title = browser.getTitle();


    title.then(function(text) {


        //prints the title of the directed page

        console.log(text);



        //matches the title of the directed page with the homepage

        expect(title).toEqual("Eat24 Food Delivery | Order Online | Restaurants Delivery");


    })



    }) 





 it("validation location icon",function() {



        //clicks the location icon

        navbarlocator.locationIcon.click();


    })




it("click the clear input location icon and enter another location",function() {



    //clicks the clearinput icon

       navbarlocator.clrinp.click();


    //click on the input bar of location

       navbarlocator.search.click();


    //input a new location

       navbarlocator.search.sendKeys('Los Angeles');


    //press enter to search

       browser.actions().sendKeys(protractor.Key.ENTER).perform();


    })



it("clicks on the restaurant/dish search and give a input and search",function() {


    //clicks on the dish search bar

    navbarlocator.dishsearch.click();


    //gives an input

    navbarlocator.dishsearch.sendKeys('Chinese');


    //press enter key

    browser.actions().sendKeys(protractor.Key.ENTER).perform();



})



it("Validation of Sign In button",function() {


    //clicks the sign in  button

    navbarlocator.signin.click();


})





it("checks the cart button after searching location",function() {

    
    //clicks on the cart button

    navbarlocator.cart.click();


    //gets the message of cart empty

    util.gettext(navbarlocator.cartMessage);


})



}) 