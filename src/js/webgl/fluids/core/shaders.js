import {UniformsUtils, Vector2, Vector3, Vector4} from 'three'
import glslify from 'glslify'

const AdvectShader = {
  uniforms: UniformsUtils.merge([
    {
      'VelocityTexture': {type: 't', value: null},
      'SourceTexture': {type: 't', value: null},
      'Obstacles': {type: 't', value: null},
      'InverseSize': {type: 'v2', value: new Vector2(0, 0)},
      'TimeStep': {type: 'f', value: -1},
      'Dissipation': {type: 'f', value: -1},
      'ObstacleThreshold': {type: 'f', value: -1}
    }
  ]),
  vertexShader: glslify('./../shaders/Advect.vert'),
  fragmentShader: glslify('./../shaders/Advect.frag')
}

const BoundaryShader = {
  uniforms: UniformsUtils.merge([
    {
      'Color': {type: 'v4', value: new Vector4(0, 0, 0, 0)},
      'Boundary': {type: 'fv1', value: []},
      'InverseSize': {type: 'v2', value: new Vector2(0, 0)}
    }
  ]),
  vertexShader: glslify('./../shaders/Boundary.vert'),
  fragmentShader: glslify('./../shaders/Boundary.frag')
}

const BuoyancyShader = {
  uniforms: UniformsUtils.merge([
    {
      'Velocity': {type: 't', value: null},
      'Temperature': {type: 't', value: null},
      'Density': {type: 't', value: null},
      'AmbientTemperature': {type: 'f', value: -1},
      'TimeStep': {type: 'f', value: -1},
      'Sigma': {type: 'f', value: -1},
      'Kappa': {type: 'f', value: -1}
    }
  ]),
  vertexShader: glslify('./../shaders/Buoyancy.vert'),
  fragmentShader: glslify('./../shaders/Buoyancy.frag')
}

const ComputeDivergenceShader = {
  uniforms: UniformsUtils.merge([
    {
      'Velocity': {type: 't', value: null},
      'Obstacles': {type: 't', value: null},
      'InverseSize': {type: 'v2', value: new Vector2(0, 0)},
      'HalfInverseCellSize': {type: 'f', value: -1},
      'ObstacleThreshold': {type: 'f', value: -1}
    }
  ]),
  vertexShader: glslify('./../shaders/ComputeDivergence.vert'),
  fragmentShader: glslify('./../shaders/ComputeDivergence.frag')
}

const JacobiShader = {
  uniforms: UniformsUtils.merge([
    {
      'Pressure': {type: 't', value: null},
      'Divergence': {type: 't', value: null},
      'Obstacles': {type: 't', value: null},
      'InverseSize': {type: 'v2', value: new Vector2(0, 0)},
      'Alpha': {type: 'f', value: -1},
      'InverseBeta': {type: 'f', value: -1},
      'ObstacleThreshold': {type: 'f', value: -1}
    }
  ]),
  vertexShader: glslify('./../shaders/Jacobi.vert'),
  fragmentShader: glslify('./../shaders/Jacobi.frag')
}
const SplatShader = {
  uniforms: UniformsUtils.merge([
    {
      'Sampler': {type: 't', value: null},
      'Point': {type: 'v2', value: new Vector2(0, 0)},
      'Radius': {type: 'f', value: -1},
      'FillColor': {type: 'v4', value: new Vector4(0, 0, 0, 0)}
    }
  ]),
  vertexShader: glslify('./../shaders/Splat.vert'),
  fragmentShader: glslify('./../shaders/Splat.frag')
}

const SubtractGradientShader = {
  uniforms: UniformsUtils.merge([
    {
      'Velocity': {type: 't', value: null},
      'Pressure': {type: 't', value: null},
      'Obstacles': {type: 't', value: null},
      'InverseSize': {type: 'v2', value: new Vector2(0, 0)},
      'GradientScale': {type: 'f', value: -1},
      'ObstacleThreshold': {type: 'f', value: -1}
    }
  ]),
  vertexShader: glslify('./../shaders/SubtractGradient.vert'),
  fragmentShader: glslify('./../shaders/SubtractGradient.frag')
}
const VisualizeShader = {
  uniforms: UniformsUtils.merge([
    {
      'Sampler': {type: 't', value: null},
      'FillColor': {type: 'v3', value: new Vector3(0, 0, 0)}
    }
  ]),
  vertexShader: glslify('./../shaders/Visualize.vert'),
  fragmentShader: glslify('./../shaders/Visualize.frag')
}

export {
  AdvectShader,
  BoundaryShader,
  BuoyancyShader,
  ComputeDivergenceShader,
  JacobiShader,
  SplatShader,
  SubtractGradientShader,
  VisualizeShader
}
