import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { LocationData } from '../types';

export class LocationService {
  private watchId: number | null = null;

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Tourist Safety Location Permission',
            message: 'This app needs access to your location for safety monitoring.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    } else {
      // iOS permission handling would go here
      return true;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      // Check if permission is granted first
      if (Platform.OS === 'android') {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
          .then((granted) => {
            if (!granted) {
              reject({
                code: 1,
                message: 'Location permission not granted'
              });
              return;
            }
            
            this.getLocationWithPermission(resolve, reject);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        this.getLocationWithPermission(resolve, reject);
      }
    });
  }

  private getLocationWithPermission(
    resolve: (location: LocationData) => void, 
    reject: (error: any) => void
  ): void {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained from GPS:', position.coords);
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(),
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
        };
        resolve(locationData);
      },
      (error) => {
        console.error('Location error:', error);
        
        // For development/testing on emulator, provide fallback
        if (__DEV__ && (error.code === 2 || error.message?.includes('unavailable'))) {
          console.warn('GPS unavailable (likely emulator), using mock location');
          const mockLocation: LocationData = {
            latitude: 28.6139, // New Delhi coordinates
            longitude: 77.2090,
            timestamp: new Date(),
            accuracy: 100,
          };
          resolve(mockLocation);
          return;
        }
        
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // Increased timeout for slower emulators
        maximumAge: 10000,
        showLocationDialog: true,
      }
    );
  }

  // Start watching location changes
  startLocationTracking(
    onLocationUpdate: (location: LocationData) => void,
    onError: (error: any) => void
  ): void {
    if (this.watchId !== null) {
      this.stopLocationTracking();
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(),
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
        };
        onLocationUpdate(locationData);
      },
      (error) => {
        console.error('Location tracking error:', error);
        onError(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 30000, // Update every 30 seconds
        fastestInterval: 10000, // Fastest update every 10 seconds
      }
    );
  }

  // Stop watching location changes
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Format location for display
  formatLocation(location: LocationData): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
