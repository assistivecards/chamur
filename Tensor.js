import * as Permissions from "expo-permissions";
import React from "react";

import { LoadingView } from "./components/LoadingView";
import { ModelView } from "./components/ModelView";
import { useTensorFlowLoaded } from "./components/useTensorFlow";
import API from './api';

export default function Tensor({gameOver}) {
  const isLoaded = useTensorFlowLoaded();
  const [status] = Permissions.usePermissions(Permissions.CAMERA, {
    ask: true,
  });
  if (!(status || {}).granted) {
    return <LoadingView>{API.t("camera_permission")}</LoadingView>;
  }
  if (!isLoaded) {
    return <LoadingView>{API.t("camera_loading")}</LoadingView>;
  }

  return <ModelView gameOver={gameOver}/>;
}
