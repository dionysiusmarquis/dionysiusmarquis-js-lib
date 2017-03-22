import {
  Box3,
  DoubleSide,
  Geometry,
  Line,
  LineBasicMaterial,
  Object3D,
  PointCloud,
  PointCloudMaterial,
  ShaderMaterial,
  UniformsUtils,
  Vector2,
  Vector3
} from 'three'

import {BezierModifierShader} from './shaders'

function BezierModifier (target, mode, width, height, center) {
  mode = mode || BezierModifier.MODE_SIZE

  let size = new Vector2(width, height)

  if (!width || !height) {
    let boundingBox = new Box3().setFromObject(target)
    let boundingBoxSize = boundingBox.size()

    size.x = boundingBoxSize.x
    size.y = boundingBoxSize.y

    center = boundingBox.center()
  } else if (!center) {
    center = new Vector3(0.0, 0.0, 0.0, 0.0)
  }

  center.sub(target.position)

  this.controlPoints = new BezierModifierControlPoints(mode, size, center)
  target.add(this.controlPoints)

  this.material = new ShaderMaterial(BezierModifierShader)
  this.material.side = DoubleSide
  this.material.uniforms = UniformsUtils.clone(this.material.uniforms)

  target.material = this.material

  this.material.uniforms.size.value = size
  this.material.uniforms.center.value = center
  this.material.uniforms.respectBounds.value = 0
  this.material.uniforms.tDiffuse.value = null

  this.material.uniforms.anchorTL.value = this.controlPoints.topLeft.getAnchorPosition()
  this.material.uniforms.controlTLH.value = this.controlPoints.topLeft.getControlHPosition()
  this.material.uniforms.controlTLV.value = this.controlPoints.topLeft.getControlVPosition()

  this.material.uniforms.anchorTR.value = this.controlPoints.topRight.getAnchorPosition()
  this.material.uniforms.controlTRH.value = this.controlPoints.topRight.getControlHPosition()
  this.material.uniforms.controlTRV.value = this.controlPoints.topRight.getControlVPosition()

  this.material.uniforms.anchorBL.value = this.controlPoints.bottomLeft.getAnchorPosition()
  this.material.uniforms.controlBLH.value = this.controlPoints.bottomLeft.getControlHPosition()
  this.material.uniforms.controlBLV.value = this.controlPoints.bottomLeft.getControlVPosition()

  this.material.uniforms.anchorBR.value = this.controlPoints.bottomRight.getAnchorPosition()
  this.material.uniforms.controlBRH.value = this.controlPoints.bottomRight.getControlHPosition()
  this.material.uniforms.controlBRV.value = this.controlPoints.bottomRight.getControlVPosition()

  this.setCenter = function (x, y, z) {
    if (x !== undefined) {
      center.x = x
    }
    if (y !== undefined) {
      center.y = y
    }
    if (z !== undefined) {
      center.z = z
    }

    this.controlPoints.reset(size, center)
  }

  this.setSize = function (width, height) {
    size.x = width
    size.y = height

    this.controlPoints.reset(size, center)
  }

  this.setMode = function (mode) {
    this.material.defines[mode] = ''
  }

  this.setMode(mode)
}
BezierModifier.prototype = Object.create(ShaderMaterial.prototype)

BezierModifier.MODE_UV = 'MODE_UV'
BezierModifier.MODE_SIZE = 'MODE_SIZE'

function BezierModifierControlPoints (mode, size, center) {
  Object3D.call(this)

  this.topLeft = new BezierModifierControlPoint()
  this.topRight = new BezierModifierControlPoint()
  this.bottomLeft = new BezierModifierControlPoint()
  this.bottomRight = new BezierModifierControlPoint()

  let controlPoints = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight]

  this.add(this.topLeft)
  this.add(this.topRight)
  this.add(this.bottomLeft)
  this.add(this.bottomRight)

  console.log(center)

  // center = new Vector3();

  this.reset = function (size, center) {
    let w
    let h

    switch (mode) {
      case BezierModifier.MODE_SIZE:
        w = size.x
        h = size.y
        break

      case BezierModifier.MODE_UV:
        w = 1
        h = 1
        break
    }

    let third = 1 / 3
    let sixth = third * 2

    this.topLeft.anchor.x = 0
    this.topLeft.anchor.y = h
    this.topLeft.anchor.z = 0
    this.topLeft.controlH.x = w * third
    this.topLeft.controlH.y = h
    this.topLeft.controlH.z = 0
    this.topLeft.controlV.x = 0
    this.topLeft.controlV.y = h * sixth
    this.topLeft.controlV.z = 0

    this.topRight.anchor.x = w
    this.topRight.anchor.y = h
    this.topRight.anchor.z = 0
    this.topRight.controlH.x = w * sixth
    this.topRight.controlH.y = h
    this.topRight.controlH.z = 0
    this.topRight.controlV.x = w
    this.topRight.controlV.y = h * sixth
    this.topRight.controlV.z = 0

    this.bottomLeft.anchor.x = 0
    this.bottomLeft.anchor.y = 0
    this.bottomLeft.anchor.z = 0
    this.bottomLeft.controlH.x = w * third
    this.bottomLeft.controlH.y = 0
    this.bottomLeft.controlH.z = 0
    this.bottomLeft.controlV.x = 0
    this.bottomLeft.controlV.y = h * third
    this.bottomLeft.controlV.z = 0

    this.bottomRight.anchor.x = w
    this.bottomRight.anchor.y = 0
    this.bottomRight.anchor.z = 0
    this.bottomRight.controlH.x = w * sixth
    this.bottomRight.controlH.y = 0
    this.bottomRight.controlH.z = 0
    this.bottomRight.controlV.x = w
    this.bottomRight.controlV.y = h * third
    this.bottomRight.controlV.z = 0

    switch (mode) {
      case BezierModifier.MODE_SIZE:
        let i, controlPoint
        for (i = 0; i < controlPoints.length; i++) {
          controlPoint = controlPoints[i]
          controlPoint.anchor.x -= w * 0.5 - center.x
          controlPoint.anchor.y -= h * 0.5 - center.y
          controlPoint.anchor.z += center.z
          controlPoint.controlH.x -= w * 0.5 - center.x
          controlPoint.controlH.y -= h * 0.5 - center.y
          controlPoint.controlH.z += center.z
          controlPoint.controlV.x -= w * 0.5 - center.x
          controlPoint.controlV.y -= h * 0.5 - center.y
          controlPoint.controlV.z += center.z
        }
        break

      case BezierModifier.MODE_UV:
        this.scale.set(size.x, size.y, 1.0)
        this.position.set(-size.x * 0.5 - center.x, -size.y * 0.5 - center.y, center.z)
        break
    }

    this.update()
  }

  this.update = function () {
    this.topLeft.update()
    this.topRight.update()
    this.bottomLeft.update()
    this.bottomRight.update()
  }

  this.reset(size, center)
}
BezierModifierControlPoints.prototype = Object.create(Object3D.prototype)

function BezierModifierControlPoint () {
  Object3D.call(this)

  let anchorPosition = new Vector3()
  let controlHPosition = new Vector3()
  let controlVPosition = new Vector3()

  this.anchor = new Vector3()
  this.controlH = new Vector3()
  this.controlV = new Vector3()

  this.anchorOffset = new Vector3()
  this.controlHOffset = new Vector3()
  this.controlVOffset = new Vector3()

  let hLineGeometry = new Geometry()
  hLineGeometry.dynamic = true
  let vLineGeometry = new Geometry()
  vLineGeometry.dynamic = true
  let pointsGeometry = new Geometry()
  pointsGeometry.dynamic = true

  hLineGeometry.vertices[0] = anchorPosition
  hLineGeometry.vertices[1] = controlHPosition

  vLineGeometry.vertices[0] = anchorPosition
  vLineGeometry.vertices[1] = controlVPosition

  pointsGeometry.vertices[0] = anchorPosition
  pointsGeometry.vertices[1] = controlHPosition
  pointsGeometry.vertices[2] = controlVPosition

  let hLine = new Line(hLineGeometry, new LineBasicMaterial({color: 0xff0000, linewidth: 1}))
  let vLine = new Line(vLineGeometry, new LineBasicMaterial({color: 0x0000ff, linewidth: 1}))
  let points = new PointCloud(pointsGeometry, new PointCloudMaterial({color: 0x000000, size: 0.05}))

  this.add(hLine)
  this.add(vLine)
  this.add(points)

  this.update = function () {
    anchorPosition.copy(this.anchor.clone().add(this.anchorOffset))
    controlHPosition.copy(this.controlH.clone().add(this.controlHOffset))
    controlVPosition.copy(this.controlV.clone().add(this.controlVOffset))

    vLineGeometry.verticesNeedUpdate = true
    hLineGeometry.verticesNeedUpdate = true
    pointsGeometry.verticesNeedUpdate = true
  }

  this.getAnchorPosition = function () {
    return anchorPosition
  }

  this.getControlHPosition = function () {
    return controlHPosition
  }

  this.getControlVPosition = function () {
    return controlVPosition
  }
}
BezierModifierControlPoint.prototype = Object.create(Object3D.prototype)

export {
  BezierModifier,
  BezierModifierControlPoints,
  BezierModifierControlPoint
}
