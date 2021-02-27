import React from 'react';
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Image as CachedImage } from "react-native-expo-image-cache";

import API from '../../api';
import TopBar from '../../components/TopBar'
import Svg, { Path, Line, Circle, Polyline, Rect } from 'react-native-svg';

export default class Setting extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      newName: null,
      newAvatar: null,
    }
  }

  componentDidMount(){
    API.hit("Account");
  }

  async changeAvatar(avatar){
    console.log(avatar);
    this.setState({newAvatar: avatar});
    setTimeout(() => {
      this.save(true);
    }, 100);
  }

  save(nopop){
    let { newName, newEmail, newAvatar } = this.state;
    let changedFields = [];
    let changedValues = [];

    if(newName != null){
      changedFields.push("name");
      changedValues.push(newName);
    }

    if(newAvatar != null){
      changedFields.push("avatar");
      changedValues.push(newAvatar);
    }

    API.update(changedFields, changedValues).then(res => {
      if(!nopop){
        this.props.navigation.pop();
      }
      API.haptics("impact");
    })
  }

  didChange(){
    return this.state.newName != null || this.state.newAvatar != null;
  }

  render() {
    return(
      <>
        <TopBar back={() => this.props.navigation.pop()} backgroundColor={API.config.backgroundColor} rightButtonRender={true} rightButtonActive={this.didChange()} rightButtonPress={() => this.save()}/>
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS == "ios" ? "padding" : "height"}>
          <ScrollView style={{flex: 1, backgroundColor: API.config.backgroundColor}}>
            <View style={[styles.head, {alignItems: API.isRTL() ? "flex-end" : "flex-start"}]}>
              <Text style={API.styles.h1}>{API.t("settings_selection_account")}</Text>
              <Text style={API.styles.pHome}>{API.t("settings_account_description")}</Text>
            </View>
            <View style={{flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 15}}>
              <View style={styles.preferenceItem}>
                <Text style={API.styles.h3}>{API.t("settings_account_section1_title")}</Text>
                <Text style={API.styles.subSmall}>{API.t("settings_account_section1_description")}</Text>
                <TextInput style={API.styles.input} defaultValue={API.user.name} onChangeText={(text) => this.setState({newName: text})}/>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={API.styles.h3}>{API.t("settings_change_avatar_title")}</Text>
                <Text style={API.styles.subSmall}>{API.t("settings_change_avatar_description")}</Text>
                <View style={{justifyContent: "center", alignItems: "center"}}>
                  <TouchableOpacity style={styles.childAvatar} onPress={() => this.props.navigation.push("Avatar", {avatar: this.changeAvatar.bind(this)})}>
                    <CachedImage uri={`${API.assetEndpoint}cards/avatar/${this.state.newAvatar ? this.state.newAvatar : API.user.avatar}.png?v=${API.version}`} resizeMode="contain" style={styles.childImage} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => API.signout()}>
                <View style={[[styles.selectionItem, {flexDirection: API.isRTL() ? "row-reverse" : "row"}], {borderBottomWidth: 0, padding: 25}]}>
                  <Svg height={24} width={24} viewBox="0 0 24 24" style={styles.selectionIcon} strokeWidth="2" stroke="#333" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <Path stroke="none" d="M0 0h24v24H0z"/>
                    <Path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                    <Path d="M7 12h14l-3 -3m0 6l3 -3" />
                  </Svg>
                  <Text style={[API.styles.b, {fontSize: 15, marginLeft: 10}]}>{API.t("settings_selection_signout")}</Text>
                </View>
              </TouchableOpacity>
              <View style={API.styles.iosBottomPadder}></View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    )
  }
}

const styles = StyleSheet.create({
  head: {
    backgroundColor: API.config.backgroundColor,
    marginBottom: 10,
    paddingVertical: 10,
    paddingBottom: 5
  },
  preferenceItem: {
    paddingBottom: 20,
    borderBottomWidth: 1, borderColor: "#f5f5f5",
  },
  childAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F5F5F7",
    borderWidth: 9,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
    	width: 0,
    	height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,

    elevation: 2,
  },
  childImage: {
    width: 60,
    height: 60,
    position: "relative",
    margin: 6
  },
});
