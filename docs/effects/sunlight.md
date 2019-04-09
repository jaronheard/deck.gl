# Sunlight 

Sunlight is a directional light source simulating the sun. Sun position calculations are based on [article](http://aa.quae.nl/en/reken/zonpositie.html) and inspired by [SunCalc](https://www.npmjs.com/package/suncalc). 

## Constructor

```js
new Sunlight({timestamp, latitude, longitude, ...});
```

Parameters:
* `timestamp`(Number) - unix timestamp in milliseconds.
* `latitude`(Number) - observer's latitude in degrees.
* `longitude`(Number) - observer's longitude in degrees.

## Methods

##### `setProps`

Used to update `timestamp`, `latitude`, and `longitude`.

## Source

[/modules/core/src/effects/lighting/sunlight.js](https://github.com/uber/deck.gl/tree/master/modules/core/src/effects/lighting/sunlight.js)
