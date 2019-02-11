/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, FlatList} from 'react-native';
import CoreMLImage from 'react-native-core-ml-image';
import Svg, {Circle, G, Path, Rect, Line} from 'react-native-svg';
import { white } from 'ansi-colors';

const BEST_MATCH_THRESHOLD = 0.5;
const bodyPointConnectionArray = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 8], [8, 9], [9, 10], [1, 5], [5, 6], [6, 7], [1, 11], [11, 12], [12, 13]];
// (0, 1),     // top-neck 
//         (1, 2),     // neck-rshoulder
//         (2, 3),     // rshoulder-relbow
//         (3, 4),     // relbow-rwrist
//         (1, 8),     // neck-rhip
//         (8, 9),     // rhip-rknee
//         (9, 10),    // rknee-rankle
        
//         (1, 5),     // neck-lshoulder
//         (5, 6),     // lshoulder-lelbow
//         (6, 7),     // lelbow-lwrist
//         (1, 11),    // neck-lhip
//         (11, 12),   // lhip-lknee
//         (12, 13),   // lknee-lankle

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

function _rangeMap(value: number, oldMin: number, oldMax: number, newMin: number, newMax: number) {
  return newMin + (newMax - newMin) * ((value - oldMin) / (oldMax - oldMin));
}

type BodyPoint = {
  name: string,
  x: number,
  y: number,
  confidence: number,
}

class BodyPointRow extends React.Component<BodyPoint> {
  _convertXToString() {
    let xString = '';
    if (this.props.x) {
      xString = this.props.x.toFixed(3);
    }
    return xString;
  }

  _convertYToString() {
    let yString = '';
    if (this.props.y) {
      yString = this.props.y.toFixed(3);
    }
    return yString;
  }

  _convertConfidenceToString() {
    let conString = '';
    if (this.props.confidence) {
      conString = this.props.confidence.toFixed(3);
    }
    return conString;
  }


  render() {
    return (
      <Text style={styles.tableViewRow}>{this.props.name}, X:{this._convertXToString()} Y:{this._convertYToString()}, confidence: {this._convertConfidenceToString()}</Text>
    );
  }
}

// export default class App extends Component<{}> {
export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      numPoints: 0,
      bodyPointsArray: [],
      avgConfidence: 0.0,
    };
  }

  onClassification(classifications) {

    if (classifications && classifications.length > 0) {
      var tmpArray = [];
      var tmpAverage = 0.0;
      classifications.forEach((point) => {
        let tmpPoint = {
          name: point.name,
          x: point.x,
          y: point.y,
          confidence: point.confidence,
        };
        tmpArray.push(tmpPoint);
        tmpAverage += point.confidence;
      });
      this.setState({
        bodyPointsArray: tmpArray,
        numPoints: tmpArray.length,
        avgConfidence: tmpAverage/tmpArray.length,
      });
    }
  }

  _renderBodyPointRow = ({item, index}) => (
    <BodyPointRow
      name={item.name}
      x={item.x}
      y={item.y}
      confidence={item.confidence}
    />
  );

  _renderBodyPoints() {
    const bodyCircles = [];
    // loop through this.state.bodyPointsArray
    for (let i = 0; i < this.state.bodyPointsArray.length; i++) {
      if (this.state.bodyPointsArray[i]) {
        const x = (this.state.bodyPointsArray[i].x*100).toFixed(2)+'%'
        const y = (this.state.bodyPointsArray[i].y*100).toFixed(2)+'%'
        const hue = _rangeMap(this.state.bodyPointsArray[i].name, 0, 14, 0, 360);
        const c = 'hsl(' + hue.toFixed(0) + ', 100%, 50%)';
        if (this.state.bodyPointsArray[i].confidence > 0.3) {
          bodyCircles.push(
            <Circle
              cx={x}
              cy={y}
              r="10"
              fill={c}
            />
          )
        }
      }
    }
    return (
      bodyCircles
    );
  }

  _renderBodyLines() {
    const bodyLines = [];
    if (this.state.avgConfidence > 0.5) {
      for (let i = 0; i < bodyPointConnectionArray.length; i++) {
        const idxPt1 = bodyPointConnectionArray[i][0];
        const idxPt2 = bodyPointConnectionArray[i][1];
        if (this.state.bodyPointsArray[idxPt1] && this.state.bodyPointsArray[idxPt2]) {
          const x1 = (this.state.bodyPointsArray[idxPt1].x*100).toFixed(2)+'%'
          const y1 = (this.state.bodyPointsArray[idxPt1].y*100).toFixed(2)+'%'
          const x2 = (this.state.bodyPointsArray[idxPt2].x*100).toFixed(2)+'%'
          const y2 = (this.state.bodyPointsArray[idxPt2].y*100).toFixed(2)+'%'
          bodyLines.push(
            <Line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="red"
              strokeWidth="3"
            />
          )
        }
      }
    }
    return (
      bodyLines
    );
  }

  render() {
    var numPointsString = 'number of points detected: ';
    if (this.state.numPoints) {
      numPointsString = numPointsString.concat(this.state.numPoints.toString());
    }

    return (
      <View style={styles.container}>
          <CoreMLImage modelFile="hourglass" onClassification={(evt) => this.onClassification(evt)}>
              <View style={styles.container}>
                {/* <View style={styles.pointListView}>
                  <FlatList
                    data={this.state.bodyPointsArray}
                    renderItem={this._renderBodyPointRow}
                    keyExtractor={item => item.name}
                  />
                </View> */}
                <View style={styles.drawingView}>
                  <Svg height="61.67%" width="100%" viewBox="0 0 300 400">
                    { this._renderBodyPoints() }
                    { this._renderBodyLines() }
                  </Svg>
                </View>
              </View>
          </CoreMLImage>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pointListView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableViewRow: {
    color: 'white',
  }
});
