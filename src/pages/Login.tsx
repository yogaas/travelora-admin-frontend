import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Plane, Loader2, AlertCircle } from "lucide-react";
import { authService, LoginCredentials } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

export function Login() {
  const [email, setEmail] = useState("admin@travelora.com");
  const [password, setPassword] = useState("password");
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // 1. Perform login to get token
      const loginRes = await authService.login(credentials);
      
      // Temporary token set to allow /auth/me call
      useAuthStore.setState({ token: loginRes.access_token });
      
      // 2. Fetch user profile
      const userRes = await authService.getMe();
      
      return { token: loginRes.access_token, user: userRes };
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate("/", { replace: true });
    },
    onError: () => {
      // Reset the temporary token if login fails
      useAuthStore.getState().clearAuth();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-base-bg flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-tr from-primary-blue to-indigo-400 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.3)] mb-4">
            <Plane className="h-7 w-7 text-white transform -rotate-45" />
          </div>
          <h1 className="text-3xl font-poppins font-bold text-text-primary tracking-tight">Travelora</h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">Tour & Travel Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[24px] shadow-premium p-8 border border-gray-50">
          <h2 className="text-xl font-bold text-text-primary mb-2">Welcome Back</h2>
          <p className="text-sm text-text-secondary mb-8">Sign in to your account to continue</p>

          {loginMutation.isError && (
            <div className="mb-6 p-4 bg-rose-50 rounded-xl flex items-start space-x-3 border border-rose-100">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-600 font-medium leading-relaxed">
                {(loginMutation.error as any)?.response?.data?.message || 
                  (loginMutation.error as any)?.response?.data?.error || 
                  "Failed to connect. The API server might be unreachable or returned an error."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium"
                placeholder="name@company.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-text-primary" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-primary-blue hover:underline">
                  Forgot Password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-primary-blue to-blue-500 hover:from-blue-600 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex justify-center items-center"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-text-secondary mt-8 font-medium">
          &copy; {new Date().getFullYear()} Travelora Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
