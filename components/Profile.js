import React from 'react';
import { StyleSheet, Platform, Text, View, SafeAreaView, TouchableOpacity, StatusBar, Dimensions, Image, Image as RNImage  } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import API from '../api'
import TouchableScale from 'touchable-scale-btk';
import { Image as CachedImage } from "react-native-expo-image-cache";

export default class App extends React.Component {

  swapProfile(profileId){
    API.setCurrentProfile(profileId).then(res => {
      console.log("now active profile id", profileId);
      this.props.navigation.pop();
    })
  }

  editProfile(profile){
    this.props.navigation.push("Account");
  }

  addProfile(){
    this.props.navigation.push("New");
  }

  renderProfile(){
    let profile = API.user;
    return (
      <TouchableOpacity style={[styles.profileItem, {flexDirection: API.isRTL() ? "row-reverse" : "row"}]} key={profile.id} onPress={() => this.editProfile(profile)}>
        <View style={styles.child}>
          <CachedImage uri={`${API.assetEndpoint}cards/avatar/${profile.avatar}.png?v=${API.version}`} resizeMode="contain" style={styles.childImage} />
        </View>
        <View style={{alignItems: API.isRTL() ? "flex-end" : "flex-start", marginHorizontal: 10}}>
          <Text style={{fontSize: 22, color: "#fff", fontWeight: "bold"}}>{profile.name}</Text>
          <Text style={[API.styles.sub, {marginHorizontal: 0, marginBottom: 0, color: "#fff", fontWeight: "normal"}]}>{API.t("edit_profile")}</Text>
        </View>
        <View style={{flex: 1, justifyContent: API.isRTL() ? "flex-start" : "flex-end", alignItems: API.isRTL() ? "flex-start" : "flex-end", flexDirection: "row", alignItems: "center"}}>
          <Svg height={32} width={32} viewBox="0 0 24 24" style={{transform: [{rotateY: API.isRTL() ? "180deg" : "0deg"}]}}>
            <Path fill={"#fff"} d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"></Path>
          </Svg>
        </View>
      </TouchableOpacity>
    )
  }

  render(){
    return (
      <View style={styles.profileCarrier}>
        {this.renderProfile()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  profileCarrier: {
    flexDirection: "column",
    padding: 10,
    paddingHorizontal: 28,
    paddingBottom: 10
  },
  child: {
    width: 70,
    height: 70,
    borderRadius: 37,
    backgroundColor: "#F5F5F7",
    marginHorizontal: 5,
    borderWidth: 7,
    borderColor: "#ffffff",
    overflow: "hidden"
  },
  childImage: {
    width: 46,
    height: 46,
    position: "relative",
    top: 5,
    margin: 6
  },
  addNew: {
    height: 50,
    flex: 1,
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(247,249,255,0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5
  },
  profileItem: {
    flexDirection: "row",
    paddingBottom: 10,
    marginBottom: 5,
    alignItems: "center"
  },
  active: {
    backgroundColor: "#fff",
    height: 16,
    width: 55,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 5,
    marginHorizontal: 12,
  }
});
