import { Injectable } from '@angular/core';

export interface CameraSettings {
  aperture: string;
  exposure: string;
  iso: string;
  whiteBalance: string;
  timer: string;
  notes?: string;
}

export interface AstroSubject {
  id: string;
  name: string;
  tripod: CameraSettings;
  tracker: CameraSettings;
  intervalometer: string;
}

export interface CalibrationFrameGuide {
    title: string;
    content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AstrophotographyGuideService {

  private subjects: AstroSubject[] = [
    {
      id: 'milkyway',
      name: 'Milky Way (Wide Angle)',
      tripod: {
        aperture: 'f/1.8 - f/2.8',
        exposure: '15-25 seconds',
        iso: '3200-6400',
        whiteBalance: '4000-4800K (Kelvin)',
        timer: '2 or 10 seconds',
        notes: 'Use the widest aperture on your lens. Exposure time is limited by the "500 Rule" to avoid star trails.'
      },
      tracker: {
        aperture: 'f/2.8 - f/4',
        exposure: '60-180 seconds',
        iso: '800-1600',
        whiteBalance: '4000-4800K (Kelvin)',
        timer: '2 seconds',
        notes: 'A tracker allows for much longer exposures, resulting in a cleaner image with lower ISO.'
      },
      intervalometer: 'For stacking, take 30-50+ light frames with a 2-3 second interval between shots to allow the sensor to cool.'
    },
    {
      id: 'nebula_bright',
      name: 'Bright Nebulae/Clusters (e.g. Orion, Pleiades)',
      tripod: {
        aperture: 'f/1.8 - f/4',
        exposure: '2-5 seconds',
        iso: '6400 or higher',
        whiteBalance: '4500K (Kelvin)',
        timer: '2 seconds',
        notes: 'Very challenging without a tracker. Requires a fast lens and many stacked images to resolve detail.'
      },
      tracker: {
        aperture: 'f/4 - f/5.6',
        exposure: '120-300 seconds',
        iso: '400-1600',
        whiteBalance: '4500K (Kelvin)',
        timer: '2 seconds',
        notes: 'Requires a telephoto lens. Longer exposures are key. Guiding may be necessary for sharp stars over 180s.'
      },
      intervalometer: 'Take at least 50-100+ light frames for good signal-to-noise ratio. Use a 5-10 second interval.'
    },
    {
        id: 'galaxy_bright',
        name: 'Galaxies (e.g. Andromeda)',
        tripod: {
          aperture: 'f/2.8 - f/4',
          exposure: '1-3 seconds',
          iso: '12800 or higher',
          whiteBalance: '4500K (Kelvin)',
          timer: '2 seconds',
          notes: 'Extremely difficult without a tracker. Only the very bright core of Andromeda will be visible.'
        },
        tracker: {
          aperture: 'f/4 - f/6.3',
          exposure: '180-300+ seconds',
          iso: '800-1600',
          whiteBalance: '4500K (Kelvin)',
          timer: '2 seconds',
          notes: 'A long focal length (300mm+) is recommended. This is a faint object requiring significant total exposure time.'
        },
        intervalometer: 'Aim for 100+ light frames, which can mean hours of total imaging time. Use a 5-10 second interval.'
    },
    {
      id: 'full_moon',
      name: 'Full Moon',
      tripod: {
        aperture: 'f/8 - f/11',
        exposure: '1/125 - 1/250 sec',
        iso: '100-200',
        whiteBalance: '5500K (Daylight)',
        timer: '2 seconds',
        notes: 'The moon is very bright! Use settings similar to a sunny day. A smaller aperture (higher f-stop) increases sharpness.'
      },
      tracker: {
        aperture: 'f/8 - f/11',
        exposure: '1/125 - 1/250 sec',
        iso: '100-200',
        whiteBalance: '5500K (Daylight)',
        timer: '2 seconds',
        notes: 'A tracker is not necessary for exposure but helps keep the moon centered in the frame for high-magnification shots.'
      },
      intervalometer: 'Not typically used for single shots, but great for creating a moonrise/set timelapse.'
    },
    {
      id: 'star_trails',
      name: 'Star Trails',
      tripod: {
        aperture: 'f/2.8 - f/4',
        exposure: '20-30 seconds',
        iso: '800-3200',
        whiteBalance: '4000K (Kelvin)',
        timer: '2 seconds',
        notes: 'The goal is to take hundreds of consecutive photos and merge them in software. Use a sturdy tripod.'
      },
      tracker: {
        aperture: 'N/A',
        exposure: 'N/A',
        iso: 'N/A',
        whiteBalance: 'N/A',
        timer: 'N/A',
        notes: 'A star tracker is designed to prevent star trails, so it should not be used for this effect.'
      },
      intervalometer: 'Set to take as many photos as possible (100-500+) with the shortest possible interval (e.g., 1 second).'
    }
  ];

  private calibrationGuide: CalibrationFrameGuide[] = [
    {
        title: 'What Are Calibration Frames?',
        content: `Calibration frames are essential for high-quality astrophotography. They are special types of photos you take to help stacking software remove unwanted noise and artifacts from your final image. By subtracting these patterns, you are left with a much cleaner image, revealing faint details that were otherwise hidden. The three main types are Darks, Flats, and Bias frames.`
    },
    {
        title: '1. Dark Frames',
        content: `
**Purpose:** To remove thermal noise and hot pixels.
*   **How:** After your main imaging session, put the lens cap on. **Do not change any settings.** Use the exact same ISO, exposure time, and sensor temperature as your actual photos (your "Light Frames").
*   **When:** Immediately after taking your light frames, so the camera sensor temperature is the same.
*   **Quantity:** Take 20-30 dark frames.
`
    },
    {
        title: '2. Flat Frames',
        content: `
**Purpose:** To correct for vignetting (dark corners) and remove dust spots on your sensor or lens.
*   **How:** Point your telescope/lens at an evenly illuminated, featureless surface (like a white t-shirt, a tablet screen with a white image, or the twilight sky). Use your camera's Aperture Priority (Av) mode, keeping the **same aperture and ISO** as your light frames. The camera will determine the shutter speed.
*   **When:** Take these before you change your focus or rotate the camera. If you take the lens off, you'll need new flats.
*   **Quantity:** Take 20-30 flat frames.
`
    },
    {
        title: '3. Bias Frames',
        content: `
**Purpose:** To remove the camera sensor's readout noise, a fixed pattern present in every photo.
*   **How:** Put the lens cap on. Set your camera to its **fastest possible shutter speed** (e.g., 1/4000s or 1/8000s). Use the same ISO as your light frames.
*   **When:** These can be taken at any time, as they are not temperature-dependent. You can build a library of them for each ISO you use.
*   **Quantity:** Take 50-100 bias frames.
`
    },
    {
        title: 'Recommended Workflow & Stacking Order',
        content: `
1.  **Image Session:** Take all your **Light Frames** (your actual pictures of the sky).
2.  **Take Darks:** Immediately after, without changing settings, put the lens cap on and take your **Dark Frames**.
3.  **Take Flats:** If you haven't already, take your **Flat Frames** before disassembling your gear.
4.  **Take Bias:** Take your **Bias Frames** anytime.
5.  **Stacking:** Use specialized software (like DeepSkyStacker, Siril, or PixInsight) to combine these frames. The software will subtract the Darks, Flats, and Bias from the Lights, then align and average the Lights to create a final, clean master image.
`
    }
  ];


  getSubjects(): AstroSubject[] {
    return this.subjects;
  }

  getCalibrationGuide(): CalibrationFrameGuide[] {
    return this.calibrationGuide;
  }
}
