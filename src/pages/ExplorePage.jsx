import React, { useState } from 'react';
import SearchComponent from '../components/SearchComponent';

const ExplorePage = () => {
  const [searchResults, setSearchResults] = useState(null);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Explorar</h1>
      
      <SearchComponent 
        onResultSelect={(result, type) => {
          setSearchResults({ result, type });
        }}
      />
      
      {searchResults && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Resultado da pesquisa:</h2>
          <div className="bg-white p-4 rounded-lg border">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(searchResults, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
