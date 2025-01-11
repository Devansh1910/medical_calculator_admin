import React, { useState } from "react";
import { Calculator, Save } from "lucide-react";
import { useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import FormulaEditor from "../components/FormulaEditor";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../server/firebase";
import { useEffect } from "react";


interface Parameter {
  name: string;
  symbol: string;
  units: string[]; // Array of strings for available units
}

function CreateCalculator() {
  const { id } = useParams<{ id: string }>(); // Get ID from URL
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    category: { popular: false, recentlyAdded: false },
    specialityTags: [] as string[],
    additionalField: "",
    whyToUse: "",
    whereToUse: "",
    parameters: [] as Parameter[],
    formula: "",
    medicalEvidences: "",
  });

  const [newParameter, setNewParameter] = useState<Parameter>({
    name: "",
    symbol: "",
    units: [],
  });

  const [newTag, setNewTag] = useState<string>("");
  const [formTouched, setFormTouched] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);

  const unitsOptions = [
    // Length
    "m",
    "cm",
    "millimeters (mm)",
    "micrometers (µm)",
    "nanometers (nm)",
    "angstroms (Å)",
    "fermi (fm)",
    "kilometers (km)",
    "feet (ft)",
    "inches (in)",
    "yards (yd)",
    "miles (mi)",
    "astronomical units (AU)",
    "light-years (ly)",
    "fathoms (ftm)",
    "chains (ch)",

    // Weight
    "kilograms (kg)",
    "grams (g)",
    "milligrams (mg)",
    "micrograms (µg)",
    "nanograms (ng)",
    "picograms (pg)",
    "femtograms (fg)",
    "attograms (ag)",
    "pounds (lbs)",
    "ounces (oz)",
    "stones (st)",
    "metric tonnes (tonne)",
    "carats (ct)",
    "grains (gr)",
    "atomic mass units (amu)",
    "daltons (Da)",

    // Volume
    "liters (L)",
    "milliliters (mL)",
    "microliters (µL)",
    "nanoliters (nL)",
    "attoliters (aL)",
    "cubic meters (m³)",
    "cubic centimeters (cm³)",
    "cubic millimeters (mm³)",
    "cubic inches (in³)",
    "cubic feet (ft³)",
    "cubic yards (yd³)",
    "gallons (gal)",
    "pints (pt)",
    "quarts (qt)",
    "fluid ounces (fl oz)",
    "teaspoons (tsp)",
    "tablespoons (tbsp)",
    "deciliters (dL)",
    "hectoliters (hL)",

    // Concentration
    "milligrams per deciliter (mg/dL)",
    "millimoles per liter (mmol/L)",
    "micromoles per liter (µmol/L)",
    "nanomoles per liter (nmol/L)",
    "femtomoles per liter (fmol/L)",
    "grams per deciliter (g/dL)",
    "nanograms per milliliter (ng/mL)",
    "picograms per milliliter (pg/mL)",
    "micrograms per liter (µg/L)",
    "milliequivalents per liter (mEq/L)",
    "millimoles per kilogram (mmol/kg)",
    "international units per liter (IU/L)",

    // Pressure
    "millimeters of mercury (mmHg)",
    "atmospheres (atm)",
    "kilopascals (kPa)",
    "hectopascals (hPa)",
    "megapascals (MPa)",
    "centimeters of water (cmH₂O)",
    "torr (Torr)",
    "pounds per square inch (psi)",
    "bars (bar)",
    "dynes per square centimeter (dyne/cm²)",
    "pascals (Pa)",

    // Time
    "seconds (s)",
    "milliseconds (ms)",
    "microseconds (µs)",
    "nanoseconds (ns)",
    "minutes (min)",
    "hours (h)",
    "days (d)",
    "weeks (wk)",
    "months (mo)",
    "years (yr)",
    "decades",
    "centuries",

    // Temperature
    "Celsius (°C)",
    "Fahrenheit (°F)",
    "Kelvin (K)",
    "Rankine (°R)",
    "Delisle (°D)",
    "Newton (°N)",

    // Energy
    "calories (cal)",
    "kilocalories (kcal)",
    "joules (J)",
    "kilojoules (kJ)",
    "megajoules (MJ)",
    "electron volts (eV)",
    "kilowatt-hour (kWh)",
    "thermal units (BTU)",
    "ergs",

    // Power
    "watts (W)",
    "kilowatts (kW)",
    "megawatts (MW)",

    // Speed/Flow Rate
    "meters per second (m/s)",
    "kilometers per hour (km/h)",
    "miles per hour (mph)",
    "liters per minute (L/min)",
    "milliliters per hour (mL/hr)",
    "cubic centimeters per second (cm³/s)",
    "liters per second (L/s)",
    "drops per minute (drops/min)",

    // Radiation
    "millisieverts (mSv)",
    "sieverts (Sv)",
    "gray (Gy)",
    "becquerels (Bq)",
    "curies (Ci)",
    "roentgens (R)",
    "counts per minute (CPM)",
    "counts per second (CPS)",
    "rad",

    // Body Surface Area
    "square centimeters (cm²)",
    "square meters (m²)",
    "square millimeters (mm²)",

    // Miscellaneous
    "percent (%)",
    "beats per minute (bpm)",
    "respirations per minute (resp/min)",
    "decibels (dB)",
    "newton-meters (N·m)",
    "micrograms per kilogram per minute (µg/kg/min)",
    "milliliters per kilogram per minute (mL/kg/min)",
    "kilograms per square meter (kg/m²)",
    "grams per square meter (g/m²)",
    "milligrams per square meter (mg/m²)",

    // Glucose-Specific
    "milligrams per deciliter (mg/dL)",
    "millimoles per liter (mmol/L)",

    // Hemoglobin-Specific
    "grams per deciliter (g/dL)",

    // Drug Dosing
    "micrograms per kilogram (µg/kg)",
    "milligrams per kilogram (mg/kg)",
    "grams per kilogram (g/kg)",
    "micrograms per kilogram per hour (µg/kg/h)",

    // Nutrition
    "millimoles of ATP per gram (mmol ATP/g)",
    "protein digestibility-corrected amino acid score (PDCAAS)",

    // Cardiology
    "milliseconds (ms)",
    "mL/beat (stroke volume)",
    "L/min/m² (cardiac index)",

    // Pulmonology
    "liters per second per meter squared (L/s/m²)",
    "mL/mmHg/min (pulmonary vascular resistance)",

    // Ophthalmology
    "diopters (D)",
    "microns (µm)",

    // Hematology
    "femtoliters (fL)",
    "gigaliters (G/L)",

    // Biochemistry
    "pH units",
    "milliosmoles per kilogram (mOsm/kg)",

    // Genetics
    "base pairs (bp)",
    "kilobases (kb)",
    "megabases (Mb)",
    "reads per kilobase per million (RPKM)",

    // Medical Imaging
    "counts per second (CPS)",
    "Gy/m² (Gray per square meter)",

    // Flow and Distribution
    "mL/m²/min",
    "m²/m² (perfusion matching)",

    // Respiratory
    "tidal volume (mL)",
    "inspiratory reserve volume (IRV)",

    // Rare Historical Units
    "scruple",
    "dram (dr)",
    "peck",
    "kilopond (kp)",
    "Planck Length",
    "Planck Time",
  ];

  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredUnits = unitsOptions.filter((unit) =>
    unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isLoading, setIsLoading] = useState<boolean>(true); // Track loading state
  const [mode, setMode] = useState<"Create" | "Update">("Create");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!isFormValid()) return;
  
    try {
      const calculatorData = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        category: formData.category,
        specialityTags: formData.specialityTags,
        additionalField: formData.additionalField,
        whyToUse: formData.whyToUse,
        whereToUse: formData.whereToUse,
        parameters: formData.parameters,
        formula: formData.formula,
        medicalEvidences: formData.medicalEvidences,
      };
  
      if (id) {
        // Update existing calculator
        const docRef = doc(db, "Calculators", id);
        await setDoc(docRef, calculatorData, { merge: true });
      } else {
        // Create a new calculator
        const docRef = doc(collection(db, "Calculators"));
        await setDoc(docRef, calculatorData);
      }
  
      alert("Calculator saved successfully!");
    } catch (error) {
      console.error("Error saving calculator:", error);
      alert("Failed to save calculator. Please try again.");
    }
  };  

  const addTag = () => {
    if (newTag && !formData.specialityTags.includes(newTag)) {
      setFormData({
        ...formData,
        specialityTags: [...formData.specialityTags, newTag],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      specialityTags: formData.specialityTags.filter((t) => t !== tag),
    });
  };

  const addParameter = () => {
    if (newParameter.name && newParameter.symbol && newParameter.units.length) {
      setFormData({
        ...formData,
        parameters: [...formData.parameters, newParameter],
      });
      setNewParameter({ name: "", symbol: "", units: [] });
    }
  };

  const updateParameter = (index: number, updated: Partial<Parameter>) => {
    const updatedParameters = [...formData.parameters];
    updatedParameters[index] = { ...updatedParameters[index], ...updated };
    setFormData({ ...formData, parameters: updatedParameters });
  };

  const removeParameter = (index: number) => {
    const updatedParameters = formData.parameters.filter((_, i) => i !== index);
    setFormData({ ...formData, parameters: updatedParameters });
  };

  const toggleUnit = (unit: string, selectedUnits: string[]) => {
    return selectedUnits.includes(unit)
      ? selectedUnits.filter((u) => u !== unit)
      : [...selectedUnits, unit];
  };

  const transformParametersForFormulaEditor = () => {
    return formData.parameters.map((param) => ({
      name: param.name,
      symbol: param.symbol,
      units: param.units,
    }));
  };

  const isFormValid = (): boolean => {
    // Check if all the basic fields are filled
    const requiredFieldsFilled =
      !!formData.name.trim() &&
      !!formData.shortDescription.trim() &&
      !!formData.longDescription.trim() &&
      !!formData.additionalField.trim() &&
      !!formData.whyToUse.trim() &&
      !!formData.whereToUse.trim() &&
      formData.parameters.length > 0 &&
      !!formData.formula.trim() &&
      !!formData.medicalEvidences.trim();

    // Check if each parameter has all required fields filled
    const allParametersValid = formData.parameters.every(
      (param) =>
        !!param.name.trim() && !!param.symbol.trim() && param.units.length > 0
    );

    return requiredFieldsFilled && allParametersValid;
  };

interface CalculatorData {
  name: string;
  shortDescription: string;
  longDescription: string;
  category: { popular: boolean; recentlyAdded: boolean };
  specialityTags: string[];
  additionalField: string;
  whyToUse: string;
  whereToUse: string;
  parameters: Parameter[];
  formula: string;
  medicalEvidences: string;
}

useEffect(() => {
  const fetchCalculatorDetails = async () => {
    if (id) {
      setMode("Update"); // Set mode to Update if ID exists
      try {
        const docRef = doc(db, "Calculators", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as CalculatorData;

          setFormData({
            name: data.name || "",
            shortDescription: data.shortDescription || "",
            longDescription: data.longDescription || "",
            category: data.category || { popular: false, recentlyAdded: false },
            specialityTags: data.specialityTags || [],
            additionalField: data.additionalField || "",
            whyToUse: data.whyToUse || "",
            whereToUse: data.whereToUse || "",
            parameters: data.parameters || [],
            formula: data.formula || "",
            medicalEvidences: data.medicalEvidences || "",
          });
        } else {
          console.error("No such calculator found!");
        }
      } catch (error) {
        console.error("Error fetching calculator details:", error);
      }
    } else {
      setMode("Create"); // Set mode to Create if no ID exists
    }
    setIsLoading(false); // Stop loading
  };

  fetchCalculatorDetails();
}, [id]);

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-blue-600">Loading...</div>
    </div>
  );
}

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md">
          {/* Mode Heading */}
          <h1 className="text-2xl font-bold mb-4">
            {mode === "Create" ? "Create Calculator" : "Update Calculator"}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.category.popular}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: {
                            ...formData.category,
                            popular: e.target.checked,
                          },
                        })
                      }
                    />
                    Popular
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.category.recentlyAdded}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: {
                            ...formData.category,
                            recentlyAdded: e.target.checked,
                          },
                        })
                      }
                    />
                    Recently Added
                  </label>
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Description
              </label>
              <textarea
                value={formData.longDescription}
                onChange={(e) =>
                  setFormData({ ...formData, longDescription: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Speciality Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Speciality Tags
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specialityTags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeTag(tag)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Additional Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Field
              </label>
              <input
                type="text"
                value={formData.additionalField}
                onChange={(e) =>
                  setFormData({ ...formData, additionalField: e.target.value })
                }
                placeholder="Enter additional information"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Rich Text Editors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why to Use
              </label>
              <RichTextEditor
                content={formData.whyToUse}
                onChange={(content) =>
                  setFormData({ ...formData, whyToUse: content })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where to Use
              </label>
              <RichTextEditor
                content={formData.whereToUse}
                onChange={(content) =>
                  setFormData({ ...formData, whereToUse: content })
                }
              />
            </div>

            {/* Parameters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parameters
              </label>
              <div className="space-y-4">
                {/* Stacked Parameters */}
                {formData.parameters.map((param, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-2"
                  >
                    <div className="text-sm">
                      <strong>{param.name}</strong> ({param.symbol}) - Units:{" "}
                      {param.units.join(", ")}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParameter(index)}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* New Parameter Form */}
                <div className="p-4 bg-white rounded-md shadow-md">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Parameter Name"
                      value={newParameter.name}
                      onChange={(e) =>
                        setNewParameter({
                          ...newParameter,
                          name: e.target.value,
                        })
                      }
                      className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Parameter Symbol"
                      value={newParameter.symbol}
                      onChange={(e) =>
                        setNewParameter({
                          ...newParameter,
                          symbol: e.target.value,
                        })
                      }
                      className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Units
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUnitDropdown((prev) => !prev)}
                      className="mt-2 w-full bg-gray-200 text-left px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {newParameter.units.length
                        ? newParameter.units.join(", ")
                        : "Select Units"}
                    </button>
                    {showUnitDropdown && (
                      <div className="relative mt-2">
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                          {/* Search Bar */}
                          <input
                            type="text"
                            placeholder="Search units..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
                          />
                          {/* Units List */}
                          <div
                            className="max-h-[400px] overflow-y-auto"
                            style={{
                              scrollbarWidth: "thin",
                              scrollbarColor: "#D1D5DB #E5E7EB",
                            }}
                          >
                            {filteredUnits.map((unit) => (
                              <label
                                key={unit}
                                className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                              >
                                <input
                                  type="checkbox"
                                  checked={newParameter.units.includes(unit)}
                                  onChange={() =>
                                    setNewParameter({
                                      ...newParameter,
                                      units: toggleUnit(
                                        unit,
                                        newParameter.units
                                      ),
                                    })
                                  }
                                  className="mr-2"
                                />
                                {unit}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addParameter}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Parameter
                  </button>
                </div>
              </div>
            </div>

            {/* Formula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formula
              </label>
              <FormulaEditor
                calculatorName={formData.name}
                parameters={transformParametersForFormulaEditor()}
                onChange={(formula) => setFormData({ ...formData, formula })}
              />
            </div>

            {/* Medical Evidences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Evidences
              </label>
              <RichTextEditor
                content={formData.medicalEvidences}
                onChange={(content) =>
                  setFormData({ ...formData, medicalEvidences: content })
                }
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {mode === "Create" ? "Save Calculator" : "Update Calculator"}
            </button>

            {saveButtonClicked && !isFormValid() && (
              <p className="text-sm text-red-500">
                Please fill in all required fields to enable saving.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCalculator;
