'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StarRating from '@/components/shared/StarRating.jsx';

const ROLES = [
  { value: 'caregiver',  label: 'Caregiver / Parent' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'educator',   label: 'Educator' },
  { value: 'developer',  label: 'Developer' },
  { value: 'other',      label: 'Other' },
];

export default function SurveyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading…</div>}>
      <SurveyForm />
    </Suspense>
  );
}

function SurveyForm() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get('session') ?? null;

  const [role, setRole]         = useState('');
  const [rating, setRating]     = useState(0);
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors]     = useState({});
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error

  async function handleSubmit(evt) {
    evt.preventDefault();
    const e = {};
    if (!rating) e.rating = 'Please select a star rating.';
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStatus('loading');

    try {
      const res = await fetch('/api/platform/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role || null,
          rating,
          feedback: feedback.trim() || null,
          gameSessionId: sessionId,
        }),
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
          <div className="text-7xl mb-4">🙏</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Your feedback helps us improve Horizons for families and researchers alike.
          </p>
          <div className="mt-6 flex justify-center">
            <StarRating value={rating} max={5} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">⭐</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Share Your Feedback</h1>
        <p className="text-slate-500 text-base leading-relaxed">
          Help us improve Horizons for families and researchers
        </p>
        {sessionId && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
            <span>🔗</span>
            <span>Linked to your assessment session</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Role */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Your role <span className="text-slate-400 font-normal">(optional)</span>
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

        {/* Star rating */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Overall rating <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-3">
            <StarRating
              value={rating}
              onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: undefined })); }}
              max={5}
            />
            {rating > 0 && (
              <span className="text-sm text-slate-600 font-medium">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </span>
            )}
          </div>
          {errors.rating && <p className="text-red-500 text-xs">{errors.rating}</p>}
        </div>

        {/* Feedback */}
        <div className="space-y-1.5">
          <Label htmlFor="feedback" className="text-sm font-medium">
            Comments <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What did you think? Any suggestions?"
            rows={4}
            maxLength={1000}
            className="rounded-xl resize-none"
          />
          <p className="text-xs text-slate-400 text-right tabular-nums">
            {feedback.length} / 1000
          </p>
        </div>

        {status === 'error' && (
          <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
        )}

        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-xl h-12 font-semibold text-base"
        >
          {status === 'loading' ? '⏳ Submitting…' : 'Submit Feedback ⭐'}
        </Button>
      </form>
    </div>
  );
}
