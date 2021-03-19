import React from 'react';
import { StyleSheet, Platform, Text, View, TouchableOpacity, StatusBar, Dimensions, Image, TextInput, Animated, TouchableWithoutFeedback } from 'react-native';
import { Image as CachedImage } from "react-native-expo-image-cache";
import Svg, { Path } from 'react-native-svg';

import API from '../api'
import TouchableScale from 'touchable-scale-btk'

export default class App extends React.Component {

  state = {
    colorAnim: new Animated.Value(this.props.active ? 1 : 0),
    disableButton: false
  }

  speak(text, speed){
    API.haptics("touch");
    API.speak(text, speed);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    if(newProps.active != this.props.active){
      Animated.timing(
        this.state.colorAnim,
        {
          toValue: newProps.active ? 1 : 0,
          duration: 200,
          useNativeDriver: false
        }
      ).start();
    }
  }

  async pressed(){
    await this.props.listen();
  }

  render(){
    var color = this.state.colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#F7F7F7', '#92c9cc']
    });

    let result = this.props.result;
    return (
      <View style={{width: this.props.width}}>
        <Animated.View style={[styles.item, {flexDirection: API.isRTL() ? "row-reverse" : "row", backgroundColor: result.type == 1 ? result.color : "#F7F7F7", borderWidth: 0, borderColor: color}]}>
          <CachedImage uri={`${API.assetEndpoint}cards/in-house/${result.slug}.png?v=${API.version}`} style={{width: API.isTablet ? 70 : 50, height: API.isTablet ? 70 : 50, margin: 5}}/>
          <Text style={[styles.searchItemText, {fontSize: result.type == 2 ? 16 : 19, marginLeft: result.type == 2 ? 0 : 10}]}>{result.title}</Text>
          {(this.props.active && !this.state.disableButton) &&
            <TouchableScale onPress={() => this.pressed()} >
              <View style={{paddingHorizontal: 12, height: 38, backgroundColor: "#92c9cc", flexDirection: "row", justifyContent: "center", alignItems: "center", borderRadius: 20}}>
                <Svg width={26} height={26} viewBox="0 0 24 24" strokeLinecap="round" strokeWidth="2" stroke="#000" fill="none" style={{ opacity: 0.7}}>
                  <Path stroke="none" d="M0 0h24v24H0z"/>
                  <Path d="M0 0h24v24H0z" stroke="none"/>
                  <Path d="M15 8a5 5 0 0 1 0 8"/>
                  <Path d="M17.7 5a9 9 0 0 1 0 14"/>
                  <Path d="M6 15 h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/>
                </Svg>
              </View>
            </TouchableScale>
          }
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  searchItemText:{
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(0,0,0,0.75)",
    flex: 1,
    paddingRight: 10
  },
  searchItemEmoji: {
    fontSize: 25, margin: 10
  }
});
