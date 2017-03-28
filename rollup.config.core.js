import eslint from 'rollup-plugin-eslint'

export default {
  entry: 'core.js',
  plugins: [
    eslint({
      include: ['src/js/**/*.js']
    })
  ],
  sourceMap: process.env.NODE_ENV === 'development' ? 'inline' : false,
  targets: [
    {
      format: 'umd',
      moduleName: 'dm',
      dest: 'build/dionysiusmarquis.core.js'
    }
  ]
};
