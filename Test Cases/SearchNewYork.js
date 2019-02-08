 //imported the locators 
 var searchit = require('../Page Objects/SearchLocators.js');

describe("Search location in Eat24",function(){
   
    //it will open https://www.eat24.com/ before each test case
    beforeEach(function(){

    browser.get("https://www.eat24.com/");

    });


    //Test case for input "New York" in the search address bar
        it("Input New York city and click search",function(){

    //close the Popup   
        searchit.pageElements.popClose.click();

    //click on the searchbar
        searchit.pageElements.searchBar.click();

    // type "New York" and click findfood
        searchit.pageElements.searchBar.sendKeys('New York');

        searchit.pageElements.findFood.click();
        
        })

        
    });