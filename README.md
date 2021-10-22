[![Netlify Status](https://api.netlify.com/api/v1/badges/32153fec-6522-4118-90ae-8e5e648d57ed/deploy-status)](https://app.netlify.com/sites/cr-citibike-mapbox/deploys)


# Citibike MapBox App

This app is a quick mapbox based app that takes citibike data from their GBFS feed and shows the closest stations to a user-inputted point using Mapbox GL JS. You can hover over the station points to see how many bikes and docks are currently available at that station.

Note: It is not quite real-time data, the data will be the most up to date from when the webpage was loaded but will not refresh after that at the moment (not a bug, just how I have it working for now).

What I would like for this app to eventually do is take in a starting point and ending point and find the two best stations to bike out of and dock in to. I plan on using Turf to help with that.

Site is deployed at https://cr-citibike-mapbox.netlify.app/