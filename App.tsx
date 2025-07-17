import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chatbot } from './components/Chatbot';
import { ConversationSidebar } from './components/ConversationSidebar';
import { Conversation, Message, ChatRole, Attachment, Source, AppUser } from './types';
import { ai } from './services/geminiService';
import { getSystemInstruction, getInitialMessage } from './constants';
import { LoginPage } from './components/LoginPage';
import { getTranslator } from './services/i18n';

export const App = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const t = getTranslator(user?.language || 'fr');

  const isPremium = useMemo(() => {
    if (!user?.premiumExpiresAt) return false;
    return user.premiumExpiresAt > Date.now();
  }, [user]);

  const hadPremiumExpired = useMemo(() => {
    if (!user?.premiumExpiresAt) return false;
    return user.premiumExpiresAt <= Date.now();
  }, [user]);


  // Effect for initial auth check and window resize
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('userData');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Impossible de charger les données utilisateur:", e);
      localStorage.removeItem('userData');
    }
    
    const checkScreenSize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);

  }, []);

  const handleNewChat = useCallback(() => {
    if (!user) return;

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: t('newConversation'),
      messages: [getInitialMessage(user.country, user.language)],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  }, [user, t]);

  // Effect to load conversations or create a new one when user logs in
  useEffect(() => {
    if (!user) return;

    const key = `conversations_${user.profile.sub}`;
    let loaded = false;
    try {
      const savedConversations = localStorage.getItem(key);
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveConversationId(parsed[0].id);
          loaded = true;
        }
      }
    } catch (e) {
      console.error("Impossible de charger les conversations:", e);
    }

    if (!loaded) {
      handleNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Effect to sync active conversation ID if it gets deleted
  useEffect(() => {
    // If the active conversation is no longer in the list, select a new one.
    if (activeConversationId && !conversations.some(c => c.id === activeConversationId)) {
      setActiveConversationId(conversations.length > 0 ? conversations[0].id : null);
    }
  }, [conversations, activeConversationId]);

  // Effect to save conversations to localStorage
  useEffect(() => {
    if (user && conversations.length > 0) {
      const key = `conversations_${user.profile.sub}`;
      localStorage.setItem(key, JSON.stringify(conversations));
    } else if (user && conversations.length === 0) {
      const key = `conversations_${user.profile.sub}`;
      localStorage.removeItem(key);
    }
  }, [conversations, user]);
  
  const handleLogin = (newUser: AppUser) => {
    localStorage.setItem('userData', JSON.stringify(newUser));
    setConversations([]);
    setActiveConversationId(null);
    setUser(newUser); 
  };

  const handleLogout = () => {
    if (!window.confirm(t('confirmLogout'))) {
        return;
    }
    // Clear storage first to prevent race conditions
    if (user) {
        const key = `conversations_${user.profile.sub}`;
        localStorage.removeItem(key);
    }
    localStorage.removeItem('userData');
    
    // Then reset state
    setUser(null);
    setConversations([]);
    setActiveConversationId(null);
    setError(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveConversationId(id);
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  };

  const handleDeleteChat = useCallback((idToDelete: string) => {
    if (!window.confirm(t('confirmDelete'))) {
      return;
    }
    if (!user) return;
    setConversations(prev => prev.filter(c => c.id !== idToDelete));
  }, [t, user]);

  const handleRenameChat = useCallback((idToRename: string, newTitle: string) => {
      setConversations(prev =>
        prev.map(c =>
            c.id === idToRename && newTitle.trim() ? { ...c, title: newTitle.trim() } : c
        )
      );
  }, []);

  const generateConversationTitle = useCallback(async (convId: string, userContent: string, modelContent: string) => {
    if (!user) return;
    try {
        const titlePrompt = t('titleGenerationPrompt');
        const prompt = `${titlePrompt}\n\n---\n\nUSER: "${userContent}"\n\nASSISTANT: "${modelContent}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
            }
        });
        
        let newTitle = response.text.trim().replace(/^"|"$/g, '').replace(/\*/g, '');

        if (newTitle) {
            handleRenameChat(convId, newTitle);
        }

    } catch (err) {
        console.error("Impossible de générer le titre de la conversation:", err);
    }
  }, [user, t, handleRenameChat]);
  
  const handleSendMessage = async (messageText: string, attachments: Attachment[]) => {
    if (!activeConversationId || !user) return;

    if (messageText.trim().toLowerCase() === 'premium') {
      // Simulate buying/renewing a 1-week premium plan
      const newExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const wasAlreadyPremium = isPremium;

      const updatedUser = { ...user, premiumExpiresAt: newExpiry };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      const premiumMessage: Message = {
          id: `bot-${Date.now()}`,
          role: ChatRole.Model,
          content: wasAlreadyPremium ? t('premiumRenewedMessage') : t('premiumActivatedMessage')
      };

      setConversations(prev => prev.map(c => 
          c.id === activeConversationId ? { ...c, messages: [...c.messages, premiumMessage] } : c
      ));
      
      return;
    }

    const userMessage: Message = { 
        id: `user-${Date.now()}`, 
        role: ChatRole.User, 
        content: messageText.trim(),
        attachments: attachments.length > 0 ? attachments : undefined
    };
    const botMessageId = `bot-${Date.now()}`;
    
    let historyForApi: Message[] = [];
    let isNewConversation = false;

    setConversations(prev => {
        return prev.map(c => {
            if (c.id === activeConversationId) {
                historyForApi = [...c.messages, userMessage];
                isNewConversation = c.title === t('newConversation');
                
                return {
                    ...c,
                    messages: [...c.messages, userMessage, { id: botMessageId, role: ChatRole.Model, content: '' }]
                };
            }
            return c;
        });
    });

    setIsLoading(true);
    setError(null);

    try {
        const chatHistoryForGemini = historyForApi
            .filter(m => m.id !== 'initial-bot-message')
            .map(msg => {
                const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [];
                 if (msg.content) {
                    parts.push({ text: msg.content });
                }
                if (msg.attachments) {
                    msg.attachments.forEach(att => {
                         parts.push({
                            inlineData: {
                                mimeType: att.type,
                                data: att.data.split(',')[1]
                            }
                        });
                    });
                }
                return { role: msg.role, parts };
            })
            .filter(content => content.parts.length > 0);
        
        const systemInstruction = getSystemInstruction(user.country, user.languageName, isPremium, hadPremiumExpired);
        
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { 
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
            },
            history: chatHistoryForGemini.slice(0, -1)
        });
        
        const lastMessage = chatHistoryForGemini[chatHistoryForGemini.length - 1];
        const response = await chat.sendMessage({ message: lastMessage.parts });
        
        const fullResponse = response.text;
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        const sources: Source[] = groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any): web is Source => web?.uri && web?.title)
            .reduce((acc: Source[], current: Source) => {
                if (!acc.some(item => item.uri === current.uri)) {
                    acc.push(current);
                }
                return acc;
            }, []);

        setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return {...c, messages: c.messages.map(m => m.id === botMessageId ? {...m, content: fullResponse, sources: sources?.length > 0 ? sources : undefined } : m)};
            }
            return c;
        }));

        if (isNewConversation) {
            generateConversationTitle(activeConversationId, userMessage.content, fullResponse);
        }

    } catch (err) {
      console.error(err);
      const errorMessage = t('errorMessage');
      setError(errorMessage);
       setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return {...c, messages: c.messages.map(m => m.id === botMessageId ? {...m, content: errorMessage} : m)};
            }
            return c;
        }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <ConversationSidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        t={t}
        user={user}
        isPremium={isPremium}
      />
      <div className="flex flex-col flex-1 h-screen">
          <header className="w-full text-center p-4 border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md flex-shrink-0 flex items-center justify-center relative">
            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 absolute left-4"
                aria-label={t('toggleSidebar')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-sky-700 dark:text-sky-400">{t('appTitle')}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('headerSubtitle')} <span className="font-semibold">{user.country}</span></p>
            </div>
          </header>
          <main className="flex-grow flex flex-col items-center overflow-hidden">
            {activeConversation ? (
              <Chatbot
                key={activeConversationId}
                messages={activeConversation.messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                error={error}
                t={t}
              />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                   <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">{t('welcomeMessage')}</h2>
                   <p className="mt-2 text-slate-600 dark:text-slate-400">{t('welcomeInstructions')}</p>
               </div>
            )}
          </main>
          <footer className="text-center p-2 text-xs text-slate-500 dark:text-slate-500 flex-shrink-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
            <p>{t('footerDisclaimer')}</p>
          </footer>
      </div>
    </div>
  );
};