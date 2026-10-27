import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  Send,
  X,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Clock,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { mockApi } from '../../services/mockApi.js';

/**
 * PlaceTrack Demo Inbox Modal
 * - Displays participant-scoped conversations stored in the shared mock store.
 * - Clean, professional monochrome design (black/white/neutral greys).
 * - Fixed horizontal composer row with perfectly aligned Send icon and text.
 * - Supports opening a specific recipient's conversation via custom DOM events.
 * - Validates empty messages and persists messages across navigation and refresh.
 */
export const DemoInboxModal = ({ isOpen, onClose, initialTarget = null }) => {
  const { user, role } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [permittedContacts, setPermittedContacts] = useState([]);
  const [showNewThreadPicker, setShowNewThreadPicker] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [draftText, setDraftText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const loadInboxData = async (preferredConvId = null) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [convList, contacts] = await Promise.all([
        mockApi.getConversations({ userId: user.id, role }),
        mockApi.getPermittedMessagingContacts({ userId: user.id, role }),
      ]);
      setConversations(convList);
      setPermittedContacts(contacts);
      if (preferredConvId) {
        setActiveConvId(preferredConvId);
      } else if (!activeConvId && convList.length > 0) {
        setActiveConvId(convList[0].id);
      } else if (activeConvId && !convList.some((c) => c.id === activeConvId)) {
        setActiveConvId(convList[0]?.id || null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    let isMounted = true;

    const init = async () => {
      if (initialTarget?.targetParticipant) {
        try {
          const opened = await mockApi.openOrCreateConversation({
            currentUser: { ...user, role },
            targetParticipant: initialTarget.targetParticipant,
            subject: initialTarget.subject || '',
          });
          if (isMounted) {
            await loadInboxData(opened.id);
            setShowNewThreadPicker(false);
          }
        } catch (err) {
          if (isMounted) {
            setValidationError(err.message || 'Unable to open conversation.');
            await loadInboxData();
          }
        }
      } else {
        await loadInboxData();
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id, role, initialTarget]);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  useEffect(() => {
    if (isOpen && activeConversation?.id && activeConversation.unread) {
      mockApi.markConversationRead(activeConversation.id, user?.id, role).then(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id ? { ...c, unread: false } : c
          )
        );
      });
    }
  }, [isOpen, activeConversation?.id]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeConversation?.messages?.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectContact = async (contact) => {
    setValidationError('');
    try {
      const opened = await mockApi.openOrCreateConversation({
        currentUser: { ...user, role },
        targetParticipant: contact,
        subject: `Placement Coordination — ${contact.name}`,
      });
      await loadInboxData(opened.id);
      setShowNewThreadPicker(false);
      setContactSearch('');
    } catch (err) {
      setValidationError(err.message || 'Could not start conversation.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = draftText.trim();
    if (!trimmed) {
      setValidationError('Please enter a message before sending. Empty messages cannot be sent.');
      return;
    }
    if (!activeConversation) {
      setValidationError('Please select or start a conversation first.');
      return;
    }

    setSending(true);
    try {
      await mockApi.sendMessage({
        conversationId: activeConversation.id,
        sender: {
          id: user?.id,
          name: user?.name,
          role,
        },
        text: trimmed,
      });
      setDraftText('');
      await loadInboxData(activeConversation.id);
    } catch (err) {
      setValidationError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getCounterparty = (conv) => {
    if (!conv || !Array.isArray(conv.participants)) {
      return { name: 'Placement Desk', role: 'STAFF', subtitle: '' };
    }
    return (
      conv.participants.find((p) => p.id !== user?.id) ||
      conv.participants[0] || { name: 'Placement Desk', role: 'STAFF', subtitle: '' }
    );
  };

  const filteredContacts = permittedContacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.subtitle || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl overflow-hidden flex flex-col h-[640px] max-h-[calc(100dvh-2.5rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple, Professional White Header (Bug 1 & 2 Fix) */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E4E4E7] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-[#09090B]" />
            </div>
            <h2 className="text-[15px] font-bold text-[#09090B] tracking-tight">
              Inbox
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
            aria-label="Close Inbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main 2-Pane Split */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-[#E4E4E7]">
          {/* Left Sidebar: Conversations & New Thread Picker */}
          <div className="w-full md:w-80 max-h-56 md:max-h-none shrink-0 flex flex-col bg-[#FAFAFA]">
            <div className="p-3.5 border-b border-[#E4E4E7] flex items-center justify-between gap-2 bg-[#FAFAFA] shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                Conversations ({conversations.length})
              </span>
              <button
                type="button"
                onClick={() => setShowNewThreadPicker((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0B0F] hover:bg-[#18181B] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-white" />
                <span>{showNewThreadPicker ? 'View Threads' : 'New Message'}</span>
              </button>
            </div>

            {showNewThreadPicker ? (
              <div className="flex-1 flex flex-col min-h-0 p-3">
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Filter permitted contacts..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D4D4D8] bg-white text-[12px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B]"
                  />
                </div>
                <p className="text-[11px] text-[#71717A] mb-2 px-1">
                  Select a permitted participant to open or start a thread:
                </p>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleSelectContact(contact)}
                      className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] hover:border-[#D4D4D8] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-bold text-[#09090B] truncate">
                          {contact.name}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#52525B]">
                          {contact.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                        {contact.subtitle}
                      </p>
                    </button>
                  ))}
                  {filteredContacts.length === 0 && (
                    <p className="text-[12px] text-[#A1A1AA] text-center py-6">
                      No matching contacts found.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-[#E4E4E7]">
                {conversations.map((conv) => {
                  const other = getCounterparty(conv);
                  const lastMsg = conv.messages?.[conv.messages.length - 1];
                  const isSelected = activeConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setValidationError('');
                      }}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F4F4F5] border-l-4 border-l-[#0B0B0F]'
                          : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-[#09090B] truncate">
                          {other.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {conv.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#0B0B0F]" />
                          )}
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E4E4E7] text-[#52525B]">
                            {other.role}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-[#52525B] truncate mt-0.5">
                        {conv.subject}
                      </p>
                      {lastMsg ? (
                        <p className="text-[11px] text-[#71717A] truncate mt-1">
                          <strong className="text-[#27272A]">
                            {lastMsg.sender_id === user?.id ? 'You' : lastMsg.sender_name}:
                          </strong>{' '}
                          {lastMsg.text}
                        </p>
                      ) : (
                        <p className="text-[11px] italic text-[#A1A1AA] mt-1">
                          No messages yet — send the first message below.
                        </p>
                      )}
                    </button>
                  );
                })}
                {!loading && conversations.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-[12px] font-semibold text-[#52525B]">
                      No conversations yet
                    </p>
                    <p className="text-[11px] text-[#A1A1AA] mt-1">
                      Click &ldquo;New Message&rdquo; above to message a permitted participant.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Pane: Active Thread History & Composer */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {activeConversation ? (
              <>
                {/* Thread Header */}
                <div className="px-5 py-3 border-b border-[#E4E4E7] flex items-center justify-between gap-4 bg-white shrink-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-[#09090B] truncate">
                        {getCounterparty(activeConversation).name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#3F3F46] border border-[#E4E4E7] shrink-0">
                        {getCounterparty(activeConversation).role}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                      {activeConversation.subject} · {getCounterparty(activeConversation).subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#27272A] bg-[#F4F4F5] border border-[#E4E4E7] px-2.5 py-1 rounded-lg shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#52525B]" />
                    <span className="font-semibold">Participant-Scoped</span>
                  </div>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-[#FAFAFA]/70">
                  {activeConversation.messages?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <div className="w-11 h-11 rounded-2xl bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] flex items-center justify-center mb-3">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <p className="text-[13px] font-bold text-[#09090B]">
                        Start Conversation
                      </p>
                      <p className="text-[12px] text-[#71717A] max-w-sm mt-1">
                        Messages sent here are saved in the shared mock store and visible when viewing as{' '}
                        <strong className="text-[#09090B]">{getCounterparty(activeConversation).name}</strong>.
                      </p>
                    </div>
                  ) : (
                    activeConversation.messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[11px] font-semibold text-[#52525B]">
                              {isMe ? `${msg.sender_name} (You)` : msg.sender_name}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#E4E4E7] text-[#52525B]">
                              {msg.sender_role}
                            </span>
                            <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {msg.timestamp}
                            </span>
                          </div>
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs break-words ${
                              isMe
                                ? 'bg-[#0B0B0F] text-white rounded-br-xs'
                                : 'bg-white border border-[#E4E4E7] text-[#09090B] rounded-bl-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Validation Banner */}
                {validationError && (
                  <div className="px-4 py-2 bg-[#FEF2F2] border-t border-[#FECACA] flex items-center justify-between gap-2 text-[12px] text-[#B91C1C] shrink-0">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-medium">{validationError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValidationError('')}
                      className="text-[#B91C1C] hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Message Composer (Bug 3 & 4 Fix: Clean horizontal flex row) */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 sm:p-4 border-t border-[#E4E4E7] bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0"
                >
                  <div className="flex-1 min-w-0">
                    <label className="sr-only" htmlFor="demo-inbox-message-input">
                      Compose message
                    </label>
                    <textarea
                      id="demo-inbox-message-input"
                      rows={2}
                      value={draftText}
                      onChange={(e) => {
                        setDraftText(e.target.value);
                        if (validationError) setValidationError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder={`Write a message to ${getCounterparty(activeConversation).name}... (Press Enter to send)`}
                      className="w-full rounded-xl border border-[#D4D4D8] bg-[#FAFAFA] focus:bg-white px-3.5 py-2.5 text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] resize-none leading-relaxed transition-colors min-h-[44px] max-h-24"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex flex-row items-center justify-center gap-2 px-5 h-11 rounded-xl bg-[#0B0B0F] hover:bg-[#18181B] text-white text-[13px] font-medium whitespace-nowrap min-w-[170px] shrink-0 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    <Send className="w-4 h-4 text-white shrink-0" />
                    <span>{sending ? 'Saving...' : 'Send Message'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="w-10 h-10 text-[#D4D4D8] mb-2" />
                <p className="text-[14px] font-bold text-[#27272A]">
                  Select a Conversation
                </p>
                <p className="text-[12px] text-[#71717A] mt-1">
                  Choose a thread on the left or click &ldquo;New Message&rdquo; to start a conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
