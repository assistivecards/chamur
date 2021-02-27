import React from 'react';
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert } from 'react-native';

import API from '../../api';
import TopBar from '../../components/TopBar'
import Svg, { Path, Ellipse, G, Circle } from 'react-native-svg';
import { Image as CachedImage } from "react-native-expo-image-cache";

function toFixed(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}

export default class Setting extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      premium: API.premium,
      cards: [],
      plans: []
    }

  }

  async componentDidMount(){
    let plans = await API.getPlans();
    this.setState({plans})
    API.event.on("premium", this._listenPremiumChange.bind(this))
    API.event.on("premiumPurchase", this._listenPremiumPurchase.bind(this))
    let cards = await API.getPacks();
    this.setState({cards: cards.filter(res => res.premium == 1)});
    API.hit("Premium");
    API.avent("Premium", "Page", "load");
  }

  _listenPremiumChange = () => {
    this.setState({premium: API.premium});
  }

  _listenPremiumPurchase = (changedTo) => {
    this.setState({premium: changedTo});
    this.save(changedTo);
  }

  componentWillUnmount(){
    API.event.removeListener("premium", this._listenPremiumChange);
    API.event.removeListener("premiumPurchase", this._listenPremiumPurchase)
  }

  async save(toPremiumValue){
    API.haptics("touch");
    let { premium } = this.state;
    let changedFields = [];
    let changedValues = [];
    if(toPremiumValue){
      premium = toPremiumValue;
    }
    changedFields.push("premium");
    changedValues.push(premium);

    let updateRes = await API.update(changedFields, changedValues);
    this.props.navigation.pop();
    API.haptics("impact");
  }

  restore(){
    Alert.alert(
      API.t("settings_restore_purchases"),
      API.t("settings_restore_purchases_desc"),
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => this.restorePurchases()
        }
      ],
      "plain-text"
    );
  }

  async restorePurchases(){
    await API.restorePurchases();
    alert(API.t("settings_restore_purchases_final"));
  }

  renderSubscriptionPlan(plan, compare){
    plan.price = plan.price.replace(",", ".");
    if(plan.productId.includes("monthly")){
       return (
         <TouchableOpacity key={plan.productId} onPress={() => API.purchasePremium(plan.productId, this.state.premium)} style={styles.listItem}>
           <View>
             <Text style={[API.styles.h3, {marginHorizontal: 0, marginVertical: 0, marginTop: 0}]}>{API.t("premium_monthly")}</Text>
           </View>
           <View><Text style={styles.price}>{API.t("premium_monthly_priceShow", plan.price)}</Text></View>
         </TouchableOpacity>
       )
    }else if(plan.productId.includes("yearly")){
      let monthlyPrice = toFixed((plan.priceAmountMicros / 1000000) / 12, 2);
      let yearlyToMonthlyPrice = plan.price.replace(toFixed((plan.priceAmountMicros / 1000000), 2), toFixed((plan.priceAmountMicros / 1000000) / 12, 2))
      let comparePercent = 0;
      if(compare){
        comparePercent = Math.ceil(((compare.priceAmountMicros / (plan.priceAmountMicros / 12)) - 1) * 100);
      }
       return (
         <TouchableOpacity key={plan.productId} onPress={() => API.purchasePremium(plan.productId, this.state.premium)} style={[styles.listItem, {borderColor: "#a2ddfd"}]}>
           <View>
             <Text style={[API.styles.h3, {marginHorizontal: 0, marginVertical: 0, marginTop: 0}]}>{API.t("premium_yearly")}</Text>
             <Text style={[API.styles.p, {marginHorizontal: 0, marginVertical: 0, marginTop: 0, padding: 0, paddingBottom: 0, marginBottom: 0}]}>{API.t("premium_yearly_sub")}</Text>
           </View>
           <View style={{alignItems: "flex-end"}}>
            <Text style={[styles.price, {paddingBottom: 7}]}>{API.t("premium_yearly_priceShow", plan.price)}</Text>
            <View style={{padding: 3, paddingHorizontal: 10, borderRadius: 15, backgroundColor: "#a2ddfd"}}>
              <Text style={{color: "#3e445a", fontWeight: "600"}}>{API.t("premium_save_percent", comparePercent)}</Text>
            </View>
           </View>
         </TouchableOpacity>
       )
    }else if(plan.productId.includes("lifetime")){
       return (
         <TouchableOpacity key={plan.productId} onPress={() => API.purchasePremium(plan.productId, this.state.premium)} style={styles.listItem}>
           <View>
             <Text style={[API.styles.h3, {marginHorizontal: 0, marginVertical: 0, marginTop: 0}]}>{API.t("premium_lifetime")}</Text>
             <Text style={[API.styles.p, {marginHorizontal: 0, marginVertical: 0, marginTop: 0, padding: 0, paddingBottom: 0, marginBottom: 0}]}>{API.t("premium_lifetime_oneTime")}</Text>
           </View>
           <View><Text style={styles.price}>{plan.price}</Text></View>
         </TouchableOpacity>
       )
    }
  }

  render() {
    let plans = this.state.plans;
    return(
      <>
        <ScrollView style={{flex: 1, backgroundColor: API.config.backgroundColor}} contentInsetAdjustmentBehavior="automatic">

          <SafeAreaView style={{backgroundColor: API.config.backgroundColor, alignItems: "flex-end"}}>
            <TouchableOpacity onPress={() => this.props.navigation.pop()} style={{justifyContent: "center", alignItems: "center", margin: 5, marginBottom: 0, marginHorizontal: 15, backgroundColor: "#fff", width: 45, height: 45, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 25}}>
              <Svg width={25} height={25} viewBox="0 0 25 25">
                <Path fill={"rgba(255,255,255,0.7)"} d={"M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"}></Path>
              </Svg>
            </TouchableOpacity>
          </SafeAreaView>

          <View style={[styles.head, {position: "relative", zIndex: 999, justifyContent: "center", alignItems: "center"}]}>
            <View style={{position: "absolute", zIndex: 999, top: 10}}>
              <Image source={require("../../assets/mascot.png")} style={{width: 180, height: 180}}/>
            </View>
          </View>
          <View style={{flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 15}}>
            <Text style={[API.styles.h2, {textAlign: "center"}]}>{API.t("premium_title")}</Text>
            <Text style={[API.styles.p, {textAlign: "center", marginBottom: 30}]}>{API.t("premium_description")}</Text>
            {plans[0] &&
              <>
                {this.renderSubscriptionPlan(plans.filter(plan => plan.productId.includes("monthly"))[0])}
                {this.renderSubscriptionPlan(plans.filter(plan => plan.productId.includes("yearly"))[0], plans.filter(plan => plan.productId.includes("monthly"))[0])}
                {this.renderSubscriptionPlan(plans.filter(plan => plan.productId.includes("lifetime"))[0])}
              </>
            }
            {!plans[0] &&
              <View style={{height: 150, justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator/>
              </View>
            }

            <View style={{paddingTop: 8}}>
              <Text style={API.styles.h3}>{API.t("premium_see_title")}</Text>
              <Text style={API.styles.p}>{API.t("premium_see_description")}</Text>
              <ScrollView style={{height: 140, width: "100%"}} horizontal={true}>
                <View style={{width: 25}}></View>
                {this.state.cards.map((pack, i) => {
                  return (
                    <View key={i} style={[styles.card, {backgroundColor: pack.color}]}>
                      <CachedImage uri={`${API.assetEndpoint}cards/icon/${pack.slug}.png?v=${API.version}`} style={{width: 50, height: 50, margin: 5}}/>
                      <Text style={{fontWeight: "500", color: "rgba(0,0,0,0.8)", paddingVertical: 3}}>{pack.locale}</Text>
                      <Text style={{fontSize: 12, color: "rgba(0,0,0,0.6)"}}>{API.t("premium_card_count", pack.count)}</Text>
                      <Text style={{fontSize: 10, color: "rgba(0,0,0,0.6)"}}>{API.t("premium_phrase_count", pack.count * 3)}</Text>
                    </View>
                  )
                })}
                <View style={{width: 25}}></View>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => API.purchasePremium("yearly", this.state.premium)}>
              <Text style={[API.styles.h3, {color: "#3e445a", marginBottom: 0, marginTop: 0, textAlign: "center"}]}>{API.t("premium_trial_title")}</Text>
              {plans[0] &&
                <Text style={[API.styles.h3, {color: "#3e445a", marginBottom: 0, marginTop: 0, paddingTop: 5}]}>{API.t("premium_then_info", plans.filter(plan => plan.productId.includes("yearly"))[0].price)}</Text>
              }
            </TouchableOpacity>
            <View>
              <Text style={[API.styles.p, {textAlign: "center", marginHorizontal: 40}]}>{API.t("premium_trial_description")}</Text>
              <Text style={[API.styles.p, {textAlign: "center", marginHorizontal: 40}]}>{API.t("premium_details1")}</Text>
              <View style={{borderBottomWidth: 1, borderBottomColor: "#eee", marginTop: 5, marginBottom: 15}}></View>
              <Text style={API.styles.sub}>{API.t("premium_details2")}</Text>
              <Text style={API.styles.sub}>{API.t("premium_details3")}</Text>
              <Text style={API.styles.sub}>{API.t("premium_details4")}</Text>
              <Text style={API.styles.sub}>{API.t("premium_details5")}</Text>
              <TouchableOpacity onPress={() => this.props.navigation.push("Browser", {link: "https://dreamoriented.org/termsofuse/"})}><Text style={API.styles.sub}>By continuing you accept our Terms of Use and Privacy Policy. (Touch to see in English)</Text></TouchableOpacity>

              {true &&
                <TouchableOpacity onPress={() => this.restore()}>
                  <View style={[[styles.selectionItem, {flexDirection: API.isRTL() ? "row-reverse" : "row"}], {borderBottomWidth: 0, paddingTop: 15, paddingHorizontal: 30}]}>
                    <Svg height={24} width={24} viewBox="0 0 24 24" style={styles.selectionIcon} strokeWidth="2" stroke="#333" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M0 0h24v24H0z" stroke="none"/>
                      <Path d="M7 12a5 5 0 0 1 5 -5"/>
                      <Path d="M12 17a5 5 0 0 0 5 -5"/>
                      <Circle cx="12" cy="12" r="9"/>
                      <Circle cx="12" cy="12" r="1"/>
                    </Svg>
                    <Text style={[API.styles.b, {fontSize: 15, marginLeft: 10}]}>{API.t("settings_restore_purchases")}</Text>
                  </View>
                </TouchableOpacity>
              }
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
    marginBottom: 0,
    height: 150
  },
  listItem: {
    marginHorizontal: 25,
    borderRadius: 15,
    borderWidth: 2, borderColor: "#f5f5f7",
    backgroundColor: "#f5f5f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 85,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  pointer: {
    width: 24, height: 24, borderRadius: 12,
    marginRight: 30
  },
  price: {
    fontWeight: "600",
    fontSize: 18,
    paddingVertical: 5
  },
  button: {
    backgroundColor: "#a2ddfd",
    height: 80,
    margin: 30,
    marginVertical: 10,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    padding: 5,
    paddingHorizontal: 15,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
  }
});
