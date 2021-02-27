import React from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, ActivityIndicator, Dimensions, TouchableWithoutFeedback, TouchableOpacity, LayoutAnimation, Platform, RefreshControl, PanResponder, Image as RNImage, Easing, SafeAreaView  } from 'react-native';
import TouchableScale from 'touchable-scale-btk';

import TopBar from '../components/TopBar';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.variable = this.props.navigation.getParam("variable");
  }

  render() {

    return (
      <View style={{flex: 1, backgroundColor: "#fff"}}>

        <TouchableScale style={{position: "absolute", bottom: 30, width: 300, height: 50, alignSelf: "center", backgroundColor: "#fca7a7" }} onPress={() => this.props.navigation.pop()}>
          <Text>POP</Text>
        </TouchableScale>
      </View>
    );
  }
}
