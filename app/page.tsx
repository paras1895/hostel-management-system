"use client";

import React from "react";
import {
  FaDumbbell,
  FaWifi,
  FaTshirt,
  FaUtensils,
  FaShieldAlt,
  FaBook,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

import Link from "next/link";

const HostelHomePage: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="font-poppins text-gray-800 bg-gray-100">
      {/* Navbar */}
      <header className="flex justify-between items-center bg-blue-600 px-4 py-4 fixed w-full top-0 z-50 shadow-md">
        <div className="text-white text-xl font-bold flex items-center">
          <img src="/hostel-logo.png" alt="logo" className="w-10 pr-3" />
          Hostel Management System
        </div>
        <ul className="hidden md:flex space-x-8 list-none pr-30">
          <li>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("about");
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#facilities"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("facilities");
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              Facilities
            </a>
          </li>
          <li>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              Contact
            </a>
          </li>
        </ul>
        <div className="flex space-x-4">
          <Link href={"/signup"} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transform hover:-translate-y-1 transition-all">
            Sign Up
          </Link>
          <Link href={"/login"} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transform hover:-translate-y-1 transition-all">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="h-screen flex items-center justify-center text-center text-white relative"
        style={{
          backgroundImage: "url('/hostel.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Glassy Blur Overlay */}
        <div className="absolute inset-0 bg-[#132440]/20 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl px-8 rounded-lg shadow-lg p-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            COEP Hostel Management System
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Empowering students with a smarter, simpler, and more connected
            hostel experience. From seamless room allocation to efficient
            maintenance management, we make hostel living effortless and
            organized.
          </p>
          <Link href="/signup" className="bg-green-500 text-white px-8 py-4 rounded text-lg hover:bg-green-600 transform hover:-translate-y-1 transition-all">
            Get Started
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg p-8 gap-8">
          <img
            src="/COEP-Hostel.jpg"
            alt="Hostel Interior"
            className="w-full md:w-1/2 rounded-lg"
          />
          <div>
            <h2 className="text-3xl font-bold pt-10 text-blue-600 mb-4">
              About Hostel Management System
            </h2>
            <p className="text-gray-700">
              COEP Hostel Management System is a smart digital platform designed
              to streamline hostel operations — from room allocation to
              maintenance and communication — creating a comfortable and
              efficient living experience for every student.
            </p>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section
        id="facilities"
        className="py-16 px-8 max-w-6xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold text-blue-600 mb-8">
          Our Facilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
            <FaDumbbell className="text-5xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Gym</h3>
            <p className="text-gray-700">
              Stay fit with our fully equipped gym, open 24/7 for your
              convenience.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
            <FaWifi className="text-5xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Free Wi-Fi</h3>
            <p className="text-gray-700">
              High-speed internet access throughout the hostel for work and
              entertainment.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
            <FaTshirt className="text-5xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Laundry</h3>
            <p className="text-gray-700">
              Self-service laundry facilities to keep your clothes fresh and
              clean.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
            <FaUtensils className="text-5xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Canteen</h3>
            <p className="text-gray-700">
              Enjoy delicious meals and snacks at our on-site canteen.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
            <FaShieldAlt className="text-5xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">24/7 Security</h3>
            <p className="text-gray-700">
              Round-the-clock security to ensure your safety and peace of mind.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
            <FaBook className="text-5xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Study Room</h3>
            <p className="text-gray-700">
              A quiet space for studying, working, or reading with comfortable
              seating.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-blue-600 text-white py-8 px-8">
        <div className="flex flex-col md:flex-row justify-around items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <ul className="list-none">
              <li>Address: COEP Hostel, Revenue Colony, Pune</li>
              <li>Phone: 12345 67890</li>
              <li>Email: hostel@gmail.com</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HostelHomePage;
