const MathUtil = {
  random: function (min, max, digits) {
    digits = digits || 0
    return Number((Math.random() * (max - min)).toFixed(digits)) + min
  },

  percentage: function (base, value) {
    return value / (base / 100)
  },

  interpolate: function (start, end, percentage) {
    return start + (end - start) * percentage
  },

  interpolate2: function (start, end, percentage) {
    return (1 - percentage) * start + percentage * end
  },

  distance: function (x1, y1, x2, y2) {
    let xs = 0
    let ys = 0

    xs = x2 - x1
    xs = xs * xs

    ys = y2 - y1
    ys = ys * ys

    return Math.sqrt(xs + ys)
  },

  angle: function (x1, y1, x2, y2) {
    let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
    return angle < 0 ? angle + 360 : angle
  },

  percSin: function (percentage, scale, offset, digits) {
    scale = 1 / scale || 1
    offset = offset || 0
    digits = 10 * digits || 100
    return Math.round(Math.sin((offset + percentage) * (Math.PI / 2 * scale)) * digits) / digits
  }
}

const ColorUtil = {
  hsv2rgb: function (h, s, v) {
    // adapted from
    // http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
    let rgb, i
    let data = []
    if (s === 0) {
      rgb = [v, v, v]
    } else {
      h = h / 60
      i = Math.floor(h)
      data = [v * (1 - s), v * (1 - s * (h - i)),
        v * (1 - s * (1 - (h - i)))]
      switch (i) {
        case 0:
          rgb = [v, data[2], data[0]]
          break
        case 1:
          rgb = [data[1], v, data[0]]
          break
        case 2:
          rgb = [data[0], v, data[2]]
          break
        case 3:
          rgb = [data[0], data[1], v]
          break
        case 4:
          rgb = [data[2], data[0], v]
          break
        default:
          rgb = [v, data[0], data[1]]
          break
      }
    }

    for (i = 0; i < rgb.length; i++) {
      rgb[i] = Math.round(rgb[i] * 255)
    }

    return rgb
  },

  rgb2hsv: function (r, g, b) {
    r = r / 255
    g = g / 255
    b = b / 255

    let rr, gg, bb, h, s
    let v = Math.max(r, g, b)
    let diff = v - Math.min(r, g, b)

    let diffc = function (c) {
      return (v - c) / 6 / diff + 1 / 2
    }

    if (diff === 0) {
      h = s = 0
    } else {
      s = diff / v
      rr = diffc(r)
      gg = diffc(g)
      bb = diffc(b)

      if (r === v) {
        h = bb - gg
      } else if (g === v) {
        h = (1 / 3) + rr - bb
      } else if (b === v) {
        h = (2 / 3) + gg - rr
      }
      if (h < 0) {
        h += 1
      } else if (h > 1) {
        h -= 1
      }
    }
    return [
      Math.round(h * 360),
      Math.round(s * 100),
      Math.round(v * 100)
    ]
  },

  hsv2hex: function (h, s, v) {
    let rgb = ColorUtil.hsv2rgb(h, s, v)
    return '#' + rgb.map(function (x) {
      return ('0' + x.toString(16)).slice(-2)
    }).join('')
  },

  rgb2hex: function (r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7)
  },

  hex2rgb: function (hex) {
    let bigint = parseInt(hex.replace('#', ''), 16)
    let r = (bigint >> 16) & 255
    let g = (bigint >> 8) & 255
    let b = bigint & 255

    return [r, g, b]
  },

  interpolate: function (color1, color2, percentage) {
    return [
      Math.interpolate(color1[0], color2[0], percentage),
      Math.interpolate(color1[1], color2[1], percentage),
      Math.interpolate(color1[2], color2[2], percentage)
    ]
  }
}

const DateUtil = {
  convert: function (timestamp, pattern) {
    let date = new Date(timestamp.replace(/-/g, '/'))

    let day = date.getDate()
    if (day < 10) {
      day = '0' + day
    }

    let month = date.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }

    let hours = date.getHours()
    if (hours < 10) {
      hours = '0' + hours
    }

    let minutes = date.getMinutes()
    if (minutes < 10) {
      minutes = '0' + minutes
    }

    if (!pattern) {
      return day + '.' + month + '.' + date.getFullYear() + '; ' + hours + ':' + minutes
    } else {
      pattern = pattern.replace('d', day)
      pattern = pattern.replace('m', month)
      pattern = pattern.replace('Y', date.getFullYear())
      pattern = pattern.replace('H', hours)
      return pattern.replace('i', minutes)
    }
  }
}

const DrawUtil = {

  getGap: function (x, y, x2, y2, minDistance, maxDistance) {
    minDistance = minDistance || 3
    maxDistance = maxDistance || 250

    let coordsArray = []
    coordsArray.push({x: x, y: y})

    let xLength = x2 - x
    let yLength = y2 - y
    let distance = Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2))

    if (distance > minDistance && distance < maxDistance) {
      let i
      for (i = 1; i < (distance / minDistance) + 1; i++) {
        coordsArray.push({
          x: x + (xLength / (distance / minDistance)) * i,
          y: y + (yLength / (distance / minDistance)) * i
        })
      }
    }

    return coordsArray
  }
}

const ObjectUtil = {
  clone: function (object) {
    if (object === null || typeof object !== 'object') {
      return object
    }
    let copy = new object.constructor()
    for (let attr in object) {
      if (object.hasOwnProperty(attr)) {
        copy[attr] = object[attr]
      }
    }
    return copy
  },

  merge: function (target, object, createObject) {
    if (createObject) {
      target = ObjectUtil.clone(target)
    }
    for (let attr in object) {
      target[attr] = object[attr]
    }

    return target
  },

  toQueryString: function (object) {
    let k = Object.keys(object)
    let s = ''
    for (let i = 0; i < k.length; i++) {
      s += k[i] + '=' + encodeURIComponent(object[k[i]])
      if (i !== k.length - 1) {
        s += '&'
      }
    }
    return s
  }
}

const ImageUtil = {
  getSrc: function (image, detailed) {
    if (image.src && !image.currentSrc) {
      console.error('ImageUtil: No valid src found for image', image.src, image)
    }

    if (!detailed) {
      return image.srcset ? image.currentSrc : image.src
    } else {
      let sources = image.srcset.split(',')
      let sourceW, sourceH
      if (image.currentSrc) {
        let index, source, sourceParts, sourceParam, sourceValue
        let src = image.currentSrc.split('/').pop()
        for (index in sources) {
          source = sources[index]
          // console.log(index, source.indexOf(src + " "), src, source, image.currentSrc);
          if (source.indexOf(src + ' ') !== -1) {
            sourceParts = source.split(' ')
            sourceParam = sourceParts[sourceParts.length - 1].slice(-1)
            sourceValue = sourceParts[sourceParts.length - 1].slice(0, -1)
            if (sourceParam === 'w') {
              sourceW = Number(sourceValue)
            }
            if (sourceParam === 'h') {
              sourceH = Number(sourceValue)
            }
          }
        }
      }
      return {src: image.srcset ? image.currentSrc : image.src, w: sourceW, h: sourceH}
    }
  }
}

const FormUtil = {
  setFormDisabled: function (form, disabled) {
    let dataElements = form.querySelectorAll('input, textarea, select, option, button')
    let i
    for (i = 0; i < dataElements.length; i++) {
      dataElements[i].disabled = disabled
    }
  },

  resetForm: function (form) {
    let formElements = form.querySelectorAll('input:not([type="submit"]), textarea, select, option')
    let i, formElement
    for (i = 0; i < formElements.length; i++) {
      formElement = formElements[i]
      switch (formElement.type) {
        case 'checkbox':
          formElement.checked = false
          break
        default:
          formElement.value = ''
          break
      }
    }
  },

  getFormValue: function (formElement) {
    switch (formElement.type) {
      case 'checkbox':
        if (formElement.name.indexOf('[]' !== -1)) {
          if (formElement.checked) {
            return formElement.value
          } else {
            return false
          }
        } else {
          return formElement.checked ? 1 : 0
        }
      default:
        return formElement.value
    }
  },

  getFormDataQuery: function (form) {
    let dataValues = []
    let dataElements = form.querySelectorAll('input:not([type="submit"]), textarea, select, option')
    let i, dataElement, value
    for (i = 0; i < dataElements.length; i++) {
      dataElement = dataElements[i]
      value = FormUtil.getFormValue(dataElement)
      if (value !== false) {
        dataValues.push(dataElement.name + '=' + encodeURIComponent(value))
      }
    }

    return dataValues.join('&')
  },

  toQueryString: function (obj) {
    let parts = []
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]))
      }
    }
    return parts.join('&')
  },

  getMultiPartFormData: function (form, boundary, filesData) {
    let body = ''
    let newLine = '\r\n'

    let dataElements = form.querySelectorAll('input:not([type="submit"]), textarea, select, option')
    let i, dataElement, value
    for (i = 0; i < dataElements.length; i++) {
      dataElement = dataElements[i]

      if (dataElement.value === '') {
        continue
      }

      body += '--' + boundary + newLine
      body += 'Content-Disposition: form-data; name="' + dataElement.name + '"' + newLine
      if (dataElement.type && dataElement.type !== 'file') {
        value = FormUtil.getFormValue(dataElement)
        if (value !== false) {
          body += newLine
          body += value + newLine
        }
      } else if (filesData[dataElement.name]) {
        body += 'Content-Type: application/octet-stream' + newLine + newLine
        body += filesData[dataElement.name] + newLine
      }
    }
    body += '--' + boundary + '--'

    return body
  },

  getFormData: function (form) {
    let dataValues = {}
    let dataElements = form.querySelectorAll('input:not([type="submit"]), textarea, select, option')
    let i, dataElement
    for (i = 0; i < dataElements.length; i++) {
      dataElement = dataElements[i]
      dataValues[dataElement.name] = FormUtil.getFormValue(dataElement)
    }

    return dataValues
  },

  validateEmail: function (email) {
    let regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
    return regex.test(email)
  }
}

const CSSUtil = {
  getFontFaces: function () {
    let sheets = document.styleSheets
    let fontFaces = []

    let i, j, fontFamily
    for (i = 0; i < sheets.length; i += 1) {
      let rules = sheets[i].cssRules

      for (j = 0; j < rules.length; j += 1) {
        if (rules[j].constructor === CSSFontFaceRule) {
          fontFamily = rules[j].style.getPropertyValue('font-family').replace(/'|"/g, '')
          if (fontFaces.indexOf(fontFamily) === -1) {
            fontFaces.push(fontFamily)
          }
        }
      }
    }
    return fontFaces
  }
}

export {
  MathUtil,
  ColorUtil,
  DateUtil,
  DrawUtil,
  ObjectUtil,
  ImageUtil,
  FormUtil,
  CSSUtil
}
