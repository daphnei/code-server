// Generated by CoffeeScript 1.7.1
(function() {
  var Q, baseUrl, cx, http, imgType, key, num, safe, searchType;

  http = require("http");

  Q = require("q");

  cx = '017716653312651474242%3Af1wy4gpl-78';

  key = 'AIzaSyAwNFSNnkwld4r-GF3yYcaH0DBkpbck6sw';

  num = 1;

  safe = 'high';

  searchType = 'image';

  imgType = '';

  baseUrl = 'https://www.googleapis.com/customsearch/v1?';

  exports.findImage = function(keyword) {
    var deferred, url;
    deferred = Q.defer();
    keyword = keyword.replace('%', '');
    console.log("In here yo!");
    url = "http://www.bing.com/images/search?q=" + keyword;
    http.get(url, function(stream) {
      var buffer;
      buffer = "";
      stream.on('data', function(packet) {
        return buffer += packet;
      });
      return stream.on('end', function() {
        var endReadIndex, startReadIndex;
        startReadIndex = buffer.indexOf("imgurl:", buffer.indexOf("dg_u")) + 13;
        endReadIndex = buffer.indexOf('&quot;', startReadIndex);
        url = buffer.substring(startReadIndex, endReadIndex);
        console.log(url);
        return deferred.resolve(url);
      });
    });
    return deferred.promise;
  };

}).call(this);
