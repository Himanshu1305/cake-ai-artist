import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useRequireCountry = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCountry, setHasCountry] = useState(false);

  useEffect(() => {
    const checkCountry = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not logged in - let other auth guards handle this
          setIsChecking(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('country')
          .eq('id', user.id)
          .single();

        if (!profile?.country) {
          navigate('/complete-profile');
          return;
        }

        setHasCountry(true);
      } catch (error) {
        console.error('Error checking country:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCountry();
  }, [navigate]);

  return { isChecking, hasCountry };
};
