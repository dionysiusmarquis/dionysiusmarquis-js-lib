import {UniformsUtils, Vector2} from 'three'

import SemVertexShader from './shaders/Sem.vert'
import SemFragmentShader from './shaders/Sem.frag'
import SemNormalVertexShader from './shaders/SemNormal.vert'
import SemNormalFragmentShader from './shaders/SemNormal.frag'
import SemPhongVertexShader from './shaders/SemPhong.vert'
import SemPhongFragmentShader from './shaders/SemPhong.frag'

const SemShader = {
  uniforms: UniformsUtils.merge([
    {
      'tMatCap': {type: 't', value: null}
    }
  ]),
  vertexShader: SemVertexShader,
  fragmentShader: SemFragmentShader
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
  vertexShader: SemNormalVertexShader,
  fragmentShader: SemNormalFragmentShader
}

const SemPhongShader = {
  uniforms: UniformsUtils.merge([
    {
      'tMatCap': {type: 't', value: null}
    }
  ]),
  vertexShader: SemPhongVertexShader,
  fragmentShader: SemPhongFragmentShader
}

export {
  SemShader,
  SemNormalShader,
  SemPhongShader
}
