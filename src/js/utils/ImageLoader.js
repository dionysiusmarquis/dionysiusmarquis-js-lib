import * as dm from './../../../core'

function ImageLoader (autoStart, invalidateAll) {
  dm.EventTarget.call(this)

  let self = this
  let images = {}

  if (autoStart !== false) {
    detectSrcChange()
  }

  function imageHandler (event) {
    switch (event.type) {
      case ImageLoaderImage.EVENT_ERROR:
        self.dispatchEvent(new Event(ImageLoader.EVENT_ERROR, event.target))
        break

      case ImageLoaderImage.EVENT_LOAD:
        self.dispatchEvent(new Event(ImageLoader.EVENT_IMAGE_LOAD, event.target))

        if (!self.isLoading()) {
          self.dispatchEvent(new Event(ImageLoader.EVENT_LOAD))
        }
        break
    }
  }

  function detectSrcChange () {
    if (images) {
      requestAnimationFrame(detectSrcChange)
    }

    let src, image, imageElement
    for (src in images) {
      image = images[src]
      imageElement = image.image
      if (imageElement.currentSrc && imageElement.currentSrc !== image.currentSrc) {
        // console.log("New currentSrc:", Utils.Image.getSrc(imageElement, true));
        image.currentSrc = imageElement.currentSrc

        if (!self.numLoading() && invalidateAll) {
          self.invalidate()
        }

        self.dispatchEvent(new Event(ImageLoader.EVENT_INVALIDATE, image))

        image.load()
      }
    }
  }

  this.add = function (image, callback) {
    if (!image.src) {
      console.warning('ImageLoader: add() No valid image')
      return
    }
    images[image.src] = new ImageLoaderImage(image, callback)
    images[image.src].addEventListener(ImageLoaderImage.EVENT_LOAD, imageHandler)
    images[image.src].addEventListener(ImageLoaderImage.EVENT_ERROR, imageHandler)
  }

  this.remove = function (src) {
    let image = images[src]
    if (image) {
      image.removeEventListener(ImageLoaderImage.EVENT_LOAD, imageHandler)
      image.removeEventListener(ImageLoaderImage.EVENT_ERROR, imageHandler)
      images[image.src] = null
      delete images[image.src]
    }
  }

  this.get = function (src) {
    return images[src]
  }

  this.init = function (element) {
    if (self.isLoading()) {
      self.destroy()
    }

    if (!images) {
      images = {}

      if (autoStart !== false) {
        detectSrcChange()
      }
    }

    let imageElements = element.querySelectorAll('img')

    let i
    for (i = 0; i < imageElements.length; i++) {
      self.add(imageElements[i])
    }
  }

  this.initWithHtml = function (html) {
    let domParser = document.createElement('div')
    domParser.innerHTML = html

    self.init(domParser)
  }

  this.load = function () {
    if (!autoStart) {
      detectSrcChange()
    }
  }

  this.stop = function () {
    let src
    for (src in images) {
      images[src].stop()
    }
  }

  this.isLoading = function () {
    let isLoading = false

    let src
    for (src in images) {
      if (!isLoading && images[src].isLoading()) {
        isLoading = true
        break
      }
    }

    return isLoading
  }

  this.numLoading = function () {
    let numLoading = 0

    let src
    for (src in images) {
      if (images[src].isLoading()) {
        numLoading++
      }
    }

    return numLoading
  }

  this.numLoaded = function () {
    let numLoaded = 0

    let src
    for (src in images) {
      if (!images[src].isLoading()) {
        numLoaded++
      }
    }

    return numLoaded
  }

  this.percentageLoaded = function () {
    let numImages = 0
    let numLoaded = 0

    let src
    for (src in images) {
      if (!images[src].isLoading()) {
        numLoaded++
      }
      numImages++
    }

    return numLoaded / numImages
  }

  this.destroy = function () {
    let src
    for (src in images) {
      self.remove(src)
    }

    images = null
  }

  this.invalidate = function () {
    let src
    for (src in images) {
      images[src].invalidate()
    }
  }
}
ImageLoader.prototype = Object.create(dm.EventTarget.prototype)
ImageLoader.EVENT_IMAGE_LOAD = 'imageload'
ImageLoader.EVENT_LOAD = 'load'
ImageLoader.EVENT_ERROR = 'error'
ImageLoader.EVENT_INVALIDATE = 'invalidate'

function ImageLoaderImage (image, callback) {
  dm.EventTarget.call(this)

  if (!image) {
    console.error('ImageLoaderImage: no valid image.')
  }

  let self = this

  this.image = image
  this.callback = callback
  this.currentSrc = null

  let loadingImage = null
  let loading = image.srcset !== ''

  // let timeout = setTimeout(function() {console.warn("ImageLoaderImage: currentSrc did not change for ", image.src, image.currentSrc)}, 5000);

  function loadingImageHandler (event) {
    switch (event.type) {
      case 'load':
        self.stop()

        if (self.callback) {
          self.callback(self)
        }

        self.dispatchEvent(new Event(ImageLoaderImage.EVENT_LOAD))
        break

      case 'error':
        self.stop()
        self.dispatchEvent(new Event(ImageLoaderImage.EVENT_ERROR))
        console.error('ImageLoaderImage: Error loading image', image.src, 'using', event.target.src)
        break
    }
  }

  this.load = function () {
    if (!image.srcset || (image.srcset && image.currentSrc)) {
      // clearTimeout(timeout);

      if (loadingImage) {
        self.stop()
      }

      loadingImage = new Image()
      loadingImage.addEventListener('load', loadingImageHandler)
      loadingImage.addEventListener('error', loadingImageHandler)
      loadingImage.src = image.srcset ? self.currentSrc : image.src
      loading = true
    }
  }

  this.stop = function () {
    if (loadingImage) {
      loadingImage.removeEventListener('load', loadingImageHandler)
      loadingImage.removeEventListener('error', loadingImageHandler)
      loadingImage.src = ''
      loadingImage = null
    }
    loading = false
  }

  this.isLoading = function () {
    return loading
  }

  this.invalidate = function () {
    this.stop()
    loading = image.srcset !== ''
  }

  this.load()
}
ImageLoaderImage.prototype = Object.create(dm.EventTarget.prototype)
ImageLoaderImage.EVENT_LOAD = 'load'
ImageLoaderImage.EVENT_ERROR = 'error'

export {ImageLoader, ImageLoaderImage}
