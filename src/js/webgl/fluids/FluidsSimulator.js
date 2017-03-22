import {
  AddEquation,
  AdditiveBlending,
  CustomBlending,
  Mesh,
  MeshBasicMaterial,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  SrcAlphaFactor,
  Vector4,
  WebGLRenderer
} from 'three'

import Detector from 'three/examples/js/Detector'

import FluidsSettings from './core/FluidsSettings'
import {FluidsTextures} from './core/textures'

import {
  Advect,
  ApplyImpulse,
  Boundary,
  Buoyancy,
  ComputeDivergence,
  Jacobi,
  SubtractGradient,
  Vignette
} from './core/shadermaterials'

import {OverrideColorShader, UnpremultiplyAlphaShader} from './../shaderlib/shaders'

function FluidsSimulator (alpha) {
  WebGLRenderer.call(this, {antialiasing: false, alpha: true, premultipliedAlpha: true})
  let self = this

  let settings = this.settings = new FluidsSettings()

  let lastSimulated = new Date().getTime()

  let scene
  let impulseDensityScene
  let impulseTemperatureScene
  let obstaclesScene
  let camera
  let renderGeometry
  let renderMesh
  let densityMesh
  let temperatureMesh

  let renderMaterial

  let textures
  let shaderMaterials

  let advectShaderMaterial
  let buoyancyShaderMaterial
  let applyImpulseShaderMaterial
  let computeDivergenceShaderMaterial
  let jacobiShaderMaterial
  let subtractGradientShaderMaterial
  // let visualizeShaderMaterial
  let boundaryShaderMaterial
  let vignetteShaderMaterial
  let overrideColorShaderMaterial
  // let premultiplyAlphaShaderMaterial
  let unpremultiplyAlphaShaderMaterial

  this.impulseObjects = []
  this.obstacleObjects = []

  // this.autoClear = false;
  // this.state.setBlending(CustomBlending, null, SrcAlphaFactor, OneMinusSrcAlphaFactor, null, OneFactor, OneFactor);

  this.applyCircleImpulse = false
  this.applyTextureImpulse = false

  this.autoClearImpulse = false
  this.autoClearObstacles = false

  this.isInitialized = false
  this.isSupported = Detector.webgl && this.supportsHalfFloatTextures()

  // this.isSupported = false;

  // this.setSize(width, height);

  function addObject (id, type, texture, x, y, width, height, overrideColor, asOverlay) {
    x = x ? x * settings.sampling : 0
    y = y ? -y * settings.sampling : 0
    width = width ? width * settings.sampling : texture.image.width * settings.sampling
    height = height ? height * settings.sampling : texture.image.height * settings.sampling

    let percWidth = width / settings.width
    let percHeight = height / settings.height
    let percX = x / settings.width * 2 + (percWidth - 1)
    let percY = y / settings.height * 2 + (1 - percHeight)

    // overrideColor = false;

    let material
    if (overrideColor) {
      material = overrideColorShaderMaterial.clone()
      material.uniforms.tDiffuse.value = texture
      material.uniforms.color.value = overrideColor
      if (settings.blendImpulse) {
        material.uniforms.premultiplied.value = 1
      } else {
        material.uniforms.premultiplied.value = 0
      }
    } else {
      if (settings.blendImpulse) {
        material = new MeshBasicMaterial()
        material.map = texture
      } else {
        material = unpremultiplyAlphaShaderMaterial.clone()
        material.uniforms.tDiffuse.value = texture
      }
    }

    material.transparent = true

    let mesh = new Mesh(renderGeometry, material)
    mesh.userData = id

    mesh.scale.set(percWidth, percHeight, 1)
    mesh.position.set(percX, percY, 0)

    let targetScene
    let renderTarget
    switch (type) {
      case 'impulsedensity':
        if (!asOverlay) {
          if (settings.blendImpulse) {
            material.blending = CustomBlending
            material.blendSrc = SrcAlphaFactor
            material.blendDst = OneMinusSrcAlphaFactor
            material.blendEquation = AddEquation
          }
        } else {
          mesh.renderOrder = 2
          material.blending = AdditiveBlending
        }
        targetScene = impulseDensityScene
        // renderTarget = textures.impulseDensity.texture;
        break
      case 'impulsetemperature':
        targetScene = impulseTemperatureScene
        // renderTarget = textures.impulseTemperature.texture;
        break
      case 'obstacle':
        targetScene = obstaclesScene
        renderTarget = textures.obstacles.texture
        break
      default:
        console.error('Wrong type specified.')
    }

    if (id) {
      let existingObject = self.getObject(id, targetScene)
      if (existingObject) {
        targetScene.remove(existingObject)
      }
    }

    targetScene.add(mesh)
    // targetScene.children.splice(-1, 1);
    // targetScene.children.unshift(mesh);

    // console.log(self.getObject("density", impulseDensityScene));

    if (renderTarget) {
      self.render(targetScene, camera, renderTarget)
    }

    return mesh
  }

  this.getObject = function (id, scene) {
    let i
    for (i = 0; i < scene.children.length; i++) {
      if (scene.children[i].userData === id) {
        return scene.children[i]
      }
    }
  }

  this.getObjectIndex = function (id, scene) {
    let i
    for (i = 0; i < scene.children.length; i++) {
      if (scene.children[i].userData === id) {
        return i
      }
    }
  }

  this.addCircleImpulse = function (radius, x, y, temperature, fillColor, asOverlay) {
    /* renderMesh.material = applyImpulseShaderMaterial

    x *= settings.sampling
    y *= settings.sampling
    y = settings.height - y

    let impulseTexture
    let temperatureTexture
    if (asOverlay) {
      impulseTexture = textures.impulseOverlay
      temperatureTexture = textures.impulseOverlayTemperature
    } else {
      impulseTexture = textures.impulse
      temperatureTexture = textures.impulseTemperature
    }

    applyImpulseShaderMaterial.uniforms.Sampler.value = impulseTexture.texture
    applyImpulseShaderMaterial.uniforms.Point.value = new Vector2(x, y)
    applyImpulseShaderMaterial.uniforms.Radius.value = radius ? radius * settings.sampling : 50 * settings.sampling
    applyImpulseShaderMaterial.uniforms.FillColor.value = fillColor || settings.impulseDensity

    this.render(scene, camera, impulseTexture.texture2)
    impulseTexture.swapTexture()

    applyImpulseShaderMaterial.uniforms.Sampler.value = temperatureTexture.texture
    applyImpulseShaderMaterial.uniforms.FillColor.value = temperature || settings.impulseTemperature

    this.render(scene, camera, temperatureTexture.texture2)
    temperatureTexture.swapTexture()

    applyImpulseShaderMaterial.uniforms.Point.value = settings.circleImpulsePosition
    applyImpulseShaderMaterial.uniforms.Radius.value = settings.circleImpulseRadius */
  }

  this.addBoundary = function () {
    // renderMesh.material = boundaryShaderMaterial;

    // boundaryShaderMaterial.uniforms.Sampler.value  = textures.obstacles.texture;
    // boundaryShaderMaterial.uniforms.Boundary.value  = [settings.boundaryTop, settings.boundaryRight, settings.boundaryBottom, settings.boundaryLeft];

    // this.render(scene, camera, textures.obstacles.texture2);
    // textures.obstacles.swapTexture();

    // advectShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
    // computeDivergenceShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
    // jacobiShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
    // subtractGradientShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;

    boundaryShaderMaterial.uniforms.Boundary.value = [settings.boundaryTop, settings.boundaryRight, settings.boundaryBottom, settings.boundaryLeft]

    let mesh = new Mesh(renderGeometry, boundaryShaderMaterial)
    mesh.userData = 'boundary'

    obstaclesScene.add(mesh)

    // this.render(obstaclesScene, camera, textures.obstacles.texture);
  }

  this.addObstacle = function (id, texture, x, y, width, height, overrideColor) {
    addObject(id, 'obstacle', texture, x, y, width, height, overrideColor)
  }

  this.addImpulse = function (id, texture, x, y, width, height, temperature, overrideColor) {
    addObject(id, 'impulsedensity', texture, x, y, width, height, overrideColor)
    addObject(id, 'impulsetemperature', texture, x, y, width, height, temperature || new Vector4(settings.impulseTemperature.x, settings.impulseTemperature.y, settings.impulseTemperature.z, 1.0))
    // console.log(id, impulseDensityScene.children.length);
  }

  this.addImpulseOverlay = function (id, texture, x, y, width, height, temperature, overrideColor) {
    addObject(id, 'impulsedensity', texture, x, y, width, height, overrideColor, true)
    addObject(id, 'impulsetemperature', texture, x, y, width, height, temperature || new Vector4(settings.impulseTemperature.x, settings.impulseTemperature.y, settings.impulseTemperature.z, 1.0), true)
    // console.log(impulseDensityScene.children.length);
  }

  // this.clearImpulse = function(overlay, keep) {
  this.clearImpulse = function (keep) {
    // return;

    keep = keep || []

    let i = 0
    let child
    while (impulseDensityScene.children.length > i) {
      child = impulseDensityScene.children[i]

      if (child.userData !== 'density' && keep.indexOf(child.userData) === -1) {
        impulseDensityScene.remove(child)
      } else {
        i++
      }
    }

    // console.log(impulseDensityScene.children.length);

    i = 0
    while (impulseTemperatureScene.children.length > i) {
      child = impulseTemperatureScene.children[i]

      if (child.userData !== 'temperature' && keep.indexOf(child.userData) === -1) {
        impulseTemperatureScene.remove(child)
      } else {
        i++
      }
    }

    // console.log(impulseDensityScene.children.length, keep.length + 1);
    // console.log(impulseTemperatureScene.children.length, keep.length + 1);
  }

  this.clearObstacles = function (keep) {
    // this.clearTarget(textures.obstacles.texture);

    keep = keep || []

    let i = 0
    let child
    while (obstaclesScene.children.length > i) {
      child = obstaclesScene.children[i]

      if (child.userData !== 'boundary' && keep.indexOf(child.userData) === -1) {
        obstaclesScene.remove(child)
      } else {
        i++
      }
    }

    // console.log(obstaclesScene.children.length);
    this.render(obstaclesScene, camera, textures.obstacles.texture)
  }

  this.init = function (width, height, setSize) {
    this.isInitialized = true

    // console.log(this.context.getSupportedExtensions());
    if (!this.isSupported) {
      return
    }

    width = width || this.domElement.width
    height = height || this.domElement.height
    settings.setSize(width, height)
    textures = new FluidsTextures(settings)

    scene = new Scene()
    impulseDensityScene = new Scene()
    impulseTemperatureScene = new Scene()
    obstaclesScene = new Scene()

    camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    renderGeometry = new PlaneBufferGeometry(2, 2)
    renderMesh = new Mesh(renderGeometry, null)

    renderMaterial = new MeshBasicMaterial()
    renderMesh.material = renderMaterial

    advectShaderMaterial = new Advect(settings, textures)
    buoyancyShaderMaterial = new Buoyancy(settings, textures)
    applyImpulseShaderMaterial = new ApplyImpulse(settings, textures)
    computeDivergenceShaderMaterial = new ComputeDivergence(settings, textures)
    jacobiShaderMaterial = new Jacobi(settings, textures)
    subtractGradientShaderMaterial = new SubtractGradient(settings, textures)
    // visualizeShaderMaterial = new Visualize(settings, textures);
    boundaryShaderMaterial = new Boundary(settings, textures)
    vignetteShaderMaterial = new Vignette(settings, textures)
    overrideColorShaderMaterial = new ShaderMaterial(OverrideColorShader)
    // premultiplyAlphaShaderMaterial = new ShaderMaterial(PremultiplyAlphaShader)
    unpremultiplyAlphaShaderMaterial = new ShaderMaterial(UnpremultiplyAlphaShader)

    shaderMaterials = [
      advectShaderMaterial,
      buoyancyShaderMaterial,
      applyImpulseShaderMaterial,
      computeDivergenceShaderMaterial,
      jacobiShaderMaterial,
      subtractGradientShaderMaterial,
      // visualizeShaderMaterial,
      boundaryShaderMaterial,
      vignetteShaderMaterial
    ]

    this.clearTarget(textures.density.texture)
    this.clearTarget(textures.temperature.texture)
    this.clearTarget(textures.obstacles.texture)

    scene.add(renderMesh)

    densityMesh = new Mesh(renderGeometry, unpremultiplyAlphaShaderMaterial.clone())
    densityMesh.renderOrder = 1
    densityMesh.userData = 'density'
    densityMesh.material.transparent = true

    impulseDensityScene.add(densityMesh)

    temperatureMesh = new Mesh(renderGeometry, unpremultiplyAlphaShaderMaterial.clone())
    temperatureMesh.renderOrder = 1
    temperatureMesh.userData = 'temperature'
    temperatureMesh.material.transparent = true

    impulseTemperatureScene.add(temperatureMesh)

    self.addBoundary()

    if (setSize !== false) {
      this.setSize(width, height)
    }
  }

  this.simulate = function (force) {
    // return;
    // createObstacles();

    /* renderMesh.material = advectShaderMaterial

     advectShaderMaterial.uniforms.VelocityTexture.value = textures.velocity.texture;
     advectShaderMaterial.uniforms.SourceTexture.value = textures.velocity.texture;

     this.render(scene, camera, textures.velocity.texture2);
     textures.velocity.swapTexture(); */

    if (!this.isInitialized) {
      return
    }

    let deltaTime = new Date().getTime() - lastSimulated
    if (!force && settings.fps !== -1 && deltaTime < 1000 / settings.fps) {
      return false
    }

    renderMesh.material = advectShaderMaterial

    advectShaderMaterial.uniforms.VelocityTexture.value = textures.velocity.texture
    advectShaderMaterial.uniforms.SourceTexture.value = textures.velocity.texture
    advectShaderMaterial.uniforms.Dissipation.value = settings.velocityDissipation

    this.render(scene, camera, textures.velocity.texture2)
    textures.velocity.swapTexture()

    advectShaderMaterial.uniforms.VelocityTexture.value = textures.velocity.texture
    advectShaderMaterial.uniforms.SourceTexture.value = textures.temperature.texture
    advectShaderMaterial.uniforms.Dissipation.value = settings.temperatureDissipation

    this.render(scene, camera, textures.temperature.texture2)
    textures.temperature.swapTexture()

    advectShaderMaterial.uniforms.VelocityTexture.value = textures.velocity.texture
    advectShaderMaterial.uniforms.SourceTexture.value = textures.density.texture
    advectShaderMaterial.uniforms.Dissipation.value = settings.densityDissipation

    this.render(scene, camera, textures.density.texture2)
    textures.density.swapTexture()

    renderMesh.material = buoyancyShaderMaterial
    buoyancyShaderMaterial.uniforms.Velocity.value = textures.velocity.texture
    buoyancyShaderMaterial.uniforms.Temperature.value = textures.temperature.texture
    buoyancyShaderMaterial.uniforms.Density.value = textures.density.texture

    buoyancyShaderMaterial.uniforms.Sigma.value = settings.invertBuoyancy ? -settings.smokeBuoyancy : settings.smokeBuoyancy
    buoyancyShaderMaterial.uniforms.Kappa.value = settings.smokeWeight

    // console.log(buoyancyShaderMaterial.uniforms.Sigma.value);

    this.render(scene, camera, textures.velocity.texture2)
    textures.velocity.swapTexture()

    if (this.applyCircleImpulse) {
      renderMesh.material = applyImpulseShaderMaterial
      applyImpulseShaderMaterial.uniforms.Sampler.value = textures.temperature.texture
      applyImpulseShaderMaterial.uniforms.FillColor.value = settings.circleImpulseTemperature || settings.impulseTemperature
      applyImpulseShaderMaterial.uniforms.Radius.value = settings.circleImpulseRadius
      this.render(scene, camera, textures.temperature.texture2)
      textures.temperature.swapTexture()

      applyImpulseShaderMaterial.uniforms.Sampler.value = textures.density.texture
      applyImpulseShaderMaterial.uniforms.FillColor.value = settings.circleImpulseDensity || settings.impulseDensity

      renderMesh.material = applyImpulseShaderMaterial
      this.render(scene, camera, textures.density.texture2)
      textures.density.swapTexture()
    }

    if (this.applyTextureImpulse && impulseDensityScene.children.length > 1) {
      // temperatureMesh.material.map = textures.temperature.texture;
      temperatureMesh.material.uniforms.tDiffuse.value = textures.temperature.texture
      this.render(impulseTemperatureScene, camera, textures.temperature.texture2)
      textures.temperature.swapTexture()

      // densityMesh.material.map = textures.density.texture;
      densityMesh.material.uniforms.tDiffuse.value = textures.density.texture
      this.render(impulseDensityScene, camera, textures.density.texture2)
      textures.density.swapTexture()
    }

    renderMesh.material = computeDivergenceShaderMaterial
    computeDivergenceShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture
    computeDivergenceShaderMaterial.uniforms.Velocity.value = textures.velocity.texture
    this.render(scene, camera, textures.divergence.texture)

    renderMesh.material = jacobiShaderMaterial
    jacobiShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture
    this.clearTarget(textures.pressure.texture1, true, true, true)
    let i
    for (i = 0; i < settings.numJacobiIterations; i++) {
      jacobiShaderMaterial.uniforms.Pressure.value = textures.pressure.texture
      this.render(scene, camera, textures.pressure.texture2, i === 0)
      textures.pressure.swapTexture()
    }

    renderMesh.material = subtractGradientShaderMaterial
    subtractGradientShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture
    subtractGradientShaderMaterial.uniforms.Velocity.value = textures.velocity.texture
    subtractGradientShaderMaterial.uniforms.Pressure.value = textures.pressure.texture
    this.render(scene, camera, textures.velocity.texture2)
    textures.velocity.swapTexture()

    /* renderMesh.material = visualizeShaderMaterial;
     visualizeShaderMaterial.uniforms.Velocity.value = textures.velocity.texture;
     visualizeShaderMaterial.uniforms.Pressure.value = textures.pressure.texture;

     renderMesh.material = visualizeShaderMaterial;
     visualizeShaderMaterial.uniforms.Sampler.value = textures.density.texture;
     this.render(scene, camera, textures.visualize.texture); */
    // settings.enableVignette = false;

    // settings.enableVignette = false;
    if (settings.enableVignette) {
      renderMesh.material = vignetteShaderMaterial
      vignetteShaderMaterial.uniforms.tDiffuse.value = textures.density.texture
    } else {
      renderMesh.material = renderMaterial
      renderMaterial.map = textures.density.texture
      // renderMaterial.map = textures.visualize.texture;
      // renderMaterial.map = textures.obstacles.texture;
      // renderMaterial.map = textures.temperature.texture;
      // renderMaterial.map = textures.divergence.texture;
      // renderMaterial.map = textures.velocity.texture;
      // renderMaterial.map = textures.pressure.texture;
      // renderMaterial.map = textures.impulseDensity.texture;
      // renderMaterial.map = textures.impulseOverlay.texture;
      // renderMaterial.map = textures.impulseTemperature.texture;
    }

    this.render(scene, camera)

    if (this.autoClearImpulse) {
      this.clearImpulse()
    }

    if (this.autoClearObstacles) {
      this.clearObstacles()
    }

    lastSimulated = new Date().getTime()

    return true
  }

  this.setSize = function (width, height, force) {
    if (!force && this.domElement.width === width && this.domElement.height === height) {
      return
    }

    this.domElement.width = width
    this.domElement.height = height
    this.domElement.style.width = width + 'px'
    this.domElement.style.height = height + 'px'
    this.setViewport(0, 0, width, height)

    settings.setSize(width, height)

    if (!this.isInitialized) {
      this.init(width, height, false)
    }

    textures.update()

    let i, shaderMaterial
    for (i = length - 1; i >= 0; i--) {
      shaderMaterial = shaderMaterials[i]
      shaderMaterial.update(settings, textures)
    }

    this.clearTarget(textures.density.texture)
    this.clearTarget(textures.temperature.texture)
    this.clearTarget(textures.obstacles.texture)
  }

  this.setSampling = function (sampling) {
    settings.sampling = sampling
    this.setSize(settings.originWidth, settings.originHeight, true)
    this.render(obstaclesScene, camera, textures.obstacles.texture)
  }
}
FluidsSimulator.prototype = Object.create(WebGLRenderer.prototype)

export default FluidsSimulator
