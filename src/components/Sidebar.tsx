import { useState, useEffect } from 'react';
import { Archive, Trash2, LogOut, ChevronLeft, ChevronRight, Home, FolderPlus } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useNotebookStore from '../store/notebookStore';
import useFolderStore from '../store/folderStore';
import useSidebarStore from '../store/sidebarStore';
import useNoteStore from '../store/noteStore';
import { FolderSection } from './FolderSection';
import { Logo } from './Logo';
import type { Folder, Notebook } from '../types/Note';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut } = useAuthStore();
  const { notebooks, fetchNotebooks, addNotebook, updateNotebook, deleteNotebook } = useNotebookStore();
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

  const handleSignOut = async () => {
    try {
      await signOut();
      setSelectedCategory('all');
      setSelectedFolder(null);
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleAddFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name) {
      await addFolder({
        name,
        user_id: user?.id || '',
        color: '#ffffff',
        is_default: false,
      });
    }
  };

  const handleAddNotebook = async (folderId: string) => {
    const name = prompt('Enter notebook name:');
    if (name) {
      await addNotebook({
        name,
        user_id: user?.id || '',
        color: '#ffffff',
        folder_id: folderId,
      });
    }
  };

  const handleEditFolder = async (folder: Folder) => {
    const newName = prompt('Enter new folder name:', folder.name);
    if (newName && newName !== folder.name) {
      await updateFolder(folder.id, { name: newName });
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}" and all its notebooks?`)) {
      const result = await deleteFolder(folder.id);
      if (!result.success) {
        alert(result.error || 'Failed to delete folder');
        return;
      }
      
      if (selectedFolder === folder.id) {
        setSelectedFolder(null);
        setSelectedCategory('all');
      }
    }
  };

  const handleEditNotebook = async (notebook: Notebook) => {
    const newName = prompt('Enter new notebook name:', notebook.name);
    if (newName && newName !== notebook.name) {
      await updateNotebook(notebook.id, { name: newName });
    }
  };

  const handleDeleteNotebook = async (notebook: Notebook) => {
    const result = await deleteNotebook(notebook.id);
    if (!result.success) {
      alert(result.error || 'Failed to delete notebook');
      return;
    }
    
    if (selectedCategory === notebook.id) {
      setSelectedCategory('all');
    }
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

  const categories = [
    { id: 'all', name: 'All Notes', icon: Home },
    { id: 'archive', name: 'Archive', icon: Archive },
    { id: 'trash', name: 'Trash', icon: Trash2 },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const greeting = `Hello, ${displayName}`;

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300 relative`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-sm z-10 hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={`p-4 ${isCollapsed ? 'items-center' : ''} flex flex-col`}>
        <Logo 
          size={isCollapsed ? "small" : "medium"} 
          className={`mb-6 ${isCollapsed ? 'justify-center' : ''}`}
          minimized={isCollapsed}
        />

        {!isCollapsed && (
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-900">{greeting}</p>
          </div>
        )}

        <nav className="flex-1 w-full">
          <div className="space-y-1 mb-6">
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
                    isCollapsed ? 'justify-center' : 'space-x-3'
                  } px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id && !selectedFolder
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{category.name}</span>}
                </button>
              );
            })}
          </div>

          <div className="mb-4">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
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
            <div className="space-y-1">
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
                />
              ))}
            </div>
          </div>
        </nav>

        <button
          onClick={handleSignOut}
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          } px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-4`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}