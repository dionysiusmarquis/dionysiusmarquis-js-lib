import * as dm from './../../../core'

class ImageLoader extends dm.EventTarget {
  constructor (autoStart, invalidateAll = false) {
    super()

    this._images = {}
    this._invalidateAll = invalidateAll

    this._autoStart = autoStart

    if (autoStart !== false) {
      this._detectSrcChange()
    }
  }

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

  _detectSrcChange () {
    if (this._images) {
      requestAnimationFrame(() => this._detectSrcChange())
    }

    let src, image, imageElement
    for (src in this._images) {
      image = this._images[src]
      imageElement = image.image
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
  }

  add (image, callback) {
    if (!image.src) {
      console.warning('ImageLoader: add() No valid image')
      return
    }
    this._images[image.src] = new ImageLoaderImage(image, callback)
    this._images[image.src].addEventListener(ImageLoaderImage.EVENT_LOAD, event => this._imageHandler(event))
    this._images[image.src].addEventListener(ImageLoaderImage.EVENT_ERROR, event => this._imageHandler(event))
  }

  remove (src) {
    let image = this._images[src]
    if (image) {
      image.removeEventListener(ImageLoaderImage.EVENT_LOAD, event => this._imageHandler(event))
      image.removeEventListener(ImageLoaderImage.EVENT_ERROR, event => this._imageHandler(event))
      this._images[image.src] = null
      delete this._images[image.src]
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

      if (this._autoStart !== false) {
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
  constructor (image, callback) {
    super()

    if (!image) {
      console.error('ImageLoaderImage: no valid image.')
    }

    this.image = image
    this._callback = callback
    this.currentSrc = null

    this._loadingImage = null
    this._isLoading = image.srcset !== ''

    this._boundLoadingImageHandler = event => this._loadingImageHandler(event)

    if (!this._isLoading) {
      this.load()
    }

    // let timeout = setTimeout(function() {console.warn("ImageLoaderImage: currentSrc did not change for ", image.src, image.currentSrc)}, 5000);
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
        console.error('ImageLoaderImage: Error this._isLoading image', this.image.src, 'using', event.target.src)
        break
    }
  }

  load () {
    if (!this.image.srcset || (this.image.srcset && this.image.currentSrc)) {
      // clearTimeout(timeout);

      if (this._loadingImage) {
        this.stop()
      }

      let src = this.image.srcset ? this.currentSrc : this.image.src

      if (!src) {
        console.error('ImageLoaderImage: Error this._isLoading image, src is', src === '' ? 'empty string' : src)
      }

      this._loadingImage = new Image()
      this._loadingImage.addEventListener('load', this._boundLoadingImageHandler)
      this._loadingImage.addEventListener('error', this._boundLoadingImageHandler)
      this._loadingImage.src = src
      this._isLoading = true
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

export { ImageLoader, ImageLoaderImage }
