
import { Injectable } from '@angular/core';

export interface Constellation {
  id: string;
  name: string;
  month: 'March' | 'April' | 'May' | 'June';
  hemi: 'Northern' | 'Southern';
  myth: string;
  pro_tip: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConstellationService {
  private constellations: Constellation[] = [
    {
      "id": "MAR-N-LEO",
      "name": "Leo (The Lion)",
      "month": "March",
      "hemi": "Northern",
      "myth": "Represents the Nemean Lion, a vicious monster in Greek mythology that was killed by Heracles (Hercules) during his first labor.",
      "pro_tip": "Look for the distinctive 'sickle' or 'question mark' asterism which forms the lion's head and mane. The bright star Regulus marks the lion's heart."
    },
    {
      "id": "MAR-S-CAR",
      "name": "Carina (The Keel)",
      "month": "March",
      "hemi": "Southern",
      "myth": "Part of the former giant constellation Argo Navis, the ship of Jason and the Argonauts. Carina represents the ship's keel.",
      "pro_tip": "Home to Canopus, the second-brightest star in the night sky. Also contains the spectacular Carina Nebula (NGC 3372)."
    },
    {
      "id": "APR-N-UMA",
      "name": "Ursa Major (The Great Bear)",
      "month": "April",
      "hemi": "Northern",
      "myth": "Commonly associated with the myth of Callisto, a nymph who was turned into a bear by a jealous Hera, wife of Zeus.",
      "pro_tip": "Features the famous 'Big Dipper' asterism. The two outer stars of the Dipper's bowl, Dubhe and Merak, point directly to Polaris, the North Star."
    },
    {
      "id": "APR-S-CRU",
      "name": "Crux (The Southern Cross)",
      "month": "April",
      "hemi": "Southern",
      "myth": "Though not from classical mythology, it's a key cultural icon in the Southern Hemisphere, featured on many national flags. It was used by sailors for navigation.",
      "pro_tip": "The smallest of the 88 constellations. Use the two 'Pointer Stars', Alpha and Beta Centauri, to easily locate it. The Coalsack Nebula, a dark nebula, is visible nearby."
    },
    {
      "id": "MAY-N-BOO",
      "name": "Boötes (The Herdsman)",
      "month": "May",
      "hemi": "Northern",
      "myth": "Often depicted as a herdsman driving the bears (Ursa Major and Ursa Minor) around the North Pole. Sometimes identified as the inventor of the plow.",
      "pro_tip": "Easily find its brightest star, Arcturus, by following the arc of the Big Dipper's handle. 'Arc to Arcturus, then speed on to Spica'."
    },
    {
      "id": "MAY-S-CEN",
      "name": "Centaurus (The Centaur)",
      "month": "May",
      "hemi": "Southern",
      "myth": "Represents a centaur; usually identified as Chiron, the wise and benevolent tutor to many Greek heroes like Achilles and Heracles.",
      "pro_tip": "Contains Alpha Centauri, the closest star system to our Sun. Also home to Omega Centauri, the Milky Way's largest and brightest globular cluster."
    },
    {
      "id": "JUN-N-HER",
      "name": "Hercules",
      "month": "June",
      "hemi": "Northern",
      "myth": "Named after the Roman equivalent of the Greek hero Heracles, representing his victory over the dragon Ladon as part of his twelve labors.",
      "pro_tip": "Look for the 'Keystone' asterism, a trapezoid of four stars that forms his torso. This is the location of M13, the Great Globular Cluster in Hercules."
    },
    {
      "id": "JUN-S-SCO",
      "name": "Scorpius (The Scorpion)",
      "month": "June",
      "hemi": "Southern",
      "myth": "The scorpion that stung and killed the hunter Orion in Greek mythology. Zeus placed both in the sky, but they are never visible at the same time.",
      "pro_tip": "A bright, J-shaped zodiac constellation. Its heart is marked by the brilliant red supergiant star Antares. It lies in a rich part of the Milky Way."
    }
  ];

  getConstellations(month: string, hemi: string): Constellation[] {
    return this.constellations.filter(c => c.month === month && c.hemi === hemi);
  }

  getAllConstellations(): Constellation[] {
    return this.constellations;
  }
}
