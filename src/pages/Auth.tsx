
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (type: 'signin' | 'signup') => {
    try {
      setLoading(true);
      
      let result;
      if (type === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (type === 'signup') {
        toast({
          title: "Success!",
          description: "Account created successfully. You can now sign in.",
        });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-[#E50914]">Cine</span>Bot
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-white">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6 bg-gray-900 p-8 rounded-lg">
          <div className="space-y-4">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => handleAuth('signin')}
              disabled={loading}
              className="w-full bg-[#E50914] hover:bg-[#f6121d] text-white"
            >
              {loading ? "Loading..." : "Sign in"}
            </Button>
            <Button
              onClick={() => handleAuth('signup')}
              disabled={loading}
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Create new account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
