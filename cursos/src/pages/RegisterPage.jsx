import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { UserPlus } from 'lucide-react';

const defaultForm = {
  nome: '',
  email: '',
  telefone: '',
  username: '',
  senha: '',
  confirmarSenha: '',
};

const RegisterPage = () => {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    if (form.senha !== form.confirmarSenha) {
      setErrors({ confirmarSenha: 'As senhas precisam ser iguais.' });
      return;
    }

    setSubmitting(true);

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      senha: form.senha,
      tipo: 'empreendedora',
    };

    if (form.username.trim()) {
      payload.username = form.username.trim();
    }
    if (form.telefone.trim()) {
      payload.telefone = form.telefone.trim();
    }

    const result = await register(payload);

    if (result.success) {
      push('Cadastro realizado! Verifique seu email para ativar a conta.', 'success');
      navigate('/');
    } else {
      const validation = result.errors || result?.data?.errors;
      if (validation) {
        setErrors(validation);
      }
      push(result.message || 'Não foi possível concluir o cadastro.', 'error');
    }

    setSubmitting(false);
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral-600">
          <UserPlus className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-semibold text-midnight">Crie sua conta EmpowerUp</h1>
        <p className="text-sm text-slate-500">Use o mesmo cadastro para aproveitar todos os serviços da plataforma.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-semibold text-slate-600">Nome completo</label>
          <input
            name="nome"
            type="text"
            required
            value={form.nome}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
          />
          {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome[0] || errors.nome}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600">Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email[0] || errors.email}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-600">Telefone (opcional)</label>
            <input
              name="telefone"
              type="tel"
              value={form.telefone}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
              placeholder="(11) 99999-9999"
            />
            {errors.telefone && <p className="mt-1 text-xs text-red-500">{errors.telefone[0] || errors.telefone}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600">Username (opcional)</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
              placeholder="minhaempresa"
            />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username[0] || errors.username}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-600">Senha</label>
            <input
              name="senha"
              type="password"
              required
              value={form.senha}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
            {errors.senha && <p className="mt-1 text-xs text-red-500">{errors.senha[0] || errors.senha}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600">Confirmar senha</label>
            <input
              name="confirmarSenha"
              type="password"
              required
              value={form.confirmarSenha}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 shadow-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
            {errors.confirmarSenha && <p className="mt-1 text-xs text-red-500">{errors.confirmarSenha}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Cadastrando…' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já possui conta?{' '}
        <Link to="/login" className="font-semibold text-coral-600 transition hover:text-coral-500">
          Faça login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
