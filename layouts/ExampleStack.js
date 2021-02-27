import React from 'react';
import { View, SafeAreaView, Text, ScrollView } from 'react-native';

import TopBar from '../components/TopBar';
import API from '../api'

export default class Example extends React.Component {
  constructor(props){
    super(props);
    this.variable = this.props.navigation.getParam("variable");
  }

  componentDidMount(){
    API.hit("Stack");
  }

  render() {
    return(
      <View style={{flex: 1, backgroundColor: "#fff"}}>
        <TopBar back={() => this.props.navigation.pop()} backgroundColor={API.config.backgroundColor}/>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <SafeAreaView>
            <Text style={API.styles.h1}>Example Stack</Text>
            <Text style={API.styles.p}>Hey, this is a stack navigator. Passed data: {JSON.stringify(this.variable)}</Text>
          </SafeAreaView>
        </ScrollView>
      </View>
    )
  }
}
