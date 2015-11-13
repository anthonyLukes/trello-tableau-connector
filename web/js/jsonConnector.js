(function() {

  var myConnector = tableau.makeConnector();

  myConnector.init = function () {
    tableau.connectionName = 'JSON data';
    tableau.initCallback();
  };

  myConnector.getColumnHeaders = function() {
    _retrieveJsonData(function (tableData) {
      var headers = tableData.headers;
      var fieldNames = [];
      var fieldTypes = [];

      for (var fieldName in headers) {
        if (headers.hasOwnProperty(fieldName)) {
          fieldNames.push(fieldName);
          fieldTypes.push(headers[fieldName]);
        }
      }
      tableau.headersCallback(fieldNames, fieldTypes); // tell tableau about the fields and their types
    });
  };

  myConnector.getTableData = function (lastRecordToken) {
    _retrieveJsonData(function (tableData) {
      var rowData = tableData.rowData;
      tableau.dataCallback(rowData, rowData.length.toString(), false);
    });
  };

  tableau.registerConnector(myConnector);
})();

function _retrieveJsonData(retrieveDataCallback) {
  if (!window.cachedTableData) {
    var conData = JSON.parse(tableau.connectionData);
    var jsonString = conData.jsonString;
    if (conData.jsonUrl) {
      var successCallback = function(data)
      {
        window.cachedTableData = _jsToTable(data);
        retrieveDataCallback(window.cachedTableData);
      };
      // Go get the json data
      // This is the first, and most basic, of many attempts to get the data.
      // We make different attempts that use different approaches, because if
      // the server we are requesting data from has not enabled CORS, then the
      // request will fail. In that case we try different proxies to try to get
      // around the same origin policy. This is not as clean as it could be, but
      // for a general purpose connector, we want to make every attempt we can
      // to pull in the data
      _basicAjaxRequest1(conData.jsonUrl, successCallback);
      return;
    }
    try {
      window.cachedTableData = _jsToTable(JSON.parse(conData.jsonString));
    }
    catch (e) {
      tableau.abortWithError("unable to parse json data");
      return;
    }
  }
  retrieveDataCallback(window.cachedTableData);
}

// There are a lot of ways to handle URLS. Sometimes we'll need workarounds for CORS. These
// methods chain together a series of attempts to get the data at the given url

function _ajaxRequestHelper(url, successCallback, conUrl, nextFunction, specialSuccessCallback){
  specialSuccessCallback = specialSuccessCallback || successCallback;
  var xhr = $.ajax({
    url: conUrl,
    dataType: 'json',
    success: specialSuccessCallback,
    error: function()
    {
      nextFunction(url, successCallback);
    }
  });
}

// try the straightforward request
function _basicAjaxRequest1(url, successCallback){
  _ajaxRequestHelper(url, successCallback, url, _corsioProxyAjaxRequest2);
}

// try to use cors.io as a proxy
function _corsioProxyAjaxRequest2(url, successCallback){
  var corsUrl = "http://cors.io/?u=" + url;
  _ajaxRequestHelper(url, successCallback, corsUrl, _yqlProxyAjaxRequest3);
}

// try to use yql as a proxy
function _yqlProxyAjaxRequest3(url, successCallback){
  var yqlQueryBase = "http://query.yahooapis.com/v1/public/yql?q=";
  var query = "select * from html where url='" + url + "'";
  var restOfQueryString = "&format=json";
  var yqlUrl = yqlQueryBase + encodeURIComponent(query) + restOfQueryString;
  var specialSuccessCallback = function(data) {
    if (data.query.count == 0) {
      _jsonpAjax4(url, successCallback);
    } else {
      successCallback(data);
    }
  }
  _ajaxRequestHelper(url, successCallback, yqlUrl, _jsonpAjax4, specialSuccessCallback);
}

// try jsonP as a final approach?
function _jsonpAjax4(url, successCallback){
  var xhr = $.ajax({
    url: url + "?callback=?",
    dataType: 'jsonp',
    success: successCallback,
    error: function()
    {
      _giveUpOnUrl9(url, successCallback);
    }
  });
}

function _giveUpOnUrl9(url, successCallback) {
  tableau.abortWithError("Could not load url: " + url);
}

// Takes a hierarchical javascript object and tries to turn it into a table
// Returns an object with headers and the row level data
function _jsToTable(objectBlob) {
  var rowData = _flattenData(objectBlob);
  var headers = _extractHeaders(rowData);
  return {"headers":headers, "rowData":rowData};
}

// Given an object:
//   - finds the longest array in the object
//   - flattens each element in that array so it is a single object with many properties
// If there is no array that is a descendent of the original object, this wraps
// the input in a single element array.
function _flattenData(objectBlob) {
  // first find the longest array
  var longestArray = _findLongestArray(objectBlob, []);
  if (!longestArray || longestArray.length == 0) {
    // if no array found, just wrap the entire object blob in an array
    longestArray = [objectBlob];
  }
  for (var ii = 0; ii < longestArray.length; ++ii) {
    _flattenObject(longestArray[ii]);
  }
  return longestArray;
}

// Given an object with hierarchical properties, flattens it so all the properties
// sit on the base object.
function _flattenObject(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] == 'object') {
      var subObj = obj[key];
      _flattenObject(subObj);
      for (var k in subObj) {
        if (subObj.hasOwnProperty(k)) {
          obj[key + '_' + k] = subObj[k];
        }
      }
      delete obj[key];
    }
  }
}

// Finds the longest array that is a descendent of the given object
function _findLongestArray(obj, bestSoFar) {
  if (!obj) {
    // skip null/undefined objects
    return bestSoFar;
  }

  // if an array, just return the longer one
  if (obj.constructor === Array) {
    // I think I can simplify this line to
    // return obj;
    // and trust that the caller will deal with taking the longer array
    return (obj.length > bestSoFar.length) ? obj : bestSoFar;
  }
  if (typeof obj != "object") {
    return bestSoFar;
  }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var subBest = _findLongestArray(obj[key], bestSoFar);
      if (subBest.length > bestSoFar.length) {
        bestSoFar = subBest;
      }
    }
  }
  return bestSoFar;
}

// Given an array of js objects, returns a map from data column name to data type
function _extractHeaders(rowData) {
  var toRet = {};
  for (var row = 0; row < rowData.length; ++row) {
    var rowLine = rowData[row];
    for (var key in rowLine) {
      if (rowLine.hasOwnProperty(key)) {
        if (!(key in toRet)) {
          toRet[key] = _determineType(rowLine[key]);
        }
      }
    }
  }
  return toRet;
}

// Given a primitive, tries to make a guess at the data type of the input
function _determineType(primitive) {
  // possible types: 'float', 'date', 'datetime', 'bool', 'string', 'int'
  if (parseInt(primitive) == primitive) return 'int';
  if (parseFloat(primitive) == primitive) return 'float';
  if (isFinite(new Date(primitive).getTime())) return 'datetime';
  return 'string';
}

function _submitToJsonToTableau(jsonString, jsonUrl) {
    var conData = {"jsonString" : jsonString, "jsonUrl": jsonUrl};
    tableau.connectionData = JSON.stringify(conData);
    tableau.submit();
}