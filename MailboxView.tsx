/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Inbox, Send, Edit3, Trash2, Folder, Archive, AlertCircle, RefreshCw,
  LogOut, Star, Search, CheckSquare, Square, ChevronLeft, ChevronRight,
  Sparkles, CornerUpLeft, ArrowRight, CornerUpRight, FileText, ChevronDown,
  Menu, X, Paperclip, Check, Download, Loader2, ArrowLeft, Clock, Keyboard, Info,
  Pin, ExternalLink, Image as ImageIcon, Music, Video, File, Globe, Calendar, Plane, ShoppingBag, Phone,
  FileArchive, Settings, UserPlus, Upload, Plus, Sliders, Users, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MailAccountSettings, MailFolder, EmailHeader, FullEmail, EmailAttachment } from '../types';
import SafeIframe from './SafeIframe';
import ComposeModal from './ComposeModal';
import ModernTooltip from './ModernTooltip';

interface MailboxViewProps {
  accountSettings: MailAccountSettings;
  onLogout: () => void;
  onSwitchAccount?: (settings: MailAccountSettings) => void;
}

export interface TripBundle {
  isBundle: true;
  id: string;
  title: string;
  location: string;
  items: EmailHeader[];
  latestDate: string;
  seen: boolean;
  flagged: boolean;
}

export const THEME_CONFIG = {
  blue: {
    bg: 'bg-[#2196f3]',
    hoverBg: 'hover:bg-blue-700',
    lightBg: 'bg-blue-50',
    lightBorder: 'border-blue-100',
    text: 'text-blue-600',
    accentText: 'text-blue-750',
    activeText: 'text-blue-800',
    bannerGradient: 'from-blue-500 to-indigo-600',
    badge: 'bg-blue-100 text-blue-850',
    btnColor: '#2196f3',
    logo: 'text-blue-600',
    ring: 'focus:border-blue-400',
  },
  crimson: {
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-700',
    lightBg: 'bg-rose-50',
    lightBorder: 'border-rose-100',
    text: 'text-rose-600',
    accentText: 'text-rose-750',
    activeText: 'text-rose-800',
    bannerGradient: 'from-rose-500 to-red-650',
    badge: 'bg-rose-100 text-rose-800',
    btnColor: '#e11d48',
    logo: 'text-rose-600',
    ring: 'focus:border-rose-400',
  },
  emerald: {
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    lightBg: 'bg-emerald-50',
    lightBorder: 'border-emerald-100',
    text: 'text-emerald-650',
    accentText: 'text-emerald-700',
    activeText: 'text-emerald-800',
    bannerGradient: 'from-emerald-500 to-teal-650',
    badge: 'bg-emerald-100 text-emerald-800',
    btnColor: '#059669',
    logo: 'text-emerald-600',
    ring: 'focus:border-emerald-400',
  },
  violet: {
    bg: 'bg-violet-600',
    hoverBg: 'hover:bg-violet-700',
    lightBg: 'bg-violet-50',
    lightBorder: 'border-violet-100',
    text: 'text-violet-600',
    accentText: 'text-[#7c3aed]',
    activeText: 'text-violet-800',
    bannerGradient: 'from-violet-500 to-purple-650',
    badge: 'bg-violet-100 text-violet-800',
    btnColor: '#7c3aed',
    logo: 'text-violet-600',
    ring: 'focus:border-violet-400',
  },
  amber: {
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-700',
    lightBg: 'bg-amber-50',
    lightBorder: 'border-amber-100',
    text: 'text-amber-700',
    accentText: 'text-amber-800',
    activeText: 'text-amber-900',
    bannerGradient: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-800',
    btnColor: '#d97706',
    logo: 'text-amber-600',
    ring: 'focus:border-amber-400',
  },
  sunset: {
    bg: 'bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600',
    hoverBg: 'hover:opacity-90',
    lightBg: 'bg-rose-50/50',
    lightBorder: 'border-rose-100',
    text: 'text-rose-600',
    accentText: 'text-purple-700',
    activeText: 'text-purple-900',
    bannerGradient: 'from-orange-500 via-rose-500 to-purple-600',
    badge: 'bg-rose-100 text-rose-800',
    btnColor: '#ec4899',
    logo: 'text-rose-600',
    ring: 'focus:border-rose-450',
  },
  ocean: {
    bg: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500',
    hoverBg: 'hover:opacity-90',
    lightBg: 'bg-cyan-50/50',
    lightBorder: 'border-cyan-100',
    text: 'text-cyan-600',
    accentText: 'text-blue-700',
    activeText: 'text-blue-900',
    bannerGradient: 'from-blue-600 to-teal-550',
    badge: 'bg-cyan-100 text-cyan-850',
    btnColor: '#0891b2',
    logo: 'text-cyan-600',
    ring: 'focus:border-cyan-400',
  },
  cosmic: {
    bg: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500',
    hoverBg: 'hover:opacity-90',
    lightBg: 'bg-purple-50/50',
    lightBorder: 'border-purple-100',
    text: 'text-purple-600',
    accentText: 'text-indigo-700',
    activeText: 'text-indigo-900',
    bannerGradient: 'from-indigo-600 to-pink-500',
    badge: 'bg-purple-100 text-purple-800',
    btnColor: '#8b5cf6',
    logo: 'text-purple-600',
    ring: 'focus:border-purple-400',
  },
  aurora: {
    bg: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500',
    hoverBg: 'hover:opacity-90',
    lightBg: 'bg-emerald-50/40',
    lightBorder: 'border-emerald-100',
    text: 'text-emerald-650',
    accentText: 'text-teal-700',
    activeText: 'text-teal-900',
    bannerGradient: 'from-emerald-600 to-sky-500',
    badge: 'bg-emerald-100 text-emerald-800',
    btnColor: '#0d9488',
    logo: 'text-emerald-600',
    ring: 'focus:border-emerald-400',
  },
};

// Pastel colorful gradient maps for sender logos
const PALETTE = [
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-indigo-500',
  'from-purple-400 to-fuchsia-500',
];

const ImageAttachmentThumbnail = ({
  uid,
  filename,
  activeFolder,
  auth
}: {
  uid: number;
  filename: string;
  activeFolder: string;
  auth: any;
  key?: any;
}) => {
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchThumb = async () => {
      try {
        const response = await fetch('/api/imap/attachment/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth,
            folder: activeFolder,
            uid,
            filename,
          })
        });
        const data = await response.json();
        if (active && response.ok && data.success) {
          setThumbSrc(`data:${data.contentType};base64,${data.contentBase64}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchThumb();
    return () => {
      active = false;
    };
  }, [uid, filename, activeFolder, auth]);

  if (loading) {
    return (
      <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-205 shrink-0 select-none animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      </div>
    );
  }

  if (thumbSrc) {
    return (
      <div className="relative w-24 h-24 group rounded-xl overflow-hidden border border-slate-250 shadow-sm transition-all hover:shadow-md cursor-pointer shrink-0">
        <img
          src={thumbSrc}
          alt={filename}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Subtle dark overlay and filename text shown ONLY on hover */}
        <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2 pointer-events-none select-none">
          <span className="text-[9px] text-white font-semibold leading-relaxed truncate block" title={filename}>
            {filename}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 select-none">
      <ImageIcon className="w-6 h-6" />
    </div>
  );
};

export const bundleTripMessages = (list: EmailHeader[]): (EmailHeader | TripBundle)[] => {
  const tripLocations = ["Paris", "London", "Tokyo", "New York", "San Francisco", "Rome", "Chicago", "Boston", "Seattle", "Austin", "Hawaii", "Sydney", "Miami", "Denver", "Las Vegas"];
  const travelRegex = /flight|hotel|booking|boarding|e-ticket|ticket|reservation|itinerary|car rental|rental car|airbnb|expedia|airlines|airline|lodging|check-in|boarding pass/i;

  const tripGroups: Record<string, { location: string; items: EmailHeader[] }> = {};
  const resultList: (EmailHeader | TripBundle)[] = [];

  list.forEach(msg => {
    const textToSearch = `${msg.subject || ''} ${msg.snippet || ''}`.toLowerCase();
    const isTravel = travelRegex.test(textToSearch);

    if (isTravel) {
      let matchedLocation = '';
      for (const loc of tripLocations) {
        if (textToSearch.includes(loc.toLowerCase())) {
          matchedLocation = loc;
          break;
        }
      }

      const tripId = matchedLocation ? `trip_${matchedLocation.toLowerCase()}` : 'trip_general';
      if (!tripGroups[tripId]) {
        tripGroups[tripId] = { location: matchedLocation || 'My Travel', items: [] };
      }
      tripGroups[tripId].items.push(msg);
    } else {
      resultList.push(msg);
    }
  });

  Object.entries(tripGroups).forEach(([tripId, data]) => {
    if (data.items.length >= 1) {
      data.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestItem = data.items[0];
      const allSeen = data.items.every(item => item.seen);
      const anyFlagged = data.items.some(item => item.flagged);

      const label = tripId === 'trip_general' ? '✈️ Upcoming Travel Details' : `✈️ Trip to ${data.location}`;
      const bundle: TripBundle = {
        isBundle: true,
        id: tripId,
        title: label,
        location: data.location,
        items: data.items,
        latestDate: latestItem.date,
        seen: allSeen,
        flagged: anyFlagged,
      };
      resultList.push(bundle);
    } else {
      resultList.push(...data.items);
    }
  });

  return resultList;
};

export function getNormalizedSubject(subject: string | undefined): string {
  if (!subject) return 'no subject';
  return subject
    .replace(/^(re|fwd|fw|aw|vs|antw|wg|cob|reply):\s*/i, '')
    .replace(/^\[[^\]]*\]\s*/i, '')
    .trim()
    .toLowerCase();
}

export interface EmailThread {
  isThread: true;
  id: string;
  subject: string;
  items: EmailHeader[];
  latestDate: string;
  seen: boolean;
  flagged: boolean;
  fromSummary: string;
}

export const threadEmails = (list: (EmailHeader | TripBundle)[]): (EmailHeader | TripBundle | EmailThread)[] => {
  const headers = list.filter((item): item is EmailHeader => !('isBundle' in item));
  
  const groups: Record<string, EmailHeader[]> = {};
  headers.forEach(msg => {
    if ('isSavedLink' in msg && (msg as any).isSavedLink) return;
    const rawSub = msg.subject || '(No Subject)';
    const norm = getNormalizedSubject(rawSub);
    if (!norm || norm === 'no subject') return;
    if (!groups[norm]) {
      groups[norm] = [];
    }
    groups[norm].push(msg);
  });

  const resultList: (EmailHeader | TripBundle | EmailThread)[] = [];
  const processedUids = new Set<number>();

  list.forEach(item => {
    if ('isBundle' in item) {
      resultList.push(item);
      return;
    }

    const msg = item;
    if (processedUids.has(msg.uid)) return;

    if ('isSavedLink' in msg && (msg as any).isSavedLink) {
      resultList.push(msg);
      processedUids.add(msg.uid);
      return;
    }

    const rawSub = msg.subject || '(No Subject)';
    const norm = getNormalizedSubject(rawSub);

    if (norm && norm !== 'no subject' && groups[norm] && groups[norm].length > 1) {
      const threadItems = [...groups[norm]];
      threadItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const latestItem = threadItems[threadItems.length - 1];
      const allSeen = threadItems.every(it => it.seen);
      const anyFlagged = threadItems.some(it => it.flagged);
      
      const uniqueSenders: string[] = [];
      const seenSenders = new Set<string>();
      threadItems.forEach(it => {
        const name = it.from?.[0]?.name || it.from?.[0]?.address?.split('@')[0] || 'Unknown';
        if (!seenSenders.has(name.toLowerCase())) {
          seenSenders.add(name.toLowerCase());
          uniqueSenders.push(name);
        }
      });
      
      const fromSummary = uniqueSenders.join(', ');

      const thread: EmailThread = {
        isThread: true,
        id: `thread_${norm}`,
        subject: latestItem.subject || '(No Subject)',
        items: threadItems,
        latestDate: latestItem.date,
        seen: allSeen,
        flagged: anyFlagged,
        fromSummary,
      };
      
      resultList.push(thread);
      threadItems.forEach(it => processedUids.add(it.uid));
    } else {
      resultList.push(msg);
      processedUids.add(msg.uid);
    }
  });

  return resultList;
};

function getSenderColor(name: string): string {
  if (!name) return PALETTE[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return PALETTE[sum % PALETTE.length];
}

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return '?';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatMailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    
    if (isNaN(date.getTime())) return dateStr;

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString([], { year: '2-digit', month: 'numeric', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// Group emails into Google Inbox style relative buckets
interface GroupedMessages {
  title: string;
  items: (EmailHeader | TripBundle | EmailThread)[];
}

function groupMessagesByDate(list: (EmailHeader | TripBundle | EmailThread)[]): GroupedMessages[] {
  const today: (EmailHeader | TripBundle | EmailThread)[] = [];
  const yesterday: (EmailHeader | TripBundle | EmailThread)[] = [];
  const thisMonth: (EmailHeader | TripBundle | EmailThread)[] = [];
  const older: (EmailHeader | TripBundle | EmailThread)[] = [];

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayMidnight = todayMidnight - 24 * 60 * 60 * 1000;
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  list.forEach(item => {
    try {
      const dateStr = 'isBundle' in item ? item.latestDate : ('isThread' in item ? item.latestDate : item.date);
      const itemDate = new Date(dateStr);
      const itemTime = itemDate.getTime();

      if (itemTime >= todayMidnight) {
        today.push(item);
      } else if (itemTime >= yesterdayMidnight) {
        yesterday.push(item);
      } else if (itemTime >= firstOfThisMonth) {
        thisMonth.push(item);
      } else {
        older.push(item);
      }
    } catch {
      older.push(item);
    }
  });

  const groups: GroupedMessages[] = [];
  if (today.length > 0) groups.push({ title: 'Today', items: today });
  if (yesterday.length > 0) groups.push({ title: 'Yesterday', items: yesterday });
  if (thisMonth.length > 0) groups.push({ title: 'This Month', items: thisMonth });
  if (older.length > 0) groups.push({ title: 'Older', items: older });

  return groups;
}

// Gmail-style category classifications helper function
function classifyEmailCategory(m: EmailHeader): 'primary' | 'social' | 'promotions' | 'updates' {
  const subject = (m.subject || '').toLowerCase();
  const snippet = (m.snippet || '').toLowerCase();
  
  const fromAddr = m.from && m.from[0] ? (m.from[0].address || '').toLowerCase() : '';
  const fromName = m.from && m.from[0] ? (m.from[0].name || '').toLowerCase() : '';
  const bodyText = (subject + ' ' + snippet + ' ' + fromAddr + ' ' + fromName);

  if (
    bodyText.includes('facebook') ||
    bodyText.includes('twitter') ||
    bodyText.includes('linkedin') ||
    bodyText.includes('instagram') ||
    bodyText.includes('social') ||
    bodyText.includes('friend') ||
    bodyText.includes('follow') ||
    bodyText.includes('connect') ||
    bodyText.includes('pinterest') ||
    bodyText.includes('youtube') ||
    bodyText.includes('tiktok')
  ) {
    return 'social';
  }

  if (
    bodyText.includes('offer') ||
    bodyText.includes('deal') ||
    bodyText.includes('discount') ||
    bodyText.includes('coupon') ||
    bodyText.includes('promo') ||
    bodyText.includes('sale') ||
    bodyText.includes('marketing') ||
    bodyText.includes('buy') ||
    bodyText.includes('shop') ||
    bodyText.includes('store') ||
    bodyText.includes('save') ||
    bodyText.includes('free shipping') ||
    bodyText.includes('clearance') ||
    bodyText.includes('pricing') ||
    bodyText.includes('retailer')
  ) {
    return 'promotions';
  }

  if (
    bodyText.includes('noreply') ||
    bodyText.includes('no-reply') ||
    bodyText.includes('receipt') ||
    bodyText.includes('bill') ||
    bodyText.includes('invoice') ||
    bodyText.includes('support') ||
    bodyText.includes('alert') ||
    bodyText.includes('ticket') ||
    bodyText.includes('confirm') ||
    bodyText.includes('notification') ||
    bodyText.includes('update') ||
    bodyText.includes('transaction') ||
    bodyText.includes('security') ||
    bodyText.includes('password') ||
    bodyText.includes('verify') ||
    bodyText.includes('your account') ||
    bodyText.includes('statement')
  ) {
    return 'updates';
  }

  return 'primary';
}

export default function MailboxView({ accountSettings, onLogout, onSwitchAccount }: MailboxViewProps) {
  // Navigation states
  const [folders, setFolders] = useState<MailFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('INBOX');
  const [loadingFolders, setLoadingFolders] = useState(true);

  // Messages / Header Stream state
  const [messages, setMessages] = useState<EmailHeader[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [paginationSkip, setPaginationSkip] = useState(0);

  // Gmail-style Category Tabs filter state
  const [activeCategory, setActiveCategory] = useState<'all' | 'primary' | 'social' | 'promotions' | 'updates'>('all');

  // Search Autocomplete state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('drewmail_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const computedSuggestions = React.useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    
    // 1. Extract contacts from existing messages
    const contactsMap = new Map<string, { name: string; address: string; count: number }>();
    if (Array.isArray(messages)) {
      messages.forEach(m => {
        if (m.from && m.from[0]) {
          const addr = m.from[0].address || '';
          const name = m.from[0].name || '';
          if (addr) {
            const key = addr.toLowerCase();
            const existing = contactsMap.get(key);
            contactsMap.set(key, {
              name: name || addr.split('@')[0],
              address: addr,
              count: (existing?.count || 0) + 1
            });
          }
        }
      });
    }

    const allContacts = Array.from(contactsMap.values());
    allContacts.sort((a, b) => b.count - a.count);

    let filteredContacts = allContacts;
    if (term) {
      filteredContacts = allContacts.filter(c => 
        c.name.toLowerCase().includes(term) || c.address.toLowerCase().includes(term)
      );
    }
    const suggestedContacts = filteredContacts.slice(0, 4);

    // 2. Extract Quick Jump emails
    let quickJumpEmails: EmailHeader[] = [];
    if (term && term.length > 0 && Array.isArray(messages)) {
      quickJumpEmails = messages.filter(m => {
        const subject = (m.subject || '').toLowerCase();
        const snippet = (m.snippet || '').toLowerCase();
        const senderName = (m.from && m.from[0] && m.from[0].name || '').toLowerCase();
        const senderAddr = (m.from && m.from[0] && m.from[0].address || '').toLowerCase();
        return (
          subject.includes(term) ||
          snippet.includes(term) ||
          senderName.includes(term) ||
          senderAddr.includes(term)
        );
      }).slice(0, 4);
    }

    return {
      suggestedContacts,
      quickJumpEmails
    };
  }, [messages, searchInput]);

  // Google Inbox pin filter state (To toggle only starred columns)
  const [activePinFilter, setActivePinFilter] = useState(false);

  // Left sidebar permanent / collapsible togglers
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Email detail cache for inline expanding
  const [detailCache, setDetailCache] = useState<Record<string, FullEmail>>({});
  const [activeUid, setActiveUid] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Inline drafting email state
  const [inlineReplyText, setInlineReplyText] = useState('');
  const [inlineReplySending, setInlineReplySending] = useState(false);

  // File attachment download states
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Compose State
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // AI Summary Assistant State (Google Inbox style!)
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ summary: string; suggestions: string[] } | null>(null);

  // AI Reply Generator States
  const [aiTone, setAiTone] = useState<string>('professional');
  const [aiCustomInstructions, setAiCustomInstructions] = useState<string>('');
  const [generatingAiResponse, setGeneratingAiResponse] = useState<boolean>(false);
  const [aiResponseError, setAiResponseError] = useState<string | null>(null);

  // Snoozed states (UID -> duration label mapping)
  const [snoozedMails, setSnoozedMails] = useState<Record<number, { until: string; emailSubject?: string }>>({});
  const [activeSnoozePopoverUid, setActiveSnoozePopoverUid] = useState<number | null>(null);

  // Undo toast states
  const [lastAction, setLastAction] = useState<{ type: 'archive' | 'delete' | 'snooze'; uid: number; messageObj?: EmailHeader; meta?: any } | null>(null);
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Key shortcuts dialog display
  const [showShortcutsHelper, setShowShortcutsHelper] = useState<boolean>(false);

  // Attachment opening/preview and threading states
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; filename: string; contentType: string } | null>(null);
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({});
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

  // App errors
  const [operationError, setOperationError] = useState<string | null>(null);

  // Mobile navigation views helper
  const [mobilePane, setMobilePane] = useState<'folders' | 'headers' | 'detail'>('headers');

  // User color themes
  const [theme, setTheme] = useState<'blue' | 'crimson' | 'emerald' | 'violet' | 'amber' | 'sunset' | 'ocean' | 'cosmic' | 'aurora'>(() => {
    return (localStorage.getItem('drewmail_theme') as any) || 'blue';
  });

  const t = THEME_CONFIG[theme] || THEME_CONFIG.blue;

  // Sorting and filtering state
  const [activeSort, setActiveSort] = useState<string>('date-desc');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Search AI Summary states
  const [searchAiSummary, setSearchAiSummary] = useState<string | null>(null);
  const [loadingSearchAiSummary, setLoadingSearchAiSummary] = useState<boolean>(false);

  // Unified Inbox state
  const [isUnified, setIsUnified] = useState<boolean>(() => {
    return localStorage.getItem('drewmail_unified_inbox') === 'true';
  });

  const [activeAccountUser, setActiveAccountUser] = useState<string | null>(null);

  // Font size adjustment scaling state (+1px larger by default)
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(() => {
    const saved = localStorage.getItem('drewmail_font_size_offset');
    return saved !== null ? Number(saved) : 1;
  });

  // Custom toast notification list state
  interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [emptyingTrash, setEmptyingTrash] = useState(false);

  const handleEmptyTrash = async () => {
    if (!confirm('Are you sure you want to permanently delete all messages in this Trash folder? This cannot be undone.')) {
      return;
    }
    setEmptyingTrash(true);
    try {
      if (isUnified) {
        const promises = linkedAccounts.map(async (acc) => {
          const trashFolder = folders.find(f => f.role === 'trash');
          if (trashFolder) {
            await fetch('/api/imap/empty-trash', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                auth: acc.imap,
                folder: trashFolder.name,
              }),
            });
          }
        });
        await Promise.all(promises);
      } else {
        const response = await fetch('/api/imap/empty-trash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth: accountSettings.imap,
            folder: activeFolder,
          }),
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to empty Trash');
        }
      }

      showToast('Trash emptied successfully!', 'success');
      setPaginationSkip(0);
      fetchMessages();
    } catch (err: any) {
      console.error('Empty Trash Error Frontend:', err);
      showToast(err.message || 'Failed to empty Trash folder', 'error');
    } finally {
      setEmptyingTrash(false);
    }
  };

  const renderSimpleSummaryMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      let content = line.trim();
      if (!content) return <div key={idx} className="h-2" />;

      let isBullet = false;
      if (content.startsWith('* ') || content.startsWith('- ')) {
        isBullet = true;
        content = content.substring(2);
      } else if (content.match(/^\d+\.\s/)) {
        isBullet = true;
        content = content.replace(/^\d+\.\s/, '');
      }

      const parts = content.split('**');
      const formattedElements = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-extrabold text-indigo-950">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-2 pl-3 items-start my-1 text-slate-700">
            <span className="text-purple-500 font-bold select-none">•</span>
            <span className="flex-1 text-[11.5px]">{formattedElements}</span>
          </div>
        );
      }

      if (content.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 mt-2 mb-1 text-[12px]">
            {content.replace('### ', '')}
          </h4>
        );
      }
      if (content.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-extrabold text-purple-700 mt-3 mb-1.5 text-[11.5px] tracking-wide uppercase">
            {content.replace('## ', '')}
          </h3>
        );
      }

      return (
        <p key={idx} className="my-1 text-slate-700 text-[11.5px]">
          {formattedElements}
        </p>
      );
    });
  };

  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
      setSearchAiSummary(null);
      return;
    }

    if (messages.length === 0) {
      setSearchAiSummary(null);
      return;
    }

    let active = true;
    const fetchSearchAiSummary = async () => {
      setLoadingSearchAiSummary(true);
      try {
        const emailSummaryPayload = messages.slice(0, 10).map(m => ({
          sender: m.from?.[0]?.name || m.from?.[0]?.address || 'Unknown Sender',
          subject: m.subject || '(No Subject)',
          date: m.date,
          snippet: m.snippet || ''
        }));

        const response = await fetch('/api/ai/search-assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            emails: emailSummaryPayload
          })
        });

        const data = await response.json();
        if (active) {
          if (response.ok && data.success && data.answer) {
            setSearchAiSummary(data.answer);
          } else {
            setSearchAiSummary('No custom briefing generated. Try refining your keywords.');
          }
        }
      } catch (err) {
        if (active) {
          setSearchAiSummary('Network connectivity failure to AI search assistant.');
        }
      } finally {
        if (active) {
          setLoadingSearchAiSummary(false);
        }
      }
    };

    fetchSearchAiSummary();

    return () => {
      active = false;
    };
  }, [searchQuery, messages]);

  const toggleUnified = () => {
    setIsUnified(prev => {
      const next = !prev;
      localStorage.setItem('drewmail_unified_inbox', String(next));
      showToast(next ? 'Switched to Unified Inbox (All Accounts Joined)' : 'Switched to Default Account View', 'info');
      setTimeout(() => {
        fetchFolders();
        fetchMessages();
      }, 50);
      return next;
    });
  };

  // Safe credentials matching for Multi-Account / Unified operations
  const getAuthForMessage = (uid: number) => {
    const targetMsg = messages.find(m => m.uid === uid);
    if (targetMsg?.accountUser) {
      const match = linkedAccounts.find(acc => acc.imap.user.toLowerCase() === targetMsg.accountUser?.toLowerCase());
      if (match) return match.imap;
    }
    return accountSettings.imap;
  };

  // Helper to resolve email details under dynamic matching
  const getEmailDetail = (uid: number, accountUser?: string) => {
    const user = accountUser || activeAccountUser || accountSettings.imap.user;
    return detailCache[`${user}_${uid}`];
  };

  const renderAccountBadge = (accountUser?: string) => {
    if (!isUnified || !accountUser) return null;
    const index = linkedAccounts.findIndex(acc => acc.imap.user.toLowerCase() === accountUser.toLowerCase());
    const colors = [
      { bg: 'bg-blue-50 text-blue-650 border-blue-200/50', name: 'Primary' },
      { bg: 'bg-emerald-50 text-emerald-650 border-emerald-250/50', name: 'Personal' },
      { bg: 'bg-violet-50 text-violet-650 border-violet-200/50', name: 'Work' },
      { bg: 'bg-amber-50 text-amber-500 border-amber-250/50', name: 'Alternate' },
      { bg: 'bg-rose-50 text-rose-650 border-rose-200/50', name: 'Other' },
    ];
    const color = colors[index % colors.length] || colors[0];
    const shortUser = accountUser.split('@')[0];
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-extrabold border uppercase tracking-wider select-none shrink-0 ${color.bg}`} title={accountUser}>
        {shortUser}
      </span>
    );
  };

  // Custom contacts state (persistent custom contacts list for auto-complete and management)
  const [customContacts, setCustomContacts] = useState<{name: string; address: string; phone?: string; company?: string;}[]>(() => {
    try {
      const stored = localStorage.getItem('drewmail_custom_contacts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep state for multiple integrated IMAP/SMTP accounts
  const [linkedAccounts, setLinkedAccounts] = useState<MailAccountSettings[]>(() => {
    try {
      const stored = localStorage.getItem('drewmail_linked_accounts');
      if (stored) {
        const decoded = JSON.parse(stored);
        if (Array.isArray(decoded) && decoded.length > 0) {
          // Verify that accountSettings is included or updated
          const updated = decoded.map((acc: any) =>
            acc.imap?.user?.toLowerCase() === accountSettings?.imap?.user?.toLowerCase() ? accountSettings : acc
          );
          if (!updated.some((acc: any) => acc.imap?.user?.toLowerCase() === accountSettings?.imap?.user?.toLowerCase())) {
            updated.push(accountSettings);
          }
          return updated;
        }
      }
    } catch {}
    return [accountSettings]; // Defaults to containing the active authenticated account
  });

  // Synchronize incoming accountSettings changes from parent
  useEffect(() => {
    setLinkedAccounts(prev => {
      const exists = prev.some(acc => acc.imap?.user?.toLowerCase() === accountSettings?.imap?.user?.toLowerCase());
      let next: MailAccountSettings[];
      if (exists) {
        next = prev.map(acc =>
          acc.imap?.user?.toLowerCase() === accountSettings?.imap?.user?.toLowerCase() ? accountSettings : acc
        );
      } else {
        next = [...prev, accountSettings];
      }
      localStorage.setItem('drewmail_linked_accounts', JSON.stringify(next));
      return next;
    });
  }, [accountSettings]);

  // Settings Modal controls
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'preferences' | 'accounts' | 'contacts'>('preferences');

  // Custom configuration options (stored locally)
  const [density, setDensity] = useState<'spacious' | 'compact'>(() => {
    return (localStorage.getItem('drewmail_density') as 'spacious' | 'compact') || 'spacious';
  });
  
  const [limit, setLimit] = useState<number>(() => {
    return Number(localStorage.getItem('drewmail_limit')) || 40;
  });

  const [signature, setSignature] = useState<string>(() => {
    return localStorage.getItem('drewmail_email_signature') || '';
  });

  const [autoAdvance, setAutoAdvance] = useState<'list' | 'newer' | 'older'>(() => {
    return (localStorage.getItem('drewmail_auto_advance') as any) || 'list';
  });

  const [notificationSound, setNotificationSound] = useState<boolean>(() => {
    return localStorage.getItem('drewmail_notif_sound') === 'true';
  });

  // Contacts management states
  const [contactSearch, setContactSearch] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [importPasteText, setImportPasteText] = useState('');

  // Account creation fields inside modal
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [newAccountImapHost, setNewAccountImapHost] = useState('');
  const [newAccountImapPort, setNewAccountImapPort] = useState('993');
  const [newAccountSmtpHost, setNewAccountSmtpHost] = useState('');
  const [newAccountSmtpPort, setNewAccountSmtpPort] = useState('465');
  const [newAccountSecure, setNewAccountSecure] = useState(true);
  const [newAccountAddingError, setNewAccountAddingError] = useState<string | null>(null);

  // Saved Links from Chrome directly to Inbox (Google Inbox feature)
  const [savedLinks, setSavedLinks] = useState<{ url: string; title: string; note?: string; date: string; uid: number }[]>(() => {
    try {
      const stored = localStorage.getItem(`drewmail_saved_links_local`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkNote, setNewLinkNote] = useState('');
  const [showSaveLinkPopover, setShowSaveLinkPopover] = useState(false);

  // Email Reminders / Task Notes (Email -> Task Conversion feature)
  const [emailReminders, setEmailReminders] = useState<Record<number, string>>(() => {
    try {
      const stored = localStorage.getItem(`drewmail_reminders_local`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activeReminderEditUid, setActiveReminderEditUid] = useState<number | null>(null);
  const [tempReminderText, setTempReminderText] = useState('');

  // AI Conversational Search Assistant
  const [aiSearchAnswer, setAiSearchAnswer] = useState<string | null>(null);
  const [searchingAi, setSearchingAi] = useState<boolean>(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  // Synchronizers
  useEffect(() => {
    localStorage.setItem(`drewmail_saved_links_local`, JSON.stringify(savedLinks));
  }, [savedLinks]);

  useEffect(() => {
    localStorage.setItem(`drewmail_reminders_local`, JSON.stringify(emailReminders));
  }, [emailReminders]);

  // Sync folders hierarchy
  useEffect(() => {
    fetchFolders(true);
  }, []);

  // Sync snoozed dictionary from localStorage
  useEffect(() => {
    const user = accountSettings?.imap?.user || 'anon';
    const key = `drewmail_snoozed_${user}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setSnoozedMails(JSON.parse(stored));
      } catch (e) {
        console.error('Failed reading snoozed dictionary', e);
      }
    }
  }, [accountSettings?.imap?.user]);

  // Pre-load visual thumbnails for image attachments on the current page
  useEffect(() => {
    let active = true;
    const fetchImages = async () => {
      const uidsToFetch: { uid: number; filename: string }[] = [];
      messages.forEach(msg => {
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.slice(0, 3).forEach(att => {
            const isImg = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(att.filename) || (att.contentType && att.contentType.startsWith('image/'));
            if (isImg && !thumbnailCache[`${msg.uid}_${att.filename}`]) {
              uidsToFetch.push({ uid: msg.uid, filename: att.filename });
            }
          });
        }
      });

      const limit = uidsToFetch.slice(0, 12);
      for (const item of limit) {
        if (!active) break;
        try {
          const cacheKey = `${item.uid}_${item.filename}`;
          const res = await fetch('/api/imap/attachment/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auth: accountSettings.imap,
              folder: activeFolder,
              uid: item.uid,
              filename: item.filename,
            })
          });
          const data = await res.json();
          if (active && res.ok && data.success && data.contentBase64) {
            const url = `data:${data.contentType || 'image/png'};base64,${data.contentBase64}`;
            setThumbnailCache(prev => ({ ...prev, [cacheKey]: url }));
          }
        } catch {
          // ignore
        }
      }
    };

    fetchImages();
    return () => {
      active = false;
    };
  }, [messages, activeFolder, accountSettings.imap]);

  // Gmail Keyboard Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || activeEl.hasAttribute('contenteditable')) {
          return; // Ignore if focused inside writing forms
        }
      }

      const key = e.key.toLowerCase();
      if (key === 'c') {
        e.preventDefault();
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeOpen(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActiveUid(null);
        setComposeOpen(false);
      } else if (key === 'e' || key === 'y') {
        // Archive / Done
        if (activeUid) {
          e.preventDefault();
          handleArchiveEmail(activeUid);
        }
      } else if (e.key === '#' || e.key === 'Backspace' || e.key === 'Delete') {
        // Recycle bin
        if (activeUid) {
          e.preventDefault();
          handleDeleteEmail(activeUid);
        }
      } else if (key === 's') {
        // Toggle Pin status
        if (activeUid) {
          e.preventDefault();
          const activeEmail = messages.find(m => m.uid === activeUid);
          if (activeEmail) {
            handleToggleFlag(activeUid, activeEmail.flagged ? 'unstar' : 'star');
          }
        }
      } else if (key === 'i') {
        // Navigate back to INBOX
        e.preventDefault();
        const firstInbox = folders.find(f => f.role === 'inbox');
        if (firstInbox) {
          setActiveFolder(firstInbox.name);
          setActiveUid(null);
        }
      } else if (e.key === '?') {
        // Trigger visual documentation dialog for Shortcuts
        e.preventDefault();
        setShowShortcutsHelper(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeUid, messages, folders, accountSettings]);

  // Undo Toast Trigger
  const triggerUndoToast = (type: 'archive' | 'delete' | 'snooze', uid: number, meta?: any) => {
    const targetMsg = messages.find(m => m.uid === uid);
    setLastAction({ type, uid, messageObj: targetMsg, meta });
    setShowUndoToast(true);

    let actionLabel = 'Action completed successfully.';
    if (type === 'archive') actionLabel = 'Email archived / marked Done.';
    if (type === 'delete') actionLabel = 'Email moved to Trash.';
    if (type === 'snooze') actionLabel = `Email snoozed successfully.`;
    showToast(actionLabel, 'success');

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setShowUndoToast(false);
      setLastAction(null);
    }, 7000); // 7 seconds
  };

  // Undo Command Executioner
  const handleUndoAction = async () => {
    if (!lastAction) return;
    const { type, uid, messageObj, meta } = lastAction;

    setShowUndoToast(false);

    // Optimistically restore item inside messages array
    if (messageObj) {
      setMessages(prev => {
        if (prev.some(m => m.uid === uid)) return prev;
        return [messageObj, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }

    try {
      if (type === 'snooze') {
        const user = accountSettings?.imap?.user || 'anon';
        const key = `drewmail_snoozed_${user}`;
        const updated = { ...snoozedMails };
        delete updated[uid];
        setSnoozedMails(updated);
        localStorage.setItem(key, JSON.stringify(updated));
      } else if (type === 'archive') {
        // Move back from archive folder to current active folder
        const archiveFolderObj = folders.find(f => f.role === 'archive');
        const archivePath = archiveFolderObj ? archiveFolderObj.name : 'Archive';

        await fetch('/api/imap/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth: accountSettings.imap,
            folder: archivePath,
            uid,
            action: 'move',
            targetFolder: activeFolder,
          }),
        });
      } else if (type === 'delete') {
        // Move back from trash to active folder
        const trashFolderObj = folders.find(f => f.role === 'trash');
        const trashPath = trashFolderObj ? trashFolderObj.name : 'Trash';

        await fetch('/api/imap/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth: accountSettings.imap,
            folder: trashPath,
            uid,
            action: 'move',
            targetFolder: activeFolder,
          }),
        });
      }

      // Sync mailbox totals
      fetchFolders();
    } catch (err) {
      console.error('Failed executing undo target actions', err);
    } finally {
      setLastAction(null);
    }
  };

  // Snoozing action trigger
  const handleSnoozeEmail = (uid: number, durationLabel: string, subjectLine?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const user = accountSettings?.imap?.user || 'anon';
    const key = `drewmail_snoozed_${user}`;

    const updated = { ...snoozedMails, [uid]: { until: durationLabel, emailSubject: subjectLine } };
    setSnoozedMails(updated);
    localStorage.setItem(key, JSON.stringify(updated));

    if (activeUid === uid) {
      setActiveUid(null);
    }

    triggerUndoToast('snooze', uid);
  };

  const handleUnsnoozeEmail = (uid: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const user = accountSettings?.imap?.user || 'anon';
    const key = `drewmail_snoozed_${user}`;

    const updated = { ...snoozedMails };
    delete updated[uid];
    setSnoozedMails(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    fetchFolders();
  };

  // Sync emails stream
  useEffect(() => {
    fetchMessages();
  }, [activeFolder, searchQuery, paginationSkip]);

  const fetchFolders = async (selectDefault = false) => {
    setLoadingFolders(true);
    setOperationError(null);
    try {
      const response = await fetch('/api/imap/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth: accountSettings.imap }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFolders(data.folders);
        if (selectDefault && data.folders.length > 0) {
          const inbox = data.folders.find((f: any) => f.role === 'inbox');
          if (inbox) {
            setActiveFolder(inbox.name);
          } else {
            setActiveFolder(data.folders[0].name);
          }
        }
      } else {
        setOperationError(data.error || 'Failed to sync folder hierarchies.');
      }
    } catch {
      setOperationError('Network connectivity failure to local sync server.');
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchMessages = async () => {
    // If it is our virtual Snoozed view, query the Inbox folder then filter in client render
    const targetFolder = activeFolder === '__SNOOZED__' ? 'INBOX' : activeFolder;

    setLoadingMessages(true);
    setOperationError(null);

    // If unified mode is on, fetch across all accounts in parallel safely
    if (isUnified && linkedAccounts.length > 1) {
      try {
        const promises = linkedAccounts.map(async (acc) => {
          try {
            const response = await fetch('/api/imap/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                auth: acc.imap,
                folder: targetFolder,
                limit: Math.max(5, Math.ceil(limit / linkedAccounts.length)),
                skip: paginationSkip,
                search: searchQuery,
              }),
            });
            const data = await response.json();
            if (response.ok && data.success && Array.isArray(data.messages)) {
              return data.messages.map((m: EmailHeader) => ({
                ...m,
                accountUser: acc.imap.user
              }));
            }
          } catch (e) {
            console.error(`Unified fetch failed for ${acc.imap.user}`, e);
          }
          return [];
        });

        const results = await Promise.all(promises);
        const allMails = results.flat();
        
        // Chronological descending sort
        allMails.sort((a, b) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA;
        });

        setMessages(allMails);
        setTotalMessages(allMails.length);
      } catch (err) {
        setOperationError('Unified metadata request failure. Please retry.');
        showToast('Unified inbox fetch failed', 'error');
      } finally {
        setLoadingMessages(false);
      }
      return;
    }

    try {
      const response = await fetch('/api/imap/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: accountSettings.imap,
          folder: targetFolder,
          limit,
          skip: paginationSkip,
          search: searchQuery,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages(data.messages.map((m: EmailHeader) => ({
          ...m,
          accountUser: accountSettings.imap.user
        })));
        setTotalMessages(data.total);
      } else {
        setOperationError(data.error || 'Failed to sync emails headers.');
      }
    } catch (err) {
      setOperationError('Metadata request timeout. Please refresh.');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Google Inbox Inline fetcher
  const fetchEmailDetailInline = async (uid: number, accountUser?: string) => {
    const targetUser = accountUser || accountSettings.imap.user;
    const cacheKey = `${targetUser}_${uid}`;

    if (activeUid === uid && activeAccountUser === targetUser) {
      // Toggle collapse
      setActiveUid(null);
      setActiveAccountUser(null);
      setAiResult(null);
      setAiError(null);
      return;
    }

    setAiResult(null);
    setAiError(null);

    // If cached in local React state, skip network download and load immediately
    if (detailCache[cacheKey]) {
      setActiveUid(uid);
      setActiveAccountUser(targetUser);
      markEmailReadState(uid);
      return;
    }

    // Set activeUid immediately so the loader renders inside the expanding sub-email panel
    setActiveUid(uid);
    setActiveAccountUser(targetUser);

    setLoadingDetail(true);
    setOperationError(null);
    try {
      const match = linkedAccounts.find(acc => acc.imap.user.toLowerCase() === targetUser.toLowerCase());
      const auth = match ? match.imap : accountSettings.imap;

      const response = await fetch('/api/imap/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth,
          folder: activeFolder === '__SNOOZED__' ? 'INBOX' : activeFolder,
          uid,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDetailCache(prev => ({ ...prev, [cacheKey]: data.email }));
        markEmailReadState(uid);
      } else {
        setOperationError(data.error || 'Could not retrieve email source body.');
        setActiveUid(null);
        setActiveAccountUser(null);
      }
    } catch {
      setOperationError('Network timeout requesting full MIME email.');
      setActiveUid(null);
      setActiveAccountUser(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const markEmailReadState = (uid: number) => {
    // Optimistically mark as seen/read in local message header list
    setMessages(prev => prev.map(m => m.uid === uid ? { ...m, seen: true } : m));
    // Update folders unread count in state
    setFolders(prev => prev.map(f => {
      if (f.name === activeFolder && f.unreadCount && f.unreadCount > 0) {
        return { ...f, unreadCount: f.unreadCount - 1 };
      }
      return f;
    }));
  };

  // Clickable attachment retriever inside Node IMAP backend
  const handleDownloadAttachment = async (uid: number, filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingFile(filename);
    try {
      const response = await fetch('/api/imap/attachment/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: getAuthForMessage(uid),
          folder: activeFolder,
          uid,
          filename,
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Hydrate base64 content back into a safe browser document Blob object
        const byteCharacters = atob(data.contentBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.contentType });
        
        const isZipFormat = filename.toLowerCase().endsWith('.zip') || 
                            filename.toLowerCase().endsWith('.rar') || 
                            filename.toLowerCase().endsWith('.7z') || 
                            filename.toLowerCase().endsWith('.tar') || 
                            filename.toLowerCase().endsWith('.gz') || 
                            filename.toLowerCase().endsWith('.tgz') || 
                            data.contentType === 'application/zip' || 
                            data.contentType === 'application/x-zip-compressed';

        const objUrl = window.URL.createObjectURL(blob);

        if (isZipFormat) {
          const link = document.createElement('a');
          link.href = objUrl;
          link.download = data.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Open in our elegant inline Preview Modal!
          setPreviewAttachment({
            url: objUrl,
            filename: data.filename,
            contentType: data.contentType || 'application/octet-stream',
          });
        }
      } else {
        alert('Could not open file preview: ' + (data.error || 'Unknown error.'));
      }
    } catch (err) {
      alert('Network error requesting attachment from IMAP client.');
    } finally {
      setDownloadingFile(null);
    }
  };

  // Group sweep (Mark all read) - Google Inbox Classic
  const handleSweepGroup = async (items: EmailHeader[], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const unseenItems = items.filter(item => !item.seen);
    if (unseenItems.length === 0) return;

    // Optimistically change state
    setMessages(prev => prev.map(m => {
      if (unseenItems.some(ui => ui.uid === m.uid)) {
        return { ...m, seen: true };
      }
      return m;
    }));

    try {
      await Promise.all(unseenItems.map(item => 
        fetch('/api/imap/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth: accountSettings.imap,
            folder: activeFolder,
            uid: item.uid,
            action: 'markRead',
          })
        })
      ));
      // Re-fetch counts
      fetchFolders();
    } catch {
      fetchMessages();
    }
  };

  // Google Inbox Inline quick replying loop
  const handleSendInlineReply = async (uid: number, toAddress: string, subject: string) => {
    if (!inlineReplyText.trim()) return;
    setInlineReplySending(true);
    setOperationError(null);
    try {
      const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
      const response = await fetch('/api/smtp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: accountSettings.smtp,
          mail: {
            to: toAddress,
            subject: replySubject,
            body: inlineReplyText,
          }
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setInlineReplyText('');
        setMessages(prev => prev.map(m => m.uid === uid ? { ...m, seen: true } : m));
        alert('Reply delivered successfully!');
        setActiveUid(null); // Collapse thread
      } else {
        setOperationError(data.error || 'SMTP rejected sending inline message.');
      }
    } catch {
      setOperationError('Network timeout sending inline SMTP reply.');
    } finally {
      setInlineReplySending(false);
    }
  };

  // Flags & Trash
  const handleToggleFlag = async (uid: number, actionType: 'seen' | 'unseen' | 'star' | 'unstar', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const apiAction = 
      actionType === 'seen' ? 'markRead' :
      actionType === 'unseen' ? 'markUnread' :
      actionType === 'star' ? 'star' : 'unstar';

    setMessages(prev => prev.map(m => {
      if (m.uid === uid) {
        return {
          ...m,
          seen: actionType === 'seen' ? true : actionType === 'unseen' ? false : m.seen,
          flagged: actionType === 'star' ? true : actionType === 'unstar' ? false : m.flagged,
        };
      }
      return m;
    }));

    if (detailCache[uid]) {
      setDetailCache(prev => {
        const item = prev[uid];
        if (!item) return prev;
        return {
          ...prev,
          [uid]: {
            ...item,
            seen: actionType === 'seen' ? true : actionType === 'unseen' ? false : item.seen,
            flagged: actionType === 'star' ? true : actionType === 'unstar' ? false : item.flagged,
          }
        };
      });
    }

    try {
      await fetch('/api/imap/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: accountSettings.imap,
          folder: activeFolder,
          uid,
          action: apiAction,
        }),
      });
    } catch {
      fetchMessages();
    }
  };

  const handleDeleteEmail = async (uid: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    triggerUndoToast('delete', uid);
    setMessages(prev => prev.filter(m => m.uid !== uid));
    if (activeUid === uid) {
      setActiveUid(null);
    }

    try {
      await fetch('/api/imap/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: getAuthForMessage(uid),
          folder: activeFolder,
          uid,
          action: 'delete',
        }),
      });
    } catch {
      fetchMessages();
    }
  };

  const handleArchiveEmail = async (uid: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    triggerUndoToast('archive', uid);
    setMessages(prev => prev.filter(m => m.uid !== uid));
    if (activeUid === uid) {
      setActiveUid(null);
    }

    const archiveFolder = folders.find(f => f.role === 'archive');
    const targetPath = archiveFolder ? archiveFolder.name : 'Archive';

    try {
      await fetch('/api/imap/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: getAuthForMessage(uid),
          folder: activeFolder,
          uid,
          action: 'move',
          targetFolder: targetPath,
        }),
      });
    } catch (err) {
      fetchMessages();
    }
  };

  const handleSmartReply = (replyText: string) => {
    if (!activeUid || !detailCache[activeUid]) return;
    const detail = detailCache[activeUid];
    setInlineReplyText(replyText);
  };

  const handleGenerateAiSummary = async (uid: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!detailCache[uid]) return;
    setAiGenerating(true);
    setAiError(null);
    setAiResult(null);

    const emailDetail = detailCache[uid];
    const emailBodyClean = emailDetail.text || emailDetail.html || '';

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailDetail.subject,
          body: emailBodyClean,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAiResult(data.ai);
      } else {
        setAiError(data.error || 'Gemini summarization failed. Verify your API Key.');
      }
    } catch {
      setAiError('Network connectivity to AI Summarizer failed.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateAiDraft = async (uid: number) => {
    if (!detailCache[uid]) return;
    setGeneratingAiResponse(true);
    setAiResponseError(null);
    const emailDetail = detailCache[uid];
    const emailBodyClean = emailDetail.text || emailDetail.html || '';

    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailDetail.subject,
          body: emailBodyClean,
          tone: aiTone,
          keypoints: aiCustomInstructions,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInlineReplyText(data.reply);
        setAiCustomInstructions('');
      } else {
        setAiResponseError(data.error || 'Failed to generate AI reply draft.');
      }
    } catch {
      setAiResponseError('Network connectivity failure to AI generation server.');
    } finally {
      setGeneratingAiResponse(false);
    }
  };

  const handleSelectFolder = (folderName: string) => {
    setActiveFolder(folderName);
    setPaginationSkip(0);
    setActiveUid(null);
    setSearchQuery('');
    setSearchInput('');
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      setRecentSearches(prev => {
        const next = [query, ...prev.filter(q => q !== query)].slice(0, 8);
        localStorage.setItem('drewmail_recent_searches', JSON.stringify(next));
        return next;
      });
    }
    setPaginationSkip(0);
    setSearchQuery(query);
    setIsSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPaginationSkip(0);
    setIsSearchFocused(false);
  };

  const handleSelectSuggestion = (query: string) => {
    setSearchInput(query);
    setSearchQuery(query);
    setPaginationSkip(0);
    setIsSearchFocused(false);

    if (query.trim()) {
      const q = query.trim();
      setRecentSearches(prev => {
        const next = [q, ...prev.filter(x => x !== q)].slice(0, 8);
        localStorage.setItem('drewmail_recent_searches', JSON.stringify(next));
        return next;
      });
    }
  };

  const getFolderIcon = (role: string) => {
    switch (role) {
      case 'inbox': return <Inbox className="w-4 h-4 shrink-0" />;
      case 'sent': return <Send className="w-4 h-4 shrink-0" />;
      case 'drafts': return <FileText className="w-4 h-4 shrink-0" />;
      case 'trash': return <Trash2 className="w-4 h-4 shrink-0" />;
      case 'archive': return <Archive className="w-4 h-4 shrink-0" />;
      case 'spam': return <AlertCircle className="w-4 h-4 shrink-0" />;
      default: return <Folder className="w-4 h-4 shrink-0 bg-transparent text-slate-400" />;
    }
  };

  // Filter pinned items if filter switch is toggled, and handle Snooze virtualization
  const filteredMessages = React.useMemo(() => {
    let list = [...messages];

    // Hydrate virtual saved links into inbox streams/timelines
    if (activeFolder.toUpperCase() === 'INBOX' || activeFolder === '__SNOOZED__') {
      const virtualSavedLinkHeaders = savedLinks.map(link => ({
        uid: link.uid,
        seq: 9999,
        subject: `🔗 Saved Link: ${link.title}`,
        snippet: link.note || link.url,
        from: [{ name: 'Task Bookmark', address: 'saved-link@drewmail.internal' }],
        to: [],
        date: link.date,
        size: 0,
        seen: false,
        flagged: true,
        attachments: [],
        isSavedLink: true,
        savedLinkUrl: link.url,
      })) as any[];
      list = [...list, ...virtualSavedLinkHeaders];
    }

    // Apply Gmail-Style smart categories filter
    if (activeFolder.toUpperCase() === 'INBOX' && activeCategory !== 'all') {
      list = list.filter(m => classifyEmailCategory(m) === activeCategory);
    }

    // Apply main menu filters
    if (activeFilter === 'unread') {
      list = list.filter(m => !m.seen);
    } else if (activeFilter === 'starred') {
      list = list.filter(m => m.flagged || (m.uid in emailReminders));
    } else if (activeFilter === 'attachments') {
      list = list.filter(m => m.attachments && m.attachments.length > 0);
    } else if (activeFilter === 'snoozed') {
      list = list.filter(m => m.uid in snoozedMails);
    }

    if (activePinFilter) {
      list = list.filter(m => m.flagged || (m.uid in emailReminders));
    }

    const sortList = (arr: any[]) => {
      if (activeSort === 'date-desc') {
        arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else if (activeSort === 'date-asc') {
        arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (activeSort === 'subject') {
        arr.sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
      } else if (activeSort === 'sender') {
        const getSenderName = (m: any) => m.from?.[0]?.name || m.from?.[0]?.address || '';
        arr.sort((a, b) => getSenderName(a).localeCompare(getSenderName(b)));
      } else if (activeSort === 'size-desc') {
        arr.sort((a, b) => (b.size || 0) - (a.size || 0));
      }
    };

    if (activeFolder === '__SNOOZED__') {
      // Show ONLY entries that are active in the snoozed dictionary
      const result = list.filter(m => m.uid in snoozedMails);
      sortList(result);
      return threadEmails(result);
    } else if (activeFolder.toUpperCase() === 'INBOX') {
      // HIDE elements that have been snoozed from the main inbox folder
      const inboxList = list.filter(m => !(m.uid in snoozedMails));
      sortList(inboxList);
      
      if (!activePinFilter) {
        // Group travel and reservation emails into custom Trip Bundles!
        const bundled = bundleTripMessages(inboxList);
        return threadEmails(bundled);
      }
      return threadEmails(inboxList);
    }

    sortList(list);
    return threadEmails(list);
  }, [messages, activePinFilter, activeFolder, snoozedMails, savedLinks, emailReminders, activeSort, activeFilter, activeCategory]);
  const groupedMessageBlocks = groupMessagesByDate(filteredMessages);

  // Parse unified names & addresses for autocomplete prediction
  const contacts = React.useMemo(() => {
    // Start with custom contacts
    const list: { name: string; address: string }[] = customContacts.map(c => ({
      name: c.name,
      address: c.address
    }));
    const seenEmails = new Set<string>(customContacts.map(c => c.address.toLowerCase()));

    messages.forEach(msg => {
      if (msg.from && msg.from.length > 0) {
        const address = msg.from[0].address;
        if (address && !seenEmails.has(address.toLowerCase())) {
          seenEmails.add(address.toLowerCase());
          list.push({
            name: msg.from[0].name || address.split('@')[0],
            address: address
          });
        }
      }
    });
    return list;
  }, [messages, customContacts]);

  const handleRefineDraft = async (type: 'formal' | 'shorter' | 'longer' | 'friendly') => {
    if (!activeUid || !detailCache[activeUid]) return;
    setGeneratingAiResponse(true);
    setAiResponseError(null);

    const emailDetail = detailCache[activeUid];
    const emailBodyClean = emailDetail.text || emailDetail.html || '';

    let instruction = `Refine this draft I have already typed: "${inlineReplyText}". `;
    if (type === 'formal') {
      instruction += 'Please rewrite it to be formal, professional, clear, and corporate.';
    } else if (type === 'shorter') {
      instruction += 'Please rewrite it to be shorter, highly concise, brief, and straight to the point.';
    } else if (type === 'longer') {
      instruction += 'Please rewrite it to be longer, more detailed, warm, and elaborate or explanatory.';
    } else if (type === 'friendly') {
      instruction += 'Please rewrite it to be friendly, casual, enthusiastic, and warm.';
    }

    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailDetail.subject,
          body: emailBodyClean,
          tone: 'custom',
          keypoints: instruction,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInlineReplyText(data.reply);
      } else {
        setAiResponseError(data.error || 'Failed to refine draft using AI.');
      }
    } catch {
      setAiResponseError('Network error connecting to AI Refiner.');
    } finally {
      setGeneratingAiResponse(false);
    }
  };

  const handleAiSearchAssist = async () => {
    if (!searchInput.trim()) return;
    setSearchingAi(true);
    setAiSearchAnswer(null);
    setAiSearchError(null);

    const sampleMails = filteredMessages.slice(0, 10).map(m => {
      if ('isBundle' in m) {
        return {
          sender: 'Multiple',
          subject: m.title,
          date: m.latestDate,
          snippet: m.items.map(it => it.snippet || '').join('; '),
        };
      }
      return {
        sender: m.from?.[0]?.name || 'Unknown',
        subject: m.subject || '(No Subject)',
        date: m.date,
        snippet: m.snippet || '',
      };
    });

    try {
      const response = await fetch('/api/ai/search-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchInput,
          emails: sampleMails,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAiSearchAnswer(data.answer);
      } else {
        setAiSearchError(data.error || 'AI Search Helper failed.');
      }
    } catch {
      setAiSearchError('Could not connect to AI Search Assistance.');
    } finally {
      setSearchingAi(false);
    }
  };

  const handleCreateSaveLink = () => {
    if (!newLinkUrl.trim() || !newLinkLabel.trim()) return;
    const newLink = {
      uid: -Date.now(),
      url: newLinkUrl.trim(),
      title: newLinkLabel.trim(),
      note: newLinkNote.trim(),
      date: new Date().toISOString(),
    };
    setSavedLinks(prev => [newLink, ...prev]);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setNewLinkNote('');
    setShowSaveLinkPopover(false);
  };

  const handleSaveReminder = (uid: number, noteText: string) => {
    setEmailReminders(prev => {
      const next = { ...prev };
      if (!noteText.trim()) {
        delete next[uid];
      } else {
        next[uid] = noteText.trim();
      }
      return next;
    });
    setActiveReminderEditUid(null);
  };

  const [expandedBundleId, setExpandedBundleId] = useState<string | null>(null);

  const renderAttachmentThumbnail = (msgUid: number, att: any) => {
    const filename = att.filename || 'attachment';
    const isImg = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(filename) || (att.contentType && att.contentType.startsWith('image/'));
    const cacheKey = `${msgUid}_${filename}`;
    const cachedUrl = thumbnailCache[cacheKey];

    if (isImg) {
      return (
        <div
          key={filename}
          onClick={(e) => handleDownloadAttachment(msgUid, filename, e)}
          className="relative w-12 h-12 group rounded-xl overflow-hidden border border-slate-200 shadow-3xs transition-all hover:shadow-2xs cursor-pointer shrink-0"
        >
          {cachedUrl ? (
            <img
              src={cachedUrl}
              alt={filename}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            </div>
          )}
          {/* Filename text displayed only on hover overlay */}
          <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-1 pointer-events-none select-none">
            <span className="text-[7.5px] text-white font-semibold leading-tight truncate block text-center" title={filename}>
              {filename}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={filename}
        onClick={(e) => handleDownloadAttachment(msgUid, filename, e)}
        className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-[9px] font-semibold text-slate-650 transition-all cursor-pointer shadow-3xs hover:border-slate-300"
      >
        {filename.toLowerCase().endsWith('.pdf') ? (
          <FileText className="w-3 h-3 text-red-500 shrink-0" />
        ) : /\.(zip|rar|7z|tar|gz|tgz)$/i.test(filename) ? (
          <FileArchive className="w-3 h-3 text-sky-600 shrink-0" />
        ) : (
          <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
        )}
        <span className="truncate max-w-28" title={filename}>{filename}</span>
      </div>
    );
  };

  const renderExpandedEmailFullSheet = (msg: EmailHeader) => {
    const emailDetail = getEmailDetail(msg.uid, msg.accountUser);
    if (!emailDetail) return null;

    const senderName = emailDetail.from?.[0]?.name || emailDetail.from?.[0]?.address?.split('@')[0] || 'Unknown';
    const senderEmail = emailDetail.from?.[0]?.address || '';

    return (
      <div className="p-4 sm:p-5 space-y-5 max-w-[1500px] mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-md p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h2 className="text-base sm:text-md font-bold text-slate-800 leading-tight select-text">
                {emailDetail.subject || '(No Subject)'}
              </h2>
              <div className="flex items-center gap-2 mt-2 select-text">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold text-xs shrink-0 select-none">
                  {getInitials(emailDetail.from?.[0]?.name, emailDetail.from?.[0]?.address)}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {emailDetail.from?.[0]?.name || emailDetail.from?.[0]?.address}
                  {emailDetail.from?.[0]?.address && (
                    <span className="text-slate-400 font-normal font-mono text-[9px] ml-1">
                      &lt;{emailDetail.from[0].address}&gt;
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={(e) => handleGenerateAiSummary(msg.uid, e)}
                disabled={aiGenerating}
                className={`px-2.5 py-1 flex items-center gap-1 bg-violet-50 hover:bg-violet-100 text-violet-750 disabled:opacity-50 text-[11px] font-bold rounded-lg border border-violet-150 cursor-pointer shadow-3xs transition-all`}
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-600 fill-violet-100 animate-pulse shrink-0" />
                <span>AI Summary</span>
              </button>

              <button
                onClick={() => handleToggleFlag(msg.uid, emailDetail.seen ? 'unseen' : 'seen')}
                className="p-1.5 text-slate-400 hover:text-blue-500 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                title={emailDetail.seen ? 'Mark as Unread' : 'Mark as Read'}
              >
                <Mail className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToggleFlag(msg.uid, emailDetail.flagged ? 'unstar' : 'star')}
                className="p-1.5 text-slate-400 hover:text-amber-500 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                title={emailDetail.flagged ? 'Unpin' : 'Pin'}
              >
                <Star className={`w-4 h-4 ${emailDetail.flagged ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>

              <button
                onClick={() => handleDeleteEmail(msg.uid)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleArchiveEmail(msg.uid)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                title="Done (Archive)"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Email Reminders Box */}
          <div className="bg-amber-50/45 border border-amber-150 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-850 font-bold text-xs select-none">
                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-350 shrink-0" />
                <span>Email Reminder / Task Note</span>
              </div>
              {activeReminderEditUid !== msg.uid ? (
                <button
                  onClick={() => {
                    setActiveReminderEditUid(msg.uid);
                    setTempReminderText(emailReminders[msg.uid] || '');
                  }}
                  className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer border-none bg-transparent"
                >
                  {emailReminders[msg.uid] ? 'Edit Reminder Note' : '+ Write Sticky Note'}
                </button>
              ) : null}
            </div>

            {activeReminderEditUid === msg.uid ? (
              <div className="flex gap-1.5 items-center pt-0.5">
                <input
                  type="text"
                  placeholder="e.g. Reply back by Wednesday, Call back at 555-0199..."
                  value={tempReminderText}
                  onChange={(e) => setTempReminderText(e.target.value)}
                  className="flex-1 text-xs bg-white border border-amber-200 focus:border-amber-400 focus:outline-none rounded-lg p-1.5 text-slate-800"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveReminder(msg.uid, tempReminderText);
                  }}
                />
                <button
                  onClick={() => handleSaveReminder(msg.uid, tempReminderText)}
                  className="px-2.5 py-1 bg-amber-550 hover:bg-amber-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setActiveReminderEditUid(null)}
                  className="px-2 py-1 text-slate-450 font-bold text-xs cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
              </div>
            ) : emailReminders[msg.uid] ? (
              <p className="text-xs p-2 bg-yellow-50 text-amber-900 border-l-3 border-amber-400 font-semibold select-text">
                📌 {emailReminders[msg.uid]}
              </p>
            ) : null}
          </div>

          <div className="text-[10px] text-slate-400 space-y-0.5 font-sans border-b border-slate-50 pb-2 select-text">
            {emailDetail.to && emailDetail.to.length > 0 && (
              <p><span className="font-semibold text-slate-500">To:</span> {emailDetail.to.map((t: any) => t.name || t.address).join(', ')}</p>
            )}
            {emailDetail.cc && emailDetail.cc.length > 0 && (
              <p><span className="font-semibold text-slate-500">Cc:</span> {emailDetail.cc.map((t: any) => t.name || t.address).join(', ')}</p>
            )}
            <p><span className="font-semibold text-slate-500">Date:</span> {new Date(emailDetail.date).toLocaleString()}</p>
          </div>

          <AnimatePresence>
            {aiGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex gap-2 text-xs text-purple-900 shadow-inner select-none"
              >
                <Loader2 className="w-4 h-4 text-purple-600 shrink-0 animate-spin" />
                <div>
                  <p className="font-bold text-purple-800">Compiling insights...</p>
                  <p className="text-purple-500 text-[10px] mt-0.5">Gemini Flash is summarizing conversation threads.</p>
                </div>
              </motion.div>
            )}

            {aiError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-150 rounded-xl p-3 flex gap-2 text-xs text-red-900"
              >
                <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
                <div>
                  <p className="font-bold text-red-800">Insight Assistant Offline</p>
                  <p className="text-red-500 text-[10px] mt-0.5 select-text">{aiError}</p>
                </div>
              </motion.div>
            )}

            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-50/50 to-violet-50/25 border border-purple-100 rounded-xl p-3.5 space-y-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-purple-805 mb-1 select-none">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-105" />
                    <p className="text-[10px] font-bold uppercase tracking-widest block">AI Sparkle Summary</p>
                  </div>
                  <p className="text-xs text-slate-755 leading-relaxed font-semibold font-sans select-text">
                    {aiResult.summary}
                  </p>
                </div>

                <hr className="border-purple-100" />

                <div>
                  <p className="text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 block select-none">Smart Replies (Prefill automatically)</p>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSmartReply(sug)}
                        className="text-left bg-white hover:bg-violet-50 border border-slate-200 hover:border-purple-300 rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:text-purple-700 transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                      >
                        <span>{sug}</span>
                        <CornerUpLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs h-[450px] bg-white relative">
            {emailDetail.html ? (
              <SafeIframe html={emailDetail.html} />
            ) : (
              <div className="p-4 bg-slate-50 text-slate-700 leading-relaxed font-mono select-text text-xs whitespace-pre-wrap overflow-y-auto h-full">
                {emailDetail.text}
              </div>
            )}
          </div>

          {/* Show attachments previews inline directly */}
          {emailDetail.attachments && emailDetail.attachments.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 select-none">
                Surfaced Image Attachments
              </span>
              <div className="flex flex-wrap gap-2.5 mb-3">
                {emailDetail.attachments.map((att, attIdx) => {
                  const isImg = /\.(jpe?g|png|gif|webp)$/i.test(att.filename) || (att.contentType && att.contentType.startsWith('image/'));
                  if (isImg) {
                    return (
                      <ImageAttachmentThumbnail
                        key={attIdx}
                        uid={msg.uid}
                        filename={att.filename}
                        activeFolder={activeFolder}
                        auth={getAuthForMessage(msg.uid)}
                      />
                    );
                  }
                  return null;
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {emailDetail.attachments.map((att, attIndex) => {
                  const isDownloading = downloadingFile === att.filename;
                  return (
                    <div
                      key={attIndex}
                      onClick={(e) => handleDownloadAttachment(msg.uid, att.filename, e)}
                      className="flex items-center justify-between p-2.5 border border-slate-205 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer group shadow-3xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="p-1.5 bg-white border border-slate-150 text-slate-400 rounded">
                          {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-750 truncate group-hover:text-blue-600 select-text">{att.filename}</p>
                          <p className="text-[8px] text-slate-400 font-mono mt-0.5">{formatBytes(att.size)}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 group-hover:text-blue-500 flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 bg-white border border-slate-150 rounded select-none">
                        <Download className="w-3 h-3" />
                        <span>Get</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI quick reply presets */}
        {/* Quick Tone presets */}
        <div className="bg-gradient-to-br from-purple-50/60 to-indigo-50/20 border border-purple-100 rounded-xl p-4 space-y-3 shadow-3xs select-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-600 fill-purple-100 animate-pulse" />
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">AI Direct Compose</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'professional', label: '👔 Corporate' },
                { id: 'casual', label: '☀️ Friendly' },
                { id: 'agree', label: '✅ Agree' },
                { id: 'decline', label: '❌ Decline' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAiTone(t.id)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md border transition-all cursor-pointer ${
                    aiTone === t.id ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Tell them sure let's meet tomorrow at 10..."
              value={aiCustomInstructions}
              onChange={(e) => setAiCustomInstructions(e.target.value)}
              className="flex-1 text-xs bg-white border border-slate-205 focus:border-purple-300 rounded-lg p-2 text-slate-800 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateAiDraft(msg.uid);
              }}
            />
            <button
              onClick={() => handleGenerateAiDraft(msg.uid)}
              disabled={generatingAiResponse}
              className="px-3.5 py-1.5 shrink-0 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-3xs"
            >
              {generatingAiResponse ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 fill-white" />}
              <span>Autotype</span>
            </button>
          </div>

          {/* AI Refiner Toolbar! */}
          {inlineReplyText.trim() && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-purple-100">
              <span className="text-[9px] font-bold text-purple-700 uppercase tracking-widest block">Refine Draft:</span>
              {[
                { id: 'formal', label: '👔 Make Business' },
                { id: 'friendly', label: '✨ Make Warm' },
                { id: 'shorter', label: '✂️ Shorten text' },
                { id: 'longer', label: '📝 Expand info' },
              ].map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleRefineDraft(act.id as any)}
                  disabled={generatingAiResponse}
                  className="px-2 py-0.5 text-[9px] bg-white border border-slate-200 text-slate-700 hover:bg-purple-55 hover:text-purple-800 disabled:opacity-40 rounded font-bold cursor-pointer"
                >
                  {act.label}
                </button>
              ))}
            </div>
          )}

          {aiResponseError && <p className="text-[10px] font-medium text-red-650">{aiResponseError}</p>}
        </div>

        {/* Text Reply Draft box */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-md p-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            <CornerUpLeft className="w-4 h-4 text-slate-400" />
            <span>Quick Reply Text</span>
          </div>

          <textarea
            placeholder={`Reply back to ${senderName}...`}
            value={inlineReplyText}
            onChange={(e) => setInlineReplyText(e.target.value)}
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 focus:border-purple-300 focus:bg-white rounded-lg p-3 text-xs text-slate-800 focus:outline-none resize-none shadow-3xs"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <button
                onClick={() => handleSendInlineReply(msg.uid, senderEmail, emailDetail.subject)}
                disabled={inlineReplySending || !inlineReplyText.trim()}
                className={`px-4 py-2 flex items-center gap-1 bg-[#2196f3] text-white disabled:opacity-50 text-xs font-bold rounded-lg cursor-pointer hover:opacity-90 shadow-2xs`}
              >
                {inlineReplySending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Reply</span>
              </button>
              <button
                onClick={() => setInlineReplyText('')}
                className="px-3 py-2 hover:bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Discard
              </button>
            </div>

            <button
              onClick={() => {
                const subj = emailDetail.subject.startsWith('Re:') ? emailDetail.subject : `Re: ${emailDetail.subject}`;
                setComposeTo(senderEmail);
                setComposeSubject(subj);
                setComposeBody(inlineReplyText);
                setComposeOpen(true);
              }}
              className="text-[9px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              <span>Pop-out editor</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="mailbox-workspace" className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-slate-800 dmail-scalable">
      <style>{`
        :root {
          --font-offset: ${fontSizeOffset}px;
        }
        .dmail-scalable .text-\[8px\] { font-size: calc(8px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[8\.5px\] { font-size: calc(8.5px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[9px\] { font-size: calc(9px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[9\.5px\] { font-size: calc(9.5px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[10px\] { font-size: calc(10px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[10\.5px\] { font-size: calc(10.5px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[11px\] { font-size: calc(11px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[11\.5px\] { font-size: calc(11.5px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[12px\] { font-size: calc(12px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[12\.5px\] { font-size: calc(12.5px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[13px\] { font-size: calc(13px + var(--font-offset)) !important; }
        .dmail-scalable .text-\[14px\] { font-size: calc(14px + var(--font-offset)) !important; }
        .dmail-scalable .text-xs { font-size: calc(0.75rem + var(--font-offset)) !important; }
        .dmail-scalable .text-sm { font-size: calc(0.875rem + var(--font-offset)) !important; }
        .dmail-scalable .text-base { font-size: calc(1rem + var(--font-offset)) !important; }
        .dmail-scalable .text-lg { font-size: calc(1.125rem + var(--font-offset)) !important; }
        .dmail-scalable .text-xl { font-size: calc(1.25rem + var(--font-offset)) !important; }
        .dmail-scalable .text-2xl { font-size: calc(1.5rem + var(--font-offset)) !important; }
      `}</style>
      
      {/* Google Inbox Bright Material Blue Header Bar */}
      <header className={`${t.bg} h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 z-20 shadow-md transition-all duration-300`}>
        
        {/* Left corner branding */}
        <div className="flex items-center gap-3">
          {/* Sidebar drawer toggler toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div 
            onClick={() => {
              handleSelectFolder('INBOX');
              setActiveCategory('all');
              setSearchQuery('');
              setSearchInput('');
              setActiveUid(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition-transform"
            title="Return to Unified DMail Inbox Overview"
          >
            <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 select-none">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                {/* A beautiful, premium geometric D + Envelope symbol */}
                <path d="M4 3h7.5c5.25 0 9.5 4.25 9.5 9.5s-4.25 9.5-9.5 9.5H4V3z" />
                {/* The inner fold line forming the letter envelope look */}
                <path d="M4 3l8 7c1.1 0.9 2.9 0.9 4 0l6-5.2" />
                {/* An elegant pulsing AI spark inside */}
                <circle cx="11.5" cy="15" r="1.5" fill="currentColor" className="animate-pulse" />
              </svg>
            </div>
            <span className="font-bold text-lg text-white font-sans tracking-tight">DMail</span>
          </div>
        </div>

        {/* Central Search Bar (Styled identically to image) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-4 sm:mx-8 relative z-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search (e.g. from:boss subject:report is:starred)"
              value={searchInput}
              aria-label="Search items"
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#1976d2]/35 focus:bg-white text-white focus:text-slate-800 placeholder-white/70 rounded-md py-2 px-10 text-sm border-none focus:outline-none transition-all focus:ring-0 shadow-inner"
            />
            <Search className="w-4.5 h-4.5 text-white/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-white/90 hover:text-white font-semibold text-xs cursor-pointer bg-white/20 hover:bg-white/30 rounded-full"
              >
                ×
              </button>
            )}
          </div>

          <AnimatePresence>
            {isSearchFocused && (
              <>
                {/* Overlay backdrop to capture pointer clicks and dismiss */}
                <div 
                  className="fixed inset-0 bg-slate-900/[0.04] z-45" 
                  onClick={() => setIsSearchFocused(false)} 
                />
                
                {/* Autocomplete suggestions panel */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-700 flex flex-col max-h-[500px]"
                >
                  <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
                    {/* 1. Quick Filters chips */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 bg-transparent uppercase tracking-wider block mb-2">
                        Filter Shortcuts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput('from:');
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-705 font-medium rounded-md transition-all cursor-pointer border-none"
                        >
                          from:
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput('subject:');
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-705 font-medium rounded-md transition-all cursor-pointer border-none"
                        >
                          subject:
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion('is:unread')}
                          className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-md transition-all cursor-pointer border-none"
                        >
                          is:unread
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion('is:starred')}
                          className="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-md transition-all cursor-pointer border-none"
                        >
                          is:starred
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion('is:snoozed')}
                          className="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-md transition-all cursor-pointer border-none"
                        >
                          is:snoozed
                        </button>
                      </div>
                    </div>

                    {/* 2. Contacts suggestions */}
                    {computedSuggestions.suggestedContacts.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 bg-transparent uppercase tracking-wider block mb-2">
                          Suggested Contacts
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {computedSuggestions.suggestedContacts.map((contact) => (
                            <button
                              key={contact.address}
                              type="button"
                              onClick={() => handleSelectSuggestion(`from:${contact.address}`)}
                              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer border-none bg-transparent w-full"
                            >
                              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {contact.name.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-semibold text-slate-800 block truncate leading-none mb-0.5">{contact.name}</span>
                                <span className="text-[10px] text-slate-450 block truncate leading-none">{contact.address}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Quick Jumps directly to emails */}
                    {computedSuggestions.quickJumpEmails.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 bg-transparent uppercase tracking-wider block mb-2">
                          Matches in current stream (Quick Jump)
                        </span>
                        <div className="space-y-1">
                          {computedSuggestions.quickJumpEmails.map((msg) => (
                            <button
                              key={msg.uid}
                              type="button"
                              onClick={() => {
                                setActiveUid(msg.uid);
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer border-none bg-transparent w-full gap-3"
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                                <div className="truncate">
                                  <span className="text-xs font-semibold text-slate-800 block truncate leading-tight">{msg.subject || '(No Subject)'}</span>
                                  <span className="text-[11px] text-slate-450 block truncate leading-none mt-0.5 animate-delay-150">
                                    from {msg.from?.[0]?.name || msg.from?.[0]?.address || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 bg-transparent uppercase tracking-wider block">
                            Recent Searches
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.removeItem('drewmail_recent_searches');
                              setRecentSearches([]);
                            }}
                            className="text-[10px] font-bold text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {recentSearches.map((term) => (
                            <div 
                              key={term} 
                              className="flex items-center justify-between group hover:bg-slate-50 rounded-md py-1 px-2 text-xs"
                            >
                              <button
                                type="button"
                                onClick={() => handleSelectSuggestion(term)}
                                className="flex items-center gap-2 text-slate-700 font-medium text-left truncate flex-1 border-none bg-transparent cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{term}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = recentSearches.filter(t => t !== term);
                                  setRecentSearches(updated);
                                  localStorage.setItem('drewmail_recent_searches', JSON.stringify(updated));
                                }}
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-full cursor-pointer ml-2 border-none bg-transparent"
                                title="Remove item"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Suggestions footer */}
                  <div className="bg-slate-50 border-t border-slate-100 py-2 px-4 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0">
                    <span>Press <kbd className="bg-white border rounded px-1 shadow-3xs">Enter</kbd> to execute search</span>
                    <span>Use operators <code className="font-mono bg-white border px-1 rounded text-blue-600">from:</code> or <code className="font-mono bg-white border px-1 rounded text-purple-600">subject:</code></span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </form>

        {/* Right Corner controls (Pin Switch & Avatars) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* Classic Pin/Push pin filter switch */}
          <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full select-none text-white border border-white/10">
            <Star className={`w-4 h-4 ${activePinFilter ? 'fill-amber-405 text-amber-405' : 'text-white/60'}`} />
            <span className="text-[10px] sm:text-xs font-semibold tracking-wide hidden sm:inline">Show Pinned</span>
            <button
              type="button"
              onClick={() => setActivePinFilter(!activePinFilter)}
              className={`w-9 h-5 rounded-full p-0.5 transition-all outline-none border-none cursor-pointer ${
                activePinFilter ? 'bg-amber-401' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                  activePinFilter ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Refresh Folder lists cache */}
          <button
            onClick={() => {
              fetchFolders();
              fetchMessages();
            }}
            title="Refresh mail stream"
            className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>

          {/* User profile identifier */}
          <div
            className="w-10 h-10 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white font-semibold shadow-sm text-sm"
            title={accountSettings.imap.user}
          >
            {getInitials(accountSettings.imap.user.split('@')[0], accountSettings.imap.user)}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 text-white/90 hover:text-red-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Mail client workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left side collapsible folders drawer */}
        <motion.aside
          animate={{ width: sidebarOpen ? 256 : 72 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-white border-r border-slate-200 shrink-0 flex flex-col p-3 overflow-y-auto overflow-x-hidden z-10 select-none shadow-xs h-full relative"
        >
          {sidebarOpen ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Folder Header */}
                <span className="text-[10px] font-bold text-slate-400 bg-transparent uppercase tracking-widest px-2 mb-3 block">
                  Mailboxes
                </span>

                {loadingFolders ? (
                  <div className="space-y-2 py-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-9 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <nav className="space-y-1">
                      {folders.map((folder) => {
                        const isActive = activeFolder === folder.name;
                        return (
                          <button
                            key={folder.name}
                            onClick={() => {
                              handleSelectFolder(folder.name);
                            }}
                            className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 group cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <span className={`transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-450'}`}>
                                {getFolderIcon(folder.role)}
                              </span>
                              <span className="truncate">{folder.label}</span>
                            </div>
                            {folder.unreadCount !== undefined && folder.unreadCount > 0 && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {folder.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </nav>

                    {/* Google Inbox Virtual Smart Folders Section */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 bg-transparent uppercase tracking-widest px-2 mb-2 block">
                        Smart Views
                      </span>
                      <nav className="space-y-1">
                        <button
                          onClick={() => {
                            handleSelectFolder('__SNOOZED__');
                          }}
                          className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                            activeFolder === '__SNOOZED__'
                              ? 'bg-amber-50 text-amber-700 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className="transition-transform duration-150 group-hover:rotate-12">
                              <Clock className="w-4 h-4 text-amber-550 shrink-0" />
                            </span>
                            <span className="truncate">Snoozed Mails</span>
                          </div>
                          {Object.keys(snoozedMails).length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-805 shrink-0">
                              {Object.keys(snoozedMails).length}
                            </span>
                          )}
                        </button>
                      </nav>
                    </div>

                    {/* Linked Accounts Section on Left Sidebar */}
                    <div className="mt-5">
                      <span className="text-[10px] font-bold text-slate-400 bg-transparent uppercase tracking-widest px-2 mb-2 block">
                        Accounts
                      </span>
                      <nav className="space-y-1">
                        {linkedAccounts.map((acc) => {
                          const isActive = acc.imap.user.toLowerCase() === accountSettings.imap.user.toLowerCase();
                          const shortUser = acc.imap.user.split('@')[0];
                          const provider = acc.imap.host.includes('gmail') ? 'Gmail' : 
                                           acc.imap.host.includes('outlook') || acc.imap.host.includes('office365') ? 'Outlook' : 
                                           acc.imap.host.includes('yahoo') ? 'Yahoo' : 'Custom';
                          return (
                            <button
                              key={acc.imap.user}
                              onClick={() => {
                                if (onSwitchAccount) onSwitchAccount(acc);
                              }}
                              className={`w-full text-left flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                                isActive
                                  ? 'bg-purple-50 text-purple-705 font-bold border-l-2 border-purple-500'
                                  : 'text-slate-650 hover:bg-slate-55 hover:text-slate-900 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 select-none ${
                                  isActive ? 'bg-purple-200 text-purple-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {acc.imap.user[0].toUpperCase()}
                                </div>
                                <div className="truncate text-left">
                                  <span className="block truncate leading-tight text-[11px] font-semibold">{shortUser}</span>
                                  <span className="block text-[8px] text-slate-400 font-normal truncate mt-0.5">{acc.imap.user}</span>
                                </div>
                              </div>
                              <span className="text-[8px] bg-slate-100 text-slate-450 px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0">
                                {provider}
                              </span>
                            </button>
                          );
                        })}
                      </nav>
                    </div>

                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-150 space-y-3 shrink-0">
                {/* Unified Inbox Mode Selection Panel */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-3xs select-none p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-1.5 leading-none">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-100 animate-pulse" />
                      Unified Inbox
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${isUnified ? 'bg-emerald-500 shadow-sm animate-pulse' : 'bg-slate-350'}`} />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                    Aggregate all linked IMAP streams into a single chronologically sorted dashboard.
                  </p>
                  <button
                    onClick={toggleUnified}
                    className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all border outline-none select-none ${
                      isUnified
                        ? `${t.bg} border-transparent text-white shadow-2xs`
                        : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {isUnified ? 'Disable Unified View' : 'Join All Mailboxes'}
                  </button>
                </div>

                {/* Keyboard shortcuts trigger button */}
                <button
                  onClick={() => setShowShortcutsHelper(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-550 hover:text-slate-800 hover:bg-slate-50/75 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <Keyboard className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Keyboard Shortcuts (?)</span>
                </button>

                {/* Settings Gear trigger button */}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-555 hover:text-slate-850 hover:bg-slate-50/80 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Mailbox Settings</span>
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed/Slim Icons Side Panel Layout */
            <div className="flex-1 flex flex-col justify-between items-center py-2 h-full">
              <div className="w-full space-y-4">
                <div className="h-4" /> {/* spacer */}

                {loadingFolders ? (
                  <div className="space-y-4 flex flex-col items-center">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-9 h-9 bg-slate-100 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {folders.map((folder) => {
                      const isActive = activeFolder === folder.name;
                      const count = folder.unreadCount || 0;
                      return (
                        <button
                          key={folder.name}
                          onClick={() => {
                            handleSelectFolder(folder.name);
                          }}
                          className={`relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150 group cursor-pointer mx-auto border-none bg-transparent ${
                            isActive
                              ? 'bg-blue-50 text-blue-600 font-bold'
                              : 'text-slate-505 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          title={folder.label}
                        >
                          <div className="relative flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                            {getFolderIcon(folder.role)}
                            {count > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-0.5 bg-blue-550 text-[7px] text-white font-extrabold rounded-full flex items-center justify-center border border-white">
                                {count > 99 ? '99' : count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    <div className="w-8 border-t border-slate-100 my-2 mx-auto" />

                    {/* Clock Snooze icon */}
                    <button
                      onClick={() => {
                        handleSelectFolder('__SNOOZED__');
                      }}
                      className={`relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150 group cursor-pointer mx-auto border-none bg-transparent ${
                        activeFolder === '__SNOOZED__'
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-slate-505 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title="Snoozed Mails"
                    >
                      <div className="relative flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                        <Clock className="w-4.5 h-4.5 text-amber-550 shrink-0" />
                        {Object.keys(snoozedMails).length > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border border-white animate-pulse" />
                        )}
                      </div>
                    </button>

                    <div className="w-8 border-t border-slate-100 my-2 mx-auto" />

                    {/* Collapsed Sidebar Accounts Icons */}
                    <div className="flex flex-col gap-2.5 w-full">
                      {linkedAccounts.map((acc) => {
                        const isActive = acc.imap.user.toLowerCase() === accountSettings.imap.user.toLowerCase();
                        return (
                          <button
                            key={acc.imap.user}
                            onClick={() => {
                              if (onSwitchAccount) onSwitchAccount(acc);
                            }}
                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 group cursor-pointer mx-auto border shadow-3xs select-none ${
                              isActive
                                ? 'bg-purple-100 border-purple-400 text-purple-700 font-extrabold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                            title={`Switch to ${acc.imap.user}`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-tight">{acc.imap.user[0]}</span>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>

              {/* Bottom collapsed toggles */}
              <div className="space-y-3.5 w-full pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShortcutsHelper(true)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-450 hover:bg-slate-55 hover:text-slate-800 transition-colors cursor-pointer mx-auto border-none bg-transparent"
                  title="Keyboard Shortcuts (?)"
                >
                  <Keyboard className="w-5 h-5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-455 hover:bg-slate-55 hover:text-slate-850 transition-colors cursor-pointer mx-auto border-none bg-transparent"
                  title="Mailbox Settings"
                >
                  <Settings className="w-5 h-5 shrink-0" />
                </button>

                <div 
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-500 cursor-help font-semibold font-mono mx-auto hover:bg-slate-200 transition-colors"
                  title={`Host: ${accountSettings.imap.host}\nUser: ${accountSettings.imap.user}`}
                >
                  {getInitials(accountSettings.imap.user.split('@')[0], '').slice(0, 2)}
                </div>
              </div>
            </div>
          )}
        </motion.aside>

        {/* Master Email stream content (FULL WIDTH like Google Inbox) */}
        <section className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 bg-slate-100/50 flex flex-col items-center">
          
          {/* Inner container to ensure perfect fluid design on wide screens */}
          <div className="w-full max-w-[1500px] flex flex-col gap-6">
            
            {/* Folder / Pagination indicators */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-semibold text-slate-500 capitalize tracking-wide select-none">
                  {activeFolder.split('/').pop() || activeFolder}
                </span>
                {totalMessages > 0 && (
                  <span className="text-[11px] text-slate-400 font-mono select-none">
                    ({Math.min(totalMessages, paginationSkip + 1)}-{Math.min(totalMessages, paginationSkip + limit)} of {totalMessages})
                  </span>
                )}

                {/* Permanent Empty-Trash trigger button */}
                {(folders.find(f => f.name === activeFolder)?.role === 'trash' || 
                  activeFolder.toLowerCase().includes('trash') || 
                  activeFolder.toLowerCase() === 'trash'
                ) && (
                  <button
                    onClick={handleEmptyTrash}
                    disabled={emptyingTrash || totalMessages === 0}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold text-red-650 hover:text-red-750 hover:bg-red-50 disabled:text-slate-400 disabled:bg-transparent rounded-lg cursor-pointer transition-all border border-red-200/50 hover:border-red-300 disabled:border-transparent select-none shrink-0"
                    title="Permanently empty all emails in this folder"
                  >
                    {emptyingTrash ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                        <span>Emptying...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Empty Trash</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Advanced Sort, Filter, and Pagination tools */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                
                {/* Dynamic List Filtering Pills */}
                <div className="flex items-center bg-slate-200/50 p-0.5 rounded-lg border border-slate-200/60 select-none">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: 'Unread' },
                    { id: 'starred', label: 'Starred' },
                    { id: 'attachments', label: 'Attachments' },
                    { id: 'snoozed', label: 'Snoozed' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-2 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer border-none ${
                        activeFilter === f.id
                          ? 'bg-white text-slate-800 shadow-3xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800 bg-transparent'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Custom Styled Sorting Selector Dropdown */}
                <div className="relative select-none">
                  <select
                    value={activeSort}
                    onChange={(e) => setActiveSort(e.target.value)}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[10px] font-bold rounded-lg py-1 px-2 pb-1.5 outline-none font-sans cursor-pointer shadow-3xs"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="subject">Subject (A-Z)</option>
                    <option value="sender">Sender (A-Z)</option>
                    <option value="size-desc">Largest Size</option>
                  </select>
                </div>

                {/* Compact Pagination Toggle Buttons */}
                <div className="flex items-center gap-0.5 border-l border-slate-200 pl-2 select-none">
                  <button
                    disabled={paginationSkip === 0}
                    onClick={() => {
                      setPaginationSkip(prev => Math.max(0, prev - limit));
                      setActiveUid(null);
                    }}
                    className="p-1 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-35 cursor-pointer block"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={paginationSkip + limit >= totalMessages}
                    onClick={() => {
                      setPaginationSkip(prev => prev + limit);
                      setActiveUid(null);
                    }}
                    className="p-1 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-35 cursor-pointer block"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* AI Search Intelligent Summary Panel (Displayed ONLY when searching) */}
            {searchQuery && (loadingSearchAiSummary || searchAiSummary) && (
              <div
                className="bg-gradient-to-br from-indigo-50/75 via-purple-50/60 to-blue-50/70 border border-purple-200 rounded-2xl p-4.5 shadow-3xs relative overflow-hidden"
              >
                {/* Ambient graphic glow backdrops */}
                <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-100/10 via-transparent to-transparent pointer-events-none select-none" />

                <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-100/40 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-purple-105 rounded-lg text-purple-600 shadow-3xs">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-100 animate-pulse" />
                    </div>
                    <span className="text-[11px] font-extrabold text-purple-700 tracking-wider uppercase font-sans">
                      DMail Search Intelligence
                    </span>
                  </div>
                  {/* Dismiss summary */}
                  <button
                    onClick={() => setSearchAiSummary(null)}
                    className="p-1 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
                    title="Dismiss Briefing"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative z-10">
                  {loadingSearchAiSummary ? (
                    <div className="space-y-2.5 py-1">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                        <span className="text-[11px] text-purple-600 font-bold">Scanning message list using Gemini AI...</span>
                      </div>
                      <div className="space-y-1.5 animate-pulse">
                        <div className="h-2.5 bg-purple-100/60 rounded-full w-full" />
                        <div className="h-2.5 bg-purple-100/60 rounded-full w-11/12" />
                        <div className="h-2.5 bg-purple-100/60 rounded-full w-4/5" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-700 font-sans leading-relaxed space-y-1 my-1">
                      {renderSimpleSummaryMarkdown(searchAiSummary || '')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sync Error Indicator */}
            {operationError && (
              <div className="bg-red-50 text-red-900 px-4 py-3 rounded-lg flex gap-2 border border-red-150 text-xs items-center shadow-xs">
                <AlertCircle className="w-4.5 h-4.5 text-red-650 shrink-0" />
                <p className="flex-1 font-medium select-text">{operationError}</p>
                <button onClick={() => setOperationError(null)} className="font-bold hover:text-red-700 px-1 text-slate-400">×</button>
              </div>
            )}

            {/* Gmail-Style Inbox Category Tabs */}
            {activeFolder.toUpperCase() === 'INBOX' && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs flex select-none overflow-x-auto min-w-0 transition-all duration-150">
                {[
                  { id: 'all', label: 'All', icon: <Inbox className="w-4 h-4" />, color: 'border-b-blue-600 text-blue-600' },
                  { id: 'primary', label: 'Primary', icon: <Mail className="w-4 h-4" />, color: 'border-b-emerald-650 text-emerald-650' },
                  { id: 'social', label: 'Social', icon: <Users className="w-4 h-4" />, color: 'border-b-sky-500 text-sky-500' },
                  { id: 'promotions', label: 'Promotions', icon: <Tag className="w-4 h-4" />, color: 'border-b-amber-500 text-amber-500' },
                  { id: 'updates', label: 'Updates', icon: <Info className="w-4 h-4" />, color: 'border-b-purple-500 text-purple-500' }
                ].map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id as any);
                        setPaginationSkip(0);
                      }}
                      className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-4 border-b-[3px] text-xs font-bold transition-all hover:bg-slate-50 cursor-pointer ${
                        isActive
                          ? `${cat.color} bg-slate-50/40 font-extrabold`
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <div className={`transition-transform duration-150 ${isActive ? 'scale-110 text-current' : 'text-slate-400'}`}>
                        {cat.icon}
                      </div>
                      <span className="tracking-wide">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Email Stream Lists (Grouped By Date) */}
            {loadingMessages ? (
              <div className="bg-white rounded-lg border border-slate-200/80 divide-y divide-slate-100 p-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-350 shadow-sm border border-slate-200 mb-4 ring-8 ring-slate-100">
                  <Inbox className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm">No emails in this section</h3>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm px-4 leading-relaxed">
                  This folder is empty, or there are no matched items filtering.
                </p>
              </div>
            ) : (
              groupedMessageBlocks.map((group) => (
                <div key={group.title} className="flex flex-col">
                  
                  {/* Date section header bar & Sweep check button */}
                  <div className="flex items-center justify-between px-3 py-2 select-none group/hdr">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest tracking-wide">
                      {group.title}
                    </span>
                    <button
                      onClick={(e) => {
                        const flatEmails: EmailHeader[] = [];
                        group.items.forEach(item => {
                          if ('isBundle' in item) {
                            flatEmails.push(...item.items);
                          } else if ('isThread' in item) {
                            flatEmails.push(...item.items);
                          } else {
                            flatEmails.push(item);
                          }
                        });
                        handleSweepGroup(flatEmails, e);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600 bg-slate-200/50 hover:bg-emerald-50 rounded-full transition-all cursor-pointer opacity-85 hover:opacity-100"
                      title="Sweep: Mark all in this section as read"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Sweep all</span>
                    </button>
                  </div>

                  {/* Date Section Rows container Block */}
                  <div className="bg-white rounded-lg border border-slate-200/80 divide-y divide-slate-100 shadow-sm overflow-hidden mb-6">
                    {group.items.map((msg) => {
                      if ('isBundle' in msg) {
                        const isBundleExpanded = expandedBundleId === msg.id;
                        return (
                          <div key={msg.id} className="transition-all duration-200 flex flex-col bg-blue-50/10 border-l-4 border-blue-400">
                            {/* Trip Bundle Row */}
                            <div
                              onClick={() => setExpandedBundleId(isBundleExpanded ? null : msg.id)}
                              className={`flex items-center gap-4 p-4 py-3.5 hover:bg-blue-50/20 cursor-pointer transition-all relative ${
                                isBundleExpanded ? 'bg-blue-50/25 border-b border-slate-100 shadow-3xs' : 'bg-white'
                              }`}
                            >
                              {!msg.seen && (
                                <div className="absolute left-1 w-1.5 h-1.5 bg-[#2196f3] rounded-full" />
                              )}

                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shrink-0 select-none shadow-xs">
                                <Plane className="w-5 h-5 text-white" />
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4 justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                                    {msg.title}
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                      {msg.items.length} {msg.items.length === 1 ? 'item' : 'items'}
                                    </span>
                                  </span>
                                  <span className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                                    Merged travel details, bookings, and confirmations
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 bg-gradient-to-l from-white pl-4 shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleSweepGroup(msg.items, e);
                                  }}
                                  className="p-1 hover:bg-emerald-50 rounded text-slate-300 hover:text-emerald-700 cursor-pointer transition-colors"
                                  title="Bulk Archive (Mark all Done)"
                                >
                                  <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                                </button>

                                <div className="w-16 text-right select-none text-[11px] font-medium text-slate-400">
                                  {formatMailDate(msg.latestDate)}
                                </div>
                              </div>
                            </div>

                            {/* Nested children emails */}
                            {isBundleExpanded && (
                              <div className="pl-6 sm:pl-10 divide-y divide-slate-100/60 bg-slate-50/10 border-b border-slate-150">
                                {msg.items.map((subMsg) => {
                                  const isExpanded = activeUid === subMsg.uid;
                                  const senderName = subMsg.from?.[0]?.name || subMsg.from?.[0]?.address?.split('@')[0] || 'Unknown';
                                  const senderEmail = subMsg.from?.[0]?.address || '';
                                  const colorHex = getSenderColor(senderName);

                                  return (
                                    <div key={subMsg.uid} className="transition-all duration-200 flex flex-col">
                                      {/* Sub-Email Row */}
                                      <div
                                        onClick={() => fetchEmailDetailInline(subMsg.uid, subMsg.accountUser)}
                                        className={`flex items-center gap-4 p-4 py-3 hover:shadow-2xs cursor-pointer transition-all border-l-2 hover:bg-slate-50/50 relative ${
                                          isExpanded ? 'bg-slate-50 border-blue-400 font-normal' : 'bg-transparent border-transparent'
                                        } ${!subMsg.seen ? 'font-bold' : 'font-normal'}`}
                                      >
                                        {!subMsg.seen && (
                                          <div className="absolute left-1 w-1.2 h-1.2 bg-[#2196f3] rounded-full" />
                                        )}

                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${colorHex} flex items-center justify-center text-white font-semibold text-[10px] shrink-0 select-none shadow-3xs`}>
                                          {getInitials(senderName, senderEmail)}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-3 justify-between">
                                          <div className="md:w-36 shrink-0">
                                            <span className={`text-xs block truncate ${!subMsg.seen ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                              {senderName}
                                            </span>
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs truncate flex items-center gap-2">
                                              <span className={!subMsg.seen ? 'text-slate-900 font-bold' : 'text-slate-705'}>
                                                {subMsg.subject || '(No Subject)'}
                                              </span>
                                              {subMsg.snippet && (
                                                <span className="text-slate-400 font-normal">
                                                  — {subMsg.snippet}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 pl-4 shrink-0 transition-all" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={(e) => handleToggleFlag(subMsg.uid, subMsg.flagged ? 'unstar' : 'star', e)}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-amber-500 cursor-pointer transition-colors"
                                            title={subMsg.flagged ? 'Pinned' : 'Pin to inbox'}
                                          >
                                            <Star className={`w-3.5 h-3.5 ${subMsg.flagged ? 'fill-amber-400 text-amber-500' : ''}`} />
                                          </button>

                                          <button
                                            onClick={(e) => handleArchiveEmail(subMsg.uid, e)}
                                            className="p-1 hover:bg-emerald-50 rounded text-slate-300 hover:text-emerald-600 cursor-pointer transition-colors"
                                            title="Mark Done (Archive)"
                                          >
                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                          </button>

                                          <button
                                            onClick={(e) => handleDeleteEmail(subMsg.uid, e)}
                                            className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                                            title="Move to Trash"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>

                                          <span className="text-[10px] text-slate-400 min-w-12 text-right">
                                            {formatMailDate(subMsg.date)}
                                          </span>
                                        </div>
                                      </div>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden bg-slate-50 border-t border-b border-slate-200"
                                          >
                                            {loadingDetail ? (
                                              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                                <span className="text-xs font-semibold tracking-wider">Parsing MIME payload...</span>
                                              </div>
                                            ) : getEmailDetail(subMsg.uid, subMsg.accountUser) ? (
                                              renderExpandedEmailFullSheet(subMsg)
                                            ) : null}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      if ('isThread' in msg) {
                        const isThreadExpanded = expandedThreadId === msg.id;
                        const latestItem = msg.items[msg.items.length - 1];
                        const latestSenderName = latestItem.from?.[0]?.name || latestItem.from?.[0]?.address?.split('@')[0] || 'Unknown';
                        const latestColorHex = getSenderColor(latestSenderName);
                        const isCompact = density === 'compact';

                        return (
                          <div key={msg.id} className="transition-all duration-200 flex flex-col bg-white">
                            {/* Conversation Thread Header Row */}
                            <div
                              onClick={async () => {
                                if (isThreadExpanded) {
                                  setExpandedThreadId(null);
                                  setActiveUid(null);
                                } else {
                                  setExpandedThreadId(msg.id);
                                  const newestItem = msg.items[msg.items.length - 1];
                                  if (newestItem) {
                                    await fetchEmailDetailInline(newestItem.uid, newestItem.accountUser);
                                  }
                                }
                              }}
                              className={`flex items-center hover:bg-slate-50/50 cursor-pointer transition-all border-l-4 relative ${
                                isThreadExpanded ? 'bg-slate-50 border-slate-400 shadow-3xs' : 'bg-transparent border-transparent'
                              } ${!msg.seen ? 'font-bold' : 'font-normal'} ${
                                isCompact ? 'gap-2.5 p-2 py-1.5' : 'gap-4 p-4 py-3.5'
                              }`}
                            >
                              {!msg.seen && (
                                <div className="absolute left-1 w-1.5 h-1.5 bg-[#2196f3] rounded-full" />
                              )}

                              {/* Overlapping duel-stack visual effect for threaded avatar with precise Tailwind values */}
                              {msg.items.length > 1 ? (
                                <div className={`relative shrink-0 select-none ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}>
                                  {/* First/Previous Sender Avatar */}
                                  <div className={`absolute top-0 right-0 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-500 font-extrabold shadow-3xs ${
                                    isCompact ? 'w-5 h-5 text-[7px]' : 'w-6.5 h-6.5 text-[8.5px]'
                                  }`}>
                                    {getInitials(msg.items[0].from?.[0]?.name || 'Replies', '')}
                                  </div>
                                  {/* Latest Sender Avatar */}
                                  <div className={`absolute bottom-0 left-0 rounded-full bg-gradient-to-tr ${latestColorHex} border border-white flex items-center justify-center text-white font-extrabold shadow-sm ${
                                    isCompact ? 'w-6 h-6 text-[8px]' : 'w-7.5 h-7.5 text-[10px]'
                                  }`}>
                                    {getInitials(latestSenderName, '')}
                                  </div>
                                </div>
                              ) : (
                                <div className={`rounded-full bg-gradient-to-tr ${latestColorHex} flex items-center justify-center text-white font-semibold shrink-0 select-none shadow-xs ${
                                  isCompact ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-xs'
                                }`}>
                                  {getInitials(latestSenderName, '')}
                                </div>
                              )}

                              {/* Col-Grid perfectly aligned with standard Inbox row style */}
                              <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4 justify-between">
                                {/* Sender list and messages counter */}
                                <div className="md:w-44 shrink-0 flex items-center gap-1.5">
                                  <span className={`text-[13px] truncate ${!msg.seen ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                                    {msg.fromSummary}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded-full font-extrabold shrink-0">
                                    {msg.items.length}
                                  </span>
                                </div>

                                {/* Subject and snippet text */}
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="text-[13px] truncate flex items-center gap-2">
                                    <span className={!msg.seen ? 'text-slate-900 font-bold' : 'text-slate-800'}>
                                      {msg.subject || '(No Subject)'}
                                    </span>
                                    {latestItem?.snippet && (
                                      <span className="text-slate-400 font-normal separator">
                                        — {latestItem.snippet}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Actions alignment bar */}
                              <div className="flex items-center gap-2 bg-gradient-to-l from-white pl-4 shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
                                {/* Snoozing indicator badge */}
                                {msg.items.some(it => it.uid in snoozedMails) && (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-150 px-1.5 py-0.5 rounded-full font-bold select-none shrink-0" title="Thread has snoozed messages">
                                    <Clock className="w-3 h-3 text-amber-500 stroke-[2.5]" />
                                    <span className="hidden sm:inline">Snoozed</span>
                                  </span>
                                )}

                                {/* Pinned / Star alignment */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const targetState = msg.flagged ? 'unstar' : 'star';
                                    for (const item of msg.items) {
                                      await handleToggleFlag(item.uid, targetState, e);
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-amber-500 cursor-pointer transition-colors"
                                  title={msg.flagged ? 'Pinned' : 'Pin thread to inbox'}
                                >
                                  <Star className={`w-4 h-4 ${msg.flagged ? 'fill-amber-400 text-amber-500' : ''}`} />
                                </button>

                                {/* Snooze Entire Thread Popover */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSnoozePopoverUid(activeSnoozePopoverUid === msg.id as any ? null : msg.id as any);
                                    }}
                                    className={`p-1 hover:bg-amber-50 rounded cursor-pointer transition-colors ${
                                      msg.items.some(it => it.uid in snoozedMails) ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                                    }`}
                                    title="Snooze thread"
                                  >
                                    <Clock className="w-4 h-4" />
                                  </button>
                                  
                                  <AnimatePresence>
                                    {activeSnoozePopoverUid === msg.id as any && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 divide-y divide-slate-100 overflow-hidden font-sans font-medium text-xs text-slate-700"
                                      >
                                        <div className="bg-slate-50 px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">
                                          Snooze thread...
                                        </div>
                                        {[
                                          { label: 'Later Today (6:00 PM)', val: 'Today 6PM' },
                                          { label: 'Tomorrow morning (8:00 AM)', val: 'Tomorrow 8AM' },
                                          { label: 'Next week (Monday 8:00 AM)', val: 'Next week' },
                                          { label: 'Someday (Undecided)', val: 'Someday' },
                                        ].map((option, opIdx) => (
                                          <button
                                            key={opIdx}
                                            type="button"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              for (const item of msg.items) {
                                                await handleSnoozeEmail(item.uid, option.val, item.subject, e);
                                              }
                                              setActiveSnoozePopoverUid(null);
                                            }}
                                            className="w-full text-left px-3 py-2 cursor-pointer transition-colors text-slate-705 font-medium hover:bg-slate-50 hover:text-slate-900 border-none bg-transparent"
                                          >
                                            {option.label}
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                {/* Sweep/Archive the whole thread */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleSweepGroup(msg.items, e);
                                  }}
                                  className="p-1 hover:bg-emerald-50 rounded text-slate-300 hover:text-emerald-700 cursor-pointer transition-colors"
                                  title="Mark Done (Archive entire thread)"
                                >
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                </button>

                                {/* Move entire thread to Trash */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm(`Move all ${msg.items.length} emails in this thread to Trash?`)) {
                                      for (const item of msg.items) {
                                        await handleDeleteEmail(item.uid, e);
                                      }
                                    }
                                  }}
                                  className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                                  title="Move thread to Trash"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <div className="w-16 text-right select-none text-[11px] font-medium text-slate-400">
                                  {formatMailDate(msg.latestDate)}
                                </div>
                              </div>
                            </div>

                            {/* Nested emails chronological stream using perfect inbox sub-row styling */}
                            {isThreadExpanded && (
                              <div className="pl-6 sm:pl-10 divide-y divide-slate-100/60 bg-slate-50/15 border-b border-slate-150">
                                {msg.items.map((subMsg) => {
                                  const isExpanded = activeUid === subMsg.uid;
                                  const senderName = subMsg.from?.[0]?.name || subMsg.from?.[0]?.address?.split('@')[0] || 'Unknown';
                                  const senderEmail = subMsg.from?.[0]?.address || '';
                                  const colorHex = getSenderColor(senderName);

                                  const isCompact = density === 'compact';
                                  return (
                                    <div key={subMsg.uid} className="transition-all duration-200 flex flex-col">
                                      {/* Sub-Email Row Header */}
                                      <div
                                        onClick={() => fetchEmailDetailInline(subMsg.uid, subMsg.accountUser)}
                                        className={`flex items-center hover:bg-slate-50/50 cursor-pointer transition-all border-l-2 relative ${
                                          isExpanded ? 'bg-slate-50 border-blue-500 font-normal' : 'bg-transparent border-transparent'
                                        } ${!subMsg.seen ? 'font-bold' : 'font-normal'} ${
                                          isCompact ? 'gap-2.5 p-2 py-1' : 'gap-4 p-4 py-3'
                                        }`}
                                      >
                                        {!subMsg.seen && (
                                          <div className="absolute left-1 w-1.2 h-1.2 bg-[#2196f3] rounded-full" />
                                        )}

                                        <div className={`rounded-full bg-gradient-to-tr ${colorHex} flex items-center justify-center text-white font-semibold shrink-0 select-none shadow-3xs ${
                                          isCompact ? 'w-6.5 h-6.5 text-[8.5px]' : 'w-8 h-8 text-[10px]'
                                        }`}>
                                          {getInitials(senderName, senderEmail)}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-3 justify-between text-left">
                                          <div className="md:w-36 shrink-0 font-medium text-[12.5px] text-slate-650">
                                            <span>{senderName}</span>
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs truncate flex items-center gap-2">
                                              <span className={!subMsg.seen ? 'text-slate-900 font-bold' : 'text-slate-705'}>
                                                {subMsg.subject || '(No Subject)'}
                                              </span>
                                              {subMsg.snippet && (
                                                <span className="text-slate-450 font-normal">
                                                  — {subMsg.snippet}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 pl-4 shrink-0 transition-all" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={(e) => handleToggleFlag(subMsg.uid, subMsg.flagged ? 'unstar' : 'star', e)}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-amber-500 cursor-pointer transition-colors"
                                            title={subMsg.flagged ? 'Pinned' : 'Pin to inbox'}
                                          >
                                            <Star className={`w-3.5 h-3.5 ${subMsg.flagged ? 'fill-amber-400 text-amber-500' : ''}`} />
                                          </button>

                                          <button
                                            onClick={(e) => handleArchiveEmail(subMsg.uid, e)}
                                            className="p-1 hover:bg-emerald-50 rounded text-slate-300 hover:text-emerald-600 cursor-pointer transition-colors"
                                            title="Mark Done (Archive)"
                                          >
                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                          </button>

                                          <button
                                            onClick={(e) => handleDeleteEmail(subMsg.uid, e)}
                                            className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                                            title="Move to Trash"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>

                                          <span className="text-[10px] text-slate-400 min-w-12 text-right font-medium">
                                            {formatMailDate(subMsg.date)}
                                          </span>
                                        </div>
                                      </div>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden bg-slate-50 border-t border-b border-slate-205"
                                          >
                                            {loadingDetail ? (
                                              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                                <span className="text-xs font-semibold tracking-wider">Parsing MIME payload...</span>
                                              </div>
                                            ) : getEmailDetail(subMsg.uid, subMsg.accountUser) ? (
                                              renderExpandedEmailFullSheet(subMsg)
                                            ) : null}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const isExpanded = activeUid === msg.uid;
                      const senderName = msg.from?.[0]?.name || msg.from?.[0]?.address?.split('@')[0] || 'Unknown';
                      const senderEmail = msg.from?.[0]?.address || '';
                      const colorHex = getSenderColor(senderName);

                      const isCompact = density === 'compact';
                      return (
                        <div key={msg.uid} className="transition-all duration-200 flex flex-col">
                          
                          {/* Email Collapsed bar item Row */}
                          <div
                            onClick={() => fetchEmailDetailInline(msg.uid, msg.accountUser)}
                            className={`flex items-center hover:shadow-md cursor-pointer transition-all border-l-4 hover:bg-slate-50/60 relative ${
                              isExpanded ? 'bg-slate-50 border-blue-500 shadow-xs' : 'bg-white border-transparent'
                            } ${!msg.seen ? 'font-bold' : 'font-normal'} ${
                              isCompact ? 'gap-2.5 p-2 py-1.5' : 'gap-4 p-4 py-3.5'
                            }`}
                          >
                            {/* Unseen blue dot indicator */}
                            {!msg.seen && (
                              <div className="absolute left-1 w-1.5 h-1.5 bg-[#2196f3] rounded-full" />
                            )}

                            {/* Sender avatar layout */}
                            <div className={`rounded-full bg-gradient-to-tr ${colorHex} flex items-center justify-center text-white font-semibold shrink-0 select-none shadow-xs ${
                              isCompact ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-xs'
                            }`}>
                              {getInitials(senderName, senderEmail)}
                            </div>

                            {/* Inline core details (Sender, Subject & Snippet, Attachments) */}
                            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4 justify-between">
                              
                              {/* Sender Column */}
                              <div className="md:w-44 shrink-0">
                                <span className={`text-[13px] block truncate ${!msg.seen ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                                  {senderName}
                                </span>
                              </div>

                              {/* Subject + Snippet Column */}
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] truncate flex items-center gap-2">
                                  <span className={!msg.seen ? 'text-slate-900 font-bold' : 'text-slate-800'}>
                                    {msg.subject || '(No Subject)'}
                                  </span>
                                  {msg.snippet && (
                                    <span className="text-slate-400 font-normal separator">
                                      — {msg.snippet}
                                    </span>
                                  )}
                                </div>

                                {/* Inline Attachment badges under the item when collapsed */}
                                {msg.attachments && msg.attachments.length > 0 && !isExpanded && (
                                  <div className="flex flex-wrap gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                                    {msg.attachments.slice(0, 3).map((att) => (
                                      renderAttachmentThumbnail(msg.uid, att)
                                    ))}
                                    {msg.attachments.length > 3 && (
                                      <span className="text-[9px] text-slate-400 font-bold pt-0.5">
                                        +{msg.attachments.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                            </div>

                            {/* Right controls column: star, archive, delete, date */}
                            <div className="flex items-center gap-2 bg-gradient-to-l from-white pl-4 shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
                              {/* Snoozing indicator badge */}
                              {msg.uid in snoozedMails && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-150 px-1.5 py-0.5 rounded-full font-bold select-none shrink-0" title={`Snoozed until: ${snoozedMails[msg.uid]?.until}`}>
                                  <Clock className="w-3 h-3 text-amber-500 stroke-[2.5]" />
                                  <span className="hidden sm:inline">{snoozedMails[msg.uid]?.until}</span>
                                </span>
                              )}

                              {/* Pin / Star Toggle element */}
                              <button
                                onClick={(e) => handleToggleFlag(msg.uid, msg.flagged ? 'unstar' : 'star', e)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-amber-500 cursor-pointer transition-colors"
                                title={msg.flagged ? 'Pinned' : 'Pin to inbox'}
                              >
                                <Star className={`w-4 h-4 ${msg.flagged ? 'fill-amber-400 text-amber-500' : ''}`} />
                              </button>

                              {/* Snooze (Clock) Action Button & Dropdown popover */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSnoozePopoverUid(activeSnoozePopoverUid === msg.uid ? null : msg.uid);
                                  }}
                                  className={`p-1 hover:bg-amber-50 rounded cursor-pointer transition-colors ${
                                    msg.uid in snoozedMails ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                                  }`}
                                  title="Snooze this email thread"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                                
                                <AnimatePresence>
                                  {activeSnoozePopoverUid === msg.uid && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 divide-y divide-slate-100 overflow-hidden font-sans font-medium text-xs text-slate-700"
                                    >
                                      <div className="bg-slate-50 px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">
                                        Snooze until...
                                      </div>
                                      {[
                                        { label: 'Later Today (6:00 PM)', val: 'Today 6PM' },
                                        { label: 'Tomorrow morning (8:00 AM)', val: 'Tomorrow 8AM' },
                                        { label: 'Next week (Monday 8:00 AM)', val: 'Next week' },
                                        { label: 'Someday (Undecided)', val: 'Someday' },
                                      ].map((option, opIdx) => (
                                        <button
                                          key={opIdx}
                                          type="button"
                                          onClick={(e) => {
                                            handleSnoozeEmail(msg.uid, option.val, msg.subject, e);
                                            setActiveSnoozePopoverUid(null);
                                          }}
                                          className="w-full text-left px-3 py-2 hover:bg-amber-50 text-slate-700 hover:text-amber-805 transition-colors cursor-pointer"
                                        >
                                          {option.label}
                                        </button>
                                      ))}
                                      {msg.uid in snoozedMails && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            handleUnsnoozeEmail(msg.uid, e);
                                            setActiveSnoozePopoverUid(null);
                                          }}
                                          className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 transition-colors font-bold cursor-pointer"
                                        >
                                          Cancel Snooze (Un-snooze)
                                        </button>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Done checked checkbox button */}
                              <button
                                onClick={(e) => handleArchiveEmail(msg.uid, e)}
                                className="p-1 hover:bg-emerald-50 rounded text-slate-300 hover:text-emerald-600 cursor-pointer transition-colors"
                                title="Mark Done (Archive)"
                              >
                                <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                              </button>

                              {/* Hard Delete Trash */}
                              <button
                                onClick={(e) => handleDeleteEmail(msg.uid, e)}
                                className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                                title="Move to Trash"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Date Text representation */}
                              <div className="w-16 text-right select-none text-[11px] font-medium text-slate-400">
                                {formatMailDate(msg.date)}
                              </div>
                            </div>

                          </div>

                          {/* Email Inline Expansion Area (ACT EXACTLY LIKE GOOGLE INBOX) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden bg-slate-50 border-t border-b border-slate-200"
                              >
                                {loadingDetail ? (
                                  <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                    <span className="text-xs font-semibold tracking-wider">Parsing MIME payload...</span>
                                  </div>
                                ) : getEmailDetail(msg.uid, msg.accountUser) ? (
                                  (() => {
                                    const emailDetail = getEmailDetail(msg.uid, msg.accountUser)!;
                                    return (
                                      <div className="p-6 sm:p-8 space-y-6 max-w-[1500px] mx-auto">
                                        
                                        {/* Large sheet email details */}
                                        <div className="bg-white border border-slate-200 rounded-xl shadow-md p-6 sm:p-8 space-y-6">
                                          
                                          {/* Big Subject header inside card */}
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                                            <div>
                                              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                                                {emailDetail.subject || '(No Subject)'}
                                              </h2>
                                              <div className="flex items-center gap-2 mt-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold text-xs">
                                                  {getInitials(emailDetail.from?.[0]?.name, emailDetail.from?.[0]?.address)}
                                                </div>
                                                <span className="text-xs font-semibold text-slate-700">
                                                  {emailDetail.from?.[0]?.name || emailDetail.from?.[0]?.address}
                                                  {emailDetail.from?.[0]?.address && (
                                                    <span className="text-slate-400 font-normal font-mono text-[10px] ml-1 select-text">
                                                      &lt;{emailDetail.from[0].address}&gt;
                                                    </span>
                                                  )}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Top quick flags within sheet */}
                                            <div className="flex items-center gap-3">
                                              
                                              {/* Magic Gemini Assist summary button */}
                                              <button
                                                onClick={(e) => handleGenerateAiSummary(msg.uid, e)}
                                                disabled={aiGenerating}
                                                className="px-3.5 py-1.5 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 disabled:opacity-50 text-xs font-bold rounded-lg border border-blue-200 cursor-pointer shadow-sm shadow-blue-500/5 hover:-translate-y-0.5 transition-all text-center"
                                              >
                                                <Sparkles className="w-4 h-4 text-blue-600 fill-blue-100 animate-pulse" />
                                                <span>AI Summary</span>
                                              </button>

                                              <button
                                                onClick={() => handleToggleFlag(msg.uid, emailDetail.seen ? 'unseen' : 'seen')}
                                                className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                                title={emailDetail.seen ? 'Mark as Unread' : 'Mark as Read'}
                                              >
                                                <Mail className="w-5 h-5" />
                                              </button>

                                              {/* Expanded Snooze clock popover */}
                                              <div className="relative">
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveSnoozePopoverUid(activeSnoozePopoverUid === msg.uid ? null : msg.uid)}
                                                  className={`p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${
                                                    msg.uid in snoozedMails ? 'text-amber-505' : 'text-slate-400 hover:text-amber-500'
                                                  }`}
                                                  title="Snooze"
                                                >
                                                  <Clock className="w-5 h-5" />
                                                </button>
                                                <AnimatePresence>
                                                  {activeSnoozePopoverUid === msg.uid && (
                                                    <motion.div
                                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 divide-y divide-slate-100 overflow-hidden font-sans font-medium text-xs text-slate-700"
                                                    >
                                                      <div className="bg-slate-50 px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">
                                                        Snooze until...
                                                      </div>
                                                      {[
                                                        { label: 'Later Today (6:00 PM)', val: 'Today 6PM' },
                                                        { label: 'Tomorrow morning (8:00 AM)', val: 'Tomorrow 8AM' },
                                                        { label: 'Next week (Monday)', val: 'Next week' },
                                                        { label: 'Someday', val: 'Someday' },
                                                      ].map((option, opIdx) => (
                                                        <button
                                                          key={opIdx}
                                                          type="button"
                                                          onClick={(e) => {
                                                            handleSnoozeEmail(msg.uid, option.val, msg.subject, e);
                                                            setActiveSnoozePopoverUid(null);
                                                          }}
                                                          className="w-full text-left px-3 py-2 hover:bg-amber-55 text-slate-705 hover:text-amber-800 transition-colors cursor-pointer border-none"
                                                        >
                                                          {option.label}
                                                        </button>
                                                      ))}
                                                      {msg.uid in snoozedMails && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            handleUnsnoozeEmail(msg.uid, e);
                                                            setActiveSnoozePopoverUid(null);
                                                          }}
                                                          className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 transition-colors font-bold cursor-pointer border-none"
                                                        >
                                                          Cancel Snooze
                                                        </button>
                                                      )}
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>

                                              <button
                                                onClick={() => handleToggleFlag(msg.uid, emailDetail.flagged ? 'unstar' : 'star')}
                                                className="p-2 text-slate-400 hover:text-amber-500 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                                title={emailDetail.flagged ? 'Unpin' : 'Pin'}
                                              >
                                                <Star className={`w-5 h-5 ${emailDetail.flagged ? 'fill-amber-450 text-amber-500' : ''}`} />
                                              </button>

                                              <button
                                                onClick={() => handleDeleteEmail(msg.uid)}
                                                className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                                title="Delete"
                                              >
                                                <Trash2 className="w-5 h-5" />
                                              </button>

                                              <button
                                                onClick={() => handleArchiveEmail(msg.uid)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                                title="Done (Archive)"
                                              >
                                                <Check className="w-5 h-5 stroke-[2.5]" />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Message Envelope Recipients */}
                                          <div className="text-[11px] text-slate-400 space-y-0.5 font-sans border-b border-slate-50 pb-3">
                                            {emailDetail.to && emailDetail.to.length > 0 && (
                                              <p><span className="font-semibold text-slate-500">To:</span> {emailDetail.to.map((t: any) => t.name || t.address).join(', ')}</p>
                                            )}
                                            {emailDetail.cc && emailDetail.cc.length > 0 && (
                                              <p><span className="font-semibold text-slate-500">Cc:</span> {emailDetail.cc.map((t: any) => t.name || t.address).join(', ')}</p>
                                            )}
                                            <p><span className="font-semibold text-slate-500">Date:</span> {new Date(emailDetail.date).toLocaleString()}</p>
                                          </div>

                                          {/* AI Smart Summary Results block */}
                                          <AnimatePresence>
                                            {aiGenerating && (
                                              <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-xs text-blue-900 shadow-inner"
                                              >
                                                <Loader2 className="w-5 h-5 text-blue-500 shrink-0 animate-spin" />
                                                <div>
                                                  <p className="font-semibold text-blue-800">Compiling thread insights...</p>
                                                  <p className="text-blue-500 text-[11px] mt-0.5">Gemini Flash is analyzing language sentiments & writing summaries.</p>
                                                </div>
                                              </motion.div>
                                            )}

                                            {aiError && (
                                              <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-xs text-red-900"
                                              >
                                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                                                <div>
                                                  <p className="font-semibold text-red-800">Insight Generator Offline</p>
                                                  <p className="text-red-500 text-[11px] mt-0.5">{aiError}</p>
                                                </div>
                                              </motion.div>
                                            )}

                                            {aiResult && (
                                              <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-gradient-to-br from-blue-50/50 to-blue-50/20 border border-blue-200 rounded-xl p-5 shadow-inner space-y-4"
                                              >
                                                <div>
                                                  <div className="flex items-center gap-1.5 text-blue-800 mb-1">
                                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                                    <p className="text-xs font-bold uppercase tracking-widest block">AI Sparkle Summary</p>
                                                  </div>
                                                  <p className="text-xs text-slate-700 leading-relaxed font-semibold font-sans">
                                                    {aiResult.summary}
                                                  </p>
                                                </div>

                                                <hr className="border-blue-100" />

                                                <div>
                                                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-2 block">Quick responses</p>
                                                  <div className="flex flex-col gap-1.5">
                                                    {aiResult.suggestions.map((sug, i) => (
                                                      <button
                                                        key={i}
                                                        onClick={() => handleSmartReply(sug)}
                                                        className="w-full text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-2.5 text-[11px] font-semibold text-slate-700 hover:text-blue-700 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                                                      >
                                                        <span>{sug}</span>
                                                        <CornerUpLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>

                                          {/* Sanitized IFrame Email Body Payload */}
                                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs h-[500px] bg-white relative">
                                            {emailDetail.html ? (
                                              <SafeIframe html={emailDetail.html} />
                                            ) : (
                                              <div className="p-4 bg-slate-50 text-slate-700 leading-relaxed font-mono select-text text-xs whitespace-pre-wrap overflow-y-auto h-full">
                                                {emailDetail.text}
                                              </div>
                                            )}
                                          </div>

                                          {/* Clickable Attachments (Google Inbox Grid view) */}
                                          {emailDetail.attachments && emailDetail.attachments.length > 0 && (
                                            <div className="border-t border-slate-100 pt-5 mt-4">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                                                Attachments ({emailDetail.attachments.length})
                                              </span>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {emailDetail.attachments.map((att, attIndex) => {
                                                  const isDownloading = downloadingFile === att.filename;
                                                  return (
                                                    <div
                                                      key={attIndex}
                                                      onClick={(e) => handleDownloadAttachment(msg.uid, att.filename, e)}
                                                      className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-blue-50/35 hover:border-blue-200 transition-colors select-none cursor-pointer group shadow-2xs"
                                                    >
                                                      <div className="flex items-center gap-3 truncate">
                                                        <div className="p-2.5 bg-white border border-slate-200 text-blue-500 group-hover:text-blue-600 rounded-lg shadow-3xs shrink-0 flex items-center justify-center">
                                                          {isDownloading ? (
                                                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                                          ) : (
                                                            <Paperclip className="w-4.5 h-4.5" />
                                                          )}
                                                        </div>
                                                        <div className="min-w-0">
                                                          <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-700">{att.filename}</p>
                                                          <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">{formatBytes(att.size)}</p>
                                                        </div>
                                                      </div>
                                                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 flex items-center gap-1 shrink-0 p-1 bg-white border border-slate-200 rounded-md">
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Get</span>
                                                      </span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}

                                        </div>

                                        {/* Google Inbox bottom quick replying draft composer */}
                                         {/* AI Drafting controls */}
                                         <div className="bg-gradient-to-br from-violet-50/70 to-indigo-50/50 border border-violet-100 rounded-xl p-4 mb-4 space-y-3 shadow-3xs">
                                           <div className="flex flex-wrap items-center justify-between gap-2">
                                             <div className="flex items-center gap-2">
                                               <Sparkles className="w-4 h-4 text-violet-600 animate-pulse fill-violet-200" />
                                               <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wide">
                                                 AI Reply Builder
                                               </span>
                                             </div>
                                             
                                             {/* AI Reply preset tone tabs */}
                                             <div className="flex flex-wrap gap-1">
                                               {[
                                                 { id: 'professional', label: 'Professional' },
                                                 { id: 'casual', label: 'Casual & Warm' },
                                                 { id: 'agree', label: 'Agree / Confirm' },
                                                 { id: 'decline', label: 'Polite Decline' },
                                               ].map((t) => (
                                                 <button
                                                   key={t.id}
                                                   onClick={() => setAiTone(t.id)}
                                                   className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border transition-all cursor-pointer ${
                                                     aiTone === t.id
                                                       ? 'bg-violet-600 border-violet-600 text-white shadow-3xs'
                                                       : 'bg-white border-slate-205 text-slate-600 hover:bg-slate-50'
                                                   }`}
                                                 >
                                                   {t.label}
                                                 </button>
                                               ))}
                                             </div>
                                           </div>

                                           {/* Mini Instruction Input bar */}
                                           <div className="flex gap-2">
                                             <input
                                               type="text"
                                               placeholder="Short instruction (e.g., 'Say yes but tell them I'm on vacation next week')"
                                               value={aiCustomInstructions}
                                               onChange={(e) => setAiCustomInstructions(e.target.value)}
                                               className="flex-1 min-w-0 bg-white border border-slate-200 focus:border-violet-400 rounded-lg py-1.5 px-3 text-xs text-slate-800 focus:outline-none transition-all placeholder-slate-400 shadow-3xs"
                                               onKeyDown={(e) => {
                                                 if (e.key === 'Enter') {
                                                   e.preventDefault();
                                                   handleGenerateAiDraft(msg.uid);
                                                 }
                                               }}
                                             />
                                             <button
                                               onClick={() => handleGenerateAiDraft(msg.uid)}
                                               disabled={generatingAiResponse}
                                               className="px-4 py-1.5 shrink-0 bg-violet-650 hover:bg-violet-700 disabled:bg-violet-300 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                                             >
                                               {generatingAiResponse ? (
                                                 <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                               ) : (
                                                 <Sparkles className="w-3.5 h-3.5 fill-white" />
                                               )}
                                               <span>Draft with AI</span>
                                             </button>
                                           </div>

                                           {/* Gen AI reply error feedback context */}
                                           {aiResponseError && (
                                             <div className="text-[11px] font-medium text-red-650 bg-red-50 px-2.5 py-1.5 rounded-md border border-red-100 select-text">
                                               {aiResponseError}
                                             </div>
                                           )}
                                         </div>
                                        <div className="bg-white border border-slate-200 rounded-xl shadow-md p-6 space-y-4">
                                          <div className="flex items-center gap-2 text-slate-450 text-[11px] font-bold uppercase tracking-widest">
                                            <CornerUpLeft className="w-4 h-4 text-slate-450" />
                                            <span>Quick Reply Draft</span>
                                          </div>
                                          
                                          <textarea
                                            placeholder={`Reply to ${senderName}...`}
                                            value={inlineReplyText}
                                            onChange={(e) => setInlineReplyText(e.target.value)}
                                            rows={4}
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg p-3 text-xs text-slate-800 shadow-2xs focus:outline-none transition-all resize-none"
                                          />

                                          <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => handleSendInlineReply(msg.uid, senderEmail, emailDetail.subject)}
                                                disabled={inlineReplySending || !inlineReplyText.trim()}
                                                className="px-5 py-2 flex items-center gap-1.5 bg-[#2196f3] hover:bg-[#1976d2] text-white disabled:opacity-50 text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
                                              >
                                                {inlineReplySending ? (
                                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                  <Send className="w-3.5 h-3.5" />
                                                )}
                                                <span>Send Reply</span>
                                              </button>
                                              <button
                                                onClick={() => setInlineReplyText('')}
                                                disabled={inlineReplySending || !inlineReplyText.trim()}
                                                className="px-4 py-2 hover:bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                              >
                                                Discard
                                              </button>
                                            </div>

                                            {/* Pop-out to larger composing modal */}
                                            <button
                                              onClick={() => {
                                                const subj = emailDetail.subject.startsWith('Re:') ? emailDetail.subject : `Re: ${emailDetail.subject}`;
                                                setComposeTo(senderEmail);
                                                setComposeSubject(subj);
                                                setComposeBody(inlineReplyText);
                                                setComposeOpen(true);
                                              }}
                                              className="text-[11px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 cursor-pointer hover:underline"
                                              title="Pop out reply to full compose"
                                            >
                                              <span>Pop-out editor</span>
                                              <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                      </div>
                                    );
                                  })()
                                ) : null}
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })}
                  </div>

                </div>
              ))
            )}

            {/* Bottom Offset to leave room for FAB */}
            <div className="h-20" />

          </div>
        </section>

        {/* Circular Floaty Red Compose button on bottom right corner (Google Inbox hallmark FAB) */}
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileActive={{ scale: 0.95 }}
            onClick={() => {
              setComposeTo('');
              setComposeSubject('');
              setComposeBody('');
              setComposeOpen(true);
            }}
            className="w-14 h-14 bg-[#f44336] hover:bg-[#d32f2f] text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/35 cursor-pointer border-none outline-none focus:outline-none transition-all active:scale-95"
            title="Compose a message (Shortcut: C)"
            aria-label="Compose message"
          >
            <Edit3 className="w-6 h-6 stroke-[2.25]" />
          </motion.button>
        </div>

      </div>

      {/* Pop-out composing envelope modal */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        accountSettings={accountSettings}
        initialTo={composeTo}
        initialSubject={composeSubject}
        initialBody={composeBody}
        contacts={contacts}
      />

      {/* Keyboard Shortcuts Helper Overlay Dialog */}
      <AnimatePresence>
        {showShortcutsHelper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full font-sans select-none"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-slate-800 text-sm">DMail Shortcuts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShortcutsHelper(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { keys: ['C'], desc: 'Open blank composer' },
                  { keys: ['Esc'], desc: 'Close / escape menus' },
                  { keys: ['R'], desc: 'Reply to active thread' },
                  { keys: ['E', 'Y'], desc: 'Archive (Mark Done)' },
                  { keys: ['#', 'Backspace'], desc: 'Delete thread text representation' },
                  { keys: ['S'], desc: 'Toggle pinned/star status' },
                  { keys: ['I'], desc: 'Go back to Inbox list' },
                  { keys: ['?'], desc: 'Toggle keyboard helper' },
                ].map((item, id) => (
                  <div key={id} className="flex items-center justify-between text-xs py-1 hover:bg-slate-50 rounded px-1 transition-colors">
                    <span className="text-slate-500 font-medium">{item.desc}</span>
                    <div className="flex gap-1 shrink-0">
                      {item.keys.map((k, kId) => (
                        <kbd key={kId} className="px-1.5 py-0.5 bg-slate-100 border border-slate-350 rounded text-[10px] font-mono font-bold text-slate-700 shadow-3xs uppercase">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowShortcutsHelper(false)}
                className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer border-none"
              >
                Close Reference
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Undo action toast banner */}
      <AnimatePresence>
        {showUndoToast && lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-6 z-55 max-w-sm bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-4 flex items-center justify-between gap-6 font-sans font-medium text-xs shadow-black/20"
          >
            <div className="truncate text-white select-none">
              <span>
                {lastAction.type === 'archive' && 'Conversation marked Done.'}
                {lastAction.type === 'delete' && 'Conversation moved to Trash.'}
                {lastAction.type === 'snooze' && 'Notification snooze registered.'}
              </span>
            </div>
            
            <button
              onClick={handleUndoAction}
              className="px-3.5 py-1.5 bg-amber-450 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold rounded-md outline-none border-none transition-colors cursor-pointer shrink-0 uppercase tracking-wide text-[10px]"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mailbox Settings Modal Overlay */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[85vh] overflow-hidden flex flex-col font-sans text-slate-800"
            >
              {/* Modal Banner Header */}
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div>
                  <h3 className="font-bold text-base text-slate-905 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600 shrink-0" />
                    Mailbox Configuration & Control
                  </h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Customize your layout preferences, linked servers, and bulk import directories</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer border-none text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Main settings grid panel */}
              <div className="flex-1 flex min-h-0 bg-white">
                
                {/* Left side navigation tabs */}
                <div className="w-56 bg-slate-50/75 border-r border-slate-100 p-3 flex flex-col gap-1 shrink-0 select-none">
                  {[
                    { id: 'preferences', label: 'General / Layout', desc: 'Theme, density, signature', icon: <Sliders className="w-4 h-4" /> },
                    { id: 'accounts', label: 'Linked Accounts', desc: 'Manage server entries', icon: <Mail className="w-4 h-4" /> },
                    { id: 'contacts', label: 'Contacts Directory', desc: 'Manager & CSV import', icon: <Users className="w-4 h-4" /> },
                  ].map((tab) => {
                    const isSelected = activeSettingsTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSettingsTab(tab.id as any)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer border-none bg-transparent group ${
                          isSelected
                            ? 'bg-white text-blue-600 shadow-3xs border border-slate-200/50 font-bold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className={`p-1 rounded-lg transition-transform duration-150 group-hover:scale-110 ${isSelected ? 'bg-blue-50 text-blue-650' : 'bg-slate-150 text-slate-500'}`}>
                          {tab.icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[12px] block font-semibold truncate leading-none">{tab.label}</span>
                          <span className="text-[9px] text-slate-400 block truncate mt-0.5 font-normal leading-none">{tab.desc}</span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="mt-auto px-3.5 py-4 bg-slate-100 bg-opacity-40 border border-slate-200/30 rounded-xl">
                    <p className="text-[9px] text-slate-450 leading-relaxed font-sans font-medium text-center">
                      Loaded Session: <br />
                      <span className="font-mono text-[8.5px] text-blue-500 font-semibold">{accountSettings.imap.user}</span>
                    </p>
                  </div>
                </div>

                {/* Right side interactive content field panel */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  
                  {/* Preferences Pane */}
                  {activeSettingsTab === 'preferences' && (
                    <div className="space-y-6">
                      
                      {/* Theme selection dropdown or buttons list */}
                      <div>
                        <label className="text-xs font-bold text-slate-900 block mb-2">Display Color Scheme</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-9 gap-2">
                          {[
                            { id: 'blue', label: 'Drew Blue', color: 'bg-[#2196f3]' },
                            { id: 'crimson', label: 'Sunset Red', color: 'bg-rose-600' },
                            { id: 'emerald', label: 'Green Ivy', color: 'bg-emerald-600' },
                            { id: 'violet', label: 'Amethyst', color: 'bg-violet-600' },
                            { id: 'amber', label: 'Retro Amber', color: 'bg-amber-600' },
                            { id: 'sunset', label: 'Sunset Glow', color: 'bg-gradient-to-tr from-orange-405 via-rose-500 to-purple-555' },
                            { id: 'ocean', label: 'Deep Ocean', color: 'bg-gradient-to-tr from-blue-500 via-cyan-451 to-teal-400' },
                            { id: 'cosmic', label: 'Cosmic Edge', color: 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500' },
                            { id: 'aurora', label: 'Aurora Flow', color: 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-400' },
                          ].map((t) => {
                            const active = theme === t.id;
                            return (
                              <button
                                key={t.id}
                                onClick={() => {
                                  setTheme(t.id as any);
                                  localStorage.setItem('drewmail_theme', t.id);
                                }}
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer bg-white group ${
                                  active
                                    ? 'border-blue-500 ring-2 ring-blue-50/70 font-bold'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className={`w-4.5 h-4.5 rounded-full ${t.color} group-hover:scale-110 transition-transform`} />
                                <span className={`text-[9px] tracking-wide block leading-tight truncate max-w-full ${active ? 'text-slate-900 font-extrabold' : 'text-slate-650 font-semibold'}`}>
                                  {t.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display density spacing size preferences toggles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">List Density Mode</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setDensity('spacious');
                                localStorage.setItem('drewmail_density', 'spacious');
                              }}
                              className={`py-2 px-3 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all border-none ${
                                density === 'spacious' ? 'bg-white text-slate-900 shadow-3xs font-bold' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                              }`}
                            >
                              Spacious (Relaxed)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDensity('compact');
                                localStorage.setItem('drewmail_density', 'compact');
                              }}
                              className={`py-2 px-3 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all border-none ${
                                density === 'compact' ? 'bg-white text-slate-900 shadow-3xs font-bold' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                              }`}
                            >
                              Compact (Grid)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">Pagination Stream Limit</label>
                          <select
                            value={limit}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setLimit(val);
                              localStorage.setItem('drewmail_limit', String(val));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white text-slate-800 text-xs rounded-xl p-2.5 font-semibold outline-none"
                          >
                            <option value={20}>20 items per load skipping</option>
                            <option value={40}>40 items per load skipping (Default)</option>
                            <option value={100}>100 items per load skipping</option>
                          </select>
                        </div>
                      </div>

                      {/* Sounds & auto-advance features toggles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">Auto Advance Stream Action</label>
                          <select
                            value={autoAdvance}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setAutoAdvance(val);
                              localStorage.setItem('drewmail_auto_advance', val);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white text-slate-800 text-xs rounded-xl p-2.5 font-semibold outline-none"
                          >
                            <option value="list">Return back to Mailbox list directly</option>
                            <option value="newer">Automatically show Newer message inline</option>
                            <option value="older">Automatically show Older message inline</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">Audio Notifications</label>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-[11px] font-semibold text-slate-600">Play alert sound when mail arrives</span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = !notificationSound;
                                setNotificationSound(next);
                                localStorage.setItem('drewmail_notif_sound', String(next));
                              }}
                              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer border-none font-sans ${
                                notificationSound ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-3xs transition-transform ${
                                notificationSound ? 'translate-x-4.5' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Font Size Adjustment Section */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-900 block">Font Size Adjustment Scale</label>
                          <span className="text-[10px] text-slate-450 font-bold">
                            {fontSizeOffset === 0 ? 'Original Size' : fontSizeOffset > 0 ? `+${fontSizeOffset}px Larger` : `${fontSizeOffset}px Smaller`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-105 p-3 rounded-xl">
                          <span className="text-[10px] font-semibold text-slate-400">A-</span>
                          <input
                            type="range"
                            min="-2"
                            max="6"
                            step="1"
                            value={fontSizeOffset}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFontSizeOffset(val);
                              localStorage.setItem('drewmail_font_size_offset', String(val));
                            }}
                            className="flex-1 accent-blue-600 h-1 bg-slate-205 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-650">A+</span>
                        </div>
                      </div>

                      {/* Customizable email signature sheet fields */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-900 block">Rich Email Signature</label>
                          <span className="text-[10px] text-slate-400">Appended to custom messages automatically</span>
                        </div>
                        <textarea
                          placeholder="Regards, &#10;Drew Admin &#10;DMail Client (Secure)"
                          value={signature}
                          onChange={(e) => {
                            setSignature(e.target.value);
                            localStorage.setItem('drewmail_email_signature', e.target.value);
                          }}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-705 font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none leading-relaxed"
                        />
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl mt-2 text-[10px] text-slate-450">
                          <span className="font-bold text-slate-600 uppercase tracking-widest text-[8px] block mb-1">Preview Signature Output:</span>
                          <span className="whitespace-pre-wrap font-mono block leading-relaxed">{signature || 'No email signature defined'}</span>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Accounts Panel Tab */}
                  {activeSettingsTab === 'accounts' && (
                    <div className="space-y-6 text-left">
                      
                      {/* Active Accounts List layout */}
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Gateways & Integrated Accounts</h4>
                        <div className="space-y-2">
                          
                          {/* Active Primary Login account */}
                          <div className="p-4 rounded-2xl border border-blue-150 bg-blue-50/15 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <span className="text-xs font-extrabold text-blue-800 tracking-wide block truncate">{accountSettings.imap.user}</span>
                              <span className="text-[9px] font-mono text-slate-450 block truncate mt-0.5">
                                Server IMAP: {accountSettings.imap.host}:{accountSettings.imap.port} (TLS: {accountSettings.imap.secure ? 'YES' : 'NO'})
                              </span>
                            </div>
                            <span className="text-[9.5px] px-2.5 py-1 rounded-full font-bold bg-blue-105 text-blue-700 tracking-wider uppercase shadow-3xs shrink-0 select-none">
                              Active Session
                            </span>
                          </div>

                          {/* Secondary Added Accounts */}
                          {linkedAccounts
                            .filter(acc => acc.imap.user.toLowerCase() !== accountSettings.imap.user.toLowerCase())
                            .map((acct, acIdx) => (
                              <div key={acIdx} className="p-3.5 rounded-2xl border border-slate-205 bg-white flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-800 tracking-wide block truncate">{acct.imap.user}</span>
                                  <span className="text-[9px] font-mono text-slate-400 block truncate mt-0.5">
                                    Server IMAP: {acct.imap.host}:{acct.imap.port} (TLS: {acct.imap.secure ? 'YES' : 'NO'})
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // SWAP root active account
                                      onSwitchAccount?.(acct);
                                      setShowSettingsModal(false);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1976d2] font-bold text-[10px] rounded-lg tracking-wide uppercase transition-all scale-95 hover:scale-100 cursor-pointer border-none"
                                  >
                                    Activate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = linkedAccounts.filter(acc => acc.imap.user.toLowerCase() !== acct.imap.user.toLowerCase());
                                      setLinkedAccounts(updated);
                                      localStorage.setItem('drewmail_linked_accounts', JSON.stringify(updated));
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                    title="Unlink Account settings metadata"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Beautiful Add Account form layout */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setNewAccountAddingError(null);

                          if (!newAccountEmail.trim() || !newAccountPassword.trim() || !newAccountImapHost.trim() || !newAccountSmtpHost.trim()) {
                            setNewAccountAddingError("Email, Password, and Server Hosts can't be empty");
                            return;
                          }

                          const newAcct: MailAccountSettings = {
                            saveCredentials: true,
                            imap: {
                              user: newAccountEmail.trim(),
                              pass: newAccountPassword.trim(),
                              host: newAccountImapHost.trim(),
                              port: Number(newAccountImapPort),
                              secure: newAccountSecure,
                            },
                            smtp: {
                              host: newAccountSmtpHost.trim(),
                              port: Number(newAccountSmtpPort),
                              user: newAccountEmail.trim(),
                              pass: newAccountPassword.trim(),
                              secure: newAccountSecure,
                            }
                          };

                          const isDuplicate = linkedAccounts.some(acc => acc.imap.user.toLowerCase() === newAcct.imap.user.toLowerCase());
                          if (isDuplicate) {
                            setNewAccountAddingError(`Account '${newAccountEmail}' is already linked`);
                            return;
                          }

                          const updated = [...linkedAccounts, newAcct];
                          setLinkedAccounts(updated);
                          localStorage.setItem('drewmail_linked_accounts', JSON.stringify(updated));

                          // Reset new connection inputs
                          setNewAccountEmail('');
                          setNewAccountPassword('');
                          setNewAccountImapHost('');
                          setNewAccountImapPort('993');
                          setNewAccountSmtpHost('');
                          setNewAccountSmtpPort('465');
                          setNewAccountSecure(true);

                          alert("Linked account added perfectly! Click 'Activate' above to switch sessions dynamically.");
                        }}
                        className="bg-slate-50/75 border border-slate-100 rounded-2xl p-4.5 space-y-4"
                      >
                        <div className="border-b pb-2 mb-1 flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4 text-slate-600" />
                          <span className="text-[11.5px] font-bold text-slate-700 tracking-wide">Add Secondary IMAP / SMTP Gateway Session</span>
                        </div>

                        {newAccountAddingError && (
                          <div className="p-2.5 bg-red-50 border border-red-200 text-red-650 rounded-xl text-[10px] font-bold leading-relaxed">{newAccountAddingError}</div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Email Address</label>
                            <input
                              type="email"
                              placeholder="engineering@example.com"
                              value={newAccountEmail}
                              onChange={(e) => setNewAccountEmail(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">App/Server Password</label>
                            <input
                              type="password"
                              placeholder="••••••••••••"
                              value={newAccountPassword}
                              onChange={(e) => setNewAccountPassword(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none font-medium text-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">IMAP Incoming Server Host (SSL)</label>
                            <input
                              type="text"
                              placeholder="imap.example.com"
                              value={newAccountImapHost}
                              onChange={(e) => setNewAccountImapHost(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">IMAP Port</label>
                            <input
                              type="text"
                              placeholder="993"
                              value={newAccountImapPort}
                              onChange={(e) => setNewAccountImapPort(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none text-center font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">SMTP Outbox Server Host (SSL)</label>
                            <input
                              type="text"
                              placeholder="smtp.example.com"
                              value={newAccountSmtpHost}
                              onChange={(e) => setNewAccountSmtpHost(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">SMTP Port</label>
                            <input
                              type="text"
                              placeholder="465"
                              value={newAccountSmtpPort}
                              onChange={(e) => setNewAccountSmtpPort(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none text-center font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-1 bg-white border border-slate-100 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-semibold pl-2">Use secure connection overlay (SSL/TLS verification)</span>
                          <button
                            type="button"
                            onClick={() => setNewAccountSecure(!newAccountSecure)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer border-none ${
                              newAccountSecure ? 'bg-blue-500' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-3xs transition-transform ${
                              newAccountSecure ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        <div className="text-right">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 border-none hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer ml-auto transition-transform"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Register Mail Gateway
                          </button>
                        </div>
                      </form>

                    </div>
                  )}

                  {/* Contacts & Import Manager Tab content */}
                  {activeSettingsTab === 'contacts' && (
                    <div className="space-y-6 text-left">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
                        
                        {/* Custom directory layout */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Directory ({customContacts.length} custom entries)</h4>
                            <input
                              type="text"
                              placeholder="Search list..."
                              value={contactSearch}
                              onChange={(e) => setContactSearch(e.target.value)}
                              className="bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-lg py-1 px-2.5 text-[10px] outline-none font-medium max-w-36"
                            />
                          </div>

                          <div className="border border-slate-150 rounded-2xl h-52 overflow-y-auto px-1 divide-y divide-slate-100 bg-slate-50/25">
                            {customContacts.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 text-xs">No user-defined contacts added. Add manually or import below!</div>
                            ) : (
                              customContacts
                                .filter(c => {
                                  const search = contactSearch.toLowerCase();
                                  return c.name.toLowerCase().includes(search) || c.address.toLowerCase().includes(search);
                                })
                                .map((contact, cIdx) => (
                                  <div key={cIdx} className="p-2 hover:bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-800 block truncate">{contact.name}</span>
                                      <span className="text-[10px] text-slate-500 font-mono block truncate">{contact.address}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = customContacts.filter(c => c.address.toLowerCase() !== contact.address.toLowerCase());
                                        setCustomContacts(updated);
                                        localStorage.setItem('drewmail_custom_contacts', JSON.stringify(updated));
                                      }}
                                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                                      title="Remove Contact"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>

                        {/* Manual Insertion pane */}
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Create New Contact</h4>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!newContactEmail.trim() || !newContactEmail.includes('@')) {
                                alert("Please enter a valid email address");
                                return;
                              }
                              const address = newContactEmail.trim().toLowerCase();
                              if (customContacts.some(c => c.address.toLowerCase() === address)) {
                                alert("This contact email address already exists.");
                                return;
                              }

                              const updated = [
                                ...customContacts,
                                {
                                  name: newContactName.trim() || newContactEmail.trim().split('@')[0],
                                  address,
                                  phone: newContactPhone.trim() || undefined,
                                  company: newContactCompany.trim() || undefined,
                                }
                              ];
                              setCustomContacts(updated);
                              localStorage.setItem('drewmail_custom_contacts', JSON.stringify(updated));

                              // Reset
                              setNewContactName('');
                              setNewContactEmail('');
                              setNewContactPhone('');
                              setNewContactCompany('');
                            }}
                            className="bg-slate-50/75 border border-slate-100 rounded-2xl p-4.5 space-y-3"
                          >
                            <div>
                              <label className="text-[9px] text-slate-500 font-extrabold tracking-wider block mb-1">Name</label>
                              <input
                                type="text"
                                placeholder="Drew Wilson"
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 font-extrabold tracking-wider block mb-1">Email Address</label>
                              <input
                                type="email"
                                placeholder="drew@example.com"
                                value={newContactEmail}
                                onChange={(e) => setNewContactEmail(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs outline-none font-medium"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3.5">
                              <div>
                                <label className="text-[9px] text-slate-500 font-extrabold tracking-wider block mb-1">Company (Opt)</label>
                                <input
                                  type="text"
                                  placeholder="Acme Inc."
                                  value={newContactCompany}
                                  onChange={(e) => setNewContactCompany(e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-extrabold tracking-wider block mb-1">Phone (Opt)</label>
                                <input
                                  type="text"
                                  placeholder="+1-555"
                                  value={newContactPhone}
                                  onChange={(e) => setNewContactPhone(e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs outline-none"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none"
                            >
                              <Plus className="w-4 h-4" />
                              Save to Directory
                            </button>
                          </form>
                        </div>

                      </div>

                      {/* Bulk paste & dropzone file uploader sheet */}
                      <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4.5 space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 mb-1">
                          <Upload className="w-4.5 h-4.5 text-blue-600" />
                          <span className="text-[11.5px] font-bold text-slate-700">Bulk Paste CSV / json sheet directory importer</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Paste container */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-slate-500 font-bold block">Option A: Paste rows of directory details</span>
                            <textarea
                              placeholder="Format: Name, Email Address &#10;Drew Admin, admin@drewmail.io &#10;Engineering, eng@example.com"
                              value={importPasteText}
                              onChange={(e) => setImportPasteText(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-705 font-mono h-[110px] focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                            />
                            
                            <button
                              type="button"
                              onClick={() => {
                                if (!importPasteText.trim()) return;
                                const lines = importPasteText.split('\n');
                                const parsedContacts: typeof customContacts = [];
                                lines.forEach(line => {
                                  const parts = line.split(/[;,]/);
                                  if (parts.length >= 2) {
                                    const name = parts[0].trim();
                                    const email = parts[1].trim();
                                    if (email.includes('@')) {
                                      parsedContacts.push({
                                        name: name || email.split('@')[0],
                                        address: email,
                                        phone: parts[2] ? parts[2].trim() : undefined,
                                        company: parts[3] ? parts[3].trim() : undefined,
                                      });
                                    }
                                  } else if (line.trim().includes('@')) {
                                    const email = line.trim();
                                    parsedContacts.push({
                                      name: email.split('@')[0],
                                      address: email
                                    });
                                  }
                                });

                                if (parsedContacts.length > 0) {
                                  const updated = [...customContacts];
                                  const existingAddresses = new Set(updated.map(c => c.address.toLowerCase()));
                                  let addedCount = 0;
                                  parsedContacts.forEach(c => {
                                    if (!existingAddresses.has(c.address.toLowerCase())) {
                                      updated.push(c);
                                      existingAddresses.add(c.address.toLowerCase());
                                      addedCount++;
                                    }
                                  });
                                  setCustomContacts(updated);
                                  localStorage.setItem('drewmail_custom_contacts', JSON.stringify(updated));
                                  alert(`Successfully added ${addedCount} contacts from pasture text!`);
                                  setImportPasteText('');
                                } else {
                                  alert("Could not parse any valid contacts formats. Check format template!");
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wide cursor-pointer border-none"
                            >
                              Parse & Import Rows
                            </button>
                          </div>

                          {/* File CSV / JSON dropzone loader container */}
                          <div className="flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-slate-500 font-bold block">Option B: Load CSV / JSON local contact document</span>
                              <p className="text-[9.5px] text-slate-400 leading-relaxed mb-3">Accepts comma-split standard columns of Name and Email Address, or standard exported contact JSON arrays.</p>
                            </div>
                            
                            <div className="border border-dashed border-slate-300 hover:border-slate-400 bg-white rounded-xl p-5 text-center cursor-pointer transition-colors relative flex flex-col justify-center items-center">
                              <Upload className="w-6 h-6 text-slate-400 mb-1.5 group-hover:scale-105 transition-transform" />
                              <span className="text-[10px] font-semibold text-slate-600">Select standard contact JSON or CSV sheet...</span>
                              <input
                                type="file"
                                accept=".csv,.json,.txt"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const text = event.target?.result as string;
                                    if (!text) return;

                                    if (file.name.endsWith('.json')) {
                                      try {
                                        const parsed = JSON.parse(text);
                                        if (Array.isArray(parsed)) {
                                          const updated = [...customContacts];
                                          const existingAddresses = new Set(updated.map(c => c.address.toLowerCase()));
                                          let addedCount = 0;
                                          parsed.forEach((item: any) => {
                                            const email = item.address || item.email;
                                            const name = item.name || email?.split('@')[0];
                                            if (email && email.includes('@') && !existingAddresses.has(email.toLowerCase())) {
                                              updated.push({
                                                name,
                                                address: email,
                                                phone: item.phone,
                                                company: item.company
                                              });
                                              existingAddresses.add(email.toLowerCase());
                                              addedCount++;
                                            }
                                          });
                                          setCustomContacts(updated);
                                          localStorage.setItem('drewmail_custom_contacts', JSON.stringify(updated));
                                          alert(`Parsed complete! Loaded ${addedCount} contacts.`);
                                        }
                                      } catch {
                                        alert("JSON schema parse fail. Must be an array of structures.");
                                      }
                                    } else if (file.name.endsWith('.csv')) {
                                      const lines = text.split('\n');
                                      const parsedContacts: typeof customContacts = [];
                                      lines.forEach((line, idx) => {
                                        if (idx === 0 && line.toLowerCase().includes('email')) return;
                                        const parts = line.split(',');
                                        if (parts.length >= 2) {
                                          const name = parts[0].replace(/^["']|["']$/g, '').trim();
                                          const email = parts[1].replace(/^["']|["']$/g, '').trim();
                                          if (email.includes('@')) {
                                            parsedContacts.push({
                                              name: name || email.split('@')[0],
                                              address: email,
                                              phone: parts[2] ? parts[2].trim() : undefined,
                                              company: parts[3] ? parts[3].trim() : undefined,
                                            });
                                          }
                                        }
                                      });

                                      if (parsedContacts.length > 0) {
                                        const updated = [...customContacts];
                                        const existingAddresses = new Set(updated.map(c => c.address.toLowerCase()));
                                        let addedCount = 0;
                                        parsedContacts.forEach(c => {
                                          if (!existingAddresses.has(c.address.toLowerCase())) {
                                            updated.push(c);
                                            existingAddresses.add(c.address.toLowerCase());
                                            addedCount++;
                                          }
                                        });
                                        setCustomContacts(updated);
                                        localStorage.setItem('drewmail_custom_contacts', JSON.stringify(updated));
                                        alert(`Successfully imported ${addedCount} contacts from CSV data folder!`);
                                      } else {
                                        alert("Could not detect Name and Email columns in comma lines");
                                      }
                                    } else {
                                      setImportPasteText(text);
                                      alert("Loaded text file coordinates. Check paste box and review details!");
                                    }
                                  };
                                  reader.readAsText(file);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>

              {/* Bottom control bar */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-slate-400 font-mono">DMail System Preferences</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    showToast('Settings saved successfully!', 'success');
                  }}
                  className={`px-4 py-2 ${t.bg} hover:opacity-90 text-white font-bold rounded-xl text-xs cursor-pointer border-none shadow-md transition-transform hover:scale-102 active:scale-95`}
                >
                  Save & Apply Configs
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewAttachment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-5 max-w-5xl w-full font-sans overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0 pr-4 text-left">
                  <div className="p-1.5 bg-slate-800 border border-slate-700 text-blue-400 rounded-lg">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <span className="font-bold text-slate-100 text-sm block truncate">{previewAttachment.filename}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block capitalize">{previewAttachment.contentType}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewAttachment.url}
                    download={previewAttachment.filename}
                    className="p-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer decoration-none"
                    title="Download to Local Desk"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save Document</span>
                  </a>
                  
                  <button
                    type="button"
                    onClick={() => {
                      window.URL.revokeObjectURL(previewAttachment.url);
                      setPreviewAttachment(null);
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-full transition-colors cursor-pointer border-none text-slate-400 hover:text-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

               <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 rounded-xl p-4 min-h-[40vh] relative">
                {previewAttachment.contentType.startsWith('image/') ? (
                  <img
                    src={previewAttachment.url}
                    alt={previewAttachment.filename}
                    referrerPolicy="no-referrer"
                    className="max-h-[65vh] max-w-full object-contain mx-auto rounded-lg shadow-md"
                  />
                ) : previewAttachment.contentType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(previewAttachment.filename) ? (
                  <div className="w-full max-w-lg p-8 rounded-xl bg-slate-900 border border-slate-850 flex flex-col items-center gap-4">
                    <Music className="w-12 h-12 text-blue-405 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-300">Ambient Playback</span>
                    <audio src={previewAttachment.url} controls className="w-full mt-2 font-sans" />
                  </div>
                ) : previewAttachment.contentType.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(previewAttachment.filename) ? (
                  <video src={previewAttachment.url} controls className="max-h-[65vh] w-full rounded-lg" />
                ) : (
                  <iframe
                    src={previewAttachment.url}
                    title={previewAttachment.filename}
                    className="w-full h-[65vh] bg-white rounded-lg border-0"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification HUD stack */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.90, transition: { duration: 0.15 } }}
              className={`p-3.5 sm:p-4 rounded-xl border shadow-2xl flex items-center gap-3 font-sans font-semibold text-xs tracking-wide pointer-events-auto select-text border-none text-white ${
                toast.type === 'error'
                  ? 'bg-rose-600'
                  : toast.type === 'info'
                    ? 'bg-slate-800'
                    : 'bg-emerald-600'
              }`}
            >
              <div className="shrink-0">
                {toast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-white stroke-[2.5]" />
                ) : toast.type === 'info' ? (
                  <Info className="w-4 h-4 text-white stroke-[2.5]" />
                ) : (
                  <Check className="w-4 h-4 text-white stroke-[2.5]" />
                )}
              </div>
              <p className="flex-1 leading-snug truncate pr-2">
                {toast.message}
              </p>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/60 hover:text-white transition-colors cursor-pointer text-xs ml-auto shrink-0 bg-transparent border-none outline-none"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
