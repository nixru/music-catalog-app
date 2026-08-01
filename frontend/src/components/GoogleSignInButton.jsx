import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const isConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (!isConfigured) {
    return (
      <div className="text-[11px] text-paper-300/40 text-center border border-dashed border-ink-700 rounded py-2">
        Google sign-in not configured (set VITE_GOOGLE_CLIENT_ID)
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="rounded overflow-hidden">
        <GoogleLogin
          theme="filled_black"
          shape="rectangular"
          onSuccess={async (credentialResponse) => {
            const ok = await loginWithGoogle(credentialResponse.credential);
            if (ok) navigate('/library');
          }}
          onError={() => {
            // GoogleLogin shows its own inline error UI; nothing else needed here.
          }}
        />
      </div>
    </div>
  );
}
