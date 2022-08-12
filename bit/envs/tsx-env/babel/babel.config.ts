import '@babel/preset-env';
import '@babel/preset-react';
import '@babel/preset-typescript';
import '@babel/plugin-proposal-class-properties';


const presets = [
  [require.resolve('@babel/preset-env'),{
    modules:false,
  }],
  require.resolve('@babel/preset-react'),
  require.resolve('@babel/preset-typescript'),
];
const plugins = [require.resolve('@babel/plugin-proposal-class-properties')];

export const babelConfig = {
  presets,
  plugins,
  sourceMaps: true,
};
