'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderIcon,
  TagIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

interface Comparison {
  id: number;
  name: string;
  colleges: string[];
  folder_id: number | null;
  tags: string[];
  created_at: string;
}

interface Folder {
  id: number;
  name: string;
  color: string;
  comparison_count: number;
}

export default function ComparisonManagerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');

  const isPremium = session?.user?.subscriptionTier === 'premium';

  useEffect(() => {
    if (!session) {
      router.push('/login?callbackUrl=/comparison-manager');
      return;
    }

    if (!isPremium) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [session, isPremium]);

  const fetchData = async () => {
    try {
      const [comparisonsRes, foldersRes] = await Promise.all([
        fetch('/api/saved-comparisons'),
        fetch('/api/comparison-folders'),
      ]);

      if (comparisonsRes.ok) {
        const data = await comparisonsRes.json();
        setComparisons(data.comparisons || []);
      }

      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/comparison-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, color: newFolderColor }),
      });

      if (response.ok) {
        setNewFolderName('');
        setShowNewFolderModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const moveToFolder = async (comparisonId: number, folderId: number | null) => {
    try {
      await fetch('/api/saved-comparisons/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comparisonId, folderId }),
      });
      fetchData();
    } catch (error) {
      console.error('Error moving comparison:', error);
    }
  };

  const addTag = async (comparisonId: number, tag: string) => {
    try {
      await fetch('/api/saved-comparisons/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comparisonId, tag }),
      });
      fetchData();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // Filter comparisons
  const filteredComparisons = comparisons.filter((comp) => {
    const matchesFolder = selectedFolder === null || comp.folder_id === selectedFolder;
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.colleges.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = !selectedTag || comp.tags?.includes(selectedTag);
    return matchesFolder && matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(comparisons.flatMap(c => c.tags || [])));

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mb-6">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white font-bold mb-4">
              Premium Feature
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Comparison Manager with Folders & Tags is available for Premium subscribers
            </p>
            <div className="bg-orange-500/10 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-white font-bold mb-4">Organize like a pro:</h3>
              <ul className="text-left space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <FolderIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Folders:</strong> Organize comparisons by type (reach, match, safety)</span>
                </li>
                <li className="flex items-start gap-3">
                  <TagIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Tags:</strong> Label comparisons with custom tags for easy filtering</span>
                </li>
                <li className="flex items-start gap-3">
                  <MagnifyingGlassIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Search & Filter:</strong> Quickly find any comparison</span>
                </li>
                <li className="flex items-start gap-3">
                  <PencilIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Bulk Operations:</strong> Move or tag multiple comparisons at once</span>
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-4 rounded-lg text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading comparisons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-bold mb-2">
            Comparison Manager
          </h1>
          <p className="text-lg text-gray-300">
            Organize your comparisons with folders and tags
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search comparisons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            {allTags.length > 0 && (
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white font-bold">Folders</h2>
                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="p-1 text-orange-500 hover:bg-orange-500/10 rounded"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder === null
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <FolderOpenIcon className="w-5 h-5" />
                  <span>All Comparisons</span>
                  <span className="ml-auto text-sm">({comparisons.length})</span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <FolderIcon className="w-5 h-5" style={{ color: selectedFolder === folder.id ? 'white' : folder.color }} />
                    <span>{folder.name}</span>
                    <span className="ml-auto text-sm">({folder.comparison_count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparisons List */}
          <div className="md:col-span-3">
            {filteredComparisons.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-14 text-center">
                <FolderOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No comparisons found</p>
                <Link
                  href="/compare"
                  className="inline-block mt-4 text-orange-500 hover:underline font-medium"
                >
                  Create your first comparison →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComparisons.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-8 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white font-bold mb-1">{comp.name}</h3>
                        <p className="text-sm text-gray-400">
                          {comp.colleges?.length || 0} colleges • {new Date(comp.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/compare?comparison=${comp.id}`}
                          className="p-2 text-orange-500 hover:bg-orange-500/10 rounded"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {comp.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Move to Folder */}
                    <select
                      value={comp.folder_id || ''}
                      onChange={(e) => moveToFolder(comp.id, e.target.value ? parseInt(e.target.value) : null)}
                      className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">No Folder</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Folder Modal */}
        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white font-bold mb-4">Create New Folder</h3>
              <input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Folder Color</label>
                <input
                  type="color"
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
