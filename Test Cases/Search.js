'use strict'

//imported the locators 

var locator = require('../Page Objects/SearchLocators.js');


describe("Search location in Eat24",function() {


//it will open https://www.eat24.com/ before each test case

beforeEach(function() {
    

browser.get("https://www.eat24.com/");


});


//Test case for input "New York" in the search address bar

    it("Input New York  and click search",function() {


   //close the Popup   

    locator.homepage.popClose.click();


   //click on the searchbar

    locator.homepage.searchBar.click();

   // type "New York" and click findfood

    locator.homepage.searchBar.sendKeys('New York');


    locator.homepage.findFood.click();


    //prints "Searched successfully"

    console.log('Searched successfully');

    })


 //Test case for input "Los Angeles" in the search address bar

it("Input Los Angeles and click search",function() {


   //close the Popup   

   locator.homepage.popClose.click();


   //click on the searchbar

   locator.homepage.searchBar.click();


   // type "New York" and click findfood

   locator.homepage.searchBar.sendKeys('Los Angeles');


   locator.homepage.findFood.click();

   //prints "Searched successfully"

   console.log('Searched successfully');

            
  })

     
        
})