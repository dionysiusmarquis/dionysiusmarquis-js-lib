import { ObjectUtil } from './../utils/Utils'
import {Event, EventTarget} from './EventTarget'

class HTMLElement extends EventTarget {
  constructor (element, id, className, style) {
    super()
    this.element = null
    /* ToDO: create getter setter */
    this.id = id
    this.children = []
    this.className = className
    this.style = style
    this.parent = null

    this._isSelectable = true
    this._isFullscreen = false

    this._transitions = {}

    if (!element) {
      throw new Error('HTMLElement: element attribute can not be null.')
    }

    if (!(element instanceof window.HTMLElement) && !(element instanceof window.SVGElement)) {
      throw new Error('HTMLElement: ' + element.constructor.name + ' not allowed as element attribute.')
    }

    this.createElement(element)
    this.isDisplayObject = true
  }

  _addDefaultListener () {
    if (typeof document.body.style['transition'] !== 'undefined') {
      this.element.addEventListener('transitionend', event => this._transitionEndHandler(event))
      this.element.addEventListener('animationend', event => this._animationEndListener(event))
    } else if (typeof document.body.style['WebkitTransition'] !== 'undefined') {
      this.element.addEventListener('webkitTransitionEnd', event => this._transitionEndHandler(event))
      this.element.addEventListener('webkitAnimationEnd', event => this._animationEndListener(event))
    } else if (typeof document.body.style['MozTransition'] !== 'undefined') {
      this.element.addEventListener('transitionend', event => this._transitionEndHandler(event))
      this.element.addEventListener('animationend', event => this._animationEndListener(event))
    } else if (typeof document.body.style['OTransition'] !== 'undefined') {
      this.element.addEventListener('oTransitionEnd', event => this._transitionEndHandler(event))
      this.element.addEventListener('oAnimationEnd', event => this._animationEndListener(event))
    }
  }

  _transitionEndHandler (event) {
    if (event.target !== this.element) {
      return
    }

    // if(event.stopPropagation)
    // event.stopPropagation();

    let transition = this.getTransition(event.propertyName)

    if (this._transitions[1]) {
      let transitions = this._transitions[1][event.propertyName]
      if (transitions) {
        delete this._transitions[1][event.propertyName]
        this.updateTransitionString()
      }
    }

    if (transition && transition[1]) {
      transition[1].call(transition[2] || this)
    }

    this.dispatchEvent(new Event('transitionend', event))
  }

  _animationEndListener (event) {
    if (event.target !== this.element) {
      return
    }

    this.dispatchEvent(new Event('animationend', event))
  }

  _fullscreenChangeHandler (event) {
    let isFullscreen =
      document.isFullscreen ||
      document.mozIsFillScreen ||
      document.webkitIsFullScreen

    this._isFullscreen = isFullscreen

    this.dispatchEvent(new Event('fullscreenchange', {isFullscreen: isFullscreen}))
  }

  _validateProperty (property, lowercase) {
    let regex = HTMLElement.ATTRIBUTE_REGEX
    if (regex.test(property)) {
      property = property.replace(regex, (match, firstLetter) => {
        return firstLetter.toUpperCase()
      })
    }

    if (typeof document.body.style[property] !== 'undefined') {
      if (lowercase) {
        if (property.indexOf(this.VENDOR_PREFIX) === -1) {
          return this._getCssProperty(property)
        } else {
          property = property.replace(this.VENDOR_PREFIX, '')
        }
      } else {
        return property
      }
    }

    let vendorProperty = this.VENDOR_PREFIX + property.charAt(0).toUpperCase() + property.slice(1)
    if (typeof document.body.style[vendorProperty] !== 'undefined') {
      if (lowercase) {
        return '-' + this._getCssProperty(vendorProperty)
      } else {
        return vendorProperty
      }
    }

    if (property === 'float' && document.body.style['cssFloat'] !== 'undefined') {
      return 'cssFloat'
    }

    // console.error("no valid property found for ", property);
  }

  _validateProperties (properties, lowercase) {
    let validatedObject = {}
    for (let property in properties) {
      validatedObject[this._validateProperty(property, lowercase)] = properties[property]
    }
    return validatedObject
  }

  _getCssProperty (property) {
    return property.replace(/[A-Z]/g, (match) => {
      return '-' + match.toLowerCase()
    })
  }

  /* function hasClassTransition () {
   let classNames = this.getClassNames()
   for (let i = 0; i < classNames.length; i++) {
   if (this._transitions[classNames[i]]) {
   return true
   }
   }

   return false
   } */

  addChild (child) {
    this.children.push(child)
    child.setParent(this)

    return child
  }

  addChildAt (child, index) {
    this.addChild(child)
    this.setChildIndex(child, index)

    return child
  }

  removeChild (child) {
    this.children.splice(this.children.indexOf(child), 1)
    child.setParent(null)

    return child
  }

  createElement (src) {
    if (!src) {
      return
    }

//    let classNames;
    if (typeof src === 'string') {
      this.element = document.createElement('div')
      this.element.innerHTML = src
      this.element = this.element.firstChild
    } else {
      this.element = src
//      classNames = this.getClassNames().join(" ");
    }

    this.parent = this.element.parentElement
    this.setId(this.id || this.element.id)
    if (this.style) {
      this.setStyle(this.style)
    } else {
      this.style = this.element.style
    }
//    this.setClassName((classNames ? classNames+" " : "")+(this.className || ""));

    let classNameToAdd = this.className
    this.className = this.getClassNames().join(' ')
    this.addClassName(classNameToAdd || '')

    this._addDefaultListener()
  }

  appendToElement (parentElement) {
    parentElement.appendChild(this.element)
  }

  setStyle (style, validate) {
    if (!style) {
      return
    }
    validate = validate === undefined ? true : validate

    for (let key in style) {
      let property = validate ? this._validateProperty(key) : key
      if (property) {
        this.element.style[property] = style[key] === null ? '' : style[key]
      }
    }
    this.style = this.element.style
  }

  setId (id) {
    this.id = (!id || id === '') ? null : id
    if (this.element) {
      if (this.id) {
        this.element.id = this.id
      } else {
        this.element.removeAttribute('id')
      }
    }
  }

  setClassName (className) {
//    if (!className && className != "")
//      return;
//    this.element.className = this.className = className == "" ? null : className;
    this.className = (!className || className === '') ? null : className
    if (this.className) {
      this.element.setAttribute('class', this.className)
    } else {
      this.element.removeAttribute('class')
    }

    this.updateTransitionString()
  }

  addClassName (className) {
    if (!className || className === '' || (this.className && this.hasClassName(className))) {
      return
    }
    let startString = this.className && this.className !== '' ? this.className + ' ' : ''
    this.setClassName(startString + className)
  }

  toggleClassName (className) {
    let classNames = this.getClassNames()
    let index = classNames.indexOf(className)
    if (index !== -1) {
      classNames.splice(index, 1)
    } else {
      classNames.push(className)
    }

    this.setClassName(classNames.join(' '))
  }

  removeClassName (className) {
    if (!this.className) {
      return
    }
    let classNames = this.getClassNames()
    let index = classNames.indexOf(className)
    if (index === -1) {
      return
    }
    classNames.splice(index, 1)
    this.setClassName(classNames.join(' '))
  }

  setParent (targetParent) {
    if (targetParent) {
      if (targetParent.element !== this.element.parentElement) {
        targetParent.element.appendChild(this.element)
      }
    } else if (this.parent) {
      this.parent.element.removeChild(this.element)
    }

    this.parent = targetParent
  }

  setIndex (index) {
    if (!this.parent) {
      return
    }
    let children = this.parent.children

    if (index < 0) {
      if (children.length <= -index) {
        index = 0
      } else {
        index = children.length + index
      }
    }
    if (children.length < index) {
      index = children.length - 1
    }

//    log(parentElement, index, childIndex);

    if (this.parent.isDisplayObject) {
      this.parent.setChildIndex(this, index)
    } else {
      let childIndex = this.getIndex()
      let nextChild = childIndex > index ? this.parent.children[index] : this.parent.children[index + 1]
      this.parent.insertBefore(nextChild)
    }
  }

  setChildIndex (child, index) {
    let childIndex = this.getChildIndex(child)
    if (childIndex === index) {
      return
    }

    if (child.isDisplayObject) {
      let nextChild = childIndex > index ? this.children[index] : this.children[index + 1]

      this.children.splice(childIndex, 1)
      this.children.splice(index, 0, child)

      if (nextChild) {
        this.element.insertBefore(child.element, nextChild.element)
      } else {
        this.element.appendChild(child.element)
      }
    }
  }

  setPointer (pointer) {
    if (pointer) {
      this.setStyle({cursor: 'pointer'})
    } else {
      this.setStyle({cursor: null})
    }
  }

  setPointerEvents (pointerEvents, force) {
    if (pointerEvents) {
      if (force) {
        this.setStyle({pointerEvents: 'all'})
      } else {
        this.setStyle({pointerEvents: null})
      }
    } else {
      this.setStyle({pointerEvents: 'none'})
    }
  }

  setSelectable (selectable) {
    this._isSelectable = selectable

    if (!selectable) {
      this.setStyle({
        userSelect: 'none'
      })
    } else {
      this.setStyle({
        userSelect: null
      })
    }
  }

  setVisible (visible) {
    if (visible) {
      this.setStyle({display: null})
    } else {
      this.setStyle({display: 'none'})
    }
  }

  toggleFullscreen () {
    if (this._isFullscreen) {
      this.cancelFullscreen()
    } else {
      this.requestFullscreen()
    }
  }

  requestFullscreen () {
    this._isFullscreen = true

    if (this.element.requestFullscreen) {
      this.element.requestFullscreen()
    } else if (this.element.mozRequestFullScreen) {
      this.element.mozRequestFullScreen()
    } else if (this.element.webkitRequestFullscreen) {
      this.element.webkitRequestFullscreen()
    }

    document.addEventListener('fullscreenchange', event => this._fullscreenChangeHandler(event))
    document.addEventListener('webkitfullscreenchange', event => this._fullscreenChangeHandler(event))
    document.addEventListener('mozfullscreenchange', event => this._fullscreenChangeHandler(event))
  }

  cancelFullscreen () {
    this._isFullscreen = false

    if (document.cancelFullscreen) {
      document.cancelFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    }
  }

  transitionFrom (startValues, values, duration, timingFunction, delay, callback) {
    this.setStyle(startValues)

    setTimeout(() => {
      this.transition(values, duration, timingFunction, delay, callback)
    }, 50)
  }

  transition (values, duration, timingFunction, delay, callback, callee) {
    if (duration === 0) {
      return
    }

    values = this._validateProperties(values)

    let value
    let properties = []
    let property
    let propertyFound = false
    let supportsTransition = this._validateProperty('transition')

    for (property in values) {
      value = values[property] || values[property] === 0 ? String(values[property]) : ''
      // console.log(property, this.getComputetStyleProperty(property), this.style[property], value, this.style[property] == value || this.getComputetStyleProperty(property) == value);
      // console.log(this.style[property], this.getComputetStyleProperty(property),value);
      // if (this.style[property] && this.style[property] == values[property])
      if (this.style[property] === value || this.getComputetStyleProperty(property) === value) {
        delete values[property]
      } else {
        propertyFound = true
        properties.push(property)
      }
    }

    if (!propertyFound && callback) {
      callback.call(callee || this)
      return
    }

    if (properties.length) {
      if (supportsTransition) {
        this.addTransitions(1, properties, duration, timingFunction, delay, callback, callee, true)
      }

      setTimeout(() => {
        // this.setStyle(values, false); ???
        this.setStyle(values)
        if (!supportsTransition && callback) {
          callback.call(callee || this)
        }
      }, Number.MIN_VALUE)
    }
  }

  addTransition (className, property, duration, timingFunction, delay, callback, callee, override, update) {
    className = className || 0
    if (!this._transitions[className]) {
      this._transitions[className] = {}
    }
    if (!override && this._transitions[className][property]) {
      return
    }
    update = update !== false
    timingFunction = timingFunction || 'ease'
    property = this._validateProperty(property, true)
    let transitionString = property + ' ' + (duration || 0) + 's' + ((delay || timingFunction !== 'ease') ? ' ' + timingFunction : '') + (delay ? ' ' + delay + 's' : '')

    this._transitions[className][property] = {}
    this._transitions[className][property][0] = transitionString
    this._transitions[className][property][1] = callback
    this._transitions[className][property][2] = callee
    if (update) {
      this.updateTransitionString()
    }

    return transitionString
  }

  addTransitions (className, properties, durations, timingFunctions, delays, callback, callee, override, update) {
    update = update !== false
    let multipleDurations = !(!durations || typeof durations === 'number')
    let multipleTimingFunctions = !(!timingFunctions || typeof timingFunctions === 'string')
    let multipleDelays = !(!delays || typeof delays === 'number')

    let transitionStrings = []
    let transitionString
    let transitions
    let property
    for (let i = 0; i < properties.length; i++) {
      transitions = this._transitions[className || 0]
      property = this._validateProperty(properties[i], true)
      if (!override && transitions && transitions[property]) {
        continue
      }

      transitionString = this.addTransition(
        className,
        property,
        multipleDurations ? durations[i] : durations,
        multipleTimingFunctions ? timingFunctions[i] : timingFunctions,
        multipleDelays ? delays[i] : delays,
        i === 0 ? callback : null,
        i === 0 ? callee : null,
        override,
        false)

      transitionStrings.push(transitionString)
    }

    if (update) {
      this.updateTransitionString()
    }
    return transitionStrings
  }

  updateTransition (className, property, duration, timingFunction, delay) {
    className = className || 0
    let transitions = this._transitions[className]
    if (!transitions) {
      return
    }

    property = this._validateProperty(property, true)
    let transition = transitions[property][0]
    if (!transition) {
      return
    }

    transition = transition.split(' ')
    for (let i = 1; i < 4; i++) {
      if (i === 1 && duration !== undefined) {
        transition[1] = duration + 's'
      }
      if (i === 2 && timingFunction) {
        transition[2] = timingFunction
      }
      if (i === 3 && delay !== undefined) {
        transition[3] = delay + 's'
      }
    }

    transitions[property][0] = transition.join(' ')

    this.updateTransitionString()
  }

  updateTransitionString () {
    let styleTransitionString = ''
    let mergedTransitions
    let supportsTransition = this._validateProperty('transition')

    let i, key, hasKeys
    for (key in this._transitions[1]) {
      hasKeys = true
      break
    }

    if (hasKeys) {
      mergedTransitions = ObjectUtil.clone(this._transitions[1])
    } else {
      mergedTransitions = ObjectUtil.clone(this._transitions[0])
    }

    // if(!this._transitions[1] && this.className) {
    if (this.className) {
      let className
      let transitions

      i = 0

      if (!mergedTransitions) {
        mergedTransitions = {}
      }

      // if(this._transitions[0])
      if (this._transitions[0] && hasKeys) {
        for (key in this._transitions[0]) {
          if (!mergedTransitions[key]) {
            mergedTransitions[key] = this._transitions[0][key]
          }
        }
      }

      let classNames = this.getClassNames()
      for (i = 0; i < classNames.length; i++) {
        className = classNames[i]
        transitions = this._transitions[className]
        if (transitions) {
          for (key in transitions) {
            mergedTransitions[key] = transitions[key]
          }
        }
      }
    }

    i = 0
    for (key in mergedTransitions) {
      if (supportsTransition) {
        if (i !== 0) {
          styleTransitionString += ', '
        }
        styleTransitionString += mergedTransitions[key][0]
        i++
      } else {
        this._transitionEndHandler({target: this.element, propertyName: key})
      }
    }

    // if(styleTransitionString != "") console.log(styleTransitionString);
    if (supportsTransition) {
      this.setStyle({
        transition: styleTransitionString === '' ? null : styleTransitionString
      })
    }
  }

  removeTransition (property, className, styleValues) {
    if (className !== undefined) {
      delete this._transitions[className || 0][property]
    } else {
      for (className in this._transitions) {
        delete this._transitions[className][property]
      }
    }

    this.updateTransitionString()

    if (styleValues) {
      setTimeout(() => {
        this.setStyle(styleValues)
      }, Number.MIN_VALUE)
    }
  }

  getTransition (property, className) {
    if (className) {
      return this._transitions[className || 0][property]
    }

    let classNames = this.getClassNames()
    classNames.unshift(0)
    classNames.push(1)

    let transitions
    let transition
    for (let i = 0; i < classNames.length; i++) {
      transitions = this._transitions[classNames[i]]
      if (transitions && transitions[property]) {
        transition = transitions[property]
      }
    }

    return transition
  }

  getComputetStyleProperty (property, asNumber) {
    let styleProperty = window.getComputedStyle(this.element, null).getPropertyValue(property)
    if (asNumber) {
      return Number(styleProperty.replace('px', ''))
    }

    return styleProperty
  }

  getClassNames () {
    if (!this.element.className) {
      return []
    }

    if (this.element.className.split) {
      return this.element.className.split(' ')
    }

    if (this.element.className.baseVal) {
      return this.element.className.baseVal.split(' ')
    }

    let elementClassList = this.element.classList
    if (elementClassList) {
      let classList = []
      for (let i = 0; i < elementClassList.length; i++) {
        classList.push(elementClassList[i])
      }

      return classList
    }

    return []
  }

  getIndex () {
    let index
    if (this.parent.isDisplayObject) {
      index = this.parent.getChildIndex(this)
    } else {
      index = 0
      let child = this.element
      while ((child = child.previousSibling) !== null) {
        index++
      }
    }

    return index
  }

  isVisible () {
    return !(this.getComputetStyleProperty('display') === 'none')
  }

  hasClassName (className) {
    return this.getClassNames().indexOf(className) !== -1
  }

  getChildIndex (child) {
    return this.children.indexOf(child)
  }

  getStyleProperty (property) {
    return this.style[property]
  }

  getChildren () {
    return this.children
  }

  getId () {
    return this.element.id
  }

  getStyle () {
    return this.style
  }

  getClassName () {
    return this.className
  }

  getElement () {
    return this.element
  }

  getParent () {
    return this.parent
  }

  getWidth () {
    return this.element.offsetWidth
  }

  getHeight () {
    return this.element.offsetHeight
  }

  getIsSelectable () {
    return this._isSelectable
  }

  getIsFullscreen () {
    return this._isFullscreen
  }
}
HTMLElement.ATTRIBUTE_REGEX = /-([a-z])/gi

document.addEventListener('DOMContentLoaded', event => {
  HTMLElement.VENDOR_PREFIX = (() => {
    let regex = /^(Moz|Webkit|webkit|Khtml|O|ms|Icab)(?=[A-Z])/

    for (let key in document.body.style) {
      if (regex.test(key)) {
        return key.match(regex)[0]
      }
    }

    regex = /(moz|webkit|ms)/

    let i, property
    let styleProperties = window.getComputedStyle(document.documentElement, '')
    for (i = 0; i < styleProperties.length; i++) {
      property = styleProperties[i]
      if (regex.test(property)) {
        return property.match(regex)[0]
      }
    }
  })()
})

export default HTMLElement
