/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for cross-origin frontend-to-backend requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Set up JSON body payload parser with reasonable limit for rich emails
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini API securely from environment variables only
const geminiApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  ? process.env.GEMINI_API_KEY
  : undefined;

if (!geminiApiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini AI features will be disabled.");
}

const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

let imapPromiseChain: Promise<any> = Promise.resolve();

/**
 * Helper to establish a temporary connection to IMAP, perform an action, and close.
 * This guarantees a stateless, memory-efficient design suitable for containerized environments.
 * It queues calls to execute sequentially, avoiding server-side concurrent connection throttles.
 */
async function executeImapAction<T>(
  auth: any,
  action: (client: ImapFlow) => Promise<T>
): Promise<T> {
  if (!auth || !auth.host || !auth.user || !auth.pass) {
    throw new Error('Incomplete IMAP credentials provided.');
  }

  // Chain and serialize execution of the IMAP connection block
  const resultPromise = imapPromiseChain.then(async () => {
    const client = new ImapFlow({
      host: auth.host,
      port: Number(auth.port) || 993,
      secure: auth.secure !== false, // default true
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
      logger: false,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        try {
          client.close(); // Force close socket connection immediately if hung
        } catch (e) {}
        reject(new Error('IMAP gateway request timed out after 20 seconds.'));
      }, 20000);
    });

    const connectAndRun = async () => {
      await client.connect();
      try {
        return await action(client);
      } finally {
        try {
          await client.logout();
        } catch (logoutErr) {
          // Ignore cleanup failures
        }
      }
    };

    try {
      return await Promise.race([connectAndRun(), timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
  });

  // Catch rejection so the promise chain recovers immediately for subsequent operations
  imapPromiseChain = resultPromise.catch(() => {});

  return resultPromise;
}

/**
 * Map IMAP folder names or attributes to standard client roles
 */
function mapFolderRole(folderName: string, specialUse: string = ''): 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom' {
  const use = specialUse.toLowerCase();
  const name = folderName.toLowerCase();

  if (use === '\\inbox' || name === 'inbox') return 'inbox';
  if (use === '\\sent' || name.includes('sent') || name.includes('sent message') || name.includes('sendte')) return 'sent';
  if (use === '\\drafts' || name.includes('draft')) return 'drafts';
  if (use === '\\trash' || name.includes('trash') || name.includes('deleted') || name.includes('bin') || name.includes('corbeille')) return 'trash';
  if (use === '\\junk' || name.includes('spam') || name.includes('junk') || name.includes('indésirables')) return 'spam';
  if (use === '\\archive' || name.includes('archive') || name.includes('archiv')) return 'archive';

  return 'custom';
}

// ==================== API ENDPOINTS ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Test Connection & Get Folders
app.post('/api/imap/test', async (req: express.Request, res: express.Response) => {
  const { auth } = req.body;
  try {
    const folders = await executeImapAction(auth, async (client) => {
      const list = await client.list();
      return list.map(item => {
        const specialUseFlag = item.specialUse || '';
        return {
          name: item.path,
          label: item.name,
          role: mapFolderRole(item.path, specialUseFlag),
        };
      });
    });

    res.json({ success: true, folders });
  } catch (error: any) {
    console.error('IMAP Test Error:', error);
    res.status(401).json({ success: false, error: error.message || 'Connection failed' });
  }
});

// Get Folders
app.post('/api/imap/folders', async (req: express.Request, res: express.Response) => {
  const { auth } = req.body;
  try {
    const folders = await executeImapAction(auth, async (client) => {
      let list;
      try {
        // Use pipelined status queries for high performance on supporting servers
        list = await client.list({ statusQuery: { messages: true, unseen: true } });
      } catch (err) {
        console.warn('client.list with statusQuery failed, falling back to simple list:', err);
        list = await client.list();
      }
      
      const structuredFolders = [];
      for (const item of list) {
        let unreadCount = 0;
        let totalCount = 0;
        
        const flagsArray = Array.from(item.flags || []);
        const isNoselect = flagsArray.some((f: string) => f.toLowerCase() === '\\noselect');

        if (item.status) {
          unreadCount = item.status.unseen || 0;
          totalCount = item.status.messages || 0;
        } else if (!isNoselect) {
          try {
            // Fallback status check on selectable folders
            const status = await client.status(item.path, { unseen: true, messages: true });
            unreadCount = status.unseen || 0;
            totalCount = status.messages || 0;
          } catch {
            // Status check might fail/not be allowed, swallow and default
          }
        }

        structuredFolders.push({
          name: item.path,
          label: item.name,
          role: mapFolderRole(item.path, item.specialUse || ''),
          unreadCount,
          totalCount,
        });
      }
      return structuredFolders;
    });

    res.json({ success: true, folders });
  } catch (error: any) {
    console.error('IMAP Get Folders Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed listing folders' });
  }
});

// Get Message Headers
app.post('/api/imap/messages', async (req: express.Request, res: express.Response) => {
  const { auth, folder = 'INBOX', limit = 40, skip = 0, search = '' } = req.body;

  try {
    const result = await executeImapAction(auth, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const total = client.mailbox ? client.mailbox.exists : 0;
        if (total === 0) {
          return { messages: [], total: 0 };
        }

        let messageUids: number[] = [];

        if (search && search.trim() !== '') {
          // Perform search by keyword or parsed filter qualifiers
          const queryStr = search.trim();
          const lowerQuery = queryStr.toLowerCase();
          
          let searchCriteria: any;
          if (lowerQuery === 'is:unread' || lowerQuery === 'unread' || lowerQuery === 'unseen') {
            searchCriteria = { seen: false };
          } else if (lowerQuery === 'is:starred' || lowerQuery === 'starred' || lowerQuery === 'flagged' || lowerQuery === 'pinned') {
            searchCriteria = { flagged: true };
          } else if (lowerQuery === 'is:read' || lowerQuery === 'read') {
            searchCriteria = { seen: true };
          } else {
            searchCriteria = { or: [{ subject: queryStr }, { body: queryStr }] };
          }

          const uids = await client.search(searchCriteria);
          // Sort reverse (newest first)
          if (Array.isArray(uids)) {
            messageUids = [...uids].reverse();
          }
        } else {
          // No search, fetch by sequence range for latest messages directly
          // Sequence numbers are sequential 1 to N
          const startSeq = Math.max(1, total - skip - limit + 1);
          const endSeq = Math.max(1, total - skip);
          
          if (startSeq > endSeq) {
            return { messages: [], total };
          }

          // Fetch numbers in range, then check their uids
          const range = `${startSeq}:${endSeq}`;
          for await (const msg of client.fetch(range, { uid: true })) {
            if (msg.uid) {
              messageUids.push(msg.uid);
            }
          }
          // Fetch gives sequence order, reverse to display newest first
          messageUids.reverse();
        }

        // Apply pagination limit on UIDs
        const paginatedUids = messageUids.slice(0, limit);
        if (paginatedUids.length === 0) {
          return { messages: [], total: messageUids.length };
        }

        const messages: any[] = [];
        // Fetch detailed envelope and flags for these UIDs
        const queryRange = paginatedUids.join(',');
        for await (const msg of client.fetch(queryRange, {
          envelope: true,
          flags: true,
          size: true,
          bodyStructure: true,
        }, { uid: true })) {
          
          // Map addresses cleanly
          const mapAddresses = (addrs: any[] = []) => {
            return addrs.map(a => ({
              name: a.name || '',
              address: a.address || '',
            }));
          };

          // Basic snippet generation from structure
          let snippet = '';
          
          const messageAttachments: any[] = [];
          try {
            if (msg.bodyStructure) {
              const findAttachments = (node: any) => {
                if (!node) return;
                const disp = node.disposition ? (typeof node.disposition === 'string' ? node.disposition : node.disposition.type) : '';
                const isAttachment = disp && disp.toUpperCase() === 'ATTACHMENT';
                const filename = node.dispositionParameters?.filename 
                  || node.parameters?.name 
                  || node.disposition?.params?.filename 
                  || node.filename 
                  || '';
                
                const isMultipart = node.type && node.type.toLowerCase() === 'multipart';
                if (!isMultipart && (isAttachment || filename)) {
                  messageAttachments.push({
                    filename: filename || 'attachment',
                    contentType: `${node.type || 'application'}/${node.subtype || 'octet-stream'}`,
                    size: node.size || 0,
                  });
                }
                if (Array.isArray(node.childNodes)) {
                  node.childNodes.forEach(findAttachments);
                }
                if (Array.isArray(node.parts)) {
                  node.parts.forEach(findAttachments);
                }
              };
              findAttachments(msg.bodyStructure);
            }
          } catch (err) {
            console.error('Error extracting attachments:', err);
          }

          messages.push({
            uid: msg.uid,
            seq: msg.seq,
            subject: msg.envelope.subject || '(No Subject)',
            from: mapAddresses(msg.envelope.from),
            to: mapAddresses(msg.envelope.to),
            date: msg.envelope.date ? msg.envelope.date.toISOString() : new Date().toISOString(),
            size: msg.size || 0,
            seen: msg.flags.has('\\Seen'),
            flagged: msg.flags.has('\\Flagged'),
            snippet: snippet || '',
            attachments: messageAttachments,
          });
        }

        // Sort resulting messages in same order as paginatedUids (newest first)
        messages.sort((a, b) => {
          return paginatedUids.indexOf(a.uid) - paginatedUids.indexOf(b.uid);
        });

        return {
          messages,
          total: search ? messageUids.length : total,
        };
      } finally {
        lock.release();
      }
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Fetch Messages Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Full Message Detail
app.post('/api/imap/message', async (req: express.Request, res: express.Response) => {
  const { auth, folder = 'INBOX', uid } = req.body;

  if (!uid) {
    res.status(400).json({ success: false, error: 'UID is required' });
    return;
  }

  try {
    const emailDetail = await executeImapAction(auth, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const msg = await client.fetchOne(uid.toString(), {
          source: true,
          flags: true,
        }, { uid: true });

        if (!msg || !msg.source) {
          throw new Error('Message not found or empty source');
        }

        // Parse full MIME data using direct mailparser simpleParser
        const parsed = await simpleParser(msg.source);

        const mapAddresses = (addrs: any) => {
          if (!addrs) return [];
          const list = Array.isArray(addrs) ? addrs : [addrs];
          const results: { name: string; address: string }[] = [];
          for (const item of list) {
            if (item.value) {
              for (const v of item.value) {
                results.push({ name: v.name || '', address: v.address || '' });
              }
            } else if (item.address) {
              results.push({ name: item.name || '', address: item.address || '' });
            }
          }
          return results;
        };

        return {
          uid: msg.uid,
          subject: parsed.subject || '(No Subject)',
          from: mapAddresses(parsed.from),
          to: mapAddresses(parsed.to),
          cc: mapAddresses(parsed.cc),
          bcc: mapAddresses(parsed.bcc),
          date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
          text: parsed.text,
          html: parsed.html || (parsed.text ? `<div style="white-space: pre-wrap;">${parsed.text}</div>` : ''),
          seen: msg.flags.has('\\Seen'),
          flagged: msg.flags.has('\\Flagged'),
          attachments: (parsed.attachments || []).map(att => ({
            filename: att.filename || 'unnamed',
            contentType: att.contentType,
            size: att.size,
            contentId: att.contentId,
          })),
          listUnsubscribe: typeof parsed.headers.get('list-unsubscribe') === 'string'
            ? parsed.headers.get('list-unsubscribe') as string
            : Array.isArray(parsed.headers.get('list-unsubscribe'))
              ? (parsed.headers.get('list-unsubscribe') as string[])[0]
              : parsed.headers.get('list-unsubscribe')
                ? String(parsed.headers.get('list-unsubscribe'))
                : undefined,
          folder,
        };
      } finally {
        lock.release();
      }
    });

    res.json({ success: true, email: emailDetail });
  } catch (error: any) {
    console.error('Fetch Message Detail Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download attachment endpoint
app.post('/api/imap/attachment/download', async (req: express.Request, res: express.Response) => {
  const { auth, folder = 'INBOX', uid, filename } = req.body;

  if (!uid || !filename) {
    res.status(400).json({ success: false, error: 'UID and filename are required' });
    return;
  }

  try {
    const fileData = await executeImapAction(auth, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const msg = await client.fetchOne(uid.toString(), { source: true }, { uid: true });
        if (!msg || !msg.source) {
          throw new Error('Message not found');
        }

        const parsed = await simpleParser(msg.source);
        const attachment = (parsed.attachments || []).find(att => att.filename === filename);
        if (!attachment) {
          throw new Error('Attachment not found inside message');
        }

        return {
          filename: attachment.filename || 'attachment',
          contentType: attachment.contentType || 'application/octet-stream',
          contentBase64: attachment.content.toString('base64'),
        };
      } finally {
        lock.release();
      }
    });

    res.json({ success: true, ...fileData });
  } catch (error: any) {
    console.error('Download Attachment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Perform Flag / Move Actions
app.post('/api/imap/action', async (req: express.Request, res: express.Response) => {
  const { auth, folder = 'INBOX', uid, action, targetFolder } = req.body;

  if (!uid) {
    res.status(400).json({ success: false, error: 'UID is required' });
    return;
  }

  try {
    await executeImapAction(auth, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        if (action === 'markRead') {
          await client.messageFlagsAdd(uid.toString(), ['\\Seen'], { uid: true });
        } else if (action === 'markUnread') {
          await client.messageFlagsRemove(uid.toString(), ['\\Seen'], { uid: true });
        } else if (action === 'star') {
          await client.messageFlagsAdd(uid.toString(), ['\\Flagged'], { uid: true });
        } else if (action === 'unstar') {
          await client.messageFlagsRemove(uid.toString(), ['\\Flagged'], { uid: true });
        } else if (action === 'move') {
          if (!targetFolder) {
            throw new Error('Target folder required for move action');
          }
          await client.messageMove(uid.toString(), targetFolder, { uid: true });
        } else if (action === 'delete') {
          // Try to find custom Trash folder using attributes
          const list = await client.list();
          const trashFolder = list.find(item => item.specialUse === '\\Trash' || item.name.toLowerCase().includes('trash') || item.name.toLowerCase().includes('bin'));
          
          if (trashFolder && trashFolder.path !== folder) {
            await client.messageMove(uid.toString(), trashFolder.path, { uid: true });
          } else {
            // Hard delete as fallback
            await client.messageFlagsAdd(uid.toString(), ['\\Deleted'], { uid: true });
          }
        }
      } finally {
        lock.release();
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('IMAP Action Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Empty Trash Folder
app.post('/api/imap/empty-trash', async (req: express.Request, res: express.Response) => {
  const { auth, folder } = req.body;

  if (!folder) {
    res.status(400).json({ success: false, error: 'Trash folder name is required' });
    return;
  }

  try {
    await executeImapAction(auth, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const status = await client.status(folder, { messages: true });
        if (status.messages && status.messages > 0) {
          await client.messageDelete('1:*', { uid: false });
        }
      } finally {
        lock.release();
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Empty Trash Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to empty Trash' });
  }
});

// SMTP Send Mail
app.post('/api/smtp/send', async (req: express.Request, res: express.Response) => {
  const { auth, mail } = req.body;

  if (!auth || !auth.host || !auth.user || !auth.pass) {
    res.status(400).json({ success: false, error: 'Incomplete SMTP credentials' });
    return;
  }

  if (!mail || !mail.to || !mail.subject || !mail.body) {
    res.status(400).json({ success: false, error: 'Incomplete send mail payload' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: auth.host,
      port: Number(auth.port) || 465,
      secure: auth.secure !== false,
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
      connectionTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"${auth.user}" <${auth.user}>`,
      to: mail.to,
      cc: mail.cc || undefined,
      bcc: mail.bcc || undefined,
      subject: mail.subject,
      text: mail.body,
      html: mail.isHtml ? mail.body : undefined,
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('SMTP Send Error:', error);
    res.status(500).json({ success: false, error: error.message || 'SMTP Connection failed' });
  }
});

// Gemini AI Summary & Smart Reply
app.post('/api/ai/summarize', async (req: express.Request, res: express.Response) => {
  const { subject, body } = req.body;

  if (!ai) {
    res.status(503).json({ success: false, error: 'Gemini AI features are not configured in the host environment' });
    return;
  }

  if (!body) {
    res.status(400).json({ success: false, error: 'HTML/Text body is required' });
    return;
  }

  try {
    // Sanitize string size for prompt speed
    const textSegment = body.replace(/<[^>]*>/g, ' ').substring(0, 3000);

    const systemText = `You are a high-efficiency email assistant for a modern Gmail/Google Inbox clone. 
Your task is to analyze the email header (subject) and partial body content.
Generate a structured, elegant summary and 3 concise, extremely helpful "Smart Reply" suggestions.
Return your answer in plain JSON matching the schema:
{
  "summary": "1-2 sentence crystal clear summary of the email's primary request or update.",
  "suggestions": [
     "Suggestion Reply 1 (e.g. Sure, sounds perfect! See you then.)",
     "Suggestion Reply 2",
     "Suggestion Reply 3"
  ]
}
Be conversational but professional, adopting a direct, polite tone. Use the recipient's perspective. Do not include markdown code block syntax (like \`\`\`json) in your actual response, reply ONLY with standard parseable JSON text.`;

    const promptText = `Subject: ${subject || '(No Subject)'}\nContent: ${textSegment}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemText,
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('Emply response from Gemini API');
    }

    const aiRes = JSON.parse(response.text.trim());
    res.json({ success: true, ai: aiRes });
  } catch (error: any) {
    console.error('Gemini API Summarize Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/generate-reply', async (req: express.Request, res: express.Response) => {
  const { subject, body, tone, keypoints } = req.body;

  if (!ai) {
    res.status(503).json({ success: false, error: 'Gemini AI features are not configured in the host environment' });
    return;
  }

  try {
    const textSegment = (body || '').replace(/<[^>]*>/g, ' ').substring(0, 3000);
    const toneText = tone || 'professional';

    const systemText = `You are an expert AI email helper for DrewMail, a Google Inbox-style email client.
Your task is to draft a reply email to an incoming email.
Make sure the reply is written from the recipient's perspective, responding perfectly to keypoints/tone.
Adopt a clear, elegant, natural writing tone. Avoid placeholders like "[Your Name]"—omit names/signature if unknown.
Return your response in parseable JSON matching the schema:
{
  "reply": "The fully drafted reply text."
}
Do not include markdown blocks like \`\`\`json.`;

    const promptText = `Incoming Email Subject: ${subject || '(No Subject)'}
Content: ${textSegment}
Tone: ${toneText}
Instructions or keypoints: ${keypoints || '(No special instructions, reply professionally)'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemText,
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini API');
    }

    const aiRes = JSON.parse(response.text.trim());
    res.json({ success: true, reply: aiRes.reply });
  } catch (error: any) {
    console.error('Gemini API Generate Reply Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/search-assist', async (req: express.Request, res: express.Response) => {
  const { query, emails } = req.body;

  if (!ai) {
    res.status(503).json({ success: false, error: 'Gemini AI features are not configured in the host environment' });
    return;
  }

  try {
    const systemText = `You are "DrewMail Search Intelligence", a smart assistant inside a Google Inbox-inspired email client.
You are given a user's natural language search query and a list of matching email headers and snippets.
Your job is to write a highly polished, friendly, human-centric summary answering the search query based on these emails.
Provide your answer in a natural, helpful, conversational tone, resembling personal intelligence dashboards like "Google Now".
Use bullet points, bold key data, and highlights representing times, flight numbers, package details, rentals, or prices.
Keep the answer brief and straight to the point (no more than 3 paragraphs). If the emails do not contain relevant information, state that politely.`;

    const emailsPromptList = (emails || []).slice(0, 10).map((m: any, idx: number) => {
      const sender = m.from?.[0]?.name || m.from?.[0]?.address || 'Unknown';
      return `${idx + 1}. [From: ${sender}] [Subject: ${m.subject}] Date: ${m.date}\nSnippet: ${m.snippet || ''}`;
    }).join('\n\n');

    const promptText = `User Search Query: "${query}"\n\nMatching Emails:\n${emailsPromptList || 'No matching emails found.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemText,
      }
    });

    res.json({ success: true, answer: response.text || 'No summarization generated.' });
  } catch (error: any) {
    console.error('Gemini API Search Assist Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== VITE MIDDLEWARE INTERACTION ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Apply Vite middleware configuration to proxy frontend assets seamlessly
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in Dev Mode.');
  } else {
    // Standard Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.json({
          status: 'ok',
          message: 'DMail AI Backend is running securely in production mode.',
          time: new Date().toISOString()
        });
      }
    });
    console.log('Serving compiled static frontend from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to launch full-stack server:', err);
});
