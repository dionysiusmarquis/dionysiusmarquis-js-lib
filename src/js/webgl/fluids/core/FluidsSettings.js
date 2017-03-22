import {HalfFloatType, LinearFilter, RGBAFormat, Vector2, Vector4} from 'three'

function FluidsSettings () {
  this.fps = -1
  this.sampling = 1
  this.cellSize = 1.25
  this.width = 500
  this.height = 500
  this.originWidth = 500
  this.originHeight = 500
  this.gridWidth = 500 / 2
  this.gridHeight = 500 / 2
  this.boundaryTop = -1
  this.boundaryRight = -1
  this.boundaryBottom = -1
  this.boundaryLeft = -1
  this.obstacleThreshold = 0.001

  this.enableVignette = false
  this.vignetteSize = 1.0
  this.vignetteSoftness = 1.0
  this.vignetteScale = new Vector2(1.0, 1.0)
  this.vignetteOffset = new Vector2(0.0, 0.0)
  this.vignetteDebug = false

  this.ambientTemperature = 0.0

  this.blendImpulse = true
  this.impulseTemperature = new Vector4(14.0, 14.0, 14.0, 1.0)
  this.impulseDensity = new Vector4(1.0, 1.0, 1.0, 1.0)
  this.impulseDensityColor = [255, 255, 255]

  // this.impulseTemperature = new Vector3(145.0, 145.0, 145.0)
  // this.impulseDensity = new Vector3(45.0, 45.0, 45.0)
  this.numJacobiIterations = 15
  this.timeStep = 0.125
  this.smokeBuoyancy = 1.0
  this.invertBuoyancy = false
  this.smokeWeight = 0.005
  this.gradientScale = 1.125 / this.cellSize
  this.temperatureDissipation = 0.99
  this.velocityDissipation = 0.99
  this.densityDissipation = 0.99

  this.circleImpulseRadius = 20
  this.circleImpulsePosition = new Vector2(this.width / 2, this.splatRadius)
  this.circleImpulseTemperature = null
  this.circleImpulseDensity = null

  this.inverseSize = new Vector2(1 / this.width, 1 / this.height)

  this.linearFloatParams = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    // wrapS: RenderTargetWrapping,
    // wrapT: RenderTargetWrapping,
    format: RGBAFormat,
    // mapping: UVMapping,
    // type: FloatType
    type: HalfFloatType
  }

  this.setSize = function (width, height) {
    this.originWidth = width
    this.originHeight = height

    width *= this.sampling
    height *= this.sampling

    width = Math.round(width)
    height = Math.round(height)

    this.width = width
    this.height = height
    this.gridWidth = Math.round(width / 2)
    this.gridHeight = Math.round(height / 2)

    this.circleImpulsePosition.x = width / 2
    this.inverseSize.x = 1 / width
    this.inverseSize.y = 1 / height
    // console.log(this);
  }

  this.setSampling = function (sampling) {
    this.sampling = sampling
    this.setSize(this.originWidth, this.originHeight)
  }
}

export default FluidsSettings
