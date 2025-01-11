import React, { useState, useEffect } from "react";
import { Search, Calculator, Edit, Trash2, Eye, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../server/firebase";

interface CalculatorItem {
  id: string;
  name: string;
  shortDescription?: string;
  popular?: boolean;
  recentlyAdded?: boolean;
  specialityTags?: string[];
}

const ExistingCalculators: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [calculators, setCalculators] = useState<CalculatorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch calculators from Firestore
  useEffect(() => {
    const fetchCalculators = async () => {
      try {
        const calculatorsCollection = collection(db, "Calculators");
        const calculatorsSnapshot = await getDocs(calculatorsCollection);
        const calculatorsList: CalculatorItem[] = calculatorsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as CalculatorItem)
        );
        setCalculators(calculatorsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching calculators:", err);
        setError("Failed to load calculators");
        setLoading(false);
      }
    };

    fetchCalculators();
  }, []);

  const filters = [
    { id: "all", label: "All" },
    { id: "popular", label: "Popular" },
    { id: "recent", label: "Recently Added" },
  ];

  const handleView = (id: string) => {
    navigate(`/create-calculator/${id}`); // Pass ID to the create/edit page
  };

  // Filter calculators based on search and filter criteria
  const filteredCalculators = calculators.filter((calc) => {
    const matchesSearch =
      calc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "popular" && calc.popular) ||
      (activeFilter === "recent" && calc.recentlyAdded);

    return matchesSearch && matchesFilter;
  });

  // Delete calculator
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this calculator?")) {
      try {
        await deleteDoc(doc(db, "Calculators", id));
        setCalculators((prev) => prev.filter((calc) => calc.id !== id)); // Remove from UI
        alert("Calculator deleted successfully!");
      } catch (error) {
        console.error("Error deleting calculator:", error);
        alert("Failed to delete calculator. Please try again.");
      }
    }
  };

  // Navigate to Edit Page
  const handleEdit = (id: string) => {
    navigate(`/create-calculator/${id}`); // Pass ID to the create/edit page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search calculators..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculators Grid */}
      {filteredCalculators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalculators.map((calculator) => (
            <div
              key={calculator.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {calculator.name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  {calculator.popular && (
                    <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      Popular
                    </span>
                  )}
                  {calculator.recentlyAdded && (
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      New
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                {calculator.shortDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {calculator.specialityTags?.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <button
                  onClick={() => handleView(calculator.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleEdit(calculator.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(calculator.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No calculators found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default ExistingCalculators;
