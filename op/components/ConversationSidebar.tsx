import React, { useState } from 'react';
import { Conversation, AppUser } from '../types';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UserIcon } from './icons/UserIcon';
import { PremiumIcon } from './icons/PremiumIcon';


interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  t: (key: string, params?: any) => string;
  user: AppUser;
  isPremium: boolean;
}

const NewChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
)

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mr-3 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
)

export const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  setIsOpen,
  onLogout,
  t,
  user,
  isPremium
}: ConversationSidebarProps) => {
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (conv: Conversation) => {
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };
  
  const handleRenameSubmit = () => {
    if (editingConvId && editingTitle.trim()) {
      onRenameChat(editingConvId, editingTitle.trim());
    }
    setEditingConvId(null);
    setEditingTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingConvId(null);
      setEditingTitle('');
    }
  };

  const sidebarClasses = `
    absolute md:relative z-20 h-full bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
    flex flex-col transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;
    
  return (
    <>
    {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 z-10 md:hidden" aria-hidden="true"></div>}
    <aside className={sidebarClasses} style={{width: '280px'}}>
      <div className="p-3 flex-shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-400 dark:border-slate-500 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <NewChatIcon />
          {t('newConversationButton')}
        </button>
      </div>
      <nav className="flex-grow overflow-y-auto px-2">
        <ul className="space-y-1">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (editingConvId !== conv.id) {
                    onSelectChat(conv.id);
                  }
                }}
                className={`flex items-center p-2 text-sm font-medium rounded-md group ${
                  conv.id === activeConversationId && !editingConvId
                    ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ChatIcon />
                {editingConvId === conv.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent focus:bg-white dark:focus:bg-slate-600 outline-none ring-1 ring-sky-500 rounded-sm px-1 mx-[-1px] text-slate-800 dark:text-slate-200"
                    autoFocus
                  />
                ) : (
                  <span className="truncate flex-grow">{conv.title}</span>
                )}
                {editingConvId !== conv.id && (
                    <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleStartRename(conv); }} className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600" aria-label={t('renameAriaLabel')}>
                           <EditIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDeleteChat(conv.id); }} className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600" aria-label={t('deleteAriaLabel')}>
                           <DeleteIcon className="w-4 h-4 text-red-600 dark:text-red-500" />
                        </button>
                    </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 flex-shrink-0 border-t border-slate-200 dark:border-slate-700">
           <div className="flex items-center space-x-3">
              {user.profile.picture ? (
                 <img src={user.profile.picture} alt={user.profile.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-500 dark:bg-slate-600 text-white flex items-center justify-center">
                    <UserIcon className="w-6 h-6" />
                </div>
              )}
               <div className="flex-grow truncate">
                   <div className="flex items-center gap-2">
                     <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{user.profile.name}</p>
                     {isPremium && <PremiumIcon className="w-4 h-4 text-amber-400 flex-shrink-0" title={t('premiumIconAriaLabel')} />}
                   </div>
                   {user.profile.email && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.profile.email}</p>}
               </div>
               <button
                    onClick={onLogout}
                    className="flex-shrink-0 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    aria-label={t('logoutButton')}
                >
                    <LogoutIcon className="h-6 w-6" />
                </button>
           </div>
      </div>
    </aside>
    </>
  );
};