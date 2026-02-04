import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataService {
  getData() {
    return {
      soils: {
        "Red Soil": {
            characteristics: "Porous, friable structure with good drainage. Its reddish color comes from a high iron content.",
            profile: { "Nitrogen": 1, "Phosphorus": 1, "Humus": 1, "Lime": 1, "Iron": 3, "Potash": 2 },
            profileText: "<strong>Deficient in:</strong> Nitrogen, Phosphorus, Humus, and Lime.<br><strong>Sufficient in:</strong> Potash.<br><strong>Rich in:</strong> Iron.",
            crops: "Millets (Ragi), Pulses, Groundnut, Potato, Tobacco."
        },
        "Black Soil": {
            characteristics: "High clay content, leading to high moisture retention. It becomes sticky when wet and develops deep cracks when dry.",
            profile: { "Nitrogen": 1, "Phosphorus": 1, "Organic Matter": 1, "Iron": 3, "Lime": 3, "Calcium": 3, "Potash": 3, "Magnesium": 3 },
            profileText: "<strong>Deficient in:</strong> Nitrogen, Phosphorus, and Organic Matter.<br><strong>Rich in:</strong> Iron, Lime, Calcium, Potash, Aluminum, and Magnesium.",
            crops: "Cotton, Sugarcane, Jowar, Tobacco, Wheat, Rice."
        },
        "Alluvial Soil": {
            characteristics: "Formed by river silt deposits, it's generally fertile and varies from sandy loam to clay.",
            profile: { "Nitrogen": 1, "Phosphorus": 1, "Potash": 3, "Lime": 3 },
            profileText: "<strong>Deficient in:</strong> Nitrogen and Phosphorus.<br><strong>Rich in:</strong> Potash and Lime.",
            crops: "Paddy (Rice), Sugarcane, Wheat, Maize, Pulses, Oilseeds."
        },
        "Laterite Soil": {
            characteristics: "Forms in areas with high temperature and heavy rainfall. It becomes very hard when it dries out.",
            profile: { "Nitrogen": 1, "Potash": 1, "Lime": 1, "Organic Matter": 1, "Iron": 3, "Aluminum": 3 },
            profileText: "<strong>Deficient in:</strong> Nitrogen, Potash, Lime, and Organic Matter.<br><strong>Rich in:</strong> Iron and Aluminum.",
            crops: "Tea, Coffee, Rubber, Cashew, Coconut."
        }
      },
      crops: {
          "Paddy (Rice)": { macro: "<strong>N:</strong> Essential for vegetative growth.<br><strong>P:</strong> Crucial for root development and energy transfer.<br><strong>K:</strong> Important for grain filling and disease resistance.", micro: "<strong>Zinc (Zn):</strong> Often deficient in paddy soils.<br><strong>Iron (Fe):</strong> Important, especially in upland rice.", needs: { "Nitrogen (N)": 3, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Corn (Maize)": { macro: "<strong>N:</strong> High requirement for vegetative growth.<br><strong>P:</strong> Important for root system and grain formation.<br><strong>K:</strong> High requirement for stalk strength and water regulation.", micro: "<strong>Zinc (Zn)</strong> and <strong>Iron (Fe)</strong> are critical for preventing deficiencies and ensuring high yield.", needs: { "Nitrogen (N)": 3, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Millets (Ragi, Jowar)": { macro: "<strong>N:</strong> Moderate requirement.<br><strong>P:</strong> Important for early growth.<br><strong>K:</strong> Needed for stalk strength and grain quality.", micro: "Generally less demanding, but respond well to <strong>Zinc</strong> and <strong>Iron</strong>.", needs: { "Nitrogen (N)": 2, "Phosphorus (P)": 2, "Potassium (K)": 2 } },
          "Pulses (Black Gram, Green Gram)": { macro: "<strong>N:</strong> Low requirement as they fix atmospheric nitrogen.<br><strong>P:</strong> Very important for nodulation and root growth.<br><strong>K:</strong> Essential for yield and quality.", micro: "<strong>Sulphur (S), Zinc (Zn),</strong> and <strong>Molybdenum (Mo)</strong> are important for nitrogen fixation.", needs: { "Nitrogen (N)": 1, "Phosphorus (P)": 3, "Potassium (K)": 2 } },
          "Groundnut (Peanut)": { macro: "<strong>N:</strong> Low starter dose needed as it fixes nitrogen.<br><strong>P:</strong> High need for root development and pod formation.<br><strong>K:</strong> Essential for oil content and overall yield.", micro: "<strong>Calcium (Ca)</strong> is crucial for pod filling and preventing 'pops'.<br><strong>Sulphur (S)</strong> is important for oil synthesis.", needs: { "Nitrogen (N)": 1, "Phosphorus (P)": 3, "Potassium (K)": 2 } },
          "Potato": { macro: "<strong>N:</strong> Moderate need for foliage growth.<br><strong>P:</strong> Important for tuber initiation.<br><strong>K:</strong> Very high requirement for tuber bulking and starch synthesis.", micro: "<strong>Magnesium (Mg)</strong> and <strong>Sulphur (S)</strong> are important for quality.<br><strong>Boron (B)</strong> helps prevent internal brown spots.", needs: { "Nitrogen (N)": 2, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Banana": { macro: "<strong>N:</strong> Very high requirement for leaf and pseudostem growth.<br><strong>P:</strong> Moderate need for root development.<br><strong>K:</strong> Extremely high requirement for bunch development and fruit quality.", micro: "<strong>Magnesium (Mg)</strong> and <strong>Sulphur (S)</strong> are vital for healthy leaves and photosynthesis.", needs: { "Nitrogen (N)": 3, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Chilli": { macro: "<strong>N:</strong> Required for vegetative growth.<br><strong>P:</strong> Important for flowering and fruit set.<br><strong>K:</strong> Crucial for fruit development, color, and pungency.", micro: "<strong>Calcium (Ca)</strong> helps prevent blossom-end rot.<br><strong>Boron (B)</strong> is important for pollen viability and fruit set.", needs: { "Nitrogen (N)": 2, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Coconut": { macro: "<strong>N, P, K</strong> are required in balanced and large quantities.<br><strong>K</strong> is particularly important for nut development and yield.", micro: "<strong>Boron (B):</strong> Prevents button shedding.<br><strong>Magnesium (Mg):</strong> Prevents yellowing of leaves.", needs: { "Nitrogen (N)": 3, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Sugarcane": { macro: "Very high requirement for <strong>N, P, and K</strong> for cane growth and sugar accumulation.", micro: "<strong>Iron (Fe)</strong> and <strong>Manganese (Mn)</strong> are important for photosynthesis.", needs: { "Nitrogen (N)": 3, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Cotton": { macro: "<strong>N:</strong> Required for vegetative growth.<br><strong>P:</strong> For root development and flowering.<br><strong>K:</strong> Crucial for boll development and fiber quality.", micro: "<strong>Zinc (Zn)</strong> and <strong>Boron (B)</strong> are important for square retention and boll setting.", needs: { "Nitrogen (N)": 3, "Phosphorus (P)": 2, "Potassium (K)": 3 } },
          "Turmeric": { macro: "High requirement for <strong>K</strong> for rhizome development, followed by <strong>N</strong> and <strong>P</strong>.", micro: "<strong>Zinc (Zn)</strong> and <strong>Iron (Fe)</strong> are important for yield and quality.", needs: { "Nitrogen (N)": 2, "Phosphorus (P)": 2, "Potassium (K)": 3 } }
      },
      organics: {
          base: { name: "Cow Dung Base", description: "This is the foundational compost starter, rich in organic matter and beneficial microbes. Select an additive below to enhance it with specific nutrients.", nutrients: { "N": 1, "P": 1, "K": 1, "Ca": 1, "S": 1, "Mg": 1 } },
          additives: {
              "oil-cake": { name: "Crop Waste / Oil Cake", nutrient: 'N', description: "Mixing in crop waste or oil cakes creates a nitrogen-rich fertilizer, perfect for promoting leafy green growth and overall plant vigor." },
              "bone-meal": { name: "Bone Meal / Ash", nutrient: 'P', description: "Adding bone meal or ash from cattle waste significantly increases phosphorus, vital for strong root development and flowering." },
              "wood-ash": { name: "Wood Ash", nutrient: 'K', description: "Combining with wood ash makes a potassium-rich liquid fertilizer (when fermented), excellent for improving fruit quality and overall plant health." },
              "eggshells": { name: "Eggshells / Lime", nutrient: 'Ca', description: "Crushed eggshells or agricultural lime are fantastic calcium sources, essential for building strong cell walls and preventing blossom-end rot." },
              "gypsum": { name: "Gypsum", nutrient: 'S', description: "Gypsum is an excellent source of sulphur, a key component of amino acids and vitamins, and also improves soil structure." },
              "epsom-salt": { name: "Epsom Salt", nutrient: 'Mg', description: "Epsom salt (Magnesium Sulphate) provides a readily available source of magnesium, crucial for photosynthesis and chlorophyll production." },
              "vermicompost": { name: "Vermicompost", nutrient: 'All', description: "Mixing in vermicompost supercharges the base with a wide array of micronutrients, beneficial microbes, and growth hormones, improving overall soil fertility." }
          }
      }
    };
  }
}
