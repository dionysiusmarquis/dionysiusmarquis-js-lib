import {UniformsUtils, Vector2} from 'three'
import glslify from 'glslify'

const SemShader = {
  uniforms: UniformsUtils.merge([
    {
      'tMatCap': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/Sem.vert'),
  fragmentShader: glslify('./shaders/Sem.frag')
}

const SemNormalShader = {
  uniforms: UniformsUtils.merge([
    {
      'time': {type: 'f', value: -1},
      'repeat': {type: 'v2', value: new Vector2(0, 0)},
      'useNormal': {type: 'f', value: -1},
      'useRim': {type: 'f', value: -1},
      'bump': {type: 'f', value: -1},
      'tNormal': {type: 't', value: null},
      'tMatCap': {type: 't', value: null},
      'noise': {type: 'f', value: -1},
      'rimPower': {type: 'f', value: -1},
      'useScreen': {type: 'f', value: -1},
      'normalScale': {type: 'f', value: -1},
      'normalRepeat': {type: 'f', value: -1}
    }
  ]),
  vertexShader: glslify('./shaders/SemNormal.vert'),
  fragmentShader: glslify('./shaders/SemNormal.frag')
}

const SemPhongShader = {
  uniforms: UniformsUtils.merge([
    {
      'tMatCap': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/SemPhong.vert'),
  fragmentShader: glslify('./shaders/SemPhong.frag')
}

export {
  SemShader,
  SemNormalShader,
  SemPhongShader
}
