import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { Camera } from "expo-camera";
import React from "react";
import { StyleSheet, useWindowDimensions, View, ActivityIndicator, Text } from "react-native";
import { LoadingView } from "./LoadingView";
import { PredictionList } from "./PredictionList";
import API from '../api';

import { useTensorFlowModel } from "./useTensorFlow";

const TensorCamera = cameraWithTensors(Camera);

export function ModelView({gameOver}) {
  const model = useTensorFlowModel(mobilenet);
  const [predictions, setPredictions] = React.useState([]);

  if (!model) {
    return(
      <View style={{flex: 1, backgroundColor: API.config.backgroundColor, justifyContent: "center", alignItems: "center"}}>
        <View style={{width: 60, height: 60, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderRadius: 30}}>
          <ActivityIndicator color={API.config.backgroundColor}/>
        </View>
        <Text style={[API.styles.b, {marginTop: 15, color: "#fff"}]}>{API.t("please_wait")}</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#63b582", justifyContent: "center" }}
    >
      <PredictionList predictions={predictions} gameOver={gameOver}/>
      <View style={{ borderRadius: 25, overflow: "hidden" }}>
        <ModelCamera model={model} setPredictions={setPredictions} />
      </View>
    </View>
  );
}

function ModelCamera({ model, setPredictions }) {
  const raf = React.useRef(null);
  const size = useWindowDimensions();

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const onReady = (images) => {
    const loop = () => {
      const nextImageTensor = images.next().value;

        model.classify(nextImageTensor).then(predictions => {
          setPredictions(predictions);
        });

      //raf.current = requestAnimationFrame(loop);
    };
    setInterval(() => {
      let batch = tf.tidy(() => loop());
      tf.dispose(batch);
    }, 1000);
  }

  return (
    <CustomTensorCamera
      width={size.width}
      style={styles.camera}
      type={Camera.Constants.Type.back}
      onReady={onReady}
      autorender
    />
  )
}

const textureSize = { width: 1080, height: 1920 };

function CustomTensorCamera({ style, width, ...props }) {
  const sizeStyle = React.useMemo(() => {
    const ratio = width / textureSize.width;
    const cameraWidth = textureSize.width * ratio;
    const cameraHeight = textureSize.height * ratio;
    return {
      maxWidth: cameraWidth,
      minWidth: cameraWidth,
      maxHeight: cameraHeight,
      minHeight: cameraHeight,
    };
  }, [width]);

  return (
    <TensorCamera
      {...props}
      style={[style, sizeStyle]}
      cameraTextureWidth={textureSize.width}
      cameraTextureHeight={textureSize.height}
      resizeWidth={152}
      resizeHeight={200}
      resizeDepth={3}
    />
  );
}

const styles = StyleSheet.create({
  camera: {
    zIndex: 0,
  },
});
