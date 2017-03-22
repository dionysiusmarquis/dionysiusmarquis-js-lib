import {WebGLRenderTarget} from 'three'

function FluidsTexture (settings) {
  // let size = 4*width*height;
  let renderTarget = new WebGLRenderTarget(settings.width, settings.height, settings.linearFloatParams)
  this.texture = renderTarget

  this.setSize = function (width, height) {
    renderTarget = renderTarget.clone()
    renderTarget.setSize(width, height)
    this.texture = renderTarget
  }

  this.update = function () {
    this.setSize(settings.width, settings.height)
  }
}

function FluidsSwappableTexture (settings) {
  let textureSwitch = false

  let renderTarget1 = new WebGLRenderTarget(settings.width, settings.height, settings.linearFloatParams)
  let renderTarget2 = new WebGLRenderTarget(settings.width, settings.height, settings.linearFloatParams)
  this.texture = renderTarget1
  this.texture2 = renderTarget2

  this.swapTexture = function () {
    textureSwitch = !textureSwitch

    if (textureSwitch) {
      this.texture = renderTarget2
      this.texture2 = renderTarget1
    } else {
      this.texture = renderTarget1
      this.texture2 = renderTarget2
    }
  }

  this.setSize = function (width, height) {
    renderTarget1 = renderTarget1.clone()
    renderTarget1.setSize(width, height)

    renderTarget2 = renderTarget2.clone()
    renderTarget2.setSize(width, height)

    if (textureSwitch) {
      this.texture = renderTarget2
      this.texture2 = renderTarget1
    } else {
      this.texture = renderTarget1
      this.texture2 = renderTarget2
    }
  }

  this.update = function () {
    this.setSize(settings.width, settings.height)
  }
}

function FluidsTextures (settings) {
  this.velocity = new FluidsSwappableTexture(settings)
  this.density = new FluidsSwappableTexture(settings)
  this.pressure = new FluidsSwappableTexture(settings)
  this.temperature = new FluidsSwappableTexture(settings)

  this.obstacles = new FluidsTexture(settings)
  this.divergence = new FluidsTexture(settings)
  // this.visualize = new Texture(settings);

  this.update = function () {
    this.velocity.update()
    this.density.update()
    this.pressure.update()
    this.temperature.update()
    this.obstacles.update()

    this.divergence.update()
    // this.visualize.update();
  }
}

export {
  FluidsTexture,
  FluidsSwappableTexture,
  FluidsTextures
}
