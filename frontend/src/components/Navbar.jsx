import React, { useState } from "react";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setResults(["Résultat 1", "Résultat 2", "Résultat 3"]);
    setSearch("");
  };

  return (
      <div className="flex flex-col items-center justify-center bg-blue-50 p-4">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md mb-4">
          <div className="flex items-center border-b border-b-2 border-teal-500 py-2">
            <input
                className="appearance-none bg-transparent border-none w-full text-black mr-3 py-1 px-2 leading-tight focus:outline-none"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Rechercher sur Twitter"
                aria-label="Search"
            />
            <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-black py-1 px-2 rounded" type="submit">
              Rechercher
            </button>
          </div>
        </form>
        <div>
          {results.map((result, index) => (
              <p key={index} className="text-black">{result}</p>
          ))}
        </div>
      </div>
  );
}