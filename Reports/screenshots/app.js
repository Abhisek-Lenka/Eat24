var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "Validation of SignUp using a new user name & password|Validation of SignUp and SignIn",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 808,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549615986256,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22rhzhu24lv17rbje5i1ifh143c1549615998083%22%2C%22sessionId%22%3A%22wie9k9h2ot86jzgsgr740fao81549615998081%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A53%3A18.081Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A4%2C%22dateTime%22%3A%222019-02-08T08%3A53%3A18.091Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%22fa8ae0fc-2b7e-11e9-b228-137576914400%22%2C%22v2SessionId%22%3A%22fa8b080f-2b7e-11e9-a3ac-9b7a56010326%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549615999405,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616006273,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616006273,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616012893,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616012893,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616013415,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616013416,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616013416,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616013416,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616013519,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616013524,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616013742,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616013742,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616013742,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616013743,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00760060-003e-004e-003a-00d00093004c.png",
        "timestamp": 1549615984128,
        "duration": 29939
    },
    {
        "description": "checks the sign in feature by using same credentials as used in sign up|Validation of SignUp and SignIn",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 808,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616014349,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616014355,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616014356,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616014363,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22rhzhu24lv17rbje5i1ifh143c1549615998083%22%2C%22sessionId%22%3A%22wie9k9h2ot86jzgsgr740fao81549615998081%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A53%3A18.081Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A4%2C%22dateTime%22%3A%222019-02-08T08%3A53%3A18.091Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%22fa8ae0fc-2b7e-11e9-b228-137576914400%22%2C%22v2SessionId%22%3A%22fa8b080f-2b7e-11e9-a3ac-9b7a56010326%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616015418,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616015418,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616015418,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015418,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616015419,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616015449,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22rhzhu24lv17rbje5i1ifh143c1549615998083%22%2C%22sessionId%22%3A%22wie9k9h2ot86jzgsgr740fao81549615998081%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A53%3A18.081Z%22%2C%22userId%22%3A%2262266835%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A3%2C%22dateTime%22%3A%222019-02-08T08%3A53%3A36.734Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%22fa8ae0fc-2b7e-11e9-b228-137576914400%22%2C%22v2SessionId%22%3A%22fa8b080f-2b7e-11e9-a3ac-9b7a56010326%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616017181,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616018179,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616018179,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616021665,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616021665,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616021665,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616021671,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616021879,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616021879,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616021879,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616021880,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=default_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616022205,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616022205,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://api-gtm.grubhub.com/restaurants/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=6&hideHateos=true&searchMetrics=true&facet=open_now%3Atrue&sorts=delivery_estimate_withCarouselImageBoost&sortSetId=umamiV2&countOmittingTimes=true - Failed to load resource: the server responded with a status of 422 ()",
                "timestamp": 1549616022205,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://assets.eat24.com/js/main-43a820f0b8862375d7a3.js 0:1168709 e",
                "timestamp": 1549616022205,
                "type": ""
            }
        ],
        "screenShotFile": "images\\009d0011-000c-00ea-00e3-0070003c0040.png",
        "timestamp": 1549616014936,
        "duration": 8964
    },
    {
        "description": "Input New York  and click search|Search location in Eat24",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 4068,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616091391,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%221gwvtrbs3o05tzlkmanjz60vt1549616094414%22%2C%22sessionId%22%3A%22yegjmxd4uplupgycw28891y0p1549616094413%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A54%3A54.413Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A6%2C%22dateTime%22%3A%222019-02-08T08%3A54%3A56.720Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%2233f5d2ad-2b7f-11e9-9fda-31fc4f08e239%22%2C%22v2SessionId%22%3A%2233f5f9bb-2b7f-11e9-8073-21b80a3a2104%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616097067,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616101857,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616101857,
                "type": ""
            }
        ],
        "screenShotFile": "images\\007700bc-0036-0017-0017-004f00460090.png",
        "timestamp": 1549616089280,
        "duration": 14872
    },
    {
        "description": "Input Los Angeles and click search|Search location in Eat24",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 4068,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616105388,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616107444,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616107444,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00230024-0073-0004-007b-009200130009.png",
        "timestamp": 1549616104866,
        "duration": 4990
    },
    {
        "description": "checks the delivery,pickup,restaurants and catering filter|Working of different filters after the location search",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7656,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616138695,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22o4077aiir4j3rx6701acotp2o1549616141230%22%2C%22sessionId%22%3A%22ht0yqi92lr029ont5rkx9pb7l1549616141229%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A55%3A41.229Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A6%2C%22dateTime%22%3A%222019-02-08T08%3A55%3A43.711Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%224fdd60ad-2b7f-11e9-93cd-456742eb4800%22%2C%22v2SessionId%22%3A%224fdd87b8-2b7f-11e9-b642-eb3e306ab3f9%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616144043,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616147390,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616147390,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22o4077aiir4j3rx6701acotp2o1549616141230%22%2C%22sessionId%22%3A%22ht0yqi92lr029ont5rkx9pb7l1549616141229%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A55%3A41.229Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A6%2C%22dateTime%22%3A%222019-02-08T08%3A55%3A43.711Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%224fdd60ad-2b7f-11e9-93cd-456742eb4800%22%2C%22v2SessionId%22%3A%224fdd87b8-2b7f-11e9-b642-eb3e306ab3f9%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616158120,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616158120,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616158120,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=20&hideHateos=true&searchMetrics=true&latitude=40.71277618&longitude=-74.00597382&facet=open_now%3Atrue&variationId=default-impressionScoreViewAdjSearchOnlyBuffed-20160607&sortSetId=umamiV2&sponsoredSize=3&countOmittingTimes=true 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=20&hideHateos=true&searchMetrics=true&latitude=40.71277618&longitude=-74.00597382&facet=open_now%3Atrue&variationId=default-impressionScoreViewAdjSearchOnlyBuffed-20160607&sortSetId=umamiV2&sponsoredSize=3&countOmittingTimes=true:26:78\n    at https://www.eat24.com/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umamiV2&pageSize=20&hideHateos=true&searchMetrics=true&latitude=40.71277618&longitude=-74.00597382&facet=open_now%3Atrue&variationId=default-impressionScoreViewAdjSearchOnlyBuffed-20160607&sortSetId=umamiV2&sponsoredSize=3&countOmittingTimes=true:93:11",
                "timestamp": 1549616158158,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616159259,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616159259,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00c20035-00ff-008b-0058-000b008700b6.png",
        "timestamp": 1549616136576,
        "duration": 24759
    },
    {
        "description": "checks the Ratings filter|Working of different filters after the location search",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7656,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616162473,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616164156,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616164156,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00fc0016-00a9-0077-00e8-002500d5005c.png",
        "timestamp": 1549616161928,
        "duration": 23720
    },
    {
        "description": "checks the Price filter|Working of different filters after the location search",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7656,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616186591,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616186591,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616186629,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616187306,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616187306,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00bf0093-0054-004c-002d-00f200000052.png",
        "timestamp": 1549616186083,
        "duration": 22075
    },
    {
        "description": "checks the feature filter|Working of different filters after the location search",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7656,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616209007,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616209007,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616209052,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616209850,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616209850,
                "type": ""
            }
        ],
        "screenShotFile": "images\\000900e6-0056-0019-0092-0029001200d8.png",
        "timestamp": 1549616208564,
        "duration": 17766
    },
    {
        "description": "checks if delivery time filter is present|Working of different filters after the location search",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7656,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616227402,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616227402,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616227417,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616228173,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616228173,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00dc0086-00ec-007b-00d8-0066004d00ad.png",
        "timestamp": 1549616226872,
        "duration": 6369
    },
    {
        "description": "validation of all cuisines button|validation the food section menu after searching location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7012,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616269253,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22anw9dpuox19mdrp92ex96jh9b1549616273746%22%2C%22sessionId%22%3A%22hdczbqzih07ippm2hyf17cdfk1549616273746%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A57%3A53.746Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A6%2C%22dateTime%22%3A%222019-02-08T08%3A57%3A54.388Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%229ed9ddfc-2b7f-11e9-b41d-bd0312730212%22%2C%22v2SessionId%22%3A%229ed9ddf6-2b7f-11e9-be2b-e1e00d875897%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616275296,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616282092,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616282092,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00d6003c-0055-00ef-00ab-00af00c600ec.png",
        "timestamp": 1549616266970,
        "duration": 21577
    },
    {
        "description": "validate the silde right and slide left button|validation the food section menu after searching location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7012,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616289680,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616292530,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616292530,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00f00001-0035-0062-0092-009c002c004f.png",
        "timestamp": 1549616289052,
        "duration": 9178
    },
    {
        "description": "Checks the Eat24 block directs to the homepage|Validation of elements present in the main nav bar after searching for a location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7444,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616322484,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22iab7xaljfvigqkjegbhrrqtb21549616326765%22%2C%22sessionId%22%3A%22gy0p82iy3iugrhqgexywy6rrp1549616326764%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A58%3A46.764Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A6%2C%22dateTime%22%3A%222019-02-08T08%3A58%3A47.221Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%22be739e8b-2b7f-11e9-a154-89c8c60f110a%22%2C%22v2SessionId%22%3A%22be73c596-2b7f-11e9-a09d-c338285038f0%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616328304,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616333277,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616333277,
                "type": ""
            }
        ],
        "screenShotFile": "images\\003a0072-0074-00e7-00a3-008f00db0064.png",
        "timestamp": 1549616320312,
        "duration": 20523
    },
    {
        "description": "validation gps button|Validation of elements present in the main nav bar after searching for a location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7444,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://clickstream.grubhub.com/event.gif?event=%7B%22name%22%3A%22reverse-geocoded-users-ip%22%2C%22platform%22%3A%22umami%20eat24%22%2C%22browserId%22%3A%22iab7xaljfvigqkjegbhrrqtb21549616326765%22%2C%22sessionId%22%3A%22gy0p82iy3iugrhqgexywy6rrp1549616326764%22%2C%22sessionStartDateTime%22%3A%222019-02-08T08%3A58%3A46.764Z%22%2C%22userId%22%3A%22%22%2C%22referrer%22%3A%22%22%2C%22userAgent%22%3A%22Mozilla/5.0%20%28Windows%20NT%206.1%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/71.0.3578.98%20Safari/537.36%22%2C%22protocol%22%3A%22https%3A%22%2C%22hostname%22%3A%22www.eat24.com%22%2C%22pathname%22%3A%22/%22%2C%22queryParams%22%3A%22%22%2C%22view%22%3A%22homepage%20logged%20out%22%2C%22data%22%3A%5B%5D%2C%22sequence%22%3A6%2C%22dateTime%22%3A%222019-02-08T08%3A58%3A47.221Z%22%2C%22timezone%22%3A-330%2C%22v2BrowserId%22%3A%22be739e8b-2b7f-11e9-a154-89c8c60f110a%22%2C%22v2SessionId%22%3A%22be73c596-2b7f-11e9-a09d-c338285038f0%22%7D - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1549616342030,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616342030,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616342030,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616342066,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616344410,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616344410,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00290027-0002-0046-000b-005400f600e8.png",
        "timestamp": 1549616341518,
        "duration": 7894
    },
    {
        "description": "click the clear input location icon and enter another location|Validation of elements present in the main nav bar after searching for a location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7444,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616350330,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616350330,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616350347,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616353089,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616353089,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00770030-00db-0065-00ee-00c700510065.png",
        "timestamp": 1549616349852,
        "duration": 7973
    },
    {
        "description": "clicks on the restaurant/dish search and give a input and search|Validation of elements present in the main nav bar after searching for a location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7444,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616358775,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616358775,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616358810,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616359321,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616359322,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00af003d-00e4-0054-001e-002300be00d3.png",
        "timestamp": 1549616358248,
        "duration": 7015
    },
    {
        "description": "Validation of Sign In button|Validation of elements present in the main nav bar after searching for a location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7444,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616366923,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616367653,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616367653,
                "type": ""
            }
        ],
        "screenShotFile": "images\\004d0086-0040-0068-0025-008f00a500d0.png",
        "timestamp": 1549616365772,
        "duration": 6823
    },
    {
        "description": "checks the cart button after searching location|Validation of elements present in the main nav bar after searching for a location",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 7444,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616373744,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616373744,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.eat24.com/ 28:24 TypeError: Cannot read property 'email' of null\n    at https://www.eat24.com/:26:78\n    at https://www.eat24.com/:93:11",
                "timestamp": 1549616373782,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'start_url' ignored, should be same origin as document.",
                "timestamp": 1549616374494,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://assets.eat24.com/manifest.json - Manifest: property 'scope' ignored, should be same origin as document.",
                "timestamp": 1549616374494,
                "type": ""
            }
        ],
        "screenShotFile": "images\\001e000d-001f-00a2-0020-00e6002f00d0.png",
        "timestamp": 1549616373291,
        "duration": 6908
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

