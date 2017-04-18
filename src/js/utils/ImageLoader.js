import * as dm from './../../../core'
import ImageCanvas from './ImageCanvas'

class ImageLoader extends dm.EventTarget {
  constructor (autoStart = true, invalidateAll = false, imageClass = ImageLoaderImage) {
    super()

    this._images = {}
    this._invalidateAll = invalidateAll
    this._imageClass = imageClass

    this._autoStart = autoStart

    // this._boundImageLoadHandler = event => this._checkSrcChange(event.target)
    this._boundImageHandler = event => this._imageHandler(event)

    if (autoStart) {
      this._detectSrcChange()
    }
  }

  /* _checkSrcChange (imageElement) {
   if (this._images) {
   let image = this._images[imageElement.src]
   if (imageElement.currentSrc && imageElement.currentSrc !== image.currentSrc) {
   // console.log("New currentSrc:", Utils.Image.getSrc(imageElement, true));
   image.currentSrc = imageElement.currentSrc

   if (!this.numLoading() && this._invalidateAll) {
   this.invalidate()
   }

   this.dispatchEvent(new dm.Event(ImageLoader.EVENT_INVALIDATE, image))

   image.load()
   }
   }
   } */

  _imageHandler (event) {
    switch (event.type) {
      case ImageLoaderImage.EVENT_ERROR:
        this.dispatchEvent(new dm.Event(ImageLoader.EVENT_ERROR, event.target))
        break

      case ImageLoaderImage.EVENT_LOAD:
        this.dispatchEvent(new dm.Event(ImageLoader.EVENT_IMAGE_LOAD, event.target))

        if (!this.isLoading()) {
          this.dispatchEvent(new dm.Event(ImageLoader.EVENT_LOAD))
        }
        break
    }
  }

  /* _detectSrcChange () {
   let src, imageElement
   for (src in this._images) {
   imageElement = this._images[src].image
   imageElement.addEventListener('load', this._boundImageLoadHandler)
   this._checkSrcChange(imageElement)
   }
   } */

  _detectSrcChange () {
    if (this._images) {
      requestAnimationFrame(() => this._detectSrcChange())
    }

    let src, image, imageElement
    for (src in this._images) {
      image = this._images[src]
      imageElement = image.image
      if (imageElement.currentSrc && imageElement.currentSrc !== image.currentSrc) {
        // console.log('New currentSrc:', Utils.Image.getSrc(imageElement, true))
        // console.log('New currentSrc:', imageElement.currentSrc)
        image.currentSrc = imageElement.currentSrc

        if (!this.numLoading() && this._invalidateAll) {
          this.invalidate()
        }

        this.dispatchEvent(new dm.Event(ImageLoader.EVENT_INVALIDATE, image))

        image.load()
      }
    }
  }

  add (image, callback = null) {
    // if (!image.src) {
    //   console.warn('ImageLoader: add() No valid image')
    //   return
    // }

    let src = image.src || image.getAttribute('data-src')
    if (!src) {
      console.error('ImageLoader: Error add image', this.image.src, 'using', event.target.src)
    }
    this._images[src] = new this._imageClass(image, callback)
    this._images[src].addEventListener(ImageLoaderImage.EVENT_LOAD, this._boundImageHandler)
    this._images[src].addEventListener(ImageLoaderImage.EVENT_ERROR, this._boundImageHandler)

    return this._images[src]
  }

  remove (src) {
    let image = this._images[src]
    if (image) {
      // image.image.removeEventListener('load', this._boundImageLoadHandler)
      image.removeEventListener(ImageLoaderImage.EVENT_LOAD, this._boundImageHandler)
      image.removeEventListener(ImageLoaderImage.EVENT_ERROR, this._boundImageHandler)
      this._images[src] = null
      delete this._images[src]
    }
  }

  get (src) {
    return this._images[src]
  }

  init (element, query = 'img') {
    if (this.isLoading()) {
      this.destroy()
    }

    if (!this._images) {
      this._images = {}

      if (this._autoStart) {
        this._detectSrcChange()
      }
    }

    let imageElements = element.querySelectorAll(query)

    let i
    for (i = 0; i < imageElements.length; i++) {
      this.add(imageElements[i])
    }
  }

  initWithHtml (html, query = 'img') {
    let domParser = document.createElement('div')
    domParser.innerHTML = html

    this.init(domParser, query)
  }

  load () {
    if (!this._autoStart) {
      this._detectSrcChange()
    }
  }

  stop () {
    let src
    for (src in this._images) {
      // this._images[src].image.removeEventListener('load', this._boundImageLoadHandler)
      this._images[src].stop()
    }
  }

  isLoading () {
    let isLoading = false

    let src
    for (src in this._images) {
      if (!isLoading && this._images[src].isLoading()) {
        isLoading = true
        break
      }
    }

    return isLoading
  }

  numLoading () {
    let numLoading = 0

    let src
    for (src in this._images) {
      if (this._images[src].isLoading()) {
        numLoading++
      }
    }

    return numLoading
  }

  numLoaded () {
    let numLoaded = 0

    let src
    for (src in this._images) {
      if (!this._images[src].isLoading()) {
        numLoaded++
      }
    }

    return numLoaded
  }

  percentageLoaded () {
    let numImages = 0
    let numLoaded = 0

    let src
    for (src in this._images) {
      if (!this._images[src].isLoading()) {
        numLoaded++
      }
      numImages++
    }

    return numLoaded / numImages
  }

  destroy () {
    let src
    for (src in this._images) {
      this.remove(src)
    }

    this._images = null
  }

  invalidate () {
    let src
    for (src in this._images) {
      this._images[src].invalidate()
    }
  }
}
ImageLoader.EVENT_IMAGE_LOAD = 'imageload'
ImageLoader.EVENT_LOAD = 'load'
ImageLoader.EVENT_ERROR = 'error'
ImageLoader.EVENT_INVALIDATE = 'invalidate'

class ImageLoaderImage extends dm.EventTarget {
  constructor (image, callback = null) {
    super()

    if (!image) {
      console.error('ImageLoaderImage: no valid image.')
    }

    this.image = image
    this._callback = callback
    this.currentSrc = null
    this.src = image.src || image.getAttribute('data-src')

    this._loadingImage = null
    this._isLoading = image.srcset !== ''

    this._boundLoadingImageHandler = event => this._loadingImageHandler(event)

    if (!this._isLoading) {
      this.load()
    }

    // this._timeout = setTimeout(() => { console.warn('ImageLoaderImage: currentSrc did not change for ', image.src, image.currentSrc) }, 5000)
  }

  _loadingImageHandler (event) {
    switch (event.type) {
      case 'load':
        this.stop()

        if (this._callback) {
          this._callback(this)
        }

        this.dispatchEvent(new dm.Event(ImageLoaderImage.EVENT_LOAD))
        break

      case 'error':
        this.stop()
        this.dispatchEvent(new dm.Event(ImageLoaderImage.EVENT_ERROR))
        console.error('ImageLoaderImage: Error load image', this.image.src, 'using', event.target.src)
        break
    }
  }

  _getSrc () {
    return this.image.srcset ? this.currentSrc : this.image.src
  }

  load (checkSrc = true) {
    if (!this.image.srcset || (this.image.srcset && this.image.currentSrc)) {
      // clearTimeout(this._timeout)

      if (this._loadingImage) {
        this.stop()
      }

      let src = this._getSrc()

      if (checkSrc && !src) {
        console.error('ImageLoaderImage: Error load image, src is', src === '' ? 'empty string' : src)
      }

      if (src) {
        this._loadingImage = new Image()
        this._loadingImage.addEventListener('load', this._boundLoadingImageHandler)
        this._loadingImage.addEventListener('error', this._boundLoadingImageHandler)
        this._loadingImage.src = src
        this._isLoading = true
      }
    }
  }

  stop () {
    if (this._loadingImage) {
      this._loadingImage.removeEventListener('load', this._boundLoadingImageHandler)
      this._loadingImage.removeEventListener('error', this._boundLoadingImageHandler)
      this._loadingImage.src = ''
      this._loadingImage = null
    }
    this._isLoading = false
  }

  isLoading () {
    return this._isLoading
  }

  invalidate () {
    this.stop()
    this._isLoading = this.image.srcset !== ''
  }
}
ImageLoaderImage.EVENT_LOAD = 'load'
ImageLoaderImage.EVENT_ERROR = 'error'

class ImageLoaderLazyImage extends ImageLoaderImage {
  constructor (image, callback = null, autoload = true) {
    super(image, callback)

    if (!this.isLazyloaded) {
      return
    }

    this._dataSrc = image.getAttribute('data-src')
    this._dataSrcset = image.getAttribute('data-srcset')

    this._autoload = autoload

    if ((this._dataSrc && !image.getAttribute('src')) || (this._dataSrcset && !image.getAttribute('srcset'))) {
      if (this._autoload) {
        this.loadHiRes()
      }
    }

    if (this._dataSrc || this._dataSrcset) {
      this._boundLowResSrcHandler = event => this._lowResSrcHandler(event)
      this.addEventListener(ImageLoaderImage.EVENT_LOAD, this._boundLowResSrcHandler)
    }
  }

  _lowResSrcHandler (event) {
    if (this._autoload) {
      this.loadHiRes()
    }

    this.removeEventListener(ImageLoaderImage.EVENT_LOAD, this._boundLowResSrcHandler)
  }

  loadHiRes () {
    if (this._dataSrcset) {
      this.image.setAttribute('srcset', this._dataSrcset)
      this.image.removeAttribute('data-srcset')
    } else if (this._dataSrc) {
      this.image.setAttribute('src', this._dataSrc)
      this.image.removeAttribute('data-src')
    }
  }

  load (checkSrc = true) {
    super.load(!this.isLazyloaded)
  }

  get isLazyloaded () {
    return this.image.classList.contains('lazyload')
  }
}

class ImageLoaderCanvasImage extends ImageLoaderLazyImage {
  constructor (image, callback = null, autoload = true) {
    super(image, callback, autoload)

    if (!image.classList.contains('lazyload') || !image.classList.contains('canvas-image')) {
      return
    }

    let type = this.image.classList.contains('canvas-image--alpha-map') ? ImageCanvas.TYPE_MASKED_IMAGE : ImageCanvas.TYPE_IMAGE

    this._imageCanvas = new ImageCanvas(image, type, !image.classList.contains('canvas-image--responsive'))
    this._imageCanvas.canvas.className = image.className

    image.style['display'] = 'none'
    image.parentNode.insertBefore(this._imageCanvas.canvas, image)
  }

  _lowResSrcHandler (event) {
    if (this._imageCanvas) {
      this._imageCanvas.update()
    }
    super._lowResSrcHandler(event)

    if (this._imageCanvas) {
      this.addEventListener(ImageLoaderImage.EVENT_LOAD, event => this._imageHandler(event))
    }
  }

  _imageHandler (event) {
    if (this._imageCanvas) {
      this._imageCanvas.update()
    }
  }
}

export { ImageLoader, ImageLoaderImage, ImageLoaderLazyImage, ImageLoaderCanvasImage }
