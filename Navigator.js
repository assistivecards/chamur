import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator, CardStyleInterpolators  } from 'react-navigation-stack';

import { Easing, Animated } from 'react-native';

import Home from './layouts/Home'
import ExampleStack from './layouts/ExampleStack'
import ExampleModalStack from './layouts/ExampleModalStack'


import Settings from './layouts/Settings/Settings'
import Account from './layouts/Settings/Account'
import Language from './layouts/Settings/Language'
import Voice from './layouts/Settings/Voice'
import Notification from './layouts/Settings/Notification'
import Browser from './layouts/Settings/Browser'
import Remove from './layouts/Settings/Remove'
import Avatar from './layouts/Settings/Avatar'
import Subscription from './layouts/Settings/Subscription'
import Premium from './layouts/Settings/Premium'
import Legal from './layouts/Settings/Legal'
import Accessibility from './layouts/Settings/Accessibility'
import Accent from './layouts/Settings/Accent'
import Apps from './layouts/Settings/Apps'

const AppNavigator = createStackNavigator({
    Home:         { screen: Home          },
    ExampleStack: { screen: ExampleStack  },
    // Your stack Navigators here


    Settings:     { screen: Settings      },
    Account:      { screen: Account       },
    Browser:      { screen: Browser       },
    Language:     { screen: Language      },
    Voice:        { screen: Voice         },
    Notification: { screen: Notification  },
    Remove:       { screen: Remove        },
    Avatar:       { screen: Avatar        },
    Subscription: { screen: Subscription  },
    Premium:      { screen: Premium       },
    Legal:        { screen: Legal         },
    Accessibility:{ screen: Accessibility },
    Accent:       { screen: Accent        },
    Apps:         { screen: Apps          },

  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    }
  }
);
function forVertical(props) {
  const { layout, position, scene } = props;

  const index = scene.index;
  const height = layout.initHeight;

  const translateX = 0;
  const translateY = position.interpolate({
    inputRange: ([index - 1, index, index + 1]: Array<number>),
    outputRange: ([height, 0, 0]: Array<number>)
  });
  const opacity = position.interpolate({
    inputRange: ([index - 1, index, index + 1]: Array<number>),
    outputRange: [0, 1, 0]
  });

  return {
    transform: [{ translateX }, { translateX }],
    opacity
  };
}
const RootNavigator = createAppContainer(AppNavigator);
const ModelNavigator = createStackNavigator({
    Root:               { screen: RootNavigator        },
    ExampleModalStack:  { screen: ExampleModalStack    }
    // Your modal stack Navigators here



  },
  {
    mode: 'modal',
    headerMode: 'none',
    gesturesEnabled: false,
    defaultNavigationOptions: {
      cardStyleInterpolator: Platform.OS == "android" ? CardStyleInterpolators.forFadeFromBottomAndroid : CardStyleInterpolators.forVerticalIOS,
      headerVisible: false,
      cardStyle: {
        backgroundColor: 'transparent',
        opacity: 1,
      },
    }
  }
);

export default createAppContainer(ModelNavigator);
