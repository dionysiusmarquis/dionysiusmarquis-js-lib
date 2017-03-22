import canvg from 'canvg-fixed'

import * as dm from './../../../core'
import {ImageLoader} from './../utils/ImageLoader'

function HTMLCanvas (element, canvas, autoSize, useImageSize) {
  dm.HTMLElement.call(this, element)

  this.canvas = canvas || document.createElement('canvas')
  this.context = this.canvas.getContext('2d')
  // console.log(this.context);

  let self = this

  let imageLoader = new ImageLoader()
  imageLoader.addEventListener(ImageLoader.EVENT_INVALIDATE, function (event) {
    self.dispatchEvent(new Event(HTMLCanvas.EVENT_INVALIDATE))
  })

  let userAgend = navigator.userAgent
  let isDesktopChrome = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgend) && /Chrome/i.test(userAgend)
  isDesktopChrome = false

  this.autoSize = autoSize !== false
  this.useImageSize = useImageSize === undefined ? false : useImageSize

  this.useDevicePixelRatio = false

  // if(!isDesktopChrome)
  //   this.canvas.style.letterSpacing = "normal";

  /* function getAlphaColor (color, alpha) {
    if (alpha < 1) {
      if (color.indexOf('rgb') === -1) {
        color = color.replace('#', '')
        let r = parseInt(color.substring(0, 2), 16)
        let g = parseInt(color.substring(2, 4), 16)
        let b = parseInt(color.substring(4, 6), 16)

        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
      } else {
        if (color.indexOf('rgba') === -1) {
          color = color.replace('rgb', 'rgba')
        } else {
          let stringParts = color.split(',')
          stringParts[stringParts.length - 1] = alpha + ')'
          return stringParts.join(',')
        }

        return color.replace(')', ', ' + alpha + ')')
      }
    }

    return color
  } */

  function svgFixIE (xml) {
    // console.log(xml);

    let start = xml.indexOf('<svg')
    let end = xml.lastIndexOf('/svg>')
    xml = xml.substring(start, end + 5)

    xml = xml.replace(/NS[0-9]+:ns[0-9]+:xmlns:ns[0-9]+=""/g, '')
    xml = xml.replace(/NS[0-9]+:xmlns:ns[0-9]+=""/g, '')
    xml = xml.replace(/xmlns:NS[0-9]+=""/g, '')
    xml = xml.replace(/NS[0-9]+:xmlns:xml="http:\/\/www.w3.org\/XML\/[0-9]+\/namespace"/g, '')
    xml = xml.replace(/xmlns:xml="http:\/\/www.w3.org\/XML\/[0-9]+\/namespace"/g, '')
    xml = xml.replace(/NS[0-9]+(:ns[0-9]+)+:/g, '')

    xml = xml.replace(/NS1:xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/, 'xmlns:xlink="http://www.w3.org/1999/xlink"')
    xml = xml.replace(/xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink" xlink:href/g, 'xlink:href')

    // console.log(xml);

    return xml
  }

  function getLineHeight (element) {
    let clone = element.cloneNode()
    // text.innerHTML = "XpÉ +eta–x- OQ_ξ";
    clone.style.display = 'block'
    clone.style.height = 'auto'
    clone.textContent = ''

    element.parentElement.appendChild(clone)
    let height = clone.offsetHeight

    clone.textContent = 'M\ng'

    let result = clone.offsetHeight - height

    element.parentElement.removeChild(clone)
    return result
  }

  function getWidth (element, styleProperties, isImage) {
    // if(!styleProperties)
    //   styleProperties = window.getComputedStyle(element, null);

    // let width = styleProperties.getPropertyValue("width");

    // if(isImage)
    //   width = width === "auto" || width === "" ? element.width : Number(width.replace("px", ""));
    // else
    //   width = width === "auto" || width === "" ? element.offsetWidth : Number(width.replace("px", ""));

    let width
    if (isImage && self.useImageSize) {
      width = element.width
    } else {
      width = element.offsetWidth
      if (self.useDevicePixelRatio && window.devicePixelRatio) {
        width *= window.devicePixelRatio
      }
    }

    return Math.floor(width)
  }

  function getHeight (element, styleProperties, isImage) {
    // if(!styleProperties)
    //   styleProperties = window.getComputedStyle(element, null);

    // let height = styleProperties.getPropertyValue("height");

    // if(isImage)
    //   height = height === "auto" || height === "" ? element.height : Number(height.replace("px", ""));
    // else
    //   height = height === "auto" || height === "" ? element.offsetHeight : Number(height.replace("px", ""));

    let height
    if (isImage && self.useImageSize) {
      height = element.height
    } else {
      height = element.offsetHeight
      if (self.useDevicePixelRatio && window.devicePixelRatio) {
        height *= window.devicePixelRatio
      }
    }

    return Math.floor(height)
  }

  function drawBorder (styleProperties, width, height, color, alpha) {
    let borderTopWidth = styleProperties.getPropertyValue('border-top-width')
    let borderBottomWidth = styleProperties.getPropertyValue('border-bottom-width')
    let borderLeftWidth = styleProperties.getPropertyValue('border-left-width')
    let borderRightWidth = styleProperties.getPropertyValue('border-right-width')
    // let borderTopColor = color || styleProperties.getPropertyValue('border-top-color')
    // let borderBottomColor = color || styleProperties.getPropertyValue('border-bottom-color')
    // let borderLeftColor = color || styleProperties.getPropertyValue('border-left-color')
    // let borderRightColor = color || styleProperties.getPropertyValue('border-right-color')

    borderTopWidth = Number(borderTopWidth.replace('px', ''))
    borderBottomWidth = Number(borderBottomWidth.replace('px', ''))
    borderLeftWidth = Number(borderLeftWidth.replace('px', ''))
    borderRightWidth = Number(borderRightWidth.replace('px', ''))

    if (borderTopWidth === 0 && borderBottomWidth === 0 && borderLeftWidth === 0 && borderRightWidth === 0) {
      return
    }

    self.context.save()
    self.context.globalAlpha = alpha
    self.context.beginPath()

    if (borderTopWidth !== 0) {
      // self.context.strokeStyle = getAlphaColor(borderTopColor, alpha);
      self.context.lineWidth = borderTopWidth * 2

      self.context.moveTo(0, 0)
      self.context.lineTo(width, 0)
    }
    if (borderBottomWidth !== 0) {
      // self.context.strokeStyle = getAlphaColor(borderBottomColor, alpha);
      self.context.lineWidth = borderBottomWidth * 2

      self.context.moveTo(0, height)
      self.context.lineTo(width, height)
    }
    if (borderLeftWidth !== 0) {
      // self.context.strokeStyle = getAlphaColor(borderLeftColor, alpha);
      self.context.lineWidth = borderLeftWidth * 2

      self.context.moveTo(0, 0)
      self.context.lineTo(0, height)
    }
    if (borderRightWidth !== 0) {
      // self.context.strokeStyle = getAlphaColor(borderRightColor, alpha);
      self.context.lineWidth = borderRightWidth * 2

      self.context.moveTo(width, 0)
      self.context.lineTo(width, height)
    }

    self.context.stroke()

    self.context.restore()
  }

  function drawBackground (styleProperties, width, height, alpha) {
    let backgroundColor = styleProperties.getPropertyValue('background-color')

    if (backgroundColor.indexOf('0)') === -1) {
      self.context.save()

      self.context.globalAlpha = alpha
      self.context.setTransform(1, 0, 0, 1, 0, 0)
      self.context.fillStyle = backgroundColor
      self.context.fillRect(0, 0, width, height)

      self.context.restore()
    }
  }

  function drawBackgroundImage (image, styleProperties, width, height, alpha) {
    let backgroundRepeat = styleProperties.getPropertyValue('background-repeat')
    let backgroundPositionX = styleProperties.getPropertyValue('background-position-x')
    let backgroundPositionY = styleProperties.getPropertyValue('background-position-y')

    backgroundPositionX = Number(backgroundPositionX.replace('px', ''))
    backgroundPositionY = Number(backgroundPositionY.replace('px', ''))

    self.context.save()

    let pattern = self.context.createPattern(image, backgroundRepeat)
    self.context.globalAlpha = alpha
    self.context.setTransform(1, 0, 0, 1, 0, 0)
    self.context.translate(backgroundPositionX, backgroundPositionY)
    self.context.fillStyle = pattern
    self.context.fillRect(-backgroundPositionX, -backgroundPositionY, width + backgroundPositionX, height + backgroundPositionY)

    self.context.restore()
  }

  function drawImage (image, styleProperties, offsetX, offsetY, alpha, autoSize, clipRect, clearBlack) {
    // console.log(image, image.width, image.height);
    // console.log(self.canvas, self.canvas.width, self.canvas.height);

    let borderTopWidth = styleProperties.getPropertyValue('border-top-width')
    let borderBottomWidth = styleProperties.getPropertyValue('border-bottom-width')
    let borderLeftWidth = styleProperties.getPropertyValue('border-left-width')
    let borderRightWidth = styleProperties.getPropertyValue('border-right-width')
    let paddingTop = styleProperties.getPropertyValue('padding-top')
    // let paddingBottom = styleProperties.getPropertyValue('padding-bottom')
    let paddingLeft = styleProperties.getPropertyValue('padding-left')
    let paddingRight = styleProperties.getPropertyValue('padding-right')
    let width = clipRect ? clipRect.width : getWidth(image, styleProperties, true)
    let height = clipRect ? clipRect.height : getHeight(image, styleProperties, true)

    paddingTop = Number(paddingTop.replace('px', ''))
    // paddingBottom = Number(paddingBottom.replace('px', ''))
    paddingLeft = Number(paddingLeft.replace('px', ''))
    paddingRight = Number(paddingRight.replace('px', ''))
    borderTopWidth = Number(borderTopWidth.replace('px', ''))
    borderBottomWidth = Number(borderBottomWidth.replace('px', ''))
    borderLeftWidth = Number(borderLeftWidth.replace('px', ''))
    borderRightWidth = Number(borderRightWidth.replace('px', ''))

    if (autoSize) {
      self.setSize(width, height)
    }

    drawBackground(styleProperties, width, height, alpha)
    drawBorder(styleProperties, width, height, null, alpha)

    width -= paddingLeft + paddingRight + borderLeftWidth + borderRightWidth
    height -= paddingLeft + paddingRight + borderTopWidth + borderBottomWidth

    offsetX += paddingLeft + borderLeftWidth
    offsetY += paddingTop + borderTopWidth

    self.context.save()
    self.context.globalAlpha = alpha
    self.context.setTransform(1, 0, 0, 1, 0, 0)
    if (clipRect) {
      self.context.drawImage(image, clipRect.x, clipRect.y, clipRect.width, clipRect.height, offsetX, offsetY, width, height)
    } else {
      self.context.drawImage(image, offsetX, offsetY, width, height)
    }
    if (clearBlack) {
      let imageData = self.context.getImageData(offsetX, offsetY, width, height)
      let i
      for (i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 3] = imageData.data[i]
      }
      self.context.putImageData(imageData, offsetX, offsetY)
    }
    self.context.restore()
  }

  function drawMaskedImage (image, styleProperties, offsetX, offsetY, alpha, autoSize) {
    let width = getWidth(element, styleProperties, true)
    let height = Math.floor(getHeight(element, styleProperties, true) / 2)
    let compositeOperation = self.context.globalCompositeOperation

    drawImage(image, styleProperties, offsetX, offsetY, alpha, autoSize, {
      x: 0,
      y: height,
      width: width,
      height: height
    }, true)
    self.context.globalCompositeOperation = 'source-in'
    drawImage(image, styleProperties, offsetX, offsetY, alpha, autoSize, {x: 0, y: 0, width: width, height: height})
    self.context.globalCompositeOperation = compositeOperation
  }

  function resizeToElement (element) {
    let styleProperties = window.getComputedStyle(element, null)
    let isImage = element.nodeName === 'IMG'
    self.setSize(getWidth(element, styleProperties, isImage), getHeight(element, styleProperties, isImage))
  }

  function getNestedChildren (element, array) {
    let nestedChildren = array || []

    let nestedCountTemp = nestedChildren.length
    let children = element.children
    let i, child
    for (i = 0; i < children.length; i++) {
      child = children[i]
      if (child.childElementCount) {
        getNestedChildren(child, nestedChildren)
        if (nestedChildren.length === nestedCountTemp) {
          nestedChildren.push(child)
        }
      } else {
        if (child.nodeName !== 'BR') {
          nestedChildren.push(child)
        }
      }
    }

    return nestedChildren
  }

  this.addDOMElement = function (element, offsetX, offsetY, color, alpha, autoSize) {
    if (element.childElementCount === undefined) {
      return
    }

    autoSize = autoSize === undefined ? this.autoSize : autoSize

    offsetX = offsetX || 0
    offsetY = offsetY || 0

    if (autoSize) {
      resizeToElement(element)
    }

    let children
    if (element.childElementCount) {
      children = getNestedChildren(element)
      // console.log(children);

      let i, child, elementRect, childRect
      for (i = 0; i < children.length; i++) {
        child = children[i]
        elementRect = element.getBoundingClientRect()
        childRect = child.getBoundingClientRect()

        this.addDOMElement(child, childRect.left - elementRect.left + offsetX, childRect.top - elementRect.top + offsetY, color, alpha, false)
      }
    } else {
      children = {length: 0}
    }

    if (!children.length) {
      switch (element.nodeName) {
        case 'SVG':
          this.addSvgElement(element, offsetX, offsetY, color, alpha, autoSize)
          break
        case 'IMG':
          this.addImage(element, offsetX, offsetY, alpha, autoSize)
          break
        default:
          this.addElement(element, offsetX, offsetY, color, alpha, autoSize)
      }
    }
  }

  this.addImage = function (element, offsetX, offsetY, alpha, autoSize, maskedImage) {
    offsetX = offsetX || 0
    offsetY = offsetY || 0

    alpha = alpha === undefined ? 1 : alpha
    autoSize = autoSize === undefined ? this.autoSize : autoSize

    // console.log(element, offsetX, offsetY, element.width, element.height);

    let styleProperties = window.getComputedStyle(element, null)

    imageLoader.add(
      element,
      function () {
        if (maskedImage) {
          drawMaskedImage(element, styleProperties, offsetX, offsetY, alpha, autoSize)
        } else {
          drawImage(element, styleProperties, offsetX, offsetY, alpha, autoSize)
        }
        self.dispatchEvent(new Event(HTMLCanvas.EVENT_LOAD))
        self.dispatchEvent(new Event(HTMLCanvas.EVENT_UPDATE))
      }
    )
  }

  this.addSvgElement = function (element, offsetX, offsetY, autoSize) {
    autoSize = autoSize === undefined ? this.autoSize : autoSize

    if (autoSize) {
      resizeToElement(element)
    }

    canvg(this.canvas, svgFixIE(element.innerHTML), {ignoreMouse: true, offsetX: offsetX, offsetY: offsetY})
    self.dispatchEvent(new Event(HTMLCanvas.EVENT_UPDATE))
  }

  this.addElement = function (element, offsetX, offsetY, color, alpha, autoSize) {
    // if((!element.textContent && !element.value) || (element.textContent === "" && element.value === ""))
    //   return;

    let styleProperties = window.getComputedStyle(element, null)
    // console.log(element, styleProperties);

    offsetX = offsetX || 0
    offsetY = offsetY || 0
    alpha = alpha === undefined ? 1 : alpha
    autoSize = autoSize === undefined ? this.autoSize : autoSize

    let textAlign = styleProperties.getPropertyValue('text-align')
    let whiteSpace = styleProperties.getPropertyValue('white-space')
    let fontFamily = styleProperties.getPropertyValue('font-family')
    let fontSize = styleProperties.getPropertyValue('font-size')
    let fontStyle = styleProperties.getPropertyValue('font-style')
    let lineHeight = styleProperties.getPropertyValue('line-height')
    let letterSpacing = styleProperties.getPropertyValue('letter-spacing')
    let borderTopWidth = styleProperties.getPropertyValue('border-top-width')
    let borderLeftWidth = styleProperties.getPropertyValue('border-left-width')
    let borderRightWidth = styleProperties.getPropertyValue('border-right-width')
    let paddingTop = styleProperties.getPropertyValue('padding-top')
    let paddingLeft = styleProperties.getPropertyValue('padding-left')
    let paddingRight = styleProperties.getPropertyValue('padding-right')
    let backgroundImage = styleProperties.getPropertyValue('background-image')

    let width = getWidth(element, styleProperties)
    let height = getHeight(element, styleProperties)

    if (isDesktopChrome) {
      if (element.parentElement) {
        element.parentElement.appendChild(this.canvas)
      }
      this.canvas.style.letterSpacing = letterSpacing
    }

    fontSize = Number(fontSize.replace('px', ''))
    lineHeight = lineHeight === 'normal' ? getLineHeight(element) : Number(lineHeight.replace('px', ''))
    letterSpacing = isDesktopChrome || letterSpacing === 'normal' ? 0 : Number(letterSpacing.replace('px', ''))
    paddingTop = Number(paddingTop.replace('px', ''))
    paddingLeft = Number(paddingLeft.replace('px', ''))
    paddingRight = Number(paddingRight.replace('px', ''))
    borderTopWidth = Number(borderTopWidth.replace('px', ''))
    borderLeftWidth = Number(borderLeftWidth.replace('px', ''))
    borderRightWidth = Number(borderRightWidth.replace('px', ''))

    if (autoSize) {
      this.setSize(width, height)
    }

    // let canvasWidth = this.canvas.width;

    // if(element.textContent == "DENNIS MARKGRAF" || element.textContent == "SR DEVELOPER")
    //   console.log(getLineHeight(element));

    if (textAlign === 'center') {
      offsetX += width / 2
    } else if (textAlign === 'right') {
      offsetX += width - paddingRight - borderRightWidth
    } else {
      offsetX += paddingLeft + borderLeftWidth
    }

    offsetY += paddingTop + borderTopWidth

    let text = ''
    if (element.nodeName !== 'INPUT' && whiteSpace !== 'nowrap') {
      // letterSpacing = 0;

      let clone = element.cloneNode()
      clone.style.whiteSpace = 'nowrap'
      element.parentElement.appendChild(clone)

      let startWidth = element.scrollWidth

      clone.textContent = ''
      if (clone.value) {
        clone.value = ''
      }
      let elementText = element.textContent || element.value
      let lines = elementText ? elementText.split('\n') : []

      // console.log(lines);

      let i, j, words, word, line
      for (i = 0; i < lines.length; i++) {
        clone.textContent = ''
        words = lines[i].split(' ')
        for (j = 0; j < words.length; j++) {
          word = words[j]

          // if(i !== 0 && word === "") {
          //   text += "\n";
          //   continue;
          // }

          line = clone.textContent
          clone.textContent += word
          if (j !== words.length - 1) {
            clone.textContent += ' '
          }

          if (clone.scrollWidth > startWidth) {
            text += line + '\n'
            clone.textContent = word + ' '
          }
        }

        if (words.length) {
          text += clone.textContent
        }

        if (i !== lines.length - 1) {
          text += '\n'
        }
      }

      element.parentElement.removeChild(clone)
    } else {
      text = element.textContent || element.value
    }

    drawBackground(styleProperties, width, height, alpha)
    drawBorder(styleProperties, width, height, color, alpha)

    color = color || styleProperties.getPropertyValue('color')
    // color = getAlphaColor(color, alpha);

    this.context.globalAlpha = alpha

    if (backgroundImage !== 'none') {
      let imageSource

      if (backgroundImage.indexOf('url("') !== -1) {
        imageSource = backgroundImage.substring(0, backgroundImage.length - 2).replace('url("', '')
      } else {
        imageSource = backgroundImage.substring(0, backgroundImage.length - 1).replace('url(', '')
      }

      // console.log(imageSource);

      let image = new Image()
      image.onload = function () {
        drawBackgroundImage(image, styleProperties, width, height, alpha)
        self.dispatchEvent(new Event(HTMLCanvas.EVENT_LOAD))
        self.addText(text, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, offsetX, offsetY)
      }
      image.src = imageSource
    } else {
    // console.log(element, element.textContent, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, x, canvasWidth);
      this.addText(text, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, offsetX, offsetY)
    }

    if (isDesktopChrome) {
      if (element.parentElement) {
        element.parentElement.removeChild(this.canvas)
      }
      this.canvas.style.letterSpacing = null
    }

    this.context.globalAlpha = 1
  }

  this.addText = function (text, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, x, y) {
    fontFamily = fontFamily || '\'serif\''
    textAlign = textAlign || 'left'
    fontSize = fontSize || 16
    fontStyle = fontStyle || 'normal'
    color = color || '#000000'

    lineHeight = lineHeight || fontSize

    this.context.save()

    this.context.font = fontStyle + ' ' + fontSize + 'px ' + fontFamily
    // console.log(this.context.font);
    this.context.fillStyle = color
    this.context.translate(x || 0, y || 0)
    this.context.translate(0, (fontSize + lineHeight) / 2)
    this.context.textAlign = textAlign

    this.context.lineWidth = 1
    this.context.strokeStyle = color

    // this.context.rotate(rotation * Math.PI / 180);

    // console.log(this.context.font, this.context.fillStyle);
    // console.log(fontStyle + " " + fontSize + "px " + fontFamily);

    let i
    let lines = text.split('\n')
    // console.log(lines);
    for (i = 0; i < lines.length; i++) {
      this.addTextLine(lines[i], 0, i * lineHeight, letterSpacing, false, false)
    }

    this.context.restore()
    self.dispatchEvent(new Event(HTMLCanvas.EVENT_UPDATE))
  }

  this.addTextLine = function (text, x, y, letterSpacing, saveRestore, dispatch) {
    if (letterSpacing === 'normal' || letterSpacing === 0) {
      // console.log(letterSpacing);
      // this.context.fillText(text, x, y);
      this.context.strokeText(text, x, y)
      return
    }

    if (!text || typeof text !== 'string' || text.length === 0) {
      return
    }

    if (!letterSpacing) {
      letterSpacing = 0
    }

    saveRestore = saveRestore !== false
    dispatch = dispatch !== false

    let characters = text.split('')
    let index = 0
    let current
    let currentPosition = x
    let align = 1

    if (saveRestore) {
      this.context.save()
    }

    if (this.context.textAlign === 'right') {
      characters = characters.reverse()
      align = -1
    } else if (this.context.textAlign === 'center') {
      let totalWidth = 0
      for (let i = 0; i < characters.length; i++) {
        totalWidth += this.context.measureText(characters[i]).width
        if (i !== characters.length - 1) {
          totalWidth += letterSpacing
        }
      }
      currentPosition = x - (totalWidth / 2)
    }

    while (index < text.length) {
      current = characters[index++]
      // this.context.fillText(current, currentPosition, y);
      this.context.strokeText(current, currentPosition, y)
      currentPosition += (align * (this.context.measureText(current).width + letterSpacing))
    }

    if (saveRestore) {
      this.context.restore()
    }

    if (dispatch) {
      self.dispatchEvent(new Event(HTMLCanvas.EVENT_UPDATE))
    }
  }

  this.setSize = function (width, height) {
    if (width === this.canvas.width && height === this.canvas.height) {
      return
    }

    this.canvas.width = width
    this.canvas.height = height

    // console.error(width, height);
    let scale = 1
    if (this.useDevicePixelRatio && window.devicePixelRatio) {
      scale = 1 / window.devicePixelRatio
    }

    this.dispatchEvent(new Event(HTMLCanvas.EVENT_RESIZE, {width: width * scale, height: height * scale}))
  }

  this.clear = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  this.isLoading = function () {
    return imageLoader.isLoading()
  }
}
HTMLCanvas.prototype = Object.create(dm.HTMLElement.prototype)
HTMLCanvas.EVENT_UPDATE = 'update'
HTMLCanvas.EVENT_LOAD = 'load'
HTMLCanvas.EVENT_INVALIDATE = 'invalidate'
HTMLCanvas.EVENT_RESIZE = 'resize'

export default HTMLCanvas
