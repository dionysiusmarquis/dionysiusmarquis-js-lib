import * as dm from './../../../core'

class ImageCanvas extends dm.EventTarget {
  constructor (image, type, sizeAttributes = false) {
    super()

    this.image = image
    this.type = type

    this._sizeAttributes = sizeAttributes

    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
  }

  drawImage () {
    let width = this.image.width
    let height = this.image.height

    if (!width || !height) {
      console.warn('ImageCanvas: drawImage() invalid size ', width, height)
    } else {
      this.setSize(width, height)

      this.context.save()
      this.context.setTransform(1, 0, 0, 1, 0, 0)
      this.context.drawImage(this.image, 0, 0, width, height)

      this.context.restore()
    }
  }

  drawMaskedImage () {
    let width = this.image.width
    let height = this.image.height

    if (!width || !height) {
      console.warn('ImageCanvas: drawMaskedImage() invalid size ', width, height)
    } else {
      this.setSize(width, height / 2)

      this.context.save()
      this.context.setTransform(1, 0, 0, 1, 0, 0)

      this.context.drawImage(this.image, 0, -height / 2, width, height)
      let alphaData = this.context.getImageData(0, 0, width, height)
      this.context.drawImage(this.image, 0, 0, width, height)
      let imageData = this.context.getImageData(0, 0, width, height)

      let i
      for (i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 3] = alphaData.data[i]
      }
      this.context.putImageData(imageData, 0, 0)

      this.context.restore()

      alphaData = null
      imageData = null
    }
  }

  update () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    switch (this.type) {
      case ImageCanvas.TYPE_MASKED_IMAGE:
        this.drawMaskedImage()
        break
      case ImageCanvas.TYPE_IMAGE:
      default:
        this.drawImage()
        break
    }

    this.dispatchEvent(new dm.Event(ImageCanvas.EVENT_UPDATE))
  }

  setSize (width, height) {
    if (width === this.canvas.width && height === this.canvas.height) {
      return
    }

    this.canvas.width = width
    this.canvas.height = height

    if (this._sizeAttributes && window.devicePixelRatio && window.devicePixelRatio !== 1) {
      this.canvas.style['width'] = `${width / window.devicePixelRatio}px`
      this.canvas.style['height'] = `${height / window.devicePixelRatio}px`
    }

    this.resize()
  }

  resize () {}
}
ImageCanvas.TYPE_IMAGE = 'image'
ImageCanvas.TYPE_MASKED_IMAGE = 'maskedImage'
ImageCanvas.EVENT_UPDATE = 'update'

export default ImageCanvas
