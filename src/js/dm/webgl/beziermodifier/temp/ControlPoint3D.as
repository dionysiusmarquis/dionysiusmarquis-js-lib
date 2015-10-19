package com.dionysiusmarquis.marquis3d.utils.modefier.beziermodifier 
{
	import flash.geom.Vector3D;
	import flash.events.EventDispatcher;
	import flash.events.Event;

	/**
	 * @author kris@neuroproductions.be
	 */
	
	
	public class ControlPoint3D extends EventDispatcher
	{		
		public var name : String;
		
		public var controlH3D : Vector3D;
		public var controlV3D : Vector3D;
		public var anchor3D : Vector3D;	
		
//		public var anchorH : Point = new Point();
//		public var anchorV : Point = new Point();
//		public var control : Point = new Point();
		
		public function ControlPoint3D( name : String ="" )
		{
			controlH3D = new Vector3D();
			controlV3D = new Vector3D();
			anchor3D = new Vector3D();
			
			this.name = name;
		}

		override public function toString() : String
		{
			var s:String = name+".anchor3D.x = "+anchor3D.x+";\n";
			s+= name + ".anchor3D.y = " + anchor3D.y + ";\n";
			s+= name + ".anchor3D.z = " + anchor3D.z + ";\n";
			
			s+= name+".controlH3D.x = " + controlH3D.x + ";\n";
			s+= name+".controlH3D.y = " + controlH3D.y + ";\n";
			s+= name+".controlH3D.z = " + controlH3D.z + ";\n";
				
			s+= name+".controlV3D.x = " + controlV3D.x + ";\n";
			s+= name+".controlV3D.y = " + controlV3D.y + ";\n";
			s+= name+".controlV3D.z = " + controlV3D.z + ";\n";
			return s;
		}
	}
}
