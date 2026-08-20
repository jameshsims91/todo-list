import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

export default merge(common, {
  mode: "production",
  devtool: "source-map",
  optimization: {
    minimizer: [
      "...",
      new CssMinimizerPlugin(),
    ],
  },
});
