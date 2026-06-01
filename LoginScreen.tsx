/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Shield, Server, ArrowRight, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MailAccountSettings } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (settings: MailAccountSettings) => void;
}

const PRESETS = [
  {
    name: 'Gmail',
    id: 'gmail',
    logo: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSecure: true,
    note: 'Requires a Google "App Password" if 2-Step Verification is active.',
  },
  {
    name: 'Outlook / Office365',
    id: 'outlook',
    logo: 'https://cdn-icons-png.flaticon.com/512/732/732223.png',
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSecure: false, // STARTTLS
    note: 'Requires an App Password or authenticating with modern security flags.',
  },
  {
    name: 'Yahoo!',
    id: 'yahoo',
    logo: 'https://cdn-icons-png.flaticon.com/512/732/732261.png',
    imapHost: 'imap.mail.yahoo.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: 465,
    smtpSecure: true,
    note: 'Requires generating an App Password in Yahoo Account Security settings.',
  },
  {
    name: 'Custom Server',
    id: 'custom',
    logo: null,
    imapHost: '',
    imapPort: 993,
    imapSecure: true,
    smtpHost: '',
    smtpPort: 465,
    smtpSecure: true,
    note: '',
  },
];

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('gmail');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom IMAP controls
  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState(993);
  const [imapSecure, setImapSecure] = useState(true);

  // Custom SMTP controls
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecure, setSmtpSecure] = useState(true);

  // Additional settings
  const [saveCredentials, setSaveCredentials] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (pId: string) => {
    setSelectedPreset(pId);
    const preset = PRESETS.find(p => p.id === pId);
    if (preset) {
      setImapHost(preset.imapHost);
      setImapPort(preset.imapPort);
      setImapSecure(preset.imapSecure);
      setSmtpHost(preset.smtpHost);
      setSmtpPort(preset.smtpPort);
      setSmtpSecure(preset.smtpSecure);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please provide both username and password.');
      return;
    }

    if (selectedPreset === 'custom' && (!imapHost.trim() || !smtpHost.trim())) {
      setErrorMsg('Please specify both IMAP and SMTP server hosts.');
      return;
    }

    setLoading(true);

    const payload: MailAccountSettings = {
      imap: {
        host: imapHost,
        port: Number(imapPort),
        secure: imapSecure,
        user: username,
        pass: password,
      },
      smtp: {
        host: smtpHost,
        port: Number(smtpPort),
        secure: smtpSecure,
        user: username, // Use same username
        pass: password, // Use same password
      },
      saveCredentials,
    };

    try {
      const response = await fetch('/api/imap/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth: payload.imap }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(payload);
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please verify your connection details and password.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Server connection failed. Ensure the server is online and try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPresetObj = PRESETS.find(p => p.id === selectedPreset);

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-white/15 shadow-inner select-none">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  {/* A beautiful, premium geometric D + Envelope symbol */}
                  <path d="M4 3h7.5c5.25 0 9.5 4.25 9.5 9.5s-4.25 9.5-9.5 9.5H4V3z" />
                  {/* The inner fold line forming the letter envelope look */}
                  <path d="M4 3l8 7c1.1 0.9 2.9 0.9 4 0l6-5.2" />
                  {/* An elegant pulsing AI spark inside */}
                  <circle cx="11.5" cy="15" r="1.5" fill="currentColor" className="animate-pulse" />
                </svg>
              </div>
              <span className="font-bold text-xs uppercase tracking-widest text-white/90">DMail Engine</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Connect Your Inbox</h1>
            <p className="text-indigo-100 text-sm mt-1">
              Stateless high-performance webmail client powered by IMAP & SMTP.
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        <form onSubmit={handleConnect} className="p-8">
          {/* Presets Grid */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3">
              Choose Mail Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedPreset === preset.id
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {preset.logo ? (
                    <img src={preset.logo} alt={preset.name} className="w-8 h-8 object-contain mb-2" />
                  ) : (
                    <Server className="w-8 h-8 text-indigo-500 mb-2" />
                  )}
                  <span className="text-xs font-medium leading-tight">{preset.name}</span>
                </button>
              ))}
            </div>
            {selectedPresetObj?.note && (
              <div className="mt-3 flex items-start gap-2 text-amber-800 bg-amber-50 rounded-lg p-3 text-xs leading-relaxed">
                <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>{selectedPresetObj.note}</span>
              </div>
            )}
          </div>

          <hr className="border-slate-200 my-6" />

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex gap-2.5 items-start bg-red-50 border border-red-200 text-red-900 rounded-xl p-4 text-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Connection Error</p>
                <p className="text-red-700/95 text-xs mt-0.5">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Basic Auth Form */}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="username">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="email"
                  required
                  placeholder="name@provider.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="password">
                Password or App Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced / Custom Configuration Accordion */}
          {selectedPreset === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 p-4"
            >
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">IMAP Server Settings</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">Server Host</span>
                  <input
                    type="text"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Port</span>
                  <input
                    type="number"
                    value={imapPort}
                    onChange={(e) => setImapPort(Number(e.target.value))}
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={imapSecure}
                  onChange={(e) => setImapSecure(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 font-medium">Use Secure Connection (SSL/TLS)</span>
              </label>

              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">SMTP Server Settings</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">Server Host</span>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Port</span>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 font-medium">Use Secure Connection (SSL/TLS / STARTTLS)</span>
              </label>
            </motion.div>
          )}

          <div className="flex items-center justify-between mt-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveCredentials}
                onChange={(e) => setSaveCredentials(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600">Remember credentials locally</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer ${
                loading ? 'opacity-85 pointer-events-none' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Connect</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Info Notice about Privacy */}
      <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed max-w-lg">
        This application operates entirely in a **stateless** manner. Your email credentials are safe and are never stored on any remote cloud database. They are only sent over encrypted connections directly to your IMAP provider.
      </p>
    </div>
  );
}
