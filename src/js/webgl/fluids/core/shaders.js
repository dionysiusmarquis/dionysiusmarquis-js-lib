import {UniformsUtils, Vector2, Vector3, Vector4} from 'three'

import AdvectVertexShader from './../shaders/Advect.vert'
import AdvectFragmentShader from './../shaders/Advect.frag'
import BoundaryVertexShader from './../shaders/Boundary.vert'
import BoundaryFragmentShader from './../shaders/Boundary.frag'
import BuoyancyVertexShader from './../shaders/Buoyancy.vert'
import BuoyancyFragmentShader from './../shaders/Buoyancy.frag'
import ComputeDivergenceVertexShader from './../shaders/ComputeDivergence.vert'
import ComputeDivergenceFragmentShader from './../shaders/ComputeDivergence.frag'
import JacobiVertexShader from './../shaders/Jacobi.vert'
import JacobiFragmentShader from './../shaders/Jacobi.frag'
import SplatVertexShader from './../shaders/Splat.vert'
import SplatFragmentShader from './../shaders/Splat.frag'
import SubtractGradientVertexShader from './../shaders/SubtractGradient.vert'
import SubtractGradientFragmentShader from './../shaders/SubtractGradient.frag'
import VisualizeVertexShader from './../shaders/Visualize.vert'
import VisualizeFragmentShader from './../shaders/Visualize.frag'

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
  vertexShader: AdvectVertexShader,
  fragmentShader: AdvectFragmentShader
}

const BoundaryShader = {
  uniforms: UniformsUtils.merge([
    {
      'Color': {type: 'v4', value: new Vector4(0, 0, 0, 0)},
      'Boundary': {type: 'fv1', value: []},
      'InverseSize': {type: 'v2', value: new Vector2(0, 0)}
    }
  ]),
  vertexShader: BoundaryVertexShader,
  fragmentShader: BoundaryFragmentShader
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
  vertexShader: BuoyancyVertexShader,
  fragmentShader: BuoyancyFragmentShader
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
  vertexShader: ComputeDivergenceVertexShader,
  fragmentShader: ComputeDivergenceFragmentShader
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
  vertexShader: JacobiVertexShader,
  fragmentShader: JacobiFragmentShader
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
  vertexShader: SplatVertexShader,
  fragmentShader: SplatFragmentShader
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
  vertexShader: SubtractGradientVertexShader,
  fragmentShader: SubtractGradientFragmentShader
}
const VisualizeShader = {
  uniforms: UniformsUtils.merge([
    {
      'Sampler': {type: 't', value: null},
      'FillColor': {type: 'v3', value: new Vector3(0, 0, 0)}
    }
  ]),
  vertexShader: VisualizeVertexShader,
  fragmentShader: VisualizeFragmentShader
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
