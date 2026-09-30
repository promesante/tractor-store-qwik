/**
 * Expected values, taken from the live blueprint (blueprint.the-tractor.store)
 * with the same inputs. The store must look and work the same.
 */
export const HOME_RECOS = [
  "TerraFirma AutoCultivator T-300 Silver",
  "Scandinavia Sower Baltic Blue",
  "Holland Hamster Polder Green",
  "Global Gallant Sahara Dawn",
];

export const RECOS: Record<string, string[]> = {
  "CL-01-GR": [
    "TerraFirma Veneto Tuscan Green",
    "Caribbean Cruiser Emerald Grove",
    "Greenland Rover Forest Fern",
    "Broadfield Majestic Rustic Crimson",
  ],
  "CL-01-GY": [
    "FarmFleet Sovereign Minted Jade",
    "Countryside Commander Pacific Teal",
    "TerraFirma Veneto Adriatic Blue",
    "FutureHarvest Navigator Majestic Violet",
  ],
  "CL-01-GR,CL-01-GY": [
    "FarmFleet Sovereign Minted Jade",
    "TerraFirma Veneto Tuscan Green",
    "Greenland Rover Forest Fern",
    "Caribbean Cruiser Emerald Grove",
  ],
  // No known SKUs, for example an empty cart: the first four items.
  "": [
    "TerraFirma AutoCultivator T-300 Silver",
    "SmartFarm Titan Sunset Copper",
    "SmartFarm Titan Cosmic Sapphire",
    "SmartFarm Titan Verdant Shadow",
  ],
};

export const STORES = [
  "Aurora Flagship Store",
  "Big Micro Machines",
  "Central Mall",
  "Downtown Model Store",
];
