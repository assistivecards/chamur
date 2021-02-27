import React from 'react';
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as Localization from 'expo-localization';

import API from '../../api';
import Languages from '../../languages.json';
import TopBar from '../../components/TopBar'

export default class Setting extends React.Component {
  constructor(props){
    super(props);
    this.language = Languages.languages.filter(lang => lang.code == API.user.language)[0];
    this.locale = this.language.locale;

    this.state = {
      accent: API.user.accent ? API.user.accent : this.locale[0]
    }

  }

  componentDidMount(){
    API.hit("Accent");
  }

  async save(){
    API.haptics("touch");
    let { accent } = this.state;
    let changedFields = [];
    let changedValues = [];

    if(accent != API.user.accent){
      changedFields.push("accent");
      changedValues.push(accent);
    }

    let updateRes = await API.update(changedFields, changedValues);
    this.props.navigation.pop();
    API.haptics("impact");
  }

  didChange(){
    return this.state.accent != API.user.accent;
  }

  render() {
    return(
      <>
        <TopBar back={() => this.props.navigation.pop()} backgroundColor={API.config.backgroundColor} rightButtonRender={true} rightButtonActive={this.didChange()} rightButtonPress={() => this.save()}/>
        <ScrollView style={{flex: 1, backgroundColor: API.config.backgroundColor}}>
          <View style={[styles.head, {alignItems: API.isRTL() ? "flex-end" : "flex-start"}]}>
            <Text style={API.styles.h1}>{API.t("settings_selection_accent")}</Text>
            <Text style={API.styles.pHome}>{API.t("settings_accent_description")}</Text>
          </View>
          <View style={{flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 15}}>
            <View style={styles.preferenceItem}>
              {this.locale.map((locale, i) => {
                return (
                  <TouchableOpacity onPress={() => { API.haptics("touch"); this.setState({accent: locale})}} key={i} style={styles.listItem}>
                    <View>
                      <Text style={[API.styles.h3, {marginVertical: 0}]}>{locale}</Text>
                      <Text style={API.styles.p}>{this.language.title}</Text>
                    </View>
                    <View style={[styles.pointer, {backgroundColor: this.state.accent == locale ? API.config.backgroundColor: "#eee"}]}></View>
                  </TouchableOpacity>
                )
              })}
            </View>
            <View style={API.styles.iosBottomPadder}></View>
          </View>
        </ScrollView>
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
    marginBottom: 10
  },
  listItem: {
    borderBottomWidth: 1, borderColor: "#f5f5f5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  pointer: {
    width: 24, height: 24, borderRadius: 12,
    marginRight: 30
  }
});
