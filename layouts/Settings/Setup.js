import React from 'react';
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, Easing, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator } from 'react-native';

import API from '../../api';
import Svg, { Path, Ellipse, G } from 'react-native-svg';
import * as ScreenOrientation from 'expo-screen-orientation';

export default class Setting extends React.Component {

  state = {
    page: "name",
    boy: true,
    girl: true,
    mixed: true,
    avatar: "",
    name: "",
    pageTransition: new Animated.Value(0),
    creating: false
  }

  componentDidMount(){
    API.getPacks();
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    this.animateTransition("name");
  }

  animateTransition(toPage){
    Animated.timing(
      this.state.pageTransition,
      {
        toValue: 0,
	      duration: 200,
        useNativeDriver: false
      }
    ).start(() => {
      if(toPage){
        if(toPage == "close"){
          this.props.done();
        }else{
          this.setState({page: toPage});
          Animated.timing(
            this.state.pageTransition,
            {
              toValue: 1,
      	      duration: 400,
              useNativeDriver: false
            }
          ).start();
        }
      }
    });
  }

  chooseAvatar(avatar){
    this.setState({avatar})
    this.animateTransition("notification");
  }

  _getTransitionInt = (from, to) => {
      const { pageTransition } = this.state;

      return pageTransition.interpolate({
          inputRange: [0, 1],
          outputRange: [from, to],
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
      });
  }

  componentWillUnmount(){
    ScreenOrientation.unlockAsync();
  }

  setName(){
    this.animateTransition("avatar");
  }

  notificationEnabled(){
    API.registerForPushNotificationsAsync();
    this.animateTransition("finish");
  }

  createProfile(){
    this.setState({creating: true});
    let { name, avatar } = this.state;

    let profile = {
      name,
      avatar
    }

    API.setup(profile).then(res => {
      this.animateTransition("close");
      setTimeout(() => {
        API.event.emit("refresh", "setup")
      }, 200);
    })
  }

  renderName(){
    return (
      <View style={{flex: 1}}>
        <KeyboardAvoidingView style={{flex: 1}}  behavior={Platform.OS == "ios" ? "padding" : "height"}>
          <View style={{flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 30}}>
            <Text style={[API.styles.h2, {color: "#fff", marginTop: 30, fontSize: 26, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_create_profile_title")}</Text>
            <Text style={[API.styles.pHome, {marginBottom: 35, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_create_profile_description")}</Text>
            <TextInput style={[API.styles.input, {width: "100%", backgroundColor: "#fff"}]} placeholder={API.t("setup_your_name")}
                       placeholderTextColor = "#aaa" value={this.state.name} onChangeText={(name) => this.setState({name})}/>
            {this.state.name.length >= 2 &&
              <TouchableOpacity style={[API.styles.whiteButton, {marginTop: 30}]} onPress={() => this.setName()}>
                <Text style={{color: API.config.backgroundColor, fontWeight: "bold", fontSize: 18}}>{API.t("button_next")}</Text>
              </TouchableOpacity>
            }
            {this.state.name.length < 2 &&
              <View style={[API.styles.whiteButton, {marginTop: 30, backgroundColor: "rgba(255,255,255,0.5)"}]} onPress={() => this.setName()}>
                <Text style={{color: API.config.backgroundColor, fontWeight: "bold", fontSize: 18}}>{API.t("button_next")}</Text>
              </View>
            }
          </View>
        </KeyboardAvoidingView>
      </View>
    )
  }

  renderAvatar(){
    return (
      <ScrollView style={{flex: 1, backgroundColor: API.config.backgroundColor}}>
        <View style={{justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 30}}>
          <Text style={[API.styles.h2, {color: "#fff", marginTop: 30, fontSize: 26, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_avatar_title")}</Text>
          <Text style={[API.styles.pHome, {marginBottom: 10, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_avatar_description")}</Text>
        </View>

        <View style={{borderWidth: 1, marginBottom: 10, borderColor: "rgba(255,255,255,0.5)", height: 36, backgroundColor: "rgba(255,255,255,0.1)", flexDirection: "row", borderRadius: 18, overflow: "hidden", marginHorizontal: 25}}>
          <TouchableOpacity onPress={() => this.setState({boy: true, girl: false, mixed: false})} style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: this.state.boy ? "rgba(255,255,255,0.2)" : "transparent"}}><Text style={{fontSize: 15, fontWeight: "bold", color: "#fff"}}>{API.t("setup_label_boy")}</Text></TouchableOpacity>
          <View style={{height: "100%", borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.5)"}}></View>
          <TouchableOpacity onPress={() => this.setState({boy: false, girl: true, mixed: false})} style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: this.state.girl ? "rgba(255,255,255,0.2)" : "transparent"}}><Text style={{fontSize: 15, fontWeight: "bold", color: "#fff"}}>{API.t("setup_label_girl")}</Text></TouchableOpacity>
          <View style={{height: "100%", borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.5)"}}></View>
          <TouchableOpacity onPress={() => this.setState({boy: false, girl: false, mixed: true})} style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: this.state.mixed ? "rgba(255,255,255,0.2)" : "transparent"}}><Text style={{fontSize: 15, fontWeight: "bold", color: "#fff"}}>{API.t("setup_label_mixed")}</Text></TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 30, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingTop: 15}}>
         {this.state.boy && Array.apply(null, Array(33)).map((boy, i) => {
           return (
             <TouchableOpacity style={styles.childAvatar} key={"boy"+(i+1)} onPress={() => this.chooseAvatar(`boy${(i+1) < 10 ? "0"+(i+1) : (i+1)}`)}>
               <Image source={{uri: `${API.assetEndpoint}cards/avatar/boy${(i+1) < 10 ? "0"+(i+1) : (i+1)}.png?v=${API.version}`}} resizeMode="contain" style={styles.childImage} />
             </TouchableOpacity>
           )
         })}
         {this.state.girl && Array.apply(null, Array(27)).map((girl, i) => {
           return (
             <TouchableOpacity style={styles.childAvatar} key={"girl"+(i+1)} onPress={() => this.chooseAvatar(`girl${(i+1) < 10 ? "0"+(i+1) : (i+1)}`)}>
               <Image source={{uri: `${API.assetEndpoint}cards/avatar/girl${(i+1) < 10 ? "0"+(i+1) : (i+1)}.png?v=${API.version}`}} resizeMode="contain" style={styles.childImage} />
             </TouchableOpacity>
           )
         })}
         {this.state.mixed && Array.apply(null, Array(29)).map((misc, i) => {
           return (
             <TouchableOpacity style={styles.childAvatar} key={"misc"+(i+1)} onPress={() => this.chooseAvatar(`misc${(i+1) < 10 ? "0"+(i+1) : (i+1)}`)}>
               <Image source={{uri: `${API.assetEndpoint}cards/avatar/misc${(i+1) < 10 ? "0"+(i+1) : (i+1)}.png?v=${API.version}`}} resizeMode="contain" style={styles.childImage} />
             </TouchableOpacity>
           )
         })}
        </View>
        <View style={{backgroundColor: API.config.backgroundColor, height: 40}}>
        </View>
      </ScrollView>
    )
  }

  renderNotification(){
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 30}}>
          <Text style={[API.styles.h2, {color: "#fff", marginTop: 30, fontSize: 26, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_notification_title")}</Text>
          <Text style={[API.styles.pHome, {marginBottom: 35, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_notification_description")}</Text>
          <TouchableOpacity style={API.styles.whiteButton} onPress={() => this.notificationEnabled()}>
            <Text style={{color: API.config.backgroundColor, fontWeight: "bold", fontSize: 18}}>{API.t("alert_ok")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderFinish(){
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 30}}>
          <Image source={require("../../assets/mascot.png")} style={{width: 120, height: 120}}/>
          <Text style={[API.styles.h2, {color: "#fff", marginTop: 30, fontSize: 26, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_congrats_title", this.state.name)}</Text>
          <Text style={[API.styles.pHome, {marginBottom: 35, marginHorizontal: 0, textAlign: "center"}]}>{API.t("setup_congrats_description")}</Text>
          {!this.state.creating &&
            <TouchableOpacity style={API.styles.whiteButton} onPress={() => this.createProfile()}>
              <Text style={{color: API.config.backgroundColor, fontWeight: "bold", fontSize: 18}}>{API.t("button_start")}</Text>
            </TouchableOpacity>
          }
          {this.state.creating &&
            <View style={API.styles.whiteButton}>
              <ActivityIndicator color={API.config.backgroundColor}/>
            </View>
          }
        </View>
      </View>
    )
  }

  render() {
    return(
      <View style={{flex: 1, backgroundColor: API.config.backgroundColor}}>
        <StatusBar backgroundColor={API.config.backgroundColor} barStyle={"light-content"} />
        <Animated.View style={{flex: 1, opacity: this._getTransitionInt(0, 1), transform: [{translateY: this._getTransitionInt(50, 0)}]}}>
          {this.state.page == "name" && this.renderName()}
          {this.state.page == "avatar" && this.renderAvatar()}
          {this.state.page == "notification" && this.renderNotification()}
          {this.state.page == "finish" && this.renderFinish()}
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  childAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F5F5F7",
    borderWidth: 9,
    borderColor: "#ffffff",
    overflow: "hidden",
    marginBottom: 15
  },
  childImage: {
    width: 60,
    height: 60,
    position: "relative",
    top: 6,
    margin: 6
  }
});
