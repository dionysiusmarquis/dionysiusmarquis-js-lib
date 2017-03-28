import {UniformsUtils, Vector2, Vector3} from 'three'

import VertexShader from './shader/BezierModifier.vert'
import FragmentShader from './shader/BezierModifier.frag'

const BezierModifierShader = {
  uniforms: UniformsUtils.merge([
    {
      'size': {type: 'v2', value: new Vector2(0, 0)},
      'center': {type: 'v3', value: new Vector3(0, 0, 0)},
      'respectBounds': {type: 'i', value: 0},
      'anchorTL': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlTLH': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlTLV': {type: 'v3', value: new Vector3(0, 0, 0)},
      'anchorTR': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlTRH': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlTRV': {type: 'v3', value: new Vector3(0, 0, 0)},
      'anchorBL': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlBLH': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlBLV': {type: 'v3', value: new Vector3(0, 0, 0)},
      'anchorBR': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlBRH': {type: 'v3', value: new Vector3(0, 0, 0)},
      'controlBRV': {type: 'v3', value: new Vector3(0, 0, 0)},
      'debugMode': {type: 'i', value: 0},
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: VertexShader,
  fragmentShader: FragmentShader
}

export {BezierModifierShader}
