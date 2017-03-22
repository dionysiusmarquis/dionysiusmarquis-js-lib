/**
 * Main app class for hhey.de
 * @class
 * @param {string} type - Type of Event.
 * @param {any} data - Any kind of data stored in this Event.
 * @param {bool} bubble - If "true" the Event is bubbeling.
 */
function Event (type, data, bubble) {
  this.target = null
  this.currentTarget = null
  this.type = type
  this.data = data
  this.bubble = bubble
  this.isBubbling = false

  this.getType = function () {
    return this.type
  }

  this.getdata = function () {
    return this.data
  }

  this.getBubble = function () {
    return this.bubble
  }
}

function EventTarget () {
  let listeners = {}
  let listenersdata = {}
  let listenersCallees = {}

//  console.info("EventTarget constructor", self);

  /* function bubbleEvent (parent) {

   } */

  this.addEventListener = function (type, listener, callee, data) {
    if (!listeners[type]) {
      listeners[type] = []
      listenersdata[type] = []
      listenersCallees[type] = []
    }

    if (listeners.length === 0 || listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener)
      listenersdata[type].push(data)
      listenersCallees[type].push(callee)
    }
  }

  this.removeEventListener = function (type, listener) {
    if (!listeners[type]) {
      return
    }

    let index = listeners[type].indexOf(listener)
    if (index !== -1) {
      listeners[type].splice(index, 1)
      listenersdata[type].splice(index, 1)
    }
  }

  this.hasEventListener = function (type, listener) {
    return listeners.length > 0 && listeners[type] && listeners[type].indexOf(listener) !== -1
  }

  this.dispatchEvent = function (event) {
//  console.info(event, event.type, listeners);

    if (!event || (event && (!event.type || event.type === ''))) {
      return
    }

    if (!event.isBubbling) {
      event.currentTarget = this
    }
    event.target = this

    if (listeners[event.type] && listeners[event.type].length > 0) {
      let listener = listeners[event.type]
      let i, j, data, dataKeys, callee, key
      for (i = 0; i < listener.length; i++) {
        data = listenersdata[event.type][i]
        callee = listenersCallees[event.type][i]
        if (data) {
          if (!event.data) {
            event.data = data
          } else {
            dataKeys = Object.keys(data)
            for (j = 0; j < dataKeys.length; j++) {
              key = dataKeys[j]
              event.data[key] = data[key]
            }
          }
        }
        listener[i].call(callee || this, event)
      }
    }
    if (event.bubble && this.parent && this.parent.isEventDispatcher) {
      event.isBubbling = true
      this.parent.dispatchEvent(event)
    }
  }

  this.isEventDispatcher = true
}

export {Event, EventTarget}
