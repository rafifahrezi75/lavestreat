import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <Card className="p-6 sm:p-8 border-brand-200/80 shadow-md bg-white rounded-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-10 h-10 rounded-xl bg-white border border-brand-200 shadow-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Lave Streat Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-extrabold text-xl text-brand-900 tracking-tight">
                Lave Streat
              </span>
            </Link>
            <h1 className="font-display font-bold text-xl text-brand-900">
              Masuk Panel Admin
            </h1>
            <p className="text-xs text-slate-wet mt-1">
              Gunakan akun administrator untuk mengakses dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {error && (
              <div className="p-2.5 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
                {error}
              </div>
            )}

            <div className="relative">
              <Input
                label="Alamat Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lavestreat.com"
                required
              />
            </div>

            <div className="relative">
              <Input
                label="Kata Sandi"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="p-2.5 bg-brand-light border border-brand-100 rounded-lg text-xs text-brand-900">
              <span className="font-semibold block mb-0.5">Akses Cepat:</span>
              <div className="flex justify-between text-[11px] text-slate-wet">
                <span>admin@lavestreat.com</span>
                <span>admin123</span>
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="mt-1 w-full text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white"
            >
              {loading ? 'Memeriksa...' : 'Masuk ke Dashboard'}
            </Button>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-brand-100">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold text-slate-wet hover:text-brand-900 transition-colors"
            >
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
