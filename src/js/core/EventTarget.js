/**
 * Main app class for hhey.de
 * @class
 * @param {string} type - Type of Event.
 * @param {any} data - Any kind of data stored in this Event.
 * @param {bool} bubble - If "true" the Event is bubbeling.
 */
class Event {
  constructor (type, data = null, bubble = false) {
    this.target = null
    this.currentTarget = null
    this.type = type
    this.data = data
    this.bubble = bubble
    this.isBubbling = false
  }

  getType () {
    return this.type
  }

  getdata () {
    return this.data
  }

  getBubble () {
    return this.bubble
  }
}

class EventTarget {
  constructor () {
    this._listeners = {}

    this.isEventDispatcher = true
  }

//  console.info("EventTarget constructor", this);

  /* function bubbleEvent (parent) {

   } */

  _listenerIndex (listener, element) {
    return element.listener === listener
  }

  addEventListener (type, listener, callee = null, data = null) {
    if (!this._listeners[type]) {
      this._listeners[type] = []
    }

    if (this._listeners.length === 0 || this._listeners[type].findIndex(element => this._listenerIndex(listener, element)) === -1) {
      this._listeners[type].push({listener, data, callee})
    }
  }

  removeEventListener (type, listener) {
    if (!this._listeners[type]) {
      return
    }

    let index = this._listeners[type].findIndex(element => this._listenerIndex(listener, element))
    if (index !== -1) {
      this._listeners[type].splice(index, 1)
    }
  }

  hasEventListener (type, listener) {
    return this._listeners[type] && this._listeners[type].length > 0 && this._listeners[type].findIndex(element => this._listenerIndex(listener, element)) !== -1
  }

  dispatchEvent (event) {
//  console.info(event, event.type, this._listeners);

    if (!event || (event && (!event.type || event.type === ''))) {
      return
    }

    if (!event.isBubbling) {
      event.currentTarget = this
    }
    event.target = this

    if (this._listeners[event.type] && this._listeners[event.type].length > 0) {
      let listeners = [...this._listeners[event.type]]
      let i, j, dataKeys, key
      for (i = 0; i < listeners.length; i++) {
        let {listener, data, callee} = listeners[i]
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
        listener.call(callee || this, event)
      }
    }
    if (event.bubble && this.parent && this.parent.isEventDispatcher) {
      event.isBubbling = true
      this.parent.dispatchEvent(event)
    }
  }
}

export { Event, EventTarget }
