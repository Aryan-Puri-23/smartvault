import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      localStorage.setItem("user", JSON.stringify(userCred.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { Eye, EyeOff, Database } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"


// export default function LoginPage() {
//   const [formData, setFormData] = useState({ email: "", password: "" })
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")
//     setLoading(true)

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       })

//       const data = await res.json()

//       if (res.ok) {
//         localStorage.setItem("token", data.token)
//         localStorage.setItem("user", JSON.stringify(data.user))
//         navigate("/dashboard")
//       } else {
//         setError(data.error || "Failed to sign in")
//       }
//     } catch {
//       setError("Network error. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

  // const handleDemoLogin = () => {
  //   setFormData({
  //     email: "demo@smartmediavault.com",
  //     password: "demo123",
  //   })
  // }

  const handleDemoLogin = async () => {
  try {
    const userCred = await signInWithEmailAndPassword(
      auth,
      "hello@gmail.com",
      "123456"
    );
    localStorage.setItem("user", JSON.stringify(userCred.user));
    navigate("/dashboard");
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your SmartMedia Vault</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium py-2 px-4 rounded-md transition"
            >
              Try Demo Account
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </a>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
