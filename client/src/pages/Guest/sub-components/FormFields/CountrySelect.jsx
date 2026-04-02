import React, { useState } from "react";

/**
 * CountrySelect Component
 * Custom dropdown showing country flags and names
 * Uses REST Countries API flag URLs
 */
export const CountrySelect = ({
    value,
    onChange,
    disabled = false,
    loading = false,
    error = false,
    countries = [],
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedCountry = countries.find((c) => c.name.common === value);

    const handleSelect = (countryName) => {
        onChange({ target: { name: "country", value: countryName } });
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Main Button */}
            <button
                type="button"
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body text-sm focus:ring-0 transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
            >
                <span className="flex items-center gap-2">
                    {loading ? (
                        <span>Loading countries...</span>
                    ) : selectedCountry ? (
                        <>
                            {selectedCountry.flags?.svg && (
                                <img
                                    src={selectedCountry.flags.svg}
                                    alt={selectedCountry.name.common}
                                    className="w-5 h-4 object-cover rounded-sm"
                                />
                            )}
                            <span>{selectedCountry.name.common}</span>
                        </>
                    ) : (
                        <span className="text-[#879398]">Select a country</span>
                    )}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && !disabled && !loading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-[#3d484d] shadow-lg z-50 max-h-64 overflow-y-auto rounded-sm">
                    {error ? (
                        <div className="p-3 text-[#ffb4ab] text-[10px]">
                            Failed to load countries
                        </div>
                    ) : (
                        countries.map((country) => (
                            <button
                                key={country.name.common}
                                onClick={() => handleSelect(country.name.common)}
                                className="w-full px-3 py-2 text-left hover:bg-[#2a2a4e] transition-colors flex items-center gap-2 text-[#e3e0f4] text-sm border-b border-[#2a2a4e] last:border-0"
                            >
                                {country.flags?.svg && (
                                    <img
                                        src={country.flags.svg}
                                        alt={country.name.common}
                                        className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                                    />
                                )}
                                <span>{country.name.common}</span>
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Hidden input for form submission */}
            <input
                type="hidden"
                name="country"
                value={value}
            />
        </div>
    );
};

export default CountrySelect;
