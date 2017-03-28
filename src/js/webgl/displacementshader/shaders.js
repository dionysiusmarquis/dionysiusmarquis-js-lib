import {UniformsUtils, Vector4} from 'three'

import VertexShader from './shader/Displacement.vert'
import FragmentShader from './shader/Displacement.frag'

const DisplacementShader = {
  uniforms: UniformsUtils.merge([
    {
      'tDiffuse': {type: 't', value: null},
      'tDisplacement': {type: 't', value: null},
      'scaleX': {type: 'f', value: -1},
      'scaleY': {type: 'f', value: -1},
      'offset': {type: 'f', value: -1},
      'color': {type: 'v4', value: new Vector4(0, 0, 0, 0)}
    }
  ]),
  vertexShader: VertexShader,
  fragmentShader: FragmentShader
}

export {DisplacementShader}
