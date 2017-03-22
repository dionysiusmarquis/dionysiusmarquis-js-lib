import {UniformsUtils, Vector2, Vector4} from 'three'
import glslify from 'glslify'

const AlphaBlendShader = {
  uniforms: UniformsUtils.merge([
    {
      'Sampler': {type: 't', value: null},
      'Sampler2': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/AlphaBlend.vert'),
  fragmentShader: glslify('./shaders/AlphaBlend.frag')
}

const ColorShader = {
  uniforms: UniformsUtils.merge([
    {
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/Color.vert'),
  fragmentShader: glslify('./shaders/Color.frag')
}

const NormalBlendShader = {
  uniforms: UniformsUtils.merge([
    {
      'Sampler': {type: 't', value: null},
      'Sampler2': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/NormalBlend.vert'),
  fragmentShader: glslify('./shaders/NormalBlend.frag')
}

const OverrideColorShader = {
  uniforms: UniformsUtils.merge([
    {
      'color': {type: 'v4', value: new Vector4(0, 0, 0, 0)},
      'premultiplied': {type: 'i', value: 0},
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/OverrideColor.vert'),
  fragmentShader: glslify('./shaders/OverrideColor.frag')
}

const PremultiplyAlphaShader = {
  uniforms: UniformsUtils.merge([
    {
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/PremultiplyAlpha.vert'),
  fragmentShader: glslify('./shaders/PremultiplyAlpha.frag')
}

const UnpremultiplyAlphaShader = {
  uniforms: UniformsUtils.merge([
    {
      'tDiffuse': {type: 't', value: null}
    }
  ]),
  vertexShader: glslify('./shaders/UnpremultiplyAlpha.vert'),
  fragmentShader: glslify('./shaders/UnpremultiplyAlpha.frag')
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
  vertexShader: glslify('./shaders/Vignette.vert'),
  fragmentShader: glslify('./shaders/Vignette.frag')
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
