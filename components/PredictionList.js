import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import API from '../api';
import shuffle from '../js/shuffle';

export function PredictionList({ predictions = [] }) {
  const [objects, setObjects] = useState([]);
  const [objectIndex, setObjectIndex] = useState(0);
  const [predict, setPredict] = useState(false);

  useEffect(async () => {
    let objectArray = await API.getObjects();
    setObjects(shuffle(objectArray));
  }, []);

  useEffect(() => {
    if(predictions && predict){
      for (var i = 0; i < predictions.length; i++) {
        let prettyWord = objects[objectIndex].replace(/-/g, " ");
        if(predictions[i].className.includes(prettyWord)){
          API.haptics("impact");
          nextObject();
          break;
        }
      }
    }
  }, [predictions]);


  let startPredicting = () => {
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
      alert("Game ends");
    }
  }

  let letsFind = (index) => {
    let prettyWord = objects[index].replace(/-/g, " ");
    API.speak("Let's find "+ prettyWord);
  }

  if(objects.length){
    return (
      <View style={styles.container}>
        <Text>{objects[objectIndex]}</Text>
        {predictions.map((p, i) => (
          <Text style={styles.text} key={`item-${i}`}>
            {p.className}
          </Text>
        ))}
        {(objectIndex == 0 && !predict) && <TouchableOpacity onPress={() => startPredicting()}><Text>Start</Text></TouchableOpacity>}
        <TouchableOpacity onPress={() => nextObject()}><Text>Skip</Text></TouchableOpacity>
      </View>
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
    bottom: margin,
    left: margin,
    right: margin,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  text: {
    paddingVertical: 2,
    fontSize: 20,
  },
});
