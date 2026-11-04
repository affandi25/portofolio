import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-8 border-t border-white/10 bg-transparent text-center">
      <p className="text-sm text-gray-400">
        © 2026{" "}
        <a
          href="https://muhammadyusufaffandi.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors font-medium"
        >
          Muhammad Yusuf Affandi™
        </a>
        . All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
