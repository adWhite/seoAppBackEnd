var _ = require('lodash'),
  Promise = require('bluebird'),
  cheerio = require('cheerio');
  request = require('request');

module.exports = function(url) {
  var results = {},
    googleApiKey = "AIzaSyA0LqDDm1ayLvjITjYYKJMpvU9wGGYiVZ4",
    apis = {
      // facebook
      facebook: "https://api.facebook.com/method/fql.query?query=select total_count,like_count,comment_count,share_count,click_count from link_stat where url='" + url + "'&format=json",
      // twitter
      twitter: "http://urls.api.twitter.com/1/urls/count.json?url=" + url,

      // google+
      google: "https://plusone.google.com/_/+1/fastbutton?url=" + url,

      // linkedin shares
      linkedin: "http://www.linkedin.com/countserv/count/share?url=" + url + "&format=json",

      // Pinterest
      pinterest: "http://api.pinterest.com/v1/urls/count.json?url=" + url,

      // Speed API 
      speed: "https://www.googleapis.com/pagespeedonline/v1/runPagespeed?url=" + url + "&key=" + googleApiKey + "&strategy=desktop&screenshot=true&filter_third_party_resources=true",

      // Scrape HTML 
      html: url 
    };

  var promises = [];
  _.each(apis, function(value, key) {
    var p = new Promise(function(resolve, reject){
        request(value, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var response,
              isHTML = key === "html",
              isGoogle = key === "google",
              isPinterest = key === "pinterest";

            if (isHTML) {
              var $ = cheerio.load(body),
              body = $("html").html();
            }

            // if pinterest we delete all strings in the response
            if (isPinterest) {
              body = body.replace("receiveCount(", "").replace(")", "");
            }

            // if google+ we delete all strings too
            if (isGoogle) {
              var $ = cheerio.load(body),
                count = $("#aggregateCount").html();

              body = count;
            }

            // We exclude google+ from the strings because it includes the "M" when 
            // there are millions and "K" when thousands, so is impossible to parse
            if (_.isString(body) && !isGoogle && !isHTML) {
              response = JSON.parse(body);   
            } else {
              response = body;
            }

            results[key] = response;
            resolve(body);
          }  
          else {
            reject(error);
          }
        });
    });
    promises.push(p);
  });
 
  return Promise.all(promises).then(function(){ return results });
}
