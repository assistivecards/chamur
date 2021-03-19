import React from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, ActivityIndicator, Dimensions, TouchableWithoutFeedback, TouchableOpacity, LayoutAnimation, Platform, RefreshControl, PanResponder, Image as RNImage, Easing, SafeAreaView  } from 'react-native';
import TouchableScale from 'touchable-scale-btk';

import WordItem from '../components/WordItem';
import Svg, { Line, Path, Circle } from 'react-native-svg';

import TopBar from '../components/TopBar';
import API from '../api';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.variable = this.props.navigation.getParam("variable");
  }

  render() {

    return (
      <View style={{flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center"}}>
        <RNImage source={{uri: `https://api.assistivecards.com/cards/conversation/yes@2x.png`}} style={{width: 150, height: 150}}/>
        <Text style={API.styles.h2}>All Done</Text>
        <Text style={API.styles.p}>You found all the objects, good job!</Text>
        <TouchableScale style={[API.styles.button, {flexDirection: "row", backgroundColor: API.config.backgroundColor}]} onPress={() => this.props.navigation.pop()}>
          <Svg className="icon icon-tabler icon-tabler-caret-right" height="30" width="30" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
            <Path d="M0 0h24v24H0z" stroke="none"/>
            <Path d="M18 15l-6-6l-6 6h12" transform="rotate(90 12 12)"/>
          </Svg>
          <Text style={{color: "#fff", fontWeight: "bold", fontSize: 18}}>{API.t("restart_playing")}</Text>
        </TouchableScale>
      </View>
    );
  }
}
