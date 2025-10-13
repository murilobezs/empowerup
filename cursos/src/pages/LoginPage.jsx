import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', senha: '' });
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const result = await login({
  login: form.login,
  senha: form.senha,
    });

    if (result.success) {
      push('Login realizado com sucesso. Bem-vinda de volta!', 'success');
      navigate(from, { replace: true });
    } else {
      push(result.message || 'Não foi possível acessar sua conta.', 'error');
    }

    setSubmitting(false);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral-600">
          <LogIn className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-semibold text-midnight">Acesse o EmpowerUp Academy</h1>
        <p className="text-sm text-slate-500">Use os mesmos dados da plataforma principal para entrar.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-left text-sm font-medium text-slate-600">
          Email ou username
          <input
            type="text"
            required
            value={form.login}
            onChange={(e) => setForm((prev) => ({ ...prev, login: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
            placeholder="seuemail@exemplo.com"
          />
        </label>

        <label className="block space-y-2 text-left text-sm font-medium text-slate-600">
          Senha
          <input
            type="password"
            required
            value={form.senha}
            onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
          />
        </label>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar na plataforma'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda não faz parte?{' '}
        <Link to="/cadastro" className="font-semibold text-coral-600 transition hover:text-coral-500">
          Criar conta
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
