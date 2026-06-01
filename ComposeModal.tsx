/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, X, Send, Eye, Paperclip, AlertTriangle, Sparkles, Check, Bookmark, FileText, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MailAccountSettings } from '../types';

interface Contact {
  name: string;
  address: string;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountSettings: MailAccountSettings;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  contacts?: Contact[];
}

export default function ComposeModal({
  isOpen,
  onClose,
  accountSettings,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  contacts = [],
}: ComposeModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Suggestions state
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<MailAccountSettings>(accountSettings);

  useEffect(() => {
    const raw = localStorage.getItem('drewmail_linked_accounts');
    if (raw) {
      try {
        setLinkedAccounts(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse linked accounts in ComposeModal', e);
      }
    }
  }, []);

  useEffect(() => {
    setSelectedAccount(accountSettings);
  }, [accountSettings]);

  // User color themes matching MailboxView config
  const activeTheme = localStorage.getItem('drewmail_theme') || 'blue';
  const themeColors: Record<string, { bg: string; text: string; hoverBg: string; shadow: string }> = {
    blue: { bg: 'bg-[#2196f3]', text: 'text-blue-600', hoverBg: 'hover:bg-blue-700', shadow: 'shadow-blue-500/15' },
    crimson: { bg: 'bg-rose-500', text: 'text-rose-600', hoverBg: 'hover:bg-rose-600', shadow: 'shadow-rose-500/15' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', hoverBg: 'hover:bg-emerald-600', shadow: 'shadow-emerald-500/15' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-600', hoverBg: 'hover:bg-violet-600', shadow: 'shadow-violet-500/15' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700', hoverBg: 'hover:bg-amber-600', shadow: 'shadow-amber-500/15' },
  };
  const theme = themeColors[activeTheme] || themeColors.blue;

  // Autosave Draft State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic user specific storage key for drafts
  const draftKey = `drewmail_draft_${selectedAccount?.imap?.user || 'anon'}`;

  // Sync initial fields if populated
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      
      // If initial parameters were passed, we prioritize them (e.g. from reply/reply-all action)
      if (initialTo || initialSubject || initialBody) {
        setTo(initialTo);
        setSubject(initialSubject);
        setBody(initialBody);
        setSaveStatus('idle');
      } else {
        // Otherwise, probe localStorage to see if a draft remains from a previous crash or session
        const stored = localStorage.getItem(draftKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setTo(parsed.to || '');
            setCc(parsed.cc || '');
            setBcc(parsed.bcc || '');
            setSubject(parsed.subject || '');
            setBody(parsed.body || '');
            setSaveStatus('saved');
          } catch (e) {
            console.error('Failed reading cached draft', e);
          }
        } else {
          // Clean slate
          setTo('');
          setCc('');
          setBcc('');
          setSubject('');
          setBody('');
          setSaveStatus('idle');
        }
      }
    }
  }, [isOpen, initialTo, initialSubject, initialBody, draftKey]);

  // Handle outside click to close contact suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter contact suggestions based on active "To" input sequence
  useEffect(() => {
    if (!to.trim() || contacts.length === 0) {
      setFilteredContacts([]);
      return;
    }
    const cleanQuery = to.toLowerCase();
    const matches = contacts.filter(
      c =>
        c.address.toLowerCase().includes(cleanQuery) ||
        (c.name && c.name.toLowerCase().includes(cleanQuery))
    );
    setFilteredContacts(matches.slice(0, 5));
  }, [to, contacts]);

  // Autosave draft setup (debounced - triggers 1 second after user halts interaction)
  useEffect(() => {
    if (!isOpen || isMinimized || loading) return;

    // Do not auto-save empty entries
    if (!to.trim() && !subject.trim() && !body.trim() && !cc.trim() && !bcc.trim()) {
      return;
    }

    setSaveStatus('saving');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      try {
        const draftPayload = { to, cc, bcc, subject, body };
        localStorage.setItem(draftKey, JSON.stringify(draftPayload));
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('idle');
      }
    }, 1000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [to, cc, bcc, subject, body, isOpen, isMinimized, loading, draftKey]);

  if (!isOpen) return null;

  const selectSuggestion = (contact: Contact) => {
    setTo(contact.address);
    setShowSuggestions(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!to.trim()) {
      setErrorMsg('Recipient "To" email is required.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Subject line is required.');
      return;
    }

    setLoading(true);

    const payload = {
      auth: selectedAccount.smtp,
      mail: {
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        body,
        isHtml: false,
      },
    };

    try {
      const response = await fetch('/api/smtp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg('Email dispatched successfully!');
        
        // Wipe active draft from storage since it has successfully shipped
        localStorage.removeItem(draftKey);
        setSaveStatus('idle');

        setTimeout(() => {
          onClose();
          setTo('');
          setCc('');
          setBcc('');
          setSubject('');
          setBody('');
          setSuccessMsg(null);
        }, 1000);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch SMTP message.');
      }
    } catch (err) {
      setErrorMsg('Network connectivity failure requesting SMTP mail server.');
    } finally {
      setLoading(false);
    }
  };

  const insertCannedText = (txt: string) => {
    setBody(prev => (prev ? `${prev}\n${txt}` : txt));
  };

  const triggerSubjectGenerator = () => {
    if (!body.trim()) {
      setErrorMsg('Add email body substance first so AI can suggest subjects!');
      return;
    }
    // Simple fast semantic subject suggestion analyzer client-side
    const verbs = ['Regarding', 'Update on', 'Inquiry:', 'Follow-up Re:'];
    const bodyWords = body.trim().split(/\s+/).slice(0, 6).join(' ');
    const cleanedText = bodyWords.replace(/[^\w\s]/g, '');
    const presetVerb = verbs[Math.floor(Math.random() * verbs.length)];
    setSubject(`${presetVerb} ${cleanedText}...`);
    setErrorMsg(null);
  };

  const applyTextMarkup = (type: 'bold' | 'list' | 'signature') => {
    if (type === 'bold') {
      setBody(prev => `${prev} **bold text**`);
    } else if (type === 'list') {
      setBody(prev => `${prev}\n- Item 1\n- Item 2`);
    } else if (type === 'signature') {
      setBody(prev => `${prev}\n\nBest regards,\n${accountSettings?.imap?.user?.split('@')[0] || 'Dave'}\nSent via DMail`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 120, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`fixed z-50 bottom-0 right-4 sm:right-12 w-full max-w-xl bg-white rounded-t-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col transition-all duration-300 ${
          isMinimized ? 'h-12' : 'h-[520px]'
        }`}
      >
        {/* Google Inbox Styled Material Blue Header banner */}
        <div 
          className={`${theme.bg} px-4 h-12 shrink-0 text-white flex items-center justify-between cursor-pointer select-none`}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide">New Message</span>
            {saveStatus === 'saved' && (
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Autosaved</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-[10px] opacity-75 animate-pulse">Saving draft...</span>
            )}
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
              title="Minimize"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                // Keep the draft saved in localStorage, just close modal
                onClose();
              }}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
              title="Save & Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form elements and bodies */}
        {!isMinimized && (
          <form onSubmit={handleSend} className="flex-1 flex flex-col p-4 overflow-y-auto bg-white">
            
            {/* Standard error and success tags */}
            {errorMsg && (
              <div className="mb-3 flex items-start gap-2 text-xs bg-red-50 text-red-850 border border-red-200 rounded-lg p-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <span className="font-medium select-text">{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-2.5 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Recipients (styled carefully) */}
            <div className="space-y-2 text-xs">
              {/* Sender choice picker */}
              <div className="flex items-center border-b border-slate-150 py-1.5">
                <span className="text-slate-400 font-bold w-12">From:</span>
                <select
                  value={selectedAccount?.imap?.user || ''}
                  onChange={(e) => {
                    const chosenUser = e.target.value;
                    if (chosenUser === accountSettings.imap.user) {
                      setSelectedAccount(accountSettings);
                    } else {
                      const found = linkedAccounts.find(acc => acc.imap.user === chosenUser);
                      if (found) {
                        setSelectedAccount(found);
                      }
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-slate-700 px-1 font-semibold focus:ring-0 text-xs py-0.5 cursor-pointer max-w-sm rounded"
                >
                  <option value={accountSettings.imap.user}>{accountSettings.imap.user} (Default)</option>
                  {linkedAccounts
                    .filter(acc => acc.imap.user !== accountSettings.imap.user)
                    .map(acc => (
                      <option key={acc.imap.user} value={acc.imap.user}>{acc.imap.user}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex items-center border-b border-slate-150 py-1.5 relative">
                <span className="text-slate-400 font-bold w-12">To:</span>
                <input
                  type="text"
                  required
                  placeholder="recipient@example.com"
                  value={to}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-slate-800 px-1 font-medium focus:ring-0"
                />
                
                {/* CC/BCC Toggle clicker */}
                <button
                  type="button"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className={`text-[11px] ${theme.text} hover:opacity-80 font-bold whitespace-nowrap cursor-pointer hover:underline`}
                >
                  Cc/Bcc
                </button>

                {/* Contacts predictive autocomplete dropdown checklist */}
                {showSuggestions && filteredContacts.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-12 top-full mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-50 divide-y divide-slate-100 overflow-hidden"
                  >
                    <div className="bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">
                      Suggested Contacts
                    </div>
                    {filteredContacts.map((contact, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectSuggestion(contact)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-bold text-slate-700">{contact.name}</span>
                          <span className="text-slate-400 font-normal ml-1.5 font-mono text-[10px]">&lt;{contact.address}&gt;</span>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">Autofill</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CC & BCC drawer panel */}
              <AnimatePresence>
                {showCcBcc && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 bg-slate-50 rounded-lg p-2.5 border border-slate-150"
                  >
                    <div className="flex items-center border-b border-slate-200 py-1">
                      <span className="text-slate-400 font-bold w-12">Cc:</span>
                      <input
                        type="email"
                        placeholder="cc_copy@example.com"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-slate-705 px-1 focus:ring-0"
                      />
                    </div>
                    <div className="flex items-center border-b border-slate-200 py-1">
                      <span className="text-slate-400 font-bold w-12">Bcc:</span>
                      <input
                        type="email"
                        placeholder="blind_copy@example.com"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-slate-705 px-1 focus:ring-0"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject box with sparkle optimization button */}
              <div className="flex items-center border-b border-slate-150 py-1.5 gap-2">
                <span className="text-slate-400 font-bold w-12">Subject:</span>
                <input
                  type="text"
                  required
                  placeholder="Insert Subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-slate-800 px-1 font-semibold focus:ring-0"
                />
                <button
                  type="button"
                  onClick={triggerSubjectGenerator}
                  className="p-1 hover:bg-violet-50 text-violet-600 hover:text-violet-800 rounded-lg flex items-center gap-1 font-bold text-[10px] border border-violet-150 bg-white transition-all cursor-pointer shadow-3xs"
                  title="Generate subject line from body content dynamically"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse fill-violet-100" />
                  <span>AI Subject</span>
                </button>
              </div>
            </div>

            {/* Canned instant template chips (Gmail classic) */}
            <div className="flex items-center gap-1.5 flex-wrap py-2 select-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Canned Responses:</span>
              {[
                { label: 'Say Thank You', text: 'Thank you for reaching out! I appreciate the message.' },
                { label: 'Confirm receipt', text: 'I have received your email and will follow up with you shortly.' },
                { label: 'Accept request', text: 'Sounds excellent! I accept the request and will align resources.' },
              ].map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => insertCannedText(chip.text)}
                  className="text-[10px] px-2 py-0.75 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-full cursor-pointer transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Email Workspace Body container */}
            <div className="flex-1 mt-2">
              <textarea
                placeholder="Write your email body..."
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-full min-h-[170px] bg-transparent border-none outline-none resize-none text-slate-800 text-xs py-1 focus:ring-0 leading-relaxed"
              />
            </div>

            <hr className="border-slate-200 my-2" />

            {/* Form writing helpers toolbox row */}
            <div className="flex items-center gap-1 text-slate-400 select-none pb-2">
              <button
                type="button"
                onClick={() => applyTextMarkup('bold')}
                className="p-1.5 hover:bg-slate-150 rounded text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-[10px] cursor-pointer"
                title="Append bold text markup"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Bold</span>
              </button>
              <button
                type="button"
                onClick={() => applyTextMarkup('list')}
                className="p-1.5 hover:bg-slate-150 rounded text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-[10px] cursor-pointer"
                title="Append template list"
              >
                <span>• Bullets</span>
              </button>
              <button
                type="button"
                onClick={() => applyTextMarkup('signature')}
                className="p-1.5 hover:bg-slate-150 rounded text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-[10px] cursor-pointer"
                title="Append quick signature"
              >
                <span>🖋️ Signature</span>
              </button>
            </div>

            {/* Buttons row / Send & Discard */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(draftKey);
                    setTo('');
                    setCc('');
                    setBcc('');
                    setSubject('');
                    setBody('');
                    onClose();
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-red-650 hover:bg-red-50 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  title="Discard draft completely"
                >
                  Discard Draft
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Save & Exit
                </button>

                {/* Classic Gmail Material styled Send button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2.5 px-6 py-2 rounded-lg ${theme.bg} ${theme.hoverBg} text-white font-bold text-xs transition-colors shadow-md ${theme.shadow} cursor-pointer select-none active:scale-95 ${
                    loading ? 'opacity-70 pointer-events-none' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Shipping...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
