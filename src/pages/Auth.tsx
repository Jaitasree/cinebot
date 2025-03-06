
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formMode, setFormMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Prefill test account on development
  const fillTestAccount = () => {
    setEmail("test1@example.com");
    setPassword("password123");
  };

  const validateForm = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address",
      });
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return false;
    }

    if (!password) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter your password",
      });
      return false;
    }

    if (formMode === 'signup' && password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters",
      });
      return false;
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      let result;

      if (formMode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              remember_me: rememberMe
            }
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            data: {
              remember_me: rememberMe
            }
          }
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (formMode === 'signup') {
        toast({
          title: "Success!",
          description: "Account created successfully. You can now sign in."
        });
        setFormMode('signin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black bg-opacity-90 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/a1dc92ca-091d-4ca9-a05b-8cd44bbfce6a/f9368347-e982-4856-a5a4-396796381f28/RS-en-20191230-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-no-repeat bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/60">
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white">
              <span className="text-[#E50914]">Cine</span>Bot
            </h1>
          </div>
          
          <div className="mt-6 bg-black/80 p-8 rounded-md shadow-xl border border-gray-800">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {formMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            
            <div className="space-y-5">
              <div>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  placeholder="Email address" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="bg-gray-800/90 border-gray-700 text-white placeholder:text-gray-400 h-12 text-base rounded"
                />
              </div>
              
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  autoComplete={formMode === 'signin' ? "current-password" : "new-password"} 
                  required 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="bg-gray-800/90 border-gray-700 text-white placeholder:text-gray-400 h-12 text-base pr-10 rounded"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {formMode === 'signin' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox 
                      id="remember-me" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(checked === true)} 
                      className="border-gray-600 data-[state=checked]:bg-[#E50914] data-[state=checked]:border-[#E50914]"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <button 
                      type="button" 
                      className="text-gray-300 hover:text-white hover:underline" 
                      onClick={() => toast({
                        title: "Reset Password",
                        description: "Please contact support to reset your password."
                      })}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <Button 
                onClick={handleAuth} 
                disabled={loading} 
                className="w-full h-12 text-base bg-[#E50914] hover:bg-[#f6121d] text-white rounded"
              >
                {loading ? "Loading..." : formMode === 'signin' ? "Sign In" : "Sign Up"}
              </Button>
              
              {process.env.NODE_ENV === 'development' && formMode === 'signin' && (
                <Button
                  onClick={fillTestAccount}
                  variant="outline"
                  className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                >
                  Use Test Account
                </Button>
              )}
            </div>
            
            <div className="mt-6 text-center">
              {formMode === 'signin' ? (
                <p className="text-gray-400">
                  New to CineBot?{' '}
                  <button 
                    type="button" 
                    className="text-white hover:underline" 
                    onClick={() => setFormMode('signup')}
                  >
                    Sign up now
                  </button>
                </p>
              ) : (
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="text-white hover:underline" 
                    onClick={() => setFormMode('signin')}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
