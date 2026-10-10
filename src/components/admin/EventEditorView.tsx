import React, { useState, useEffect } from 'react';
import type { EventConfig, ScheduleItem, PrizeItem, FaqItem, ContactPerson } from '../../types';
import { api } from '../../lib/api';
import {
  IconCheck,
  IconUpload,
  IconExternalLink,
  IconAlertCircle,
  IconPlus,
  IconTrash,
} from '../../lib/icons';

interface EventEditorViewProps {
  onViewPublic: () => void;
}

export const EventEditorView: React.FC<EventEditorViewProps> = ({ onViewPublic }) => {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getEventConfig().then(setConfig).catch(console.error);
  }, []);

  if (!config) {
    return (
      <div className="py-20 text-center text-sm text-[#8C8C85]">
        Loading event settings...
      </div>
    );
  }

  const handleFieldChange = (field: keyof EventConfig, value: unknown) => {
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'banner_url' | 'logo_url' | 'genlab_logo_url' | 'gpay_qr_url'
  ) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const res = await api.uploadEventImage(file);
        handleFieldChange(field, res.url);
      } catch (err: unknown) {
        alert((err as Error).message || 'Failed to upload image.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await api.updateEventConfig(config);
      setConfig(res.config);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Schedule helpers
  const handleAddSchedule = () => {
    const items = [...(config.schedule || [])];
    items.push({ time: '09:00 AM', title: 'New Session', description: 'Session details', tag: 'Keynote' });
    handleFieldChange('schedule', items);
  };
  const handleUpdateSchedule = (idx: number, field: keyof ScheduleItem, val: string) => {
    const items = [...(config.schedule || [])];
    items[idx] = { ...items[idx], [field]: val };
    handleFieldChange('schedule', items);
  };
  const handleRemoveSchedule = (idx: number) => {
    const items = config.schedule.filter((_, i) => i !== idx);
    handleFieldChange('schedule', items);
  };

  // Prize helpers
  const handleAddPrize = () => {
    const items = [...(config.prizes || [])];
    items.push({ rank: '1st Place', amount: '₹25,000', description: 'Winner prize' });
    handleFieldChange('prizes', items);
  };
  const handleUpdatePrize = (idx: number, field: keyof PrizeItem, val: string) => {
    const items = [...(config.prizes || [])];
    items[idx] = { ...items[idx], [field]: val };
    handleFieldChange('prizes', items);
  };
  const handleRemovePrize = (idx: number) => {
    const items = config.prizes.filter((_, i) => i !== idx);
    handleFieldChange('prizes', items);
  };

  // Guidelines helpers
  const handleAddGuideline = () => {
    const items = [...(config.guidelines || [])];
    items.push('New guideline rule');
    handleFieldChange('guidelines', items);
  };
  const handleUpdateGuideline = (idx: number, val: string) => {
    const items = [...(config.guidelines || [])];
    items[idx] = val;
    handleFieldChange('guidelines', items);
  };
  const handleRemoveGuideline = (idx: number) => {
    const items = config.guidelines.filter((_, i) => i !== idx);
    handleFieldChange('guidelines', items);
  };

  // FAQ helpers
  const handleAddFaq = () => {
    const items = [...(config.faq || [])];
    items.push({ question: 'New Question', answer: 'Answer details here.' });
    handleFieldChange('faq', items);
  };
  const handleUpdateFaq = (idx: number, field: keyof FaqItem, val: string) => {
    const items = [...(config.faq || [])];
    items[idx] = { ...items[idx], [field]: val };
    handleFieldChange('faq', items);
  };
  const handleRemoveFaq = (idx: number) => {
    const items = config.faq.filter((_, i) => i !== idx);
    handleFieldChange('faq', items);
  };

  // Contact helpers
  const handleAddContact = () => {
    const items = [...(config.contact || [])];
    items.push({ role: 'Lead Organizer', name: 'Contact Name', phone: '9876543210', email: 'contact@genlab.org' });
    handleFieldChange('contact', items);
  };
  const handleUpdateContact = (idx: number, field: keyof ContactPerson, val: string) => {
    const items = [...(config.contact || [])];
    items[idx] = { ...items[idx], [field]: val };
    handleFieldChange('contact', items);
  };
  const handleRemoveContact = (idx: number) => {
    const items = config.contact.filter((_, i) => i !== idx);
    handleFieldChange('contact', items);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E6DF] pb-6">
        <div>
          <span className="text-xs text-[#8C8C85] font-mono uppercase tracking-wider font-bold block mb-1">
            Content Management System
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
            Event Content
          </h1>
          <p className="text-xs text-[#55554F] mt-1 font-medium">
            All edits save directly to the database and reflect on the public site immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onViewPublic}
            className="h-10 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-xs font-bold text-[#0A0A0A] inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <IconExternalLink size={14} />
            <span>Live preview</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            {saving ? (
              <span>Saving...</span>
            ) : savedSuccess ? (
              <>
                <IconCheck size={15} />
                <span>Changes saved!</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-[#FFF5F5] border border-[#E53935]/30 text-[#E53935] text-xs rounded-xl flex items-center gap-2">
          <IconAlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main CMS Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: General Info */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-6">
            <h2 className="text-base font-bold text-[#0A0A0A] border-b border-[#E6E6DF] pb-3">
              General Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Event Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="field-input w-full"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Tagline / Subheading</label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  className="field-input w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8C8C85]">Event Description</label>
              <textarea
                rows={3}
                value={config.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="field-input w-full resize-none"
              />
            </div>
          </div>

          {/* Section: Date, Time & Venue */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-6">
            <h2 className="text-base font-bold text-[#0A0A0A] border-b border-[#E6E6DF] pb-3">
              Date, Time & Venue
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Date Text</label>
                <input
                  type="text"
                  placeholder="Saturday, October 24, 2026"
                  value={config.date_text}
                  onChange={(e) => handleFieldChange('date_text', e.target.value)}
                  className="field-input w-full"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Time Hours</label>
                <input
                  type="text"
                  placeholder="08:30 AM - 06:00 PM IST"
                  value={config.time_text}
                  onChange={(e) => handleFieldChange('time_text', e.target.value)}
                  className="field-input w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Venue Hall / Building</label>
                <input
                  type="text"
                  placeholder="Auditorium 01, Tech Innovation Center"
                  value={config.venue_name}
                  onChange={(e) => handleFieldChange('venue_name', e.target.value)}
                  className="field-input w-full"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Full Street Address</label>
                <input
                  type="text"
                  placeholder="100 Feet Road, Koramangala 4th Block, Bengaluru"
                  value={config.venue_address}
                  onChange={(e) => handleFieldChange('venue_address', e.target.value)}
                  className="field-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Section: Pricing & UPI */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-6">
            <h2 className="text-base font-bold text-[#0A0A0A] border-b border-[#E6E6DF] pb-3">
              Pricing & Payment Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Price per Person (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={config.price_per_person}
                  onChange={(e) => handleFieldChange('price_per_person', Number(e.target.value))}
                  className="field-input w-full font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">UPI ID / VPA</label>
                <input
                  type="text"
                  value={config.upi_id}
                  onChange={(e) => handleFieldChange('upi_id', e.target.value)}
                  className="field-input w-full font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8C8C85]">Payee Name</label>
                <input
                  type="text"
                  value={config.upi_name}
                  onChange={(e) => handleFieldChange('upi_name', e.target.value)}
                  className="field-input w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section: Schedule Items */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6DF] pb-3">
              <h2 className="text-base font-bold text-[#0A0A0A]">
                Schedule Items ({config.schedule?.length || 0})
              </h2>
              <button
                type="button"
                onClick={handleAddSchedule}
                className="text-xs text-[#0A0A0A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={14} />
                <span>Add session</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.schedule || []).map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Time (e.g. 09:00 AM)"
                      value={item.time}
                      onChange={(e) => handleUpdateSchedule(idx, 'time', e.target.value)}
                      className="field-input text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Session Title"
                      value={item.title}
                      onChange={(e) => handleUpdateSchedule(idx, 'title', e.target.value)}
                      className="field-input text-xs sm:col-span-2"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Tag (e.g. Keynote, Sprint, Lunch)"
                      value={item.tag}
                      onChange={(e) => handleUpdateSchedule(idx, 'tag', e.target.value)}
                      className="field-input text-xs w-1/3"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleUpdateSchedule(idx, 'description', e.target.value)}
                      className="field-input text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSchedule(idx)}
                      className="p-2 text-[#8C8C85] hover:text-[#E53935] cursor-pointer"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Prizes */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6DF] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#0A0A0A]">
                  Prizes ({config.prizes?.length || 0})
                </h2>
                <span className="text-xs text-[#8C8C85]">
                  If empty, the prizes section on the public site will be automatically hidden.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddPrize}
                className="text-xs text-[#0A0A0A] font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <IconPlus size={14} />
                <span>Add prize</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.prizes || []).map((prize, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF] flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Rank (e.g. 1st Place)"
                    value={prize.rank}
                    onChange={(e) => handleUpdatePrize(idx, 'rank', e.target.value)}
                    className="field-input text-xs w-1/4"
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g. ₹25,000)"
                    value={prize.amount}
                    onChange={(e) => handleUpdatePrize(idx, 'amount', e.target.value)}
                    className="field-input text-xs w-1/4 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={prize.description}
                    onChange={(e) => handleUpdatePrize(idx, 'description', e.target.value)}
                    className="field-input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePrize(idx)}
                    className="p-2 text-[#8C8C85] hover:text-[#E53935] cursor-pointer"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Guidelines */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6DF] pb-3">
              <h2 className="text-base font-bold text-[#0A0A0A]">
                Guidelines & Rules ({config.guidelines?.length || 0})
              </h2>
              <button
                type="button"
                onClick={handleAddGuideline}
                className="text-xs text-[#0A0A0A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={14} />
                <span>Add rule</span>
              </button>
            </div>

            <div className="space-y-2">
              {(config.guidelines || []).map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleUpdateGuideline(idx, e.target.value)}
                    className="field-input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGuideline(idx)}
                    className="p-2 text-[#8C8C85] hover:text-[#E53935] cursor-pointer"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: FAQ */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6DF] pb-3">
              <h2 className="text-base font-bold text-[#0A0A0A]">
                Frequently Asked Questions ({config.faq?.length || 0})
              </h2>
              <button
                type="button"
                onClick={handleAddFaq}
                className="text-xs text-[#0A0A0A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={14} />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.faq || []).map((faqItem, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Question"
                      value={faqItem.question}
                      onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                      className="field-input text-xs flex-1 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="p-2 text-[#8C8C85] hover:text-[#E53935] cursor-pointer"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Answer"
                    value={faqItem.answer}
                    onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                    className="field-input text-xs w-full resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Contact Persons */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6DF] pb-3">
              <h2 className="text-base font-bold text-[#0A0A0A]">
                Contact Persons ({config.contact?.length || 0})
              </h2>
              <button
                type="button"
                onClick={handleAddContact}
                className="text-xs text-[#0A0A0A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={14} />
                <span>Add contact</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.contact || []).map((cp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF] grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Role"
                    value={cp.role}
                    onChange={(e) => handleUpdateContact(idx, 'role', e.target.value)}
                    className="field-input text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={cp.name}
                    onChange={(e) => handleUpdateContact(idx, 'name', e.target.value)}
                    className="field-input text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={cp.phone}
                    onChange={(e) => handleUpdateContact(idx, 'phone', e.target.value)}
                    className="field-input text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={cp.email}
                      onChange={(e) => handleUpdateContact(idx, 'email', e.target.value)}
                      className="field-input text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="p-2 text-[#8C8C85] hover:text-[#E53935] cursor-pointer"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Media Uploads */}
        <div className="lg:col-span-4 space-y-6">
          {/* Banner Upload */}
          <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <h2 className="text-sm font-bold text-[#0A0A0A] border-b border-[#E6E6DF] pb-2">
              Hero Banner Image
            </h2>

            <div className="aspect-[16/10] bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] overflow-hidden relative group">
              {config.banner_url ? (
                <img
                  src={config.banner_url}
                  alt="Hero Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#8C8C85]">
                  No banner set (abstract frame used)
                </div>
              )}
              <label className="absolute inset-0 bg-[#0A0A0A]/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[#FAFAF7] text-xs">
                <IconUpload size={20} className="mb-1 text-[#C2E600]" />
                <span>Upload banner image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'banner_url')}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8C8C85]">Or paste image URL</label>
              <input
                type="text"
                value={config.banner_url}
                onChange={(e) => handleFieldChange('banner_url', e.target.value)}
                className="field-input w-full text-xs font-mono"
              />
            </div>
          </div>

          {/* GenLab Logo Upload */}
          <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <h2 className="text-sm font-bold text-[#0A0A0A] border-b border-[#E6E6DF] pb-2">
              GenLab Organiser Logo
            </h2>
            <div className="space-y-2">
              <label className="flex items-center justify-center p-4 border border-dashed border-[#E6E6DF] hover:border-[#0A0A0A] rounded-xl cursor-pointer text-xs text-[#55554F] hover:text-[#0A0A0A] bg-[#FAFAF7]">
                <IconUpload size={16} className="mr-2 text-[#0A0A0A]" />
                <span>Upload GenLab Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'genlab_logo_url')}
                  className="hidden"
                />
              </label>
              {config.genlab_logo_url && (
                <div className="text-xs text-[#8C8C85] truncate font-mono">
                  {config.genlab_logo_url}
                </div>
              )}
            </div>
          </div>

          {/* UPI Payment QR Upload */}
          <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-4">
            <h2 className="text-sm font-bold text-[#0A0A0A] border-b border-[#E6E6DF] pb-2">
              UPI Payment QR
            </h2>

            <div className="w-40 h-40 mx-auto bg-[#FFFFFF] p-2 rounded-xl border border-[#E6E6DF] relative group shadow-sm">
              <img
                src={
                  config.gpay_qr_url ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${config.upi_id}`
                }
                alt="UPI QR Preview"
                className="w-full h-full object-contain"
              />
              <label className="absolute inset-0 bg-[#0A0A0A]/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[#FAFAF7] text-xs text-center p-2 rounded-xl">
                <IconUpload size={18} className="mb-1 text-[#C2E600]" />
                <span>Upload custom QR</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'gpay_qr_url')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
