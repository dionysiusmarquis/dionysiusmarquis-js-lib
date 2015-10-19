package com.dionysiusmarquis.marquis3d.utils.modefier.beziermodifier 
{
	import com.dionysiusmarquis.marquis3d.core.math.InterpolationUtil;
	import com.dionysiusmarquis.marquis3d.objects.primitives.Plane;
	import com.dionysiusmarquis.marquis3d.utils.modefier.VertexModifier;

	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Point;
	import flash.geom.Vector3D;

	/**
	 * @author dmarkgraf
	 */
	public class PlaneBezierModifier extends VertexModifier 
	{
		private var _plane : Plane;
		private var _cpTL : ControlPoint3D;
		private var _cpTR : ControlPoint3D;
		private var _cpBL : ControlPoint3D;
		private var _cpBR : ControlPoint3D;
		
		private var _controlPoints : Vector.<ControlPoint3D>;
		
		private var vpTop : ViewPort;
		private var vpFront : ViewPort;
		
		private var _showControlPoints : Boolean;
		
		public function PlaneBezierModifier( plane : Plane, showControlPoints : Boolean = false )
		{
			super( plane.geometry );
			
			_plane = plane;
			
			_controlPoints = getflatControlPoints();
			_cpTL = _controlPoints[ 0 ];
			_cpTR = _controlPoints[ 1 ];
			_cpBL = _controlPoints[ 2 ];
			_cpBR = _controlPoints[ 3 ];
			
			this.showControlPoints = showControlPoints;
		}

		override public function modify() : void
		{
			var leftVertices : Vector.<Vector3D> = _getVertices3D( _cpTL.anchor3D, _cpTL.controlV3D, _cpBL.anchor3D, _cpBL.controlV3D, _plane.segmentsH );
			var rightVertices : Vector.<Vector3D> = _getVertices3D( _cpTR.anchor3D, _cpTR.controlV3D, _cpBR.anchor3D, _cpBR.controlV3D, _plane.segmentsH );
			
			var vertices : Vector.<Number> = new Vector.<Number>();
//			var vertices : Vector.<Number> = geometry.vertices;
			var position : Vector3D;
			var inter : Number;
			
			var anchor1 : Vector3D;
			var anchor2 : Vector3D;
			var control1 : Vector3D;
			var control2 : Vector3D;
			
			var i : int;
			var j : int;
			for( i = 0; i <= _plane.segmentsH; i++ )
			{
				inter = ( _plane.segmentsH - i ) / _plane.segmentsH;
	
				anchor1 = leftVertices[ i ];
				anchor2 = rightVertices[ i ];
				
				control1 = InterpolationUtil.interpolate( _cpTL.controlH3D, _cpBL.controlH3D, inter );
				control2 = InterpolationUtil.interpolate( _cpTR.controlH3D, _cpBR.controlH3D, inter );
				
				for( j = 0; j <= _plane.segmentsW; j++ )
				{
					position = _getVector3D( anchor1, control1, anchor2, control2, j * ( 1 / _plane.segmentsW ) );
					vertices.push( position.x, position.y, position.z );
				}
			}
			
			_plane.geometry.vertices = vertices;
		}

		private function _getVector3D( anchor1 : Vector3D, control1 : Vector3D, anchor2 : Vector3D, control2 : Vector3D, step : Number ) : Vector3D
		{
			var position : Vector3D = new Vector3D();
			
			position.x = Math.pow( step, 3 ) * ( anchor2.x + 3 * ( control1.x - control2.x ) - anchor1.x ) + 3 * Math.pow( step, 2 ) * ( anchor1.x - 2 * control1.x + control2.x ) + 3 * step * ( control1.x - anchor1.x ) + anchor1.x;
			position.y = Math.pow( step, 3 ) * ( anchor2.y + 3 * ( control1.y - control2.y ) - anchor1.y ) + 3 * Math.pow( step, 2 ) * ( anchor1.y - 2 * control1.y + control2.y ) + 3 * step * ( control1.y - anchor1.y ) + anchor1.y;
			position.z = Math.pow( step, 3 ) * ( anchor2.z + 3 * ( control1.z - control2.z ) - anchor1.z ) + 3 * Math.pow( step, 2 ) * ( anchor1.z - 2 * control1.z + control2.z ) + 3 * step * ( control1.z - anchor1.z ) + anchor1.z;
			
			return position;
		}

		private function _getVertices3D( anchor1 : Vector3D, control1 : Vector3D, anchor2 : Vector3D, control2 : Vector3D, steps : int ) : Vector.<Vector3D>
		{
			var arr : Vector.<Vector3D> = new Vector.<Vector3D>();
			
			var i : int;
			for( i = 0; i <= steps; i++ )
				arr.push( _getVector3D( anchor1, control1, anchor2, control2, 1 - ( steps - i ) / steps ) );
			
			return arr;
		}
		
		public function getflatControlPoints( centered : Boolean = true ) : Vector.<ControlPoint3D>
		{
			
			var w : Number = _plane.width;
			var h : Number = _plane.height;
			
			var cpArray : Vector.<ControlPoint3D> = new Vector.<ControlPoint3D>( 4, true );
			var third : Number = ( 1 / 3 );
			var sixth : Number = third * 2;
			
			var cpTL : ControlPoint3D = new ControlPoint3D( "cpTL" );
			cpTL.anchor3D.x = 0;
			cpTL.anchor3D.y = 0;
			cpTL.anchor3D.z = 0;
			cpTL.controlH3D.x = w * third;
			cpTL.controlH3D.y = 0;
			cpTL.controlH3D.z = 0;
			cpTL.controlV3D.x = 0;
			cpTL.controlV3D.y = h * third;
			cpTL.controlV3D.z = 0;
			cpArray[ 0 ] = cpTL;
			
			var cpTR : ControlPoint3D = new ControlPoint3D( "cpTR" );
			cpTR.anchor3D.x = w;
			cpTR.anchor3D.y = 0;
			cpTR.anchor3D.z = 0;
			cpTR.controlH3D.x = w * sixth;
			cpTR.controlH3D.y = 0;
			cpTR.controlH3D.z = 0;
			cpTR.controlV3D.x = w;
			cpTR.controlV3D.y = h * third;
			cpTR.controlV3D.z = 0;
			cpArray[ 1 ] = cpTR;
			
			var cpBL : ControlPoint3D = new ControlPoint3D( "cpBL" );
			cpBL.anchor3D.x = 0;
			cpBL.anchor3D.y = h;
			cpBL.anchor3D.z = 0;
			cpBL.controlH3D.x = w * third;
			cpBL.controlH3D.y = h;
			cpBL.controlH3D.z = 0;
			cpBL.controlV3D.x = 0;
			cpBL.controlV3D.y = h * sixth;
			cpBL.controlV3D.z = 0;
			cpArray[ 2 ] = cpBL;
			
			var cpBR : ControlPoint3D = new ControlPoint3D( "cpBR" );
			cpBR.anchor3D.x = w;
			cpBR.anchor3D.y = h;
			cpBR.anchor3D.z = 0;
			cpBR.controlH3D.x = w * sixth;
			cpBR.controlH3D.y = h;
			cpBR.controlH3D.z = 0;
			cpBR.controlV3D.x = w;
			cpBR.controlV3D.y = h * sixth;
			cpBR.controlV3D.z = 0;
			cpArray[ 3 ] = cpBR;
			
			if( centered )
			{
				for each( var cp : ControlPoint3D in cpArray )
				{
					cp.anchor3D.x -= w * .5;
					cp.anchor3D.y -= h * .5;
					cp.controlH3D.x -= w * .5;
					cp.controlH3D.y -= h * .5;
					cp.controlV3D.x -= w * .5;
					cp.controlV3D.y -= h * .5;
				}				
			}
			
			return cpArray;
		}

		public function update() : void { { dispatchEvent( new Event( Event.CHANGE ) ); } }
		
		public function set showControlPoints( showControlPoints : Boolean ) : void
		{
			_showControlPoints = showControlPoints;
			
			if( _showControlPoints )
			{
				if( !vpFront )
				{
					vpFront = new ViewPortFront( _cpTL, _cpTR, _cpBL, _cpBR, "front", 0x21a5fd );
					vpFront.update2D();
					vpFront.addEventListener( Event.CHANGE, _changeViewPortTop );
					addChild( vpFront );
				}
				
				if( !vpTop )
				{
					vpTop = new ViewPort( _cpTL, _cpTR, _cpBL, _cpBR, "top" );
					vpTop.update2D();
					vpTop.addEventListener( Event.CHANGE, _changeViewPortFront );
					addChild( vpTop );
				}
			} else {
				if( vpFront ) 
				{
					vpFront.parent.removeChild( vpFront );
					vpFront.destroy();
				}
				if( vpTop ) 
				{
					vpTop.parent.removeChild( vpTop );
					vpTop.destroy();
				}
			}
		}
		
		public function updateViewPorts() : void
		{
			if( vpTop ) _changeViewPortTop( null );
			if( vpFront ) _changeViewPortFront( null );
		}
		
		private function _changeViewPortTop( event : Event ) : void
		{
			try { vpTop.update2D(); } catch(e : *){}
			if( event ) dispatchEvent( new Event( Event.CHANGE ) );
		}

		private function _changeViewPortFront( event : Event ) : void
		{
			try { vpFront.update2D(); } catch(e : *){}
			if( event ) dispatchEvent( new Event( Event.CHANGE ) );
		}
		
		override public function destroy() : void
		{
			showControlPoints = false;
			super.destroy();
		}

		public function get plane() : Plane { return _plane; }
		public function get cpTL() : ControlPoint3D { return _cpTL; }
		public function get cpTR() : ControlPoint3D { return _cpTR; }
		public function get cpBL() : ControlPoint3D { return _cpBL; }
		public function get cpBR() : ControlPoint3D { return _cpBR; }
		public function get controlPoints() : Vector.<ControlPoint3D> { return _controlPoints; }


		public function get showControlPoints() : Boolean { return _showControlPoints; }

		
//		public function set cpTL( cp : ControlPoint3D ) : void { _cpTL = cp; }
//		public function set cpTR( cp : ControlPoint3D ) : void { _cpTR = cp; }
//		public function set cpBL( cp : ControlPoint3D ) : void { _cpBL = cp; }
//		public function set cpBR( cp : ControlPoint3D ) : void { _cpBR = cp; }
	}
}
