declare module "react-native-mathjax" {
  import type React from "react";
  import type { StyleProp, ViewStyle } from "react-native";

  export type MathJaxProps = {
    html: string;
    style?: StyleProp<ViewStyle>;
    mathJaxOptions?: Record<string, unknown>;
  };

  const MathJax: React.ComponentType<MathJaxProps>;

  export default MathJax;
}
