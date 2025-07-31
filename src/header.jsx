import React from 'react';

const Header = () => {

    return (
        <header className="sticky top-0 z-50 bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-6 ">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold">Viet-Travle</span>
            </div>
          </div>
        </div>
      </header>
    )
}

export default Header;