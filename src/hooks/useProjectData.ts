"use client";

import { useState, useEffect } from 'react';

export interface ProjectData {
  metadata?: {
    type: string;
  };
  project?: {
    shadows?: boolean;
    shadowType?: number;
    toneMapping?: number;
    toneMappingExposure?: number;
  };
  camera?: any;
  scene?: any;
  scripts?: any;
  environment?: any;
}

export function useProjectData(jsonPath?: string): {
  data: ProjectData | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jsonPath) return;

    setLoading(true);
    setError(null);

    fetch(jsonPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load project data: ${response.status}`);
        }
        return response.json();
      })
      .then((projectData: ProjectData) => {
        setData(projectData);
      })
      .catch((err) => {
        setError(err.message);
        console.error('Error loading project data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [jsonPath]);

  return { data, loading, error };
}

// Function to load project data from a JSON object directly
export function useProjectDataFromObject(projectData?: ProjectData): {
  data: ProjectData | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectData) return;

    setLoading(true);
    setError(null);

    try {
      // Validate the project data structure
      if (typeof projectData !== 'object') {
        throw new Error('Invalid project data format');
      }

      setData(projectData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error processing project data:', err);
    } finally {
      setLoading(false);
    }
  }, [projectData]);

  return { data, loading, error };
}
