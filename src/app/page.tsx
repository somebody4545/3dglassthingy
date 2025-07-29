"use client";

import dynamic from "next/dynamic";
import { useProjectData } from "../hooks/useProjectData";
import PixelationEffect from "../components/PixelationEffect";

// Dynamically import ThreePlayer to avoid SSR issues
const ThreePlayer = dynamic(() => import("../components/ThreePlayer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
      Loading 3D Scene...
    </div>
  ),
});

function ThreeScene() {
  const { data: projectData, loading, error } = useProjectData('/app.json');

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        Loading 3D Scene...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-900/20 text-red-200">
        Error loading 3D scene: {error}
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <ThreePlayer 
        projectData={projectData}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <PixelationEffect tileSize={2} sigmaGauss={0}>
      <ThreeScene />
    </PixelationEffect>
  );
}
