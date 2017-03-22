import {ClampToEdgeWrapping, DoubleSide, ShaderMaterial, SmoothShading, UniformsUtils, Vector2} from 'three'

import {SemNormalShader, SemPhongShader, SemShader} from './shaders'

function SemShaderMaterial (materialCapture, usePhong) {
  ShaderMaterial.call(this, usePhong ? SemPhongShader : SemShader)
  this.uniforms = UniformsUtils.clone(this.uniforms)

  this.uniforms.tMatCap.value = materialCapture
}
SemShaderMaterial.prototype = Object.create(ShaderMaterial.prototype)

function SemNormalShaderMaterial (materialCapture, normalMap) {
  ShaderMaterial.call(this, SemNormalShader)
  this.uniforms = UniformsUtils.clone(this.uniforms)

  this.uniforms.tNormal.value = normalMap
  this.uniforms.tMatCap.value = materialCapture
  this.uniforms.time.value = 0
  this.uniforms.bump.value = 0
  this.uniforms.noise.value = 0.04
  this.uniforms.repeat.value = new Vector2(1, 1)
  this.uniforms.useNormal.value = 0
  this.uniforms.useRim.value = 0
  this.uniforms.rimPower.value = 2
  this.uniforms.useScreen.value = 0
  this.uniforms.normalScale.value = 0.5
  this.uniforms.normalRepeat.value = 1

  this.wrapping = ClampToEdgeWrapping
  this.shading = SmoothShading
  this.side = DoubleSide
}
SemNormalShaderMaterial.prototype = Object.create(ShaderMaterial.prototype)

export {
  SemShaderMaterial,
  SemNormalShaderMaterial
}
