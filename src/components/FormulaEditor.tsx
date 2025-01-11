import React, { useState, useRef } from "react";
import "katex/dist/katex.min.css";
import {
  Divide,
  Plus,
  Minus,
  X,
  Square,
  Superscript,
  Subscript,
  SquareDot,
  Sigma,
} from "lucide-react";

interface Parameter {
  name: string;
  symbol: string;
  units: string[]; // Array of strings for available units
}

interface FormulaEditorProps {
  calculatorName: string;
  parameters: Parameter[];
  onChange: (formula: string) => void;
}

const mathComponents = [
  { symbol: "\\frac{}{} ", label: "Fraction", icon: <Divide size={16} /> },
  { symbol: "^{2} ", label: "Square", icon: <Square size={16} /> },
  { symbol: "^{} ", label: "Power", icon: <Superscript size={16} /> },
  { symbol: "_{} ", label: "Subscript", icon: <Subscript size={16} /> },
  { symbol: "\\sqrt{} ", label: "Square Root", icon: <SquareDot size={16} /> },
  { symbol: "\\sum_{i=1}^{n} ", label: "Summation", icon: <Sigma size={16} /> },
];

const operators = [
  { symbol: " + ", label: "Plus", icon: <Plus size={16} /> },
  { symbol: " - ", label: "Minus", icon: <Minus size={16} /> },
  { symbol: " \\times ", label: "Multiply", icon: <X size={16} /> },
  { symbol: " \\div ", label: "Divide", icon: <Divide size={16} /> },
];

const FormulaEditor: React.FC<FormulaEditorProps> = ({
  calculatorName,
  parameters,
  onChange,
}) => {
  const [formula, setFormula] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to convert calculator name to camel case
  const toCamelCase = (name: string) =>
    name
      .replace(/[^a-zA-Z0-9]/g, " ")
      .split(" ")
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("");

  const functionName = toCamelCase(calculatorName);

  const handleFormulaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newFormula = e.target.value;
    setFormula(newFormula);
    try {
      onChange(newFormula);
      setError(null);
    } catch {
      setError("Invalid LaTeX formula");
    }
  };

  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;

    const newFormula =
      formula.substring(0, start) + symbol + formula.substring(end);
    setFormula(newFormula);
    onChange(newFormula);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  const [paramValues, setParamValues] = useState<
    Record<string, { value: number; unit: string }>
  >({});

  const evaluateFormula = () => {
    try {
      const formulaWithValues = formula
        .replace(/\\frac{([^}]*)}{([^}]*)}/g, "($1) / ($2)") // Replace fractions
        .replace(/\^{2}/g, "**2") // Replace powers
        .replace(/\\times/g, "*") // Replace multiplication
        .replace(/\\div/g, "/") // Replace division
        .replace(/([a-zA-Z]+)/g, (match) => {
          if (paramValues[match]?.value !== undefined) {
            const { value, unit } = paramValues[match];
            const convertedValue = convertUnit(
              value,
              unit,
              parameters.find((p) => p.symbol === match)?.units[0] || unit
            );
            return String(convertedValue); // Use converted value for substitution
          } else {
            throw new Error(`Missing value for parameter: ${match}`);
          }
        });

      const result = eval(formulaWithValues); // Evaluate the formula
      setCalculatedResult(result);
      setError(null);
    } catch (err) {
      setCalculatedResult(null);
      setError(
        (err as Error).message ||
          "Failed to evaluate formula. Check your input."
      );
    }
  };

  const convertUnit = (value: number, from: string, to: string): number => {
    if (from === to) {
      return value;
    }
    const conversions: Record<string, number> = {
      "cm->m": 0.01,
      "m->cm": 100,
      "kg->lbs": 2.20462,
      "lbs->kg": 1 / 2.20462,
      // Add more conversions as needed
    };

    const key = `${from}->${to}`;
    if (conversions[key] !== undefined) {
      return value * conversions[key];
    } else {
      throw new Error(`Unsupported unit conversion: ${from} to ${to}`);
    }
  };

  const generateSwiftCode = () => {
    const swiftFormula = formula
      .replace(/\\frac{([^}]*)}{([^}]*)}/g, "($1) / ($2)") // Fractions
      .replace(/\\sqrt{([^}]*)}/g, "sqrt($1)") // Square roots
      .replace(/\^2/g, "**2") // Square powers
      .replace(/\^/g, "**") // Generic power
      .replace(/\\times/g, "*") // Multiplication
      .replace(/\\div/g, "/"); // Division

    const unitConversionFunction = `
    func convertUnit(value: Double, from: String, to: String) -> Double {
        if from == to {
            return value
        }
        switch (from, to) {
        case ("cm", "m"): return value / 100
        case ("m", "cm"): return value * 100
        case ("kg", "lbs"): return value * 2.20462
        case ("lbs", "kg"): return value / 2.20462
        // Add other conversions as needed
        default: fatalError("Unsupported unit conversion: \\(from) to \\(to)")
        }
    }
    `;

    const paramList = parameters
      .map(
        (param) =>
          `${param.symbol}: Double, from${param.symbol}Unit: String, to${param.symbol}Unit: String`
      )
      .join(", ");

    const convertedParams = parameters
      .map(
        (param) =>
          `let ${param.symbol}Converted = convertUnit(value: ${param.symbol}, from: from${param.symbol}Unit, to: to${param.symbol}Unit)`
      )
      .join("\n");

    const explanationLines = parameters
      .map(
        (param) => `For ${param.name} (${param.symbol}): Enter value and unit.`
      )
      .join("\n");

    return `
    import Foundation
  
    struct Formulas {
        static func ${functionName}(${paramList}) -> (String, Double) {
            ${unitConversionFunction}
            ${convertedParams}
            let result = ${swiftFormula}
            let explanation = """
            The formula for ${calculatorName} is: ${formula}.
            ${explanationLines}
            Result: \\(result).
            """
            return (explanation, round(result * 100) / 100)
        }
    }
    `;
  };

  const generateJavaCode = () => {
    const javaFormula = formula
      .replace(/\\frac{([^}]*)}{([^}]*)}/g, "($1) / ($2)") // Replace fractions
      .replace(/\\sqrt{([^}]*)}/g, "Math.sqrt($1)") // Square roots
      .replace(/\^2/g, "Math.pow($1, 2)") // Square powers
      .replace(/\^/g, "Math.pow") // Generic power
      .replace(/\\times/g, "*") // Multiplication
      .replace(/\\div/g, "/"); // Division

    const unitConversionFunction = `
    public static double convertUnit(double value, String from, String to) {
        if (from.equals(to)) {
            return value;
        }
        switch (from + "->" + to) {
            case "cm->m": return value / 100;
            case "m->cm": return value * 100;
            case "kg->lbs": return value * 2.20462;
            case "lbs->kg": return value / 2.20462;
            // Add other conversions as needed
            default: throw new IllegalArgumentException("Unsupported unit conversion: " + from + " to " + to);
        }
    }
    `;

    const paramList = parameters
      .map(
        (param) =>
          `double ${param.symbol}, String from${param.symbol}Unit, String to${param.symbol}Unit`
      )
      .join(", ");

    const convertedParams = parameters
      .map(
        (param) =>
          `double ${param.symbol}Converted = convertUnit(${param.symbol}, from${param.symbol}Unit, to${param.symbol}Unit);`
      )
      .join("\n");

    const explanationLines = parameters
      .map(
        (param) => `// ${param.name} (${param.symbol}): Enter value and unit`
      )
      .join("\n");

    return `
    public class Formulas {
        ${unitConversionFunction}
  
        public static String ${functionName}(${paramList}) {
            ${convertedParams}
            double result = ${javaFormula};
            String explanation = "The formula for ${calculatorName} is: ${formula}.\\n" +
                "${explanationLines}\\n" +
                "Result: " + result;
            return explanation;
        }
    }
    `;
  };

  return (
    <div className="space-y-4">
      {/* Parameters */}
      <div className="p-2 border rounded-md bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Parameters:</p>
        <div className="flex flex-wrap gap-2">
          {parameters.map((param) => (
            <button
              key={param.symbol}
              type="button"
              onClick={() => insertSymbol(param.symbol)}
              className="px-3 py-1 bg-blue-100 rounded-md hover:bg-blue-200 text-sm"
              title={`${param.name} (${param.units.join(", ")})`} // Use the units array
            >
              {param.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Math Components */}
      <div className="p-2 border rounded-md bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Math Components:
        </p>
        <div className="flex flex-wrap gap-2">
          {mathComponents.map((comp) => (
            <button
              key={comp.label}
              type="button"
              onClick={() => insertSymbol(comp.symbol)}
              className="px-3 py-1 bg-green-100 rounded-md hover:bg-green-200 text-sm flex items-center gap-1"
              title={comp.label}
            >
              {comp.icon}
              <span>{comp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Operators */}
      <div className="p-2 border rounded-md bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Operators:</p>
        <div className="flex flex-wrap gap-2">
          {operators.map((op) => (
            <button
              key={op.label}
              type="button"
              onClick={() => insertSymbol(op.symbol)}
              className="px-3 py-1 bg-purple-100 rounded-md hover:bg-purple-200 text-sm flex items-center gap-1"
              title={op.label}
            >
              {op.icon}
              <span>{op.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formula Input */}
      <textarea
        ref={textareaRef}
        value={formula}
        onChange={handleFormulaChange}
        className="w-full p-2 border rounded-md font-mono"
        rows={3}
        placeholder="Enter LaTeX formula (e.g., \\frac{w}{h^2})"
      />

      {/* Parameter Input Values */}
      <div className="p-4 border rounded-md bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Test Formula:</p>
        <div className="space-y-4">
          {parameters.map((param) => (
            <div key={param.symbol} className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium text-gray-700">
                {param.name} ({param.symbol}):
              </label>

              <input
                type="number"
                placeholder={`Enter ${param.name} value`}
                value={paramValues[param.symbol]?.value || ""}
                onChange={(e) =>
                  setParamValues({
                    ...paramValues,
                    [param.symbol]: {
                      ...paramValues[param.symbol],
                      value: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="flex-grow p-2 border rounded-md"
              />

              <select
                value={paramValues[param.symbol]?.unit || ""}
                onChange={(e) =>
                  setParamValues({
                    ...paramValues,
                    [param.symbol]: {
                      ...paramValues[param.symbol],
                      unit: e.target.value,
                    },
                  })
                }
                className="w-1/3 p-2 border rounded-md"
              >
                <option value="" disabled>
                  Select Unit
                </option>
                {param.units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={evaluateFormula}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Evaluate Formula
          </button>

          {calculatedResult !== null && (
            <div className="mt-4 p-2 bg-green-100 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                Result: {calculatedResult}
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-2 bg-red-100 rounded-md">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Code Outputs */}
      <div className="space-y-4">
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Swift Implementation:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {generateSwiftCode()}
          </pre>
        </div>
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Java Implementation:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {generateJavaCode()}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FormulaEditor;
