import {ShaderMaterial, Vector3, Vector4} from 'three'

import {
  AdvectShader,
  BoundaryShader,
  BuoyancyShader,
  ComputeDivergenceShader,
  JacobiShader,
  SplatShader,
  SubtractGradientShader,
  VisualizeShader
} from './shaders'

import {VignetteShader} from './../../shaderlib/shaders'

function Advect (settings, textures) {
  ShaderMaterial.call(this, AdvectShader)

  this.update = function (settings, textures) {
    this.uniforms.VelocityTexture.value = textures.velocity.texture
    this.uniforms.SourceTexture.value = textures.velocity.texture
    this.uniforms.Obstacles.value = textures.obstacles.texture
    this.uniforms.InverseSize.value = settings.inverseSize
    this.uniforms.TimeStep.value = settings.timeStep
    this.uniforms.Dissipation.value = settings.velocityDissipation
    this.uniforms.ObstacleThreshold.value = settings.obstacleThreshold
  }

  this.update(settings, textures)
}
Advect.prototype = Object.create(ShaderMaterial.prototype)

function Buoyancy (settings, textures) {
  ShaderMaterial.call(this, BuoyancyShader)

  this.update = function (settings, textures) {
    this.uniforms.Velocity.value = textures.velocity.texture
    this.uniforms.Temperature.value = textures.temperature.texture
    this.uniforms.Density.value = textures.density.texture
    this.uniforms.AmbientTemperature.value = settings.ambientTemperature
    this.uniforms.TimeStep.value = settings.timeStep
    this.uniforms.Sigma.value = settings.smokeBuoyancy
    this.uniforms.Kappa.value = settings.smokeWeight
  }

  this.update(settings, textures)
}
Buoyancy.prototype = Object.create(ShaderMaterial.prototype)

function ApplyImpulse (settings, textures) {
  ShaderMaterial.call(this, SplatShader)

  this.update = function (settings, textures) {
    this.uniforms.Sampler.value = textures.density.texture
    this.uniforms.Point.value = settings.circleImpulsePosition
    this.uniforms.Radius.value = settings.splatRadius
    this.uniforms.FillColor.value = settings.impulseTemperature
  }

  this.update(settings, textures)
}
ApplyImpulse.prototype = Object.create(ShaderMaterial.prototype)

function ComputeDivergence (settings, textures) {
  ShaderMaterial.call(this, ComputeDivergenceShader)

  this.update = function (settings, textures) {
    this.uniforms.Velocity.value = textures.velocity.texture
    this.uniforms.Obstacles.value = textures.obstacles.texture
    this.uniforms.InverseSize.value = settings.inverseSize
    this.uniforms.HalfInverseCellSize.value = 0.5 / settings.cellSize
    this.uniforms.ObstacleThreshold.value = settings.obstacleThreshold
  }

  this.update(settings, textures)
}
ComputeDivergence.prototype = Object.create(ShaderMaterial.prototype)

function Jacobi (settings, textures) {
  ShaderMaterial.call(this, JacobiShader)

  this.update = function (settings, textures) {
    this.uniforms.Pressure.value = textures.pressure.texture
    this.uniforms.Divergence.value = textures.divergence.texture
    this.uniforms.Obstacles.value = textures.obstacles.texture
    this.uniforms.InverseSize.value = settings.inverseSize
    this.uniforms.Alpha.value = -settings.cellSize * settings.cellSize
    this.uniforms.InverseBeta.value = 0.25
    this.uniforms.ObstacleThreshold.value = settings.obstacleThreshold
  }

  this.update(settings, textures)
}
Jacobi.prototype = Object.create(ShaderMaterial.prototype)

function SubtractGradient (settings, textures) {
  ShaderMaterial.call(this, SubtractGradientShader)

  this.update = function (settings, textures) {
    this.uniforms.Velocity.value = textures.velocity.texture
    this.uniforms.Pressure.value = textures.pressure.texture
    this.uniforms.Obstacles.value = textures.obstacles.texture
    this.uniforms.InverseSize.value = settings.inverseSize
    this.uniforms.GradientScale.value = settings.gradientScale
    this.uniforms.ObstacleThreshold.value = settings.obstacleThreshold
  }

  this.update(settings, textures)
}
SubtractGradient.prototype = Object.create(ShaderMaterial.prototype)

function Boundary (settings, textures) {
  ShaderMaterial.call(this, BoundaryShader)

  this.update = function (settings, textures) {
    // this.uniforms.Sampler.value = textures.obstacles.texture;
    this.uniforms.Color.value = new Vector4(0, 0, 0, 1)
    this.uniforms.Boundary.value = [settings.boundaryTop, settings.boundaryRight, settings.boundaryBottom, settings.boundaryLeft]
    this.uniforms.InverseSize.value = settings.inverseSize
  }

  this.update(settings, textures)
}
Boundary.prototype = Object.create(ShaderMaterial.prototype)

function Vignette (settings, textures) {
  ShaderMaterial.call(this, VignetteShader)

  this.update = function (settings, textures) {
    this.uniforms.tDiffuse.value = textures.density.texture
    this.uniforms.size.value = settings.vignetteSize
    this.uniforms.softness.value = settings.vignetteSoftness
    this.uniforms.scale.value = settings.vignetteScale
    this.uniforms.offset.value = settings.vignetteOffset
    this.uniforms.debug.value = settings.vignetteDebug
  }

  this.update(settings, textures)
}
Vignette.prototype = Object.create(ShaderMaterial.prototype)

function Visualize (settings, textures) {
  ShaderMaterial.call(this, VisualizeShader)

  this.update = function (settings, textures) {
    this.uniforms.Sampler.value = textures.density.texture
    this.uniforms.FillColor.value = new Vector3(1.0, 1.0, 1.0)
  }

  this.update(settings, textures)
}
Visualize.prototype = Object.create(ShaderMaterial.prototype)

export {
  Advect,
  Buoyancy,
  ApplyImpulse,
  ComputeDivergence,
  Jacobi,
  SubtractGradient,
  Boundary,
  Vignette,
  Visualize
}
