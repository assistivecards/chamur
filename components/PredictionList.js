import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import API from '../api';
import shuffle from '../js/shuffle';
import WordItem from './WordItem';
import Svg, { Line, Path, Circle } from 'react-native-svg';

import TouchableScale from 'touchable-scale-btk'

export function PredictionList({ predictions = [], gameOver }) {
  const [objects, setObjects] = useState([]);
  const [objectIndex, setObjectIndex] = useState(0);
  const [predict, setPredict] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    API.getCards("in-house", true).then(objectArray => {
      setObjects(shuffle(objectArray));
      API.hit("Play");
    });
  }, []);

  useEffect(() => {
    if(predictions && predict){
      for (var i = 0; i < predictions.length; i++) {
        let prettyWord = objects[objectIndex].slug.replace(/-/g, " ");
        if(predictions[i].className.includes(prettyWord)){
          API.haptics("impact");
          nextObject();
          break;
        }
      }
    }
  }, [predictions]);


  let startPredicting = () => {
    setStarted(true);
    letsFind(0);
    setTimeout(() => {
      setPredict(true);
    }, 2000);
  }

  let nextObject = () => {
    setPredict(false);
    if(objectIndex+1 < objects.length){
      letsFind(objectIndex+1);
      setObjectIndex(objectIndex+1);
      setTimeout(() => {
        setPredict(true);
      }, 2000);
    }else{
      gameOver();
      API.hit("GameOver");
    }
  }

  let letsFind = (index) => {
    let prettyWord = objects[index].title;
    API.speak(API.t("lets_find")+" "+ prettyWord);
  }

  if(objects.length){
    return (
      <>
      <View style={{justifyContent: "center", alignItems: "center", position: "absolute", top: 10, zIndex: 100, width: "100%"}}>
        <View style={{backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 20}}>
          <Text style={[API.styles.p, {marginBottom: 5}]}>{predictions[0].className}</Text>
        </View>
      </View>
      <View style={styles.container}>
        <WordItem width={"100%"} result={objects[objectIndex]} active={true} listen={() => API.speak(objects[objectIndex].title)}/>
        {false && predictions.map((p, i) => (
          <Text style={styles.text} key={`item-${i}`}>
            {p.className}
          </Text>
        ))}
        <View style={{marginTop: 10}}></View>
        {(objectIndex == 0 && !predict) &&
          <TouchableScale style={[API.styles.button, {flexDirection: "row", backgroundColor: API.config.backgroundColor}]} onPress={() => startPredicting()}>
            <Svg className="icon icon-tabler icon-tabler-caret-right" height="30" width="30" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
              <Path d="M0 0h24v24H0z" stroke="none"/>
              <Path d="M18 15l-6-6l-6 6h12" transform="rotate(90 12 12)"/>
            </Svg>
            <Text style={{color: "#fff", fontWeight: "bold", fontSize: 18}}>{API.t("start_playing")}</Text>
          </TouchableScale>
        }
        {predict &&
          <TouchableScale style={[API.styles.button, {flexDirection: "row", backgroundColor: API.config.backgroundColor}]} onPress={() => nextObject()}>
            <Svg className="icon icon-tabler icon-tabler-caret-right" height="30" width="30" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
              <Path d="M0 0h24v24H0z" stroke="none"/>
              <Path d="M15 13l4 -4l-4 -4m4 4h-11a4 4 0 0 0 0 8h1"/>
            </Svg>
            <Text style={{color: "#fff", fontWeight: "bold", fontSize: 18}}>{API.t("skip")}</Text>
          </TouchableScale>
        }
      </View>
      </>
    );
  }else{
    return null;
  }

}

const margin = 24;

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    position: "absolute",
    bottom: margin / 2,
    left: margin / 2,
    right: margin / 2,
    alignItems: "center",
  },
  text: {
    paddingVertical: 2,
    fontSize: 20,
  },
});
