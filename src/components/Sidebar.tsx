import { useState, useEffect } from 'react';
import { Archive, Trash2, LogOut, ChevronLeft, ChevronRight, Home, FolderPlus } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useNotebookStore from '../store/notebookStore';
import useFolderStore from '../store/folderStore';
import useSidebarStore from '../store/sidebarStore';
import useNoteStore from '../store/noteStore';
import { FolderSection } from './FolderSection';
import { Logo } from './Logo';
import { EditProfileDialog } from './EditProfileDialog';
import type { Folder, Notebook } from '../types/Note';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { user, signOut, refreshSession } = useAuthStore();
  const { notebooks, fetchNotebooks, addNotebook, updateNotebook, deleteNotebook, moveNotebook } = useNotebookStore();
  const { folders, fetchFolders, addFolder, updateFolder, deleteFolder } = useFolderStore();
  const { selectedCategory, setSelectedCategory, selectedFolder, setSelectedFolder } = useSidebarStore();
  const { fetchNotes } = useNoteStore();

  useEffect(() => {
    fetchFolders();
    fetchNotebooks();
  }, [fetchFolders, fetchNotebooks]);

  useEffect(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'archive' && selectedCategory !== 'trash') {
      fetchNotes(selectedCategory);
    } else {
      fetchNotes();
    }
  }, [selectedCategory, fetchNotes]);

  const handleSignOut = async (e: React.MouseEvent) => {
    try {
      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();
      
      // Call signOut which will handle cleanup and navigation
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleAddFolder = async () => {
    if (!user) {
      toast.error('You must be logged in to create a folder');
      return;
    }

    const name = prompt('Enter folder name:');
    if (!name?.trim()) return;

    try {
      await addFolder({
        name: name.trim(),
        user_id: user.id,
        color: '#ffffff',
        is_default: false,
      });
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleAddNotebook = async (folderId: string) => {
    const name = prompt('Enter notebook name:');
    if (!name?.trim()) {
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a notebook');
      return;
    }

    try {
      const notebook = await addNotebook({
        name: name.trim(),
        user_id: user.id,
        color: '#ffffff',
        folder_id: folderId,
      });

      if (!notebook) {
        throw new Error('Failed to create notebook');
      }

      toast.success('Notebook created successfully');
      setSelectedCategory(notebook.id);
      setSelectedFolder(null);
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error('Failed to create notebook');
    }
  };

  const handleEditFolder = async (folder: Folder) => {
    const newName = prompt('Enter new folder name:', folder.name);
    if (newName?.trim() && newName !== folder.name) {
      try {
        await updateFolder(folder.id, { name: newName.trim() });
        toast.success('Folder renamed successfully');
      } catch (error) {
        console.error('Error renaming folder:', error);
        toast.error('Failed to rename folder');
      }
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}" and all its notebooks?`)) {
      const result = await deleteFolder(folder.id);
      if (!result.success) {
        toast.error(result.error || 'Failed to delete folder');
        return;
      }
      
      if (selectedFolder === folder.id) {
        setSelectedFolder(null);
        setSelectedCategory('all');
      }
      toast.success('Folder deleted successfully');
    }
  };

  const handleEditNotebook = async (notebook: Notebook) => {
    const newName = prompt('Enter new notebook name:', notebook.name);
    if (newName?.trim() && newName !== notebook.name) {
      try {
        await updateNotebook(notebook.id, { name: newName.trim() });
        toast.success('Notebook renamed successfully');
      } catch (error) {
        console.error('Error renaming notebook:', error);
        toast.error('Failed to rename notebook');
      }
    }
  };

  const handleDeleteNotebook = async (notebook: Notebook) => {
    const result = await deleteNotebook(notebook.id);
    if (!result.success) {
      toast.error(result.error || 'Failed to delete notebook');
      return;
    }
    
    if (selectedCategory === notebook.id) {
      setSelectedCategory('all');
    }
    toast.success('Notebook deleted successfully');
  };

  const handleFolderClick = (folderId: string) => {
    if (selectedFolder === folderId) {
      setSelectedFolder(null);
      setSelectedCategory('all');
    } else {
      setSelectedFolder(folderId);
      setSelectedCategory('all');
    }
  };

  const handleMoveNotebook = async (notebook: Notebook, newFolderId: string) => {
    const result = await moveNotebook(notebook.id, newFolderId);
    if (!result.success) {
      toast.error(result.error || 'Failed to move notebook');
    } else {
      toast.success('Notebook moved successfully');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await refreshSession();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Failed to refresh profile');
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const greeting = `Hello, ${displayName}`;

  const categories = [
    { id: 'all', name: 'All Notes', icon: Home },
    { id: 'archive', name: 'Archive', icon: Archive },
    { id: 'trash', name: 'Trash', icon: Trash2 },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`relative flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200
      ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 z-10 p-1 bg-gray-200 dark:bg-gray-700 
          rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className={`flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200 w-full overflow-x-hidden`}>
        <Logo 
          size={isCollapsed ? "small" : "medium"} 
          className={`${isCollapsed ? 'justify-center' : ''}`}
          minimized={isCollapsed}
        />

        {!isCollapsed && (
          <div className="mt-6 truncate w-full">
            <button
              onClick={() => setShowProfileDialog(true)}
              className="text-sm font-medium text-gray-900 hover:text-yellow-600 transition-colors truncate w-full text-left"
            >
              {greeting}
            </button>
          </div>
        )}
      </div>

      <div className={`flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-4'} w-full overflow-x-hidden`}>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedFolder(null);
                }}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2' : 'space-x-3 px-3 py-2'
                } rounded-lg transition-colors ${
                  selectedCategory === category.id && !selectedFolder
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={isCollapsed ? 18 : 20} className="flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{category.name}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden">
        <div className={`flex-shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-2 w-full`}>
          {!isCollapsed && <span className="text-sm text-gray-600">Folders</span>}
          {!isCollapsed && (
            <button 
              onClick={handleAddFolder}
              className="p-1 hover:bg-gray-100 rounded"
              title="Add Folder"
            >
              <FolderPlus size={16} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">
          <div className="space-y-1 pb-4">
            {folders.map((folder) => (
              <FolderSection
                key={folder.id}
                folder={folder}
                notebooks={notebooks}
                selectedCategory={selectedCategory}
                selectedFolder={selectedFolder}
                isCollapsed={isCollapsed}
                onSelectCategory={setSelectedCategory}
                onSelectFolder={handleFolderClick}
                onAddNotebook={handleAddNotebook}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
                onEditNotebook={handleEditNotebook}
                onDeleteNotebook={handleDeleteNotebook}
                onMoveNotebook={handleMoveNotebook}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-gray-200 w-full overflow-x-hidden">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          } px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>

      {showProfileDialog && (
        <EditProfileDialog
          currentName={displayName}
          onClose={() => setShowProfileDialog(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}