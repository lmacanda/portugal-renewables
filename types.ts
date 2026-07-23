export interface DamFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    basin: string;
    district: string;
    municipality: string;
    yearOperational: number;
    damType: string;
  };
}