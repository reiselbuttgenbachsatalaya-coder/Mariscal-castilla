import React, { useState } from 'react';
import {
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Calendar,
  Phone,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Teacher } from '../types';
import { storageService } from '../services/storageService';

interface AuthScreenProps {
  onLoginSuccess: (teacher: Teacher) => void;
  registeredTeachers: Teacher[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  registeredTeachers,
}) => {
  const [authCategory, setAuthCategory] = useState<'teacher' | 'admin'>('teacher');
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');

  // Teacher Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [resetFullName, setResetFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin Form states (password empty by default, user must type it!)
  const [adminUsername, setAdminUsername] = useState('directora');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  // 1. INICIAR SESIÓN DOCENTE (con Nombre Completo o DNI)
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanInput = username.trim();
    if (!cleanInput) {
      setErrorMessage('Ingresa tu nombre completo o DNI.');
      return;
    }
    if (!password) {
      setErrorMessage('Ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await storageService.login(cleanInput, password);
      if (result.success && result.teacher) {
        onLoginSuccess(result.teacher);
      } else {
        setErrorMessage(result.error || 'Nombre/DNI o contraseña incorrectos.');
      }
    } catch {
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. CREAR CUENTA DOCENTE
  const handleTeacherRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Ingresa tu nombre completo.');
      return;
    }
    if (cleanName.length < 3) {
      setErrorMessage('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (cleanName.toLowerCase() === 'directora') {
      setErrorMessage('El nombre "directora" está reservado para la Sección de Administración.');
      return;
    }
    if (!dni.trim()) {
      setErrorMessage('Ingresa tu número de DNI.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    const result = storageService.createAccount({
      name: cleanName,
      password: password,
      dni: dni.trim(),
      birthDate: birthDate,
      phone: phone.trim(),
    });

    if (result.success && result.teacher) {
      onLoginSuccess(result.teacher);
    } else {
      setErrorMessage(result.error || 'Error al crear la cuenta.');
    }
  };

  // 3. INICIAR SESIÓN ADMIN / DIRECTORA
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUsername = adminUsername.trim();
    if (!cleanUsername) {
      setErrorMessage('Ingresa el usuario de dirección.');
      return;
    }
    if (!adminPassword) {
      setErrorMessage('Ingresa la contraseña de dirección.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await storageService.login(cleanUsername, adminPassword);
      if (result.success && result.teacher) {
        onLoginSuccess(result.teacher);
      } else {
        setErrorMessage(result.error || 'Credenciales de dirección incorrectas.');
      }
    } catch {
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. RESTABLECER CONTRASEÑA (con solo Nombre Completo y Nueva Contraseña)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanFullName = resetFullName.trim();
    if (!cleanFullName) {
      setErrorMessage('Ingresa tu nombre completo registrado.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await storageService.resetPassword(cleanFullName, password);
      if (result.success) {
        setSuccessMessage(`¡Contraseña restablecida con éxito para ${result.teacherName || cleanFullName}! Ya puedes iniciar sesión.`);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setMode('login');
          setUsername(cleanFullName);
        }, 1600);
      } else {
        setErrorMessage(result.error || 'No se pudo restablecer la contraseña.');
      }
    } catch {
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="max-w-md w-full relative z-10 my-4">
        {/* Institutional Branding */}
        <div className="text-center mb-6">
          <div className="inline-block relative mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-400 via-sky-300 to-amber-200 shadow-2xl shadow-indigo-950/60 flex items-center justify-center">
              <img
                src="/insignia_colegio.jpg"
                alt="Insignia I.E. Libertador Mariscal Castilla"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full bg-white shadow-inner"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-sm">
              1954
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            I.E. Libertador Mariscal Castilla
          </h1>
          <p className="text-xs sm:text-sm text-amber-300 font-semibold mt-0.5">
            Oxapampa • Archivo Docente Oficial
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
            Plataforma Institucional de Documentación y Horarios de Secundaria
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 backdrop-blur-sm">
          
          {/* Main Category Tabs: Docente vs Admin */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
            <button
              id="tab-access-teacher"
              type="button"
              onClick={() => {
                setAuthCategory('teacher');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authCategory === 'teacher'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Acceso Docente</span>
            </button>

            <button
              id="tab-access-admin"
              type="button"
              onClick={() => {
                setAuthCategory('admin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authCategory === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sección Admin (Directora)</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SECTION 1: ACCESO DOCENTE */}
          {authCategory === 'teacher' && (
            <div>
              {/* Header Title inside Teacher card */}
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-800">
                  {mode === 'login' && 'Iniciar Sesión Docente'}
                  {mode === 'register' && 'Crear Cuenta de Docente'}
                  {mode === 'reset' && 'Restablecer Contraseña'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === 'login' && 'Ingresa con tu usuario y contraseña'}
                  {mode === 'register' && 'Ingresa tus datos personales y credenciales'}
                  {mode === 'reset' && 'Escribe tu usuario para asignar una nueva contraseña'}
                </p>
              </div>

              {/* 1A. DOCENTE LOGIN */}
              {mode === 'login' && (
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nombre Completo o DNI
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="teacher-login-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ingresa tu nombre completo o DNI"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                      >
                        Restablecer contraseña
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="teacher-login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        required
                        className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="teacher-login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                  </button>

                  <div className="text-center pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      ¿No tienes una cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Crear cuenta docente
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* 1B. DOCENTE REGISTRO */}
              {mode === 'register' && (
                <form onSubmit={handleTeacherRegister} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Prof. Carlos Mendoza"
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* DNI & Celular */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        DNI (Para ingresar) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          maxLength={10}
                          value={dni}
                          onChange={(e) => setDni(e.target.value)}
                          placeholder="Ej: 71234567"
                          required
                          className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Celular
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ej: 987 654 321"
                          className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha de Nacimiento
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Contraseñas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contraseña *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mín. 4 caract."
                        required
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirmar *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite clave"
                        required
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    id="teacher-register-submit"
                    type="submit"
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Cuenta Docente</span>
                  </button>

                  <div className="text-center pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a Iniciar Sesión</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 1C. RESTABLECER CONTRASEÑA */}
              {mode === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nombre Completo del Docente *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={resetFullName}
                        onChange={(e) => setResetFullName(e.target.value)}
                        placeholder="Ej: Prof. Carlos Mendoza"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Solo con tu nombre completo registrado podrás asignar tu nueva contraseña.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nueva contraseña (mín. 4 caracteres)"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma la nueva contraseña"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Guardar Nueva Contraseña</span>
                  </button>

                  <div className="text-center pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver al inicio de sesión</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* SECTION 2: SECCIÓN DE ADMIN (DIRECTORA) */}
          {authCategory === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-950">
                    Sección de Administración y Dirección
                  </h3>
                  <p className="text-[11px] text-indigo-700 mt-0.5 leading-relaxed">
                    Rol especial para eliminar cuentas de docentes, supervisar perfiles, y previsualizar o descargar archivos institucionales.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Usuario Administrador
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <input
                      id="admin-username-input"
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="directora"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contraseña de Administración
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <input
                      id="admin-password-input"
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Escribe la contraseña de administración"
                      required
                      autoComplete="off"
                      className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    La contraseña no se autocompleta por seguridad. Debes escribirla manualmente.
                  </p>
                </div>

                <button
                  id="admin-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{isLoading ? 'Ingresando...' : 'Iniciar Sesión como Directora'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Archivo Docente Escolar • Secundaria 1° a 5° • Secciones A, B, C y D
        </p>
      </div>
    </div>
  );
};
