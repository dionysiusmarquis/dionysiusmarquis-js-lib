import {ShaderMaterial, UniformsUtils, Vector4} from 'three'

import {DisplacementShader} from './shaders'

function DisplacementShaderMaterial (texture, displacementMap, componentX, componentY, scaleX, scaleY, mode, color, offset) {
  ShaderMaterial.call(this, DisplacementShader)
  this.uniforms = UniformsUtils.clone(this.uniforms)

  this.uniforms.tDiffuse.value = texture
  this.uniforms.tDisplacement.value = displacementMap

  this.uniforms.scaleX.value = scaleX || 0.01
  this.uniforms.scaleY.value = scaleY || 0.01
  this.uniforms.color.value = color || new Vector4(0.0, 0.0, 0.0, 1.0)
  this.uniforms.offset.value = offset || 0.5

  this.setMode = function (mode) {
    this.defines = {COMPONENT_X: this.defines.COMPONENT_X, COMPONENT_Y: this.defines.COMPONENT_Y}
    this.defines[mode] = ''
  }

  this.setComponentX = function (componentX) {
    this.defines.COMPONENT_X = componentX
  }

  this.setComponentY = function (componentY) {
    this.defines.COMPONENT_Y = componentY
  }

  this.setComponentX(componentX || DisplacementShaderMaterial.CHANNEL_RED)
  this.setComponentY(componentY || DisplacementShaderMaterial.CHANNEL_RED)
  this.setMode(mode || DisplacementShaderMaterial.MODE_WRAP)
}
DisplacementShaderMaterial.prototype = Object.create(ShaderMaterial.prototype)

DisplacementShaderMaterial.MODE_WRAP = 'MODE_WRAP'
DisplacementShaderMaterial.MODE_CLAMP = 'MODE_CLAMP'
DisplacementShaderMaterial.MODE_IGNORE = 'MODE_IGNORE'
DisplacementShaderMaterial.MODE_COLOR = 'MODE_COLOR'

DisplacementShaderMaterial.CHANNEL_RED = 0
DisplacementShaderMaterial.CHANNEL_GREEN = 1
DisplacementShaderMaterial.CHANNEL_BLUE = 2
DisplacementShaderMaterial.CHANNEL_ALPHA = 3

export default DisplacementShaderMaterial
