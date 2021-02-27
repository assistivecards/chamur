import Storage from 'react-native-storage';
import { AsyncStorage, Platform, Alert } from 'react-native';

import Speech from 'react-native-tts';
import * as Localization from 'expo-localization';
import * as Haptics from 'expo-haptics';
import * as Permissions from 'expo-permissions';
import * as Device from 'expo-device';
import * as InAppPurchases from 'expo-in-app-purchases';
import * as Notifications from 'expo-notifications';

import { Analytics, ScreenHit, Event as Avent } from 'expo-analytics-safe';
import { CacheManager } from "react-native-expo-image-cache";
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';

import Event from './js/event';
import makeid from './js/makeid';
import styles from './js/styles';
import uitext from './uitext';

const APP = require("./app.json");
// For test cases
const _DEVELOPMENT = false;

const _NETWORK_STATUS = true;
const _FLUSH = false;
const _DEVLOCALE = "en-US";
const _ISPREMIUM = false;

const ANALYTICS_KEY = APP.analyticsKey;
const API_ENDPOINT = APP.apiEndpoint;
const ASSET_ENDPOINT = APP.assetEndpoint;
const ASSET_VERSION = APP.assetVersion;
const RTL = ["ar","ur","he"];

let storage = new Storage({
	size: 1000,
	storageBackend: Platform.OS === "web" ? localStorage : AsyncStorage,
	defaultExpires: null,
	enableCache: true,
	sync: {}
});

class Api {
  constructor(){
		if(_DEVELOPMENT && _FLUSH){
			AsyncStorage.clear();
			CacheManager.clearCache();
		}
		this.user = {};
		this.cards = {};
		this.storeId = APP.storeId;
		this.searchArray = [];
		this.development = _DEVELOPMENT;
		this.styles = styles;
		this.setSpeechEngine();

		this.config = APP.config;
		this.event = Event;
		this.analytics = new Analytics(_DEVELOPMENT ? "DEVELOPMENT" : ANALYTICS_KEY, {slug: APP.name, name: APP.displayName, version: APP.expo.version});
		this.isTablet = false;
		this._checkIfTablet();

		this.version = ASSET_VERSION;
		this.assetEndpoint = ASSET_ENDPOINT;

		if(_DEVELOPMENT){
			this.isOnline = _NETWORK_STATUS;
		}else{
			this.isOnline = true;
		}

		this.locked = true;
		this.premium = "determining";
		this.premiumPlans = [];

    console.log("API: Created instance");
		if(!_DEVELOPMENT){
			this._listenNetwork();
		}
		this._initSubscriptions();
  }

	isRTL(){
		if(this.user.language){
			return RTL.includes(this.user.language);
		}else{
			return false;
		}
	}

	requestSpeechInstall(){
		if(Platform.OS == "android"){
			Speech.getInitStatus().then(() => {
				Speech.requestInstallData();
			}, (err) => {
			  if (err.code === 'no_engine') {
					Speech.requestInstallEngine();
			  }
			});
		}
	}

	setSpeechEngine(){
		if(Platform.OS == "android"){
			Speech.engines().then(engines => {
				engines.forEach(engine => {
					if(engine.label){
						if(engine.label.includes("Google") || engine.label.includes("google") || engine.label.includes("google")){
							if(!engine.default){
								Speech.setDefaultEngine(engine.name);
							}
						}
					}
				});
			});
		}
	}

	initSpeech(){
		console.log("Speech Initialized");

		Speech.setDefaultVoice(this.user.voice).then(res => {
			console.log(res);
		}, (err) => {
		  console.log("Error: ", err);
		});
		Speech.setIgnoreSilentSwitch("ignore");
		Speech.setDucking(true);
		Speech.addEventListener('tts-start', () => {});
		Speech.addEventListener('tts-finish', () => {});
		Speech.addEventListener('tts-cancel', () => {});
	}

	hit(screen){
		this.analytics.hit(new ScreenHit(screen))
		  .then(() => {
				// hit done
			})
		  .catch(e => console.log(e.message));
	}

	avent(a,b,c){
		this.analytics.event(new Avent(a, b, c))
	}

	_listenNetwork(){
		NetInfo.addEventListener(state => {
		  console.log('Connection type', state.type);
		  console.log('Is connected?', state.isConnected);
			this.isOnline = state.isConnected;
		});
	}

	async _checkIfTablet(){
		let deviceType = await Device.getDeviceTypeAsync()

		this.isTablet = deviceType == Device.DeviceType.TABLET;
	}

	isPremium(){
		if(_DEVELOPMENT){
			return _ISPREMIUM;
		}

		if(this.premium.includes("lifetime") || this.premium.includes("yearly") || this.premium.includes("monthly")){
			return true;
		}else{
			if(this.isGift){
				return true;
			}else{
				return false;
			}
		}
	}

	haptics(style){
		if(Platform.OS != "web"){
			if(this.user.haptic !== "0"){
				switch (style) {
					case "touch":
						Haptics.selectionAsync()
						break;
					case "impact":
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						break;
					default:
						Haptics.selectionAsync()
				}
			}
		}else{
			console.log("BZZ");
		}
	}

	async registerForPushNotificationsAsync() {
    await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });

    let experienceId = undefined;
    if (!Constants.manifest) {
      // Absence of the manifest means we're in bare workflow
      experienceId = '@burak/'+APP.name;
    }

    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      experienceId,
    });

    console.log(expoPushToken.data);
    this.scheduleNotif();
  }

  async scheduleNotif(){
    let scheduledNotifs = await Notifications.getAllScheduledNotificationsAsync();
    console.log("##Notif", scheduledNotifs);
    if(scheduledNotifs.length == 0){

      let content = {
        sound: 'default',
        title: this.t("setup_notification_badge_title"),
        body: this.t("setup_notification_badge_description"),
      };

      Notifications.scheduleNotificationAsync({
        content: content,
        trigger: {
          seconds: 60*60*24*2, // 2 days = 60*60*24*2
          repeats: true
        },
      });
    }
  }

	async setup(profile){
		let lang = profile.language ? profile.language : Localization.locale.substr(0, 2);
		let voice = await this.getBestAvailableVoiceDriver(lang);
		let user = {
			name: profile.name,
			avatar: profile.avatar,
			voice: voice.identifier,
			language: lang,
			haptic: 1
		}

		await this.setData("user", JSON.stringify(user));
		console.log("Setup completed.");
		this.user = user;
		this.initSpeech();
	}

	signout(){
    Alert.alert(
      this.t("alert_signout_title"),
      this.t("alert_signout_description"),
      [
        {
          text: this.t("alert_cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: this.t("alert_ok"), onPress: () => {
					//AsyncStorage.clear();
					this.event.emit("refresh", "signout");
				} }
      ],
      { cancelable: true }
    );
  }

	async update(fields, values){
		let user = JSON.parse(await this.getData("user"));
		fields.forEach((itemProperty, i) => {
			user[itemProperty] = values[i];
		});

		this.user = user;

		await this.setData("user", JSON.stringify(user));
		this.event.emit("refresh");
	}


	speak(text, speed, voice){
		if(voice){
			Speech.setDefaultVoice(voice);
		}
		//text = this.phrase()
		let rate = 0.5;
		if(speed == "slow"){
			rate = 0.25;
		}
		if(this.user.voice != "unsupported"){
			Speech.speak(text, {
				language: this.user.language,
				pitch: 1,
				rate: rate,
				androidParams: {
					KEY_PARAM_STREAM: 'STREAM_MUSIC'
				}
			});
		}
	}

	async getAvailableVoicesAsync(recall){
		let voices = await Speech.voices();
		if(voices.length == 0){
			if(recall){
				return [];
			}else{
				await new Promise(function(resolve) {
		        setTimeout(resolve, 8000);
		    });
				return await this.getAvailableVoicesAsync(true);
			}
		}else{
			voices.map(voice => {
				voice.name = voice.id;
				voice.identifier = voice.id;
				voice.quality == 500 ? voice.quality = "Enhanced" : voice.quality = "Optimal";
			});
			return voices;
		}
	}

	async getBestAvailableVoiceDriver(language){
		let allVoices = await this.getAvailableVoicesAsync();
		let voices = allVoices.filter(voice => voice.language.includes(language));

		if(voices.length == 0){
			return "unsupported";
		}else if(voices.length == 1){
			return voices[0];
		}else if(voices.length > 1){
			let localeString = this.localeString().toLowerCase().replace(/_/g, "-");
			let localeVoices = voices.filter(voice => localeString.includes(voice.language.toLowerCase().replace(/_/g, "-")));

			if(localeVoices.length == 0){
				// check if there is an enhanced one
				return voices.sort((a, b) => {
	          let aQ = !(a.quality == "Enhanced");
	          let bQ = !(b.quality == "Enhanced");
	          if (aQ < bQ) return -1
	          if (aQ > bQ) return 1
	          return 0
	      })[0];
			}else if(localeVoices.length == 1){
				return localeVoices[0];
			}else if(localeVoices.length > 1){
				// check if there is an enhanced one
				return localeVoices.sort((a, b) => {
	          let aQ = !(a.quality == "Enhanced");
	          let bQ = !(b.quality == "Enhanced");
	          if (aQ < bQ) return -1
	          if (aQ > bQ) return 1
	          return 0
	      })[0];
			}
		}
	}

	async getPacks(force){
		var url = ASSET_ENDPOINT + "packs/" + this.user.language + "/metadata.json?v="+this.version;

		if(this.packs && force == null){
			console.log("pulling from ram");
			return this.packs;
		}else{
			let packsResponse;
			try {
				packsResponse = await fetch(url, {cache: "no-cache"})
		    .then(res => res.json());
				this.setData("packs", JSON.stringify(packsResponse));

			} catch(error){
				console.log("Offline, Falling back to cached packdata!", error);
				let packsResponseString = await this.getData("packs");
				if(packsResponseString){
					packsResponse = JSON.parse(packsResponseString);
				}
			}
			this.packs = packsResponse;
			return packsResponse;
		}
	}

	async ramCards(slugArray, force){
		// We need to ram things hereé!
	}

	async _initSubscriptions(){
    try{
			if(_DEVELOPMENT){
				if(!_ISPREMIUM){
					this.premium = "none";
					this.event.emit("premium");
				}
			}

	    if(!Constants.isDevice) {
				this.premium = "none";
				this.event.emit("premium");
			}
			await InAppPurchases.connectAsync();

			InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
				// Purchase was successful
				if (responseCode === InAppPurchases.IAPResponseCode.OK) {
					results.forEach(async (purchase) => {
						if (!purchase.acknowledged) {
							console.log(`Successfully purchased ${purchase.productId}`);
							// Process transaction here and unlock content...

							this.premium = purchase.productId;
							if(purchase.productId.includes("lifetime")){
								this.premium = "lifetime";
							}else if(purchase.productId.includes("monthly")){
								this.premium = "monthly";
							}else if(purchase.productId.includes("yearly")){
								this.premium = "yearly";
							}

							let consume = (purchase.productId.includes("lifetime"));
							console.log("Should I consume?", consume);
							// Then when you're done
							let resfinish = await InAppPurchases.finishTransactionAsync(purchase, consume);
							alert(`Successfully purchased ${purchase.productId.replace(APP.planPrefix, "")}, you can now use the premium version of the app!`);
							this.event.emit("premium");
							this.event.emit("premiumPurchase", this.premium);
							await this.setData("premium", this.premium);
							this.event.emit("refresh");
						}
					});
				}

				// Else find out what went wrong
				if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
					console.log('User canceled the transaction');
				} else if (responseCode === InAppPurchases.IAPResponseCode.DEFERRED) {
					console.log('User does not have permissions to buy but requested parental approval (iOS only)');
				} else {
					console.warn(`Something went wrong with the purchase. Received errorCode ${responseCode}`);
				}
			});

			this.restorePurchases();

    } catch(err){
      console.log("###### maybe no internet, or the app reloaded in dev mode", err);
			this.premium = await this.getData("premium");
			if(!this.premium) {
				this.premium = "none";
				this.setData("premium", "none");
			}
			this.event.emit("premium");
    }
	}

	async restorePurchases(){
		const history = await InAppPurchases.getPurchaseHistoryAsync(Platform.OS == "ios");
		if (history.responseCode === InAppPurchases.IAPResponseCode.OK) {
			// get to know if user is premium or npt.
			let lifetime = history.results.filter(res => res.productId.includes("lifetime"))[0];
			if(lifetime){
				this.premium = "lifetime";
			}else{
				let orderedHistory = history.results.sort((a, b) => (a.purchaseTime > b.purchaseTime) ? 1 : -1);
				if(orderedHistory[0]){
					if(orderedHistory[0].productId.includes("monthly")){
						this.premium = "monthly";
					}else if(orderedHistory[0].productId.includes("yearly")){
						this.premium = "yearly";
					}else{
						this.premium = "none";
					}
				}else{
					this.premium = "none";
				}
			}

			this.event.emit("premium");
			await this.setData("premium", this.premium);

			this.getPlans(); // async fetch the plans for later use.

		}else{
			console.log("#### Appstore status is not ok.");
			this.premium = await this.getData("premium");
			if(!this.premium) {
				this.premium = "none";
				this.setData("premium", "none");
			}
			this.event.emit("premium");
		}
	}

	async getPlans(){
		if(this.premiumPlans.length != 0){
			return this.premiumPlans;
		}else{
			try {
	      const { responseCode, results } = await InAppPurchases.getProductsAsync([APP.planPrefix + "monthly", APP.planPrefix + "yearly", APP.planPrefix + "lifetime"]);
				console.log("plans", results);
				if (responseCode === InAppPurchases.IAPResponseCode.OK) {
					this.premiumPlans = results;
				}
			}catch (err) {
				console.log("Issues with fetching products: ", err);
			}
			return this.premiumPlans;
		}
	}

	async purchasePremium(productId, oldProductId){
		if(oldProductId && oldProductId != "none"){
			await InAppPurchases.purchaseItemAsync(productId, oldProductId);
		}else{
			await InAppPurchases.purchaseItemAsync(productId);
		}
		this.avent("Premium", "PurchaseClick", productId);

	}

	async getCards(slug, force){
		var url = ASSET_ENDPOINT + "packs/" + this.user.language + "/"+ slug +".json?v="+this.version;

		if(this.cards[slug] && force == null){
			console.log("pulling from ram", "cardsFor", slug);
			return this.cards[slug];
		}else{
			let cardsResponse;
			try {
				cardsResponse = await fetch(url, {cache: "no-cache"})
				.then(res => res.json());
				this.setData("cards:"+slug, JSON.stringify(cardsResponse));

			} catch(error){
				console.log("Offline, Falling back to cached cardData!", error, slug);
				let cardsResponseString = await this.getData("cards:"+slug);
				if(cardsResponseString){
					cardsResponse = JSON.parse(cardsResponseString);
				}
			}
			this.cards[slug] = cardsResponse;
			return cardsResponse;
		}
	}

	getCardData(slug, pack){
		console.log(slug, pack);
		return this.cards[pack].filter(ramCard => ramCard.slug == slug)[0];
	}

	localeString(){
		if(_DEVELOPMENT){
			return _DEVLOCALE;
		}else{
			return Localization.locales.join("|");
		}
	}

	t(UITextIdentifier, variableArray){
		let lang = "en";
		if(this.user){
			lang = this.user.language ? this.user.language : Localization.locale.substr(0, 2);
		}else{
			lang = Localization.locale.substr(0, 2);
		}

		if(!uitext[lang + "_json"]){
			lang = "en";
		}

		if(typeof variableArray == "string" || typeof variableArray == "number"){
			let text = uitext[lang + "_json"][UITextIdentifier];
			if(text) return text.replace("$1", variableArray);
			return "UnSupportedIdentifier";
		}else if(typeof variableArray == "array"){
			let text = uitext[lang + "_json"][UITextIdentifier];
			if(text){
				variableArray.forEach((variable, i) => {
					let variableIdentifier = `${i+1}`;
				 	text = text.replace(variableIdentifier, variable);
				});
				return text;
			}else{
				return "UnSupportedIdentifier";
			}

		}else{
			let text = uitext[lang + "_json"][UITextIdentifier];
			if(text) return text;
			return "UnSupportedIdentifier";
		}
	}

  setData(key, data){
		return storage.save({key, data});
  }

  async getData(key){
    // returns promise
		try {
			return await storage.load({key});
		} catch (error) {
			return "";
		}
  }
}

const _api = new Api();
export default _api;
