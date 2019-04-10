import test from 'tape-catch';
import {getSolarPosition} from '@deck.gl/core/effects/lighting/sunlight';

const MS_A_HOUR = 3.6e6;

function almostEqual(v1, v2, epsilon = 0.3) {
  return Math.abs(v1 - v2) < epsilon;
}

test('Sunlight#azimuth and altitude', t => {
  const latitude = 49.253;
  const longitude = -123.13;
  let timestamp = 1553990400000; // 03/31/2019 @ 12:00am (UTC)
  timestamp += 7 * MS_A_HOUR; // Vancouver GMT-7

  // https://www.wolframalpha.com/input/?i=solar+position+on+20:00+03-31-2019+at+Vancouver
  const expectedAzimuth = [336.645, 60.2354, 120.573, 214.564, 281.106];
  const expectedAltitude = [-34.1018, -18.1205, 28.7791, 39.9957, -3.70205];

  for (let i = 0; i < 5; i++) {
    const hour = i * 5;
    const ts = timestamp + hour * MS_A_HOUR;
    const {azimuth, altitude} = getSolarPosition(ts, latitude, longitude);
    // azimuth is measured from south to west, azimuth + 180 is converting to north to east
    const azimuthInDegree = 180 + (azimuth * 180) / Math.PI;
    const altitudeInDegree = (altitude * 180) / Math.PI;

    t.ok(almostEqual(azimuthInDegree, expectedAzimuth[i]), 'Azimuth angle should match.');
    t.ok(almostEqual(altitudeInDegree, expectedAltitude[i]), 'Altitude angle should match.');
  }

  t.end();
});
