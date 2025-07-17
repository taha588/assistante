import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatRole, Attachment } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CopyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MessageBubble = ({ message, t }: { message: Message; t: (key: string) => string; }) => {
  const isUser = message.role === ChatRole.User;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const bubbleStyles = isUser
    ? 'bg-sky-600 text-white rounded-br-none'
    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none';

  const copyButtonStyles = isUser
    ? 'bg-sky-700 hover:bg-sky-800 text-sky-200'
    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300';
    
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-700 dark:bg-sky-400 text-white flex items-center justify-center shadow-md">
          <BotIcon className="w-7 h-7" />
        </div>
      )}
      <div className="relative group max-w-md lg:max-w-2xl">
        <div className={`px-4 py-3 rounded-xl shadow-md ${bubbleStyles}`}>
            {message.content && (
                 <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc space-y-1 pl-4 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal space-y-1 pl-4 mb-2" {...props} />,
                            a: ({node, ...props}) => <a className="text-sky-400 hover:text-sky-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            )}
             {message.attachments && message.attachments.length > 0 && (
                <div className={`mt-2 grid gap-2 grid-cols-2 sm:grid-cols-3`}>
                    {message.attachments.map((att, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden">
                             <img src={att.data} alt={att.name} className="w-full h-auto object-cover" />
                        </div>
                    ))}
                </div>
            )}
            {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-300/50 dark:border-slate-600/50">
                    <h4 className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-300">{t('sourcesTitle')}</h4>
                    <ul className="space-y-1 list-none p-0">
                        {message.sources.map((source, index) => (
                            <li key={index}>
                                <a
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-sky-700 dark:text-sky-300 hover:underline flex items-start gap-1.5"
                                >
                                    <span className="flex-shrink-0 text-slate-500 dark:text-slate-400">[{index + 1}]</span>
                                    <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
        {message.content && (
            <button
                onClick={handleCopy}
                className={`absolute -top-2 -right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${copyButtonStyles}`}
                aria-label={isCopied ? t('copiedAriaLabel') : t('copyAriaLabel')}
            >
                {isCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
            </button>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 dark:bg-slate-500 text-white flex items-center justify-center shadow-md">
          <UserIcon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

interface ChatbotProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string, attachments: Attachment[]) => Promise<void>;
    error: string | null;
    t: (key: string) => string;
}

export const Chatbot = ({ messages, isLoading, onSendMessage, error, t }: ChatbotProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isBotReplying = isLoading && messages.length > 0 && messages[messages.length - 1].role === ChatRole.Model;

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages, attachments]);
  
  const addAttachmentsFromFiles = (files: File[]) => {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      imageFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
              if (loadEvent.target?.result) {
                  const newAttachment: Attachment = {
                      name: file.name || `pasted-image-${Date.now()}.png`,
                      type: file.type,
                      data: loadEvent.target.result as string,
                  };
                  setAttachments(prev => {
                      if (prev.some(att => att.data === newAttachment.data)) {
                          return prev;
                      }
                      return [...prev, newAttachment];
                  });
              }
          };
          reader.readAsDataURL(file);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    addAttachmentsFromFiles(files);

    if (e.target) {
      e.target.value = ''; // Allow selecting the same file again
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      const files = Array.from(e.clipboardData.files);
      if (files.length > 0) {
          e.preventDefault();
          addAttachmentsFromFiles(files);
      }
  };

  const removeAttachment = (nameToRemove: string) => {
    setAttachments(prev => prev.filter(att => att.name !== nameToRemove));
  };


  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) {
      return;
    }
    await onSendMessage(inputValue, attachments);
    setInputValue('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-200 dark:bg-slate-800">
      <div ref={chatLogRef} className="flex-grow p-4 sm:p-6 overflow-y-auto" aria-live="polite">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} t={t} />
        ))}
        {isBotReplying && messages[messages.length - 1].content === '' && (
           <div className="flex items-start gap-3 my-4 justify-start">
             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-700 dark:bg-sky-400 text-white flex items-center justify-center shadow-md">
                <BotIcon className="w-7 h-7" />
            </div>
            <div className="max-w-md lg:max-w-2xl px-4 py-3 rounded-xl shadow-md bg-white dark:bg-slate-700 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
          </div>
        )}
      </div>
      {error && <div className="text-center text-red-500 p-2 text-sm">{error}</div>}
      <div 
        onPaste={handlePaste}
        className="p-4 bg-white dark:bg-slate-900/50 border-t border-slate-300 dark:border-slate-700 flex-shrink-0"
      >
         {attachments.length > 0 && (
            <div className="mb-3 p-2 border border-slate-300 dark:border-slate-600 rounded-lg">
                <p className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">{t('attachmentsTitle')}</p>
                <div className="flex flex-wrap gap-2">
                    {attachments.map(att => (
                        <div key={att.name} className="relative bg-slate-100 dark:bg-slate-700 p-1 rounded-md flex items-center text-xs">
                           <img src={att.data} alt={att.name} className="w-10 h-10 rounded-md object-cover mr-2" />
                            <span className="truncate max-w-[100px] text-slate-700 dark:text-slate-300">{att.name}</span>
                            <button onClick={() => removeAttachment(att.name)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600">&times;</button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
           <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 transition-colors"
            aria-label={t('attachFilesAriaLabel')}
          >
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isLoading ? t('inputPlaceholderLoading') : t('inputPlaceholder')}
            className="flex-grow p-3 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-800 dark:text-slate-200"
            disabled={isLoading}
            aria-label={t('messageInputAriaLabel')}
          />
          <button
            type="submit"
            disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label={t('sendMessageAriaLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.54l3.079-1.148a.75.75 0 01.952.952l-1.148 3.079a.75.75 0 00.54.95l4.95 1.414a.75.75 0 00.95-.826l-2.14-7.491a.75.75 0 00-.934-.636l-7.49 2.141z" />
              <path d="M11.959 13.041a.75.75 0 01.952-.952l1.148-3.079a.75.75 0 01-.54-.95l-4.95-1.414a.75.75 0 01-.95.826l2.14 7.492a.75.75 0 01.636.934l7.49-2.14a.75.75 0 01.826-.95l-4.949-1.414a.75.75 0 01-.95-.54l-3.079 1.148z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};