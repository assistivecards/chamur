import React, {useEffect, useRef} from 'react';
import { StyleSheet, Platform, Text, View, TouchableOpacity, StatusBar, Dimensions, Image, TextInput, TouchableHighlight, Animated, Easing } from 'react-native';
import API from '../api'

export default function Recognition({active, results}){

  const animatedLoop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loopAnim(1);
  }, []);

  let loopAnim = (toVal) => {
    Animated.timing(animatedLoop, {
      toValue: toVal,
      duration: 600,
      useNativeDriver: false,
    }).start(() => {
      loopAnim(toVal === 1 ? 0 : 1);
    });
  }

  let backgroundColor = active ? "#63b2b5" : "#eee";

  let _getInt = (from, to) => {
    return animatedLoop.interpolate({
        inputRange: [0, 1],
        outputRange: [from, to]
    });
  }

  return (
    <View style={{height: 50, marginBottom: 0, position: "relative", top: 15, zIndex: 9}}>
      <View style={{flex: 1, height: 50, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(40, 20), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(10, 30), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(30, 50), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(10, 50), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(40, 20), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(15, 30), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(10, 40), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(50, 20), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(40, 10), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(15, 50), marginHorizontal: 2}}/>
        <Animated.View style={{width: 4, borderRadius: 4, backgroundColor, height: _getInt(40, 10), marginHorizontal: 2}}/>
      </View>
    </View>
  )
}
