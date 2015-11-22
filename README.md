# brumHack
A bar crawl generator app, created at BrumHack in spring 2015

Working in a team of 4, we had 24 hours to come up with an idea then make it!

Written mainly in JavaScript, and a little bit of PHP, we made use of the [esri geolocation api](https://developers.arcgis.com/en/) for the pathing, and the [google maps api](https://developers.google.com/maps/?hl=en) for finding the nearest bars.

The app gets the current location from browser, then queries google maps to find the x nearest bars/pubs

We translate the location into longitude/latitude, then pass these to the esri api, which finds the optimal (walking) path between them.

The user can edit the bars underneath the map, to select which ones they definitely do or don't want to visit. These choices persist when the crawl is regenerated.

![screenshot](screenshot.png)
