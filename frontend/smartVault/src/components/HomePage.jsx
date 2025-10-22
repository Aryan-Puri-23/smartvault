import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import { Shield, Upload, Search, Database, Users, Lock } from "lucide-react";
import Navbar from "./Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 relative">

      <Navbar />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 mt-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Secure Media Management
            <span className="text-blue-600"> Made Simple</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-10 mt-16 leading-relaxed">
            Upload, organize, and access your personal files with enterprise-grade security. Your media, your control, your privacy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-16">
            <Link to="/signup">
              <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-10 sm:px-12 py-3 sm:py-4 text-base font-semibold rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer">
                Get Started Free
              </button>
            </Link>
            <Link to="/login">
              <button className="border border-gray-600 text-gray-800 px-10 sm:px-12 py-3 sm:py-4 text-base font-semibold rounded-full hover:scale-105 hover:bg-gray-100 transition-transform cursor-pointer">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 sm:py-20 py-0">
        <div className="text-center mb-24">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Everything You Need for Media Management
          </h3>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Built with modern technologies, security, and best practices to keep your files safe and accessible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 md:ml-0 md:mr-0 ml-6 mr-6">
          {[{
            icon: <Upload className="h-12 w-12 text-blue-500 mb-4" />,
            title: "Secure Upload",
            description: "Upload images, documents, videos, and more"
          }, {
            icon: <Search className="h-12 w-12 text-green-500 mb-4" />,
            title: "Smart Search",
            description: "Find files instantly with keyword search, date filters, and custom date ranges"
          }, {
            icon: <Shield className="h-12 w-12 text-purple-500 mb-4" />,
            title: "Privacy First",
            description: "Firebase authentication ensures only you can access your files"
          }, {
            icon: <Database className="h-12 w-12 text-orange-500 mb-4" />,
            title: "Organized Storage",
            description: "MongoDB backend stores metadata with tags, descriptions, and file information"
          }, {
            icon: <Users className="h-12 w-12 text-red-500 mb-4" />,
            title: "Personal Dashboard",
            description: "Manage all your files from a clean, intuitive dashboard built with React"
          }, {
            icon: <Lock className="h-12 w-12 text-indigo-500 mb-4" />,
            title: "Enterprise Security",
            description: "Firebase Authentication with secure API endpoints"
          }].map((feature, idx) => (
            <Card
              key={idx}
              className="border rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:-translate-y-2 p-6 sm:p-8 "
            >
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle className="text-xl sm:text-2xl font-semibold mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
<section className="mt-24 sm:mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 sm:py-8 text-center">
  <div className="container mx-auto px-4 sm:px-6">
    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
      Ready to Secure Your Media?
    </h3>
    <p className="text-base sm:text-lg mb-6 sm:mb-10 opacity-90 max-w-xl mx-auto">
      Join thousands of users who trust SmartMedia Vault with their personal files.
    </p>
    <Link to="/signup">
      <button className="bg-white text-blue-700 px-8 sm:px-10 md:px-12 py-2 sm:py-3 md:py-4 text-base font-semibold rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer">
        Start Your Free Account
      </button>
    </Link>
  </div>
</section>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <Database className="h-7 w-7 text-blue-500" />
            <span className="font-semibold text-lg">SmartMedia Vault</span>
          </div>
          <p className="text-sm text-gray-400">© 2024 SmartMedia Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}






// import { Link } from "react-router-dom"
// import { Card, CardDescription, CardHeader, CardTitle } from "./ui/Card"
// import { Shield, Upload, Search, Database, Users, Lock } from "lucide-react"
// import Navbar from "./Navbar"

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

//       <Navbar />

//       {/* Hero Section */}
//       <section className="container mx-auto px-4 py-20 text-center">
//         <div className="max-w-4xl mx-auto">
//           <h2 className="text-5xl font-bold text-gray-900 mb-6">
//             Secure Media Management
//             <span className="text-blue-600"> Made Simple</span>
//           </h2>
//           <p className="text-xl text-gray-600 mb-8 leading-relaxed">
//             Upload, organize, and access your personal files with enterprise-grade security. Your media, your control,
//             your privacy.
//           </p>
//           <div className="flex flex-wrap items-center justify-center gap-4">
//             <Link to="/signup">
//               <button className="bg-black text-white px-8 py-3 text-sm font-semibold rounded-md hover:opacity-90 transition cursor-pointer">
//                 Get Started Free
//               </button>
//             </Link>
//             <Link to="/login">
//               <button className="border border-gray-300 text-gray-800 px-8 py-3 text-sm font-semibold rounded-md hover:bg-gray-100 transition cursor-pointer">
//                 Sign In
//               </button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="container mx-auto px-12 py-20">
//         <div className="text-center mb-16">
//           <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Media Management</h3>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Built with modern technologies and security best practices to keep your files safe and accessible.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
//             <CardHeader>
//               <Upload className="h-12 w-12 text-blue-600 mb-4" />
//               <CardTitle>Secure Upload</CardTitle>
//               <CardDescription>
//                 Upload images, documents, videos, and more
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
//             <CardHeader>
//               <Search className="h-12 w-12 text-green-600 mb-4" />
//               <CardTitle>Smart Search</CardTitle>
//               <CardDescription>
//                 Find files instantly with keyword search, date filters, and custom date ranges
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
//             <CardHeader>
//               <Shield className="h-12 w-12 text-purple-600 mb-4" />
//               <CardTitle>Privacy First</CardTitle>
//               <CardDescription>
//                 Firebase authentication ensures only you can access your files
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
//             <CardHeader>
//               <Database className="h-12 w-12 text-orange-600 mb-4" />
//               <CardTitle>Organized Storage</CardTitle>
//               <CardDescription>
//                 MongoDB backend stores metadata with tags, descriptions, and file information
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
//             <CardHeader>
//               <Users className="h-12 w-12 text-red-600 mb-4" />
//               <CardTitle>Personal Dashboard</CardTitle>
//               <CardDescription>
//                 Manage all your files from a clean, intuitive dashboard built with React
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
//             <CardHeader>
//               <Lock className="h-12 w-12 text-indigo-600 mb-4" />
//               <CardTitle>Enterprise Security</CardTitle>
//               <CardDescription>
//                 Firebase Authentication with secure API endpoints
//               </CardDescription>
//             </CardHeader>
//           </Card>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="bg-blue-600 text-white py-20">
//         <div className="container mx-auto px-4 text-center">
//           <h3 className="text-3xl font-bold mb-4">Ready to Secure Your Media?</h3>
//           <p className="text-xl mb-8 opacity-90">
//             Join thousands of users who trust SmartMedia Vault with their personal files.
//           </p>
//           <Link to="/signup">
//             <button className="bg-white text-blue-600 px-8 py-3 text-sm font-semibold rounded-md hover:bg-gray-100 transition cursor-pointer">
//               Start Your Free Account
//             </button>
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-12">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Database className="h-6 w-6" />
//               <span className="font-semibold">SmartMedia Vault</span>
//             </div>
//             <p className="text-gray-400">© 2024 SmartMedia Vault. Secure media management platform.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }
