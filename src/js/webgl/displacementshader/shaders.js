import {UniformsUtils, Vector4} from 'three'
import glslify from 'glslify'

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
  vertexShader: glslify('./shaders/Displacement.vert'),
  fragmentShader: glslify('./shaders/Displacement.frag')
}

export {DisplacementShader}
