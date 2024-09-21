import React from 'react';
import logo from './logo111.png';  // Make sure this path is correct

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 w-full">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="mr-2 w-12 h-12 object-contain" />
          <span className="text-xl font-bold">Fatures</span>
        </div>
        <a href="/" className="underline">Back to Home</a>
      </div>
    </header>
  );
};

export default Header;
