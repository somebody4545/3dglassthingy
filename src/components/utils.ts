// Helper function to dispatch events
export function dispatch(array: Array<(event: unknown) => void>, event: unknown) {
  for (let i = 0, l = array.length; i < l; i++) {
    const fn = array[i];
    if (fn) {
      fn(event);
    }
  }
}

// Camera configuration constants
export const CAMERA_CONFIGS = {
  sideview: {
    position: { x: 19.178403854370117, y: -0.23591174185276031, z: 1.6092607975006104 },
    matrix: [
      -0.0069840684784670225, 0.0000018543924965897307, -0.9999756636490419, 0,
      0.013963832155882514, 0.9999024963707595, -0.00009567247655881668, 0,
      0.9998781622101486, -0.01396416051014617, -0.00698341340083375, 0,
      19.178403854370117, -0.23591174185276031, 1.6092607975006104, 1
    ],
    fov: 32.26880414280885
  },
  intro: {
    position: { x: 14.86, y: 1.036, z: 20.462 },
    matrix: [
      0.8171439616690617, -0.024134028473317245, -0.5759282026237645, 0,
      0.04422503559001073, 0.9988030904518558, 0.020893365714606437, 0,
      0.5747346275759391, -0.04254333289096095, 0.8172332425272945, 0,
      14.86, 1.036, 20.462, 1
    ],
    fov: 33.43
  }
};

// Transition configuration
export const TRANSITION_CONFIG = {
  duration: 2000, // 2 seconds
  ease: (t: number) => 1 - Math.pow(1 - t, 3) // ease out cubic
};
