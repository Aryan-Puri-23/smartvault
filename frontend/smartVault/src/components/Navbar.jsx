import { Link, useNavigate } from "react-router-dom";
import { Database, User, Menu, X, Moon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../Firebase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap sm:flex-nowrap">
        {/* Left Side (Logo) */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* <Database className="h-8 w-8 text-blue-600" /> */}
          <h1 className="text-2xl font-bold text-gray-900">SmartMedia Vault</h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center ml-auto space-x-2 sm:space-x-4">
          {/* Desktop Menu (sm+) */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            {/* <button className="flex items-center justify-center bg-gray-200 text-gray-700 rounded-md p-2 hover:bg-gray-300 transition">
              <Moon className="h-5 w-5" />
            </button> */}

            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-600 transition cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-sm font-medium hover:bg-gray-300 px-4 py-2 rounded-md transition cursor-pointer">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition cursor-pointer">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Hamburger (below sm) */}
          <div className="sm:hidden relative" ref={menuRef}>
            <button
              className="flex items-center justify-center p-2 rounded-md border hover:bg-gray-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
              <div
                className="absolute right-0 mt-2  w-48 bg-white rounded-md shadow-lg flex flex-col space-y-2 p-2 z-50"
                onClick={(e) => e.stopPropagation()} // Stops clicks inside dropdown from closing
              >
                {/* Dark Mode Toggle */}
                <button className="flex items-center justify-center bg-gray-200 text-gray-700 rounded-md p-2 hover:bg-gray-300 transition w-full">
                  <Moon className="h-5 w-5 mr-2" /> Dark Mode
                </button>

                {user ? (
                  <>
                    <div className="flex items-center space-x-2 px-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                        {user.displayName || user.email}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false); // close menu on logout
                      }}
                      className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-600 transition cursor-pointer w-full"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <button
                        onClick={() => setMobileMenuOpen(false)} // close menu when clicked
                        className="text-sm font-medium hover:bg-gray-300 px-4 py-2 rounded-md transition cursor-pointer w-full"
                      >
                        Login
                      </button>
                    </Link>
                    <Link to="/signup">
                      <button
                        onClick={() => setMobileMenuOpen(false)} // close menu when clicked
                        className="bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition cursor-pointer w-full"
                      >
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}