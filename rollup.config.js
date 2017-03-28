import eslint from 'rollup-plugin-eslint'

function glsl () {
  return {
    transform (code, id) {
      if (!/\.glsl$|\.vert$|\.frag$/.test(id)) {
        return
      }

      return {
        code: 'export default ' + JSON.stringify(
          code
            .replace(/[ \t]*\/\/.*\n/g, '')
            .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '')
            .replace(/\n{2,}/g, '\n')
        ) + ';',
        map: {mappings: ''}
      }
    }
  }
}

export default {
  entry: 'src/js/index.js',
  plugins: [
    eslint({
      include: ['src/js/**/*.js']
    }),
    glsl()
  ],
  sourceMap: process.env.NODE_ENV === 'development' ? 'inline' : false,
  targets: [
    {
      format: 'umd',
      moduleName: 'dm',
      dest: 'build/dionysiusmarquis.js'
    },
    {
      format: 'es',
      dest: 'build/dionysiusmarquis.module.js'
    }
  ],
  external: [
    'three'
  ]
};
