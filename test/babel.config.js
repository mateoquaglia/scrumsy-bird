module.exports = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-flow',
      "@babel/preset-typescript"
    ],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
    plugins: [
      'babel-plugin-styled-components',
      '@babel/plugin-proposal-class-properties',
    ]
  }
