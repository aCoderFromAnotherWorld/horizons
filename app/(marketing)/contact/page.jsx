'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLES = [
  { value: 'caregiver',  label: 'Caregiver / Parent' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'educator',   label: 'Educator' },
  { value: 'developer',  label: 'Developer' },
  { value: 'other',      label: 'Other' },
];

const MAX_MSG = 2000;
const MIN_MSG = 5;

export default function ContactPage() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [role, setRole]       = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error

  const [honeypot, setHoneypot] = useState('');

  function validate() {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const e = {};
    if (!email.trim() || !EMAIL_RE.test(email.trim())) e.email = 'A valid email is required.';
    if (message.trim().length < MIN_MSG) e.message = `Message must be at least ${MIN_MSG} characters.`;
    if (message.trim().length > MAX_MSG) e.message = `Message must be at most ${MAX_MSG} characters.`;
    return e;
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    if (status === 'loading') return;
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStatus('loading');

    try {
      const res = await fetch('/api/platform/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null, email, role: role || null, message, website: honeypot }),
      });
      if (!res.ok) throw new Error('server error');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <div className="text-7xl mb-4">✅</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Message sent!</h2>
          <p className="text-slate-500 text-base">
            Thank you for reaching out. We&apos;ll get back to you as soon as possible.
          </p>
          <button
            onClick={() => { setStatus('idle'); setName(''); setEmail(''); setRole(''); setMessage(''); setErrors({}); }}
            className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Send another message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">✉️</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-slate-500 text-base leading-relaxed">
          Questions, collaboration inquiries, or feedback — we&apos;re happy to hear from you.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }}
        />
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            className="rounded-xl h-11"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="you@example.com"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            className={`rounded-xl h-11 ${errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
          />
          {errors.email && <p id="email-error" role="alert" className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Role <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue placeholder="Select your role…" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-sm font-medium">
            Message <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: undefined })); }}
            placeholder="How can we help?"
            rows={5}
            maxLength={MAX_MSG}
            aria-describedby={errors.message ? 'message-error' : 'message-count'}
            aria-invalid={!!errors.message}
            className={`rounded-xl resize-none ${errors.message ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
          />
          <div className="flex justify-between items-center">
            {errors.message
              ? <p id="message-error" role="alert" className="text-red-500 text-xs">{errors.message}</p>
              : <span />}
            <p id="message-count" className={`text-xs tabular-nums ${message.length > MAX_MSG * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
              {message.length} / {MAX_MSG}
            </p>
          </div>
        </div>

        {status === 'error' && (
          <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
        )}

        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-xl h-12 font-semibold text-base"
        >
          {status === 'loading' ? '⏳ Sending…' : 'Send Message ✉️'}
        </Button>
      </form>
    </div>
  );
}
