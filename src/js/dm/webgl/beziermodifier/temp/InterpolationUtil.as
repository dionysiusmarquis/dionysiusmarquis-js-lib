package com.dionysiusmarquis.marquis3d.core.math
{
	import flash.geom.Vector3D;
	
	public class InterpolationUtil
	{
		public static function interpolate( v1 : Vector3D, v2 : Vector3D, f : Number ) : Vector3D
		{
			var dst : Vector3D = new Vector3D();
			dst.x = v2.x + f * ( v1.x - v2.x );
			dst.y = v2.y + f * ( v1.y - v2.y );
			dst.z = v2.z + f * ( v1.z - v2.z );
			
			return dst;
		}
		
		public static function interpolateTo( target : Vector3D, v1 : Vector3D, v2 : Vector3D, f : Number ) : void
		{
			target.x = v2.x + f * ( v1.x - v2.x );
			target.y = v2.y + f * ( v1.y - v2.y );
			target.z = v2.z + f * ( v1.z - v2.z );
		}
		
	}
}