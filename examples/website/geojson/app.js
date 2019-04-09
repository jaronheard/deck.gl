/* global setInterval */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {GeoJsonLayer} from 'deck.gl';
import {scaleThreshold} from 'd3-scale';
import {LightingEffect, experimental} from '@deck.gl/core';
import {PhongMaterial} from '@luma.gl/core';
const {Sunlight} = experimental;

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/geojson/vancouver-blocks.json'; // eslint-disable-line

const MS_A_HOUR = 3.6e6;

let START_TIMESTAMP = 1553990400000; // 03/31/2019 @ 12:00am (UTC)
START_TIMESTAMP += 7 * MS_A_HOUR; // Vancouver GMT-7

export const COLOR_SCALE = scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);

export const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 11,
  maxZoom: 16,
  pitch: 45,
  bearing: 0
};

const sunLight = new Sunlight({
  latitude: INITIAL_VIEW_STATE.latitude,
  longitude: INITIAL_VIEW_STATE.longitude,
  timestamp: START_TIMESTAMP
});

const material = new PhongMaterial({
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
});

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE,
      hour: 0,
      lightingEffect: new LightingEffect({sunLight}),
      hoveredObject: null
    };

    this._getLightingEffect = this._getLightingEffect.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({hour: (this.state.hour + 1) % 24});
    }, 500);
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderLayers() {
    const {data = DATA_URL} = this.props;

    return [
      new GeoJsonLayer({
        id: 'geojson',
        data,
        opacity: 0.8,
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        fp64: true,
        getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
        getFillColor: f => COLOR_SCALE(f.properties.growth),
        getLineColor: [255, 255, 255],
        pickable: true,
        onHover: this._onHover,
        material
      })
    ];
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: y, left: x}}>
          <div>
            <b>Average Property Value</b>
          </div>
          <div>
            <div>${hoveredObject.properties.valuePerParcel} / parcel</div>
            <div>
              ${hoveredObject.properties.valuePerSqm} / m<sup>2</sup>
            </div>
          </div>
          <div>
            <b>Growth</b>
          </div>
          <div>{Math.round(hoveredObject.properties.growth * 100)}%</div>
        </div>
      )
    );
  }

  _getLightingEffect() {
    const {longitude, latitude} = this.state.viewState;
    const {hour} = this.state;
    sunLight.setProps({latitude, longitude, timestamp: START_TIMESTAMP + hour * MS_A_HOUR});
    // eslint-disable-next-line no-console, no-undef
    console.log(`${hour}:00 azimuth: ${sunLight._azimuthAngle}`);
    return new LightingEffect({sunLight});
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;
    const lightingEffect = this._getLightingEffect();

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
        effects={[lightingEffect]}
        onViewStateChange={this._onViewStateChange}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/light-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}

        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
