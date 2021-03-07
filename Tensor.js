import * as Permissions from "expo-permissions";
import React from "react";

import { LoadingView } from "./components/LoadingView";
import { ModelView } from "./components/ModelView";
import { useTensorFlowLoaded } from "./components/useTensorFlow";

export default function Tensor() {
  const isLoaded = useTensorFlowLoaded();
  const [status] = Permissions.usePermissions(Permissions.CAMERA, {
    ask: true,
  });
  if (!(status || {}).granted) {
    return <LoadingView>Camera permission is required to continue</LoadingView>;
  }
  if (!isLoaded) {
    return <LoadingView>Loading TensorFlow</LoadingView>;
  }

  return <ModelView />;
}
