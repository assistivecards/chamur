import React from 'react';
import { StyleSheet, View, SafeAreaView, Dimensions, Image, Text, ScrollView, Animated, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator } from 'react-native';

import API from '../api';
import { titleCase } from "title-case";
import { Image as CachedImage } from "react-native-expo-image-cache";
import * as ScreenOrientation from 'expo-screen-orientation';
import Svg, { Line, Path, Circle } from 'react-native-svg';

import TouchableScale from 'touchable-scale-btk';

export default class Setting extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      orientation: "portrait"
    }

    ScreenOrientation.getOrientationAsync().then(orientation => {
      if(orientation == 3 || orientation == 4){
        this.setState({orientation: "landscape"});
      }
    })
  }

  componentDidMount(){
    API.hit("Home");
    API.event.on("refresh", this._refreshHandler)
    API.event.on("premium", this._refreshHandler)
    this.orientationSubscription = ScreenOrientation.addOrientationChangeListener(this._orientationChanged.bind(this));
  }

  _orientationChanged(orientation){
    let newOrientation = "portrait";
    if(orientation.orientationInfo.orientation == 3 || orientation.orientationInfo.orientation == 4){
      newOrientation = "landscape";
    }
    this.setState({orientation: newOrientation});
  }

  _refreshHandler = () => {
    console.log("refreshed");
    this.forceUpdate();
  };

  componentWillUnmount(){
    ScreenOrientation.removeOrientationChangeListener(this.orientationSubscription);
    API.event.removeListener("refresh", this._refreshHandler);
    API.event.removeListener("premium", this._refreshHandler);
  }

  openSettings(){
    this.props.navigation.navigate("Settings");
  }


  async getPacks(packs, force){
    let allPacks = await API.getPacks(force);
    this.setState({packs: allPacks});

    API.ramCards(packs, force);
  }

  render() {

    return(
      <View style={{flex: 1, backgroundColor: "#fff"}}>
        <SafeAreaView></SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" keyboardDismissMode={"on-drag"}>
        <SafeAreaView style={{flex: 1}}>
          <View style={{flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start"}}>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", flex: 1}}>
              <TouchableOpacity style={styles.avatarHolder} onPress={() => this.openSettings()}>
                <View style={styles.avatar}>
                  <CachedImage uri={`${API.assetEndpoint}cards/avatar/${API.user.avatar}.png?v=${API.version}`}
                    style={{width: 40, height: 40, position: "relative", top: 4}}
                    resizeMode={"contain"}
                    />
                </View>
                <View style={styles.avatarIcon}>
                  <Svg width={11} height={11} viewBox="0 0 8 4">
                    <Line x1="1" x2="7" y1="0.8" y2="0.8" fill="none" stroke={API.config.backgroundColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1"/>
                    <Line x1="1" x2="7" y1="3.2" y2="3.2" fill="none" stroke={API.config.backgroundColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1"/>
                  </Svg>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          </SafeAreaView>

          <SafeAreaView>
            <Text style={[API.styles.h1, {color: "#333"}]}>H1: Heading</Text>
            <Text style={API.styles.h2}>H2: Heading</Text>
            <Text style={API.styles.h3}>H3: Heading</Text>
            <Text style={API.styles.p}>This is a simple paragraph text style.</Text>


            <View style={{alignItems: "center"}}>
              <TouchableScale style={API.styles.button} onPress={() => this.props.navigation.push("ExampleStack", {variable: "test"})}>
                <Text style={[API.styles.p, {color: "#fff"}]}>Push Stack</Text>
              </TouchableScale>
              <View style={{height: 10}}></View>
              <TouchableScale style={API.styles.button} onPress={() => this.props.navigation.push("ExampleModalStack", {variable: "test"})}>
                <Text style={[API.styles.p, {color: "#fff"}]}>Push Modal</Text>
              </TouchableScale>
            </View>

          </SafeAreaView>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  carrier: {
    flex: 1,
    backgroundColor: "#fff",
    height: "100%"
  },
  header: {
    backgroundColor: API.config.backgroundColor
  },
  avatar: {
    marginHorizontal: 30, padding: 2, backgroundColor: "#fff", borderRadius: 40, overflow: "hidden",
    width: 45,
    height: 45,
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee"
  },
  avatarHolder: {
    position: "relative"
  },
  avatarIcon: {
    backgroundColor: "#fff",
    width: 18,
    height: 18,
    position: "absolute",
    bottom: -2,
    right: 28,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  categoryItem: {
    width: "100%"
  },
  categoryItemLandscape: {
    width: "50%"
  },
  board: {
    justifyContent: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15
  },
  categoryItemInner: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 1,
    margin: 5,
    marginHorizontal: 10,
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  categoryItemText:{
    fontWeight: "bold",
    color: "rgba(0,0,0,0.75)"
  },
  tabStyle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 20
  },
  tabStyleText: {
    fontWeight: "bold",
    fontSize: 17
  },
  tabStyleActive: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: API.config.backgroundColor,
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  tabStyleActiveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17
  },
  tabHolder: {
    flex: 1, flexDirection: "row", alignItems: "center",
    marginLeft: 20,
    marginTop: 10,
    height: 60,
  }
});
