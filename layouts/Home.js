import React from 'react';
import { StyleSheet, View, SafeAreaView, Dimensions, Image, Text, ScrollView, Animated, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator } from 'react-native';

import API from '../api';
import Tensor from '../Tensor';
import { titleCase } from "title-case";
import { Image as CachedImage } from "react-native-expo-image-cache";
import * as ScreenOrientation from 'expo-screen-orientation';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import TouchableScale from 'touchable-scale-btk';

export default class Setting extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      orientation: "portrait",
      game: false
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

    this.setState({game: true})

    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({game: true})
    });
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
    this.setState({game: false})
    this.props.navigation.navigate("Settings");
  }

  gameOver(){
    this.setState({game: false})
    this.props.navigation.navigate("GameOver");
  }

  async getPacks(packs, force){
    let allPacks = await API.getPacks(force);
    this.setState({packs: allPacks});

    API.ramCards(packs, force);
  }

  render() {

    return(
      <View style={{flex: 1, backgroundColor: API.config.backgroundColor, flexDirection: "column"}}>
      <LinearGradient
        // Background Linear Gradient
        colors={[API.config.backgroundColor, API.config.backgroundColor, API.config.backgroundColor, API.config.backgroundColor+"00"]}
        style={{position: "relative", zIndex: 99, height: 130}}
      >
        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 50}}>
          <Text style={[API.styles.h2, {fontWeight: "bold", color: "rgba(255,255,255,0.8)", marginVertical: 0, marginTop: 0}]}>{API.t("find_the_object")}</Text>
          <TouchableOpacity onPress={() => this.openSettings()}>
            <View style={{backgroundColor: "#fff", padding: 5, borderRadius: 30, width: 50, marginRight: 20, height: 50, overflow: "hidden"}}>
              <CachedImage uri={`${API.assetEndpoint}cards/avatar/${API.user.avatar}.png?v=${API.version}`}
                style={{width: 40, height: 40, position: "relative", top: 5}}
                resizeMode={"contain"}
                />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
        {this.state.game &&
          <Tensor gameOver={() => this.gameOver()}/>
        }
        <View style={{height: 50}}></View>
      </View>
    )
  }
}

//<Tensor />
