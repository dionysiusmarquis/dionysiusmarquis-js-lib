import {UniformsUtils, Vector2, Vector4} from 'three'

import AlphaBlendVertexShader from './shaders/AlphaBlend.vert'
import AlphaBlendFragmentShader from './shaders/AlphaBlend.frag'
import ColorVertexShader from './shaders/Color.vert'
import ColorFragmentShader from './shaders/Color.frag'
import NormalBlendVertexShader from './shaders/NormalBlend.vert'
import NormalBlendFragmentShader from './shaders/NormalBlend.frag'
import OverrideColorVertexShader from './shaders/OverrideColor.vert'
import OverrideColorFragmentShader from './shaders/OverrideColor.frag'
import PremultiplyAlphaVertexShader from './shaders/PremultiplyAlpha.vert'
import PremultiplyAlphaFragmentShader from './shaders/PremultiplyAlpha.frag'
import UnpremultiplyAlphaVertexShader from './shaders/UnpremultiplyAlpha.vert'
import UnpremultiplyAlphaFragmentShader from './shaders/UnpremultiplyAlpha.frag'
import VignetteVertexShader from './shaders/Vignette.vert'
import VignetteFragmentShader from './shaders/Vignette.frag'

const AlphaBlendShader = {
  uniforms: UniformsUtils.merge([
    {
      'Sampler': {type: 't', value: null},
      'Sampler2': {type: 't', value: null}
    }
  ]),
  vertexShader: AlphaBlendVertexShader,
  fragmentShader: AlphaBlendFragmentShader
}

const ColorShader = {
  uniforms: UniformsUtils.merge([
    {
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: ColorVertexShader,
  fragmentShader: ColorFragmentShader
}

const NormalBlendShader = {
  uniforms: UniformsUtils.merge([
    {
      'Sampler': {type: 't', value: null},
      'Sampler2': {type: 't', value: null}
    }
  ]),
  vertexShader: NormalBlendVertexShader,
  fragmentShader: NormalBlendFragmentShader
}

const OverrideColorShader = {
  uniforms: UniformsUtils.merge([
    {
      'color': {type: 'v4', value: new Vector4(0, 0, 0, 0)},
      'premultiplied': {type: 'i', value: 0},
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: OverrideColorVertexShader,
  fragmentShader: OverrideColorFragmentShader
}

const PremultiplyAlphaShader = {
  uniforms: UniformsUtils.merge([
    {
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: PremultiplyAlphaVertexShader,
  fragmentShader: PremultiplyAlphaFragmentShader
}

const UnpremultiplyAlphaShader = {
  uniforms: UniformsUtils.merge([
    {
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: UnpremultiplyAlphaVertexShader,
  fragmentShader: UnpremultiplyAlphaFragmentShader
}

const VignetteShader = {
  uniforms: UniformsUtils.merge([
    {
      'size': {type: 'f', value: -1},
      'softness': {type: 'f', value: -1},
      'scale': {type: 'v2', value: new Vector2(0, 0)},
      'offset': {type: 'v2', value: new Vector2(0, 0)},
      'debug': {type: 'i', value: 0},
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: VignetteVertexShader,
  fragmentShader: VignetteFragmentShader
}

export {
  AlphaBlendShader,
  ColorShader,
  NormalBlendShader,
  OverrideColorShader,
  PremultiplyAlphaShader,
  UnpremultiplyAlphaShader,
  VignetteShader
}
