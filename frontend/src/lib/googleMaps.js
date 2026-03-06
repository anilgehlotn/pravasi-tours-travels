/**
 * Calculate distance between two locations using Google Maps Distance Matrix Service.
 * Called from the browser. Has timeout + fallback for graceful degradation.
 */

function waitForGoogleMaps(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(interval);
        resolve(window.google.maps);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Google Maps failed to load"));
      }
    }, 200);
  });
}

export async function calculateDistance(origin, destination) {
  // Wrap the entire operation in a timeout
  return Promise.race([
    _doCalculateDistance(origin, destination),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Distance calculation timed out")), 8000)
    ),
  ]);
}

async function _doCalculateDistance(origin, destination) {
  try {
    const maps = await waitForGoogleMaps();

    // Check if DistanceMatrixService exists
    if (!maps.DistanceMatrixService) {
      throw new Error("DistanceMatrixService not available");
    }

    const service = new maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: maps.TravelMode.DRIVING,
          unitSystem: maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === "OK" || status === maps.DistanceMatrixStatus.OK) {
            const element = response.rows[0]?.elements[0];
            if (element?.status === "OK") {
              const distanceKm = element.distance.value / 1000;
              const durationText = element.duration.text;
              resolve({
                distance_km: Math.round(distanceKm * 10) / 10,
                duration_text: durationText,
                status: "OK",
              });
            } else {
              reject(new Error(`Location not found: ${element?.status || "UNKNOWN"}`));
            }
          } else {
            reject(new Error(`Distance Matrix error: ${status}`));
          }
        }
      );
    });
  } catch (err) {
    console.error("Google Maps distance error:", err);
    throw err;
  }
}
