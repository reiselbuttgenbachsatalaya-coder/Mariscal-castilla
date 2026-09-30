import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  LogIn,
  KeyRound,
  UserMinus
} from 'lucide-react';
import { Teacher } from '../types';

interface SwitchAccountModalProps {
  isOpen: boolean;
  targetTeacher: Teacher | null;
  onClose: () => void;
  onConfirmSwitch: (targetTeacher: Teacher, password: string) => Promise<{ success: boolean; error?: string }>;
  onOpenResetPassword: (teacherName: string) => void;
  onDismissTeacher: (teacherId: string) => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  targetTeacher,
  onClose,
  onConfirmSwitch,
  onOpenResetPassword,
  onDismissTeacher,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);

  if (!isOpen || !targetTeacher) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password) {
      setErrorMsg('Ingresa la contraseña de la cuenta.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onConfirmSwitch(targetTeacher, password);
      if (result.success) {
        setPassword('');
        onClose();
      } else {
        setErrorMsg(result.error || 'Contraseña incorrecta.');
      }
    } catch {
      setErrorMsg('Error al verificar la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    onDismissTeacher(targetTeacher.id);
    setShowDismissConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Ingresar a otra cuenta
              </h3>
              <p className="text-[11px] text-slate-500">
                Se requiere la contraseña del docente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Target Teacher Profile Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <img
              src={targetTeacher.avatar}
              alt={targetTeacher.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {targetTeacher.name}
              </p>
              {targetTeacher.dni && (
                <p className="text-[11px] text-slate-500 font-mono">
                  DNI: {targetTeacher.dni}
                </p>
              )}
              <p className="text-[10px] text-indigo-600 font-semibold truncate">
                {targetTeacher.roleLabel || 'Docente'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {showDismissConfirm ? (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
              <div>
                <p className="text-xs font-bold text-amber-900 text-center">
                  ¿Quitar la cuenta de <strong>{targetTeacher.name}</strong> de este dispositivo?
                </p>
                <p className="text-[11px] text-amber-700 text-center mt-1">
                  La cuenta <strong>no se borrará del sistema escolar</strong>. El docente podrá volver a ingresar cuando lo desee con su usuario y contraseña.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDismissConfirm(false)}
                  className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 cursor-pointer"
                >
                  Sí, quitar de la lista
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña de acceso *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña"
                    required
                    autoFocus
                    className="w-full pl-3 pr-10 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResetPassword(targetTeacher.name);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>¿Olvidaste la contraseña?</span>
                </button>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDismissConfirm(true)}
                  className="w-full py-2 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 border border-slate-200 hover:border-amber-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Quitar esta cuenta de la lista</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
