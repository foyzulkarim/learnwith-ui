import { Link } from "wouter";
import { BookOpen, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BookOpen className="mr-2" />
              Foyzul's Academy
            </h3>
            <p className="text-gray-300 mb-4">
              The modern learning platform designed to help you achieve your educational goals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">For Students</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Course Catalog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Student Success Stories</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Career Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Student Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">For Instructors</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Become an Instructor</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Instructor Resources</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Success Guidelines</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Instructor FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Partners</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-gray-300 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Foyzul's Academy. All rights reserved.
          </p>
          <div className="flex flex-wrap space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Cookie Settings</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
