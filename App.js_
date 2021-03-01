import React from 'react';
import { Text, View, StatusBar, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Image, Linking, SafeAreaView } from 'react-native';
import Navigator from './Navigator';
import Setup from './layouts/Settings/Setup';
import Browser from './layouts/Settings/Browser';

import Svg, { Path, Line, Circle, Polyline, Rect } from 'react-native-svg';

import * as Font from 'expo-font';
import * as Localization from 'expo-localization';
import * as ScreenOrientation from 'expo-screen-orientation';

import API from './api';

TouchableOpacity.defaultProps = TouchableOpacity.defaultProps || {};
TouchableOpacity.defaultProps.delayPressIn = 0;
TouchableWithoutFeedback.defaultProps = TouchableWithoutFeedback.defaultProps || {};
TouchableWithoutFeedback.defaultProps.delayPressIn = 0;

export default class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      screen: "loading",
      moreSignin: false,
      activity: false,
      premium: API.premium
    }

    API.event.on("premium", () => {
      console.log("$$$$$", API.premium)
      this.setState({premium: API.premium});
    })

  }

  async componentDidMount(){
    setTimeout(() => {
      if(this.state.screen == "loading"){
        this.setState({screen: "login"});
      }
    }, 2000);

    this.checkIdentifier();

    ScreenOrientation.unlockAsync();

    API.event.on("refresh", (type) => {
      if(type == "signout"){
        this.setState({screen: "login"});
      }else if(type == "setup"){
        this.checkIdentifier();
      }
    })
  }

  checkIdentifier(){
		API.getData("user").then(user => {
			if(user){
				API.user = JSON.parse(user);
        this.setState({screen: "logged"});
        API.initSpeech();
      }else{
        console.log("You need to setup your app!!");
        this.setState({screen: "login"});
      }
		});
  }

  setupComplete(param){
    console.log("setup complete", param);
  }

  signInScreen(){
    return (
      <>
        <SafeAreaView style={{justifyContent: "center", alignItems: "center", flex: 1, backgroundColor: API.config.backgroundColor}}>
          <Image source={require("./assets/title_screen.png")} style={{width: 200, height: 200}}/>

          <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 20}}>
            <Text style={[API.styles.pHome, {marginBottom: 0, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_welcome_description")}</Text>
          </View>
          {this.renderSignInButtons()}
          <TouchableOpacity onPress={() => this.setState({screen: "policy"})} style={{marginTop: 15, marginBottom: 30}}>
            <Text style={[API.styles.pHome, {textAlign: "center"}]}>
              By starting you accept our <Text style={{fontWeight: "600"}}>Terms of Use</Text> and <Text style={{fontWeight: "600"}}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
        {this.state.activity &&
          <View style={{backgroundColor: "rgba(0,0,0,0.3)", width: "100%", height: "100%", position: "absolute", top: 0, left: 0, justifyContent: "center", alignItems: "center"}}>
            <View style={{width: 60, height: 60, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderRadius: 30}}>
              <ActivityIndicator color={API.config.backgroundColor}/>
            </View>
            <TouchableOpacity style={{marginTop: 30, position: "absolute", bottom: 30}} onPress={() => this.setState({activity: false})}>
              <Text style={{color: "#fff", fontWeight: "bold", fontSize: 18}}>{API.t("alert_cancel")}</Text>
            </TouchableOpacity>
          </View>
        }
      </>
    )
  }

  renderSignInButtons(){
    return(
      <>
        <TouchableOpacity
          style={{ width: 240, height: 46, alignItems: "center", borderRadius: 25, backgroundColor: "#fff",  justifyContent: "center", flexDirection: "row"}}
          onPress={() => { this.setState({screen: "logged"}) }}>
          <Svg height={24} width={24} viewBox="0 0 24 24" style={{marginRight: 5}} strokeWidth="2" stroke="#333" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M0 0h24v24H0z" stroke="none"/>
            <Path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"/>
            <Polyline points="9 11 12 14 20 6"/>
          </Svg>
          <Text style={{fontSize: 19, fontWeight: "500"}}>{API.t("button_get_started")}</Text>
        </TouchableOpacity>
      </>
    );
  }

  renderLoading(type){
    if(type == "premium"){
      setTimeout(() => {
        this.setState({premium: "none"});
      }, 3000);
    }
    return (
      <View style={{flex: 1, backgroundColor: API.config.backgroundColor, justifyContent: "center", alignItems: "center"}}>
        <StatusBar backgroundColor={API.config.backgroundColor} barStyle={"light-content"} />
        <View style={{width: 60, height: 60, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderRadius: 30}}>
          <ActivityIndicator color={API.config.backgroundColor}/>
        </View>
      </View>
    )
  }

  render() {
    let screen = this.state.screen;

    if(screen == "login"){
      return this.signInScreen();
    }else if(screen == "policy"){
      return (<Browser link={"https://dreamoriented.org/privacypolicy/"} back={() => this.setState({screen: "login"})}/>);
    }else if(screen == "logged"){
      if(API.user.name){
        if(this.state.premium == "determining"){
          return this.renderLoading("premium");
        }else{
          return (
            <View style={{flex: 1}}>
              <StatusBar backgroundColor="#ffffff" barStyle={"dark-content"} />
              <Navigator/>
            </View>
          );
        }
      }else{
        return (<Setup done={this.setupComplete.bind(this)}/>);
      }

    }else if(screen == "loading"){
      return this.renderLoading();
    }
  }
}
