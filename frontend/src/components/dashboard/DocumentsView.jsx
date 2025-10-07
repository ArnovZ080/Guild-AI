import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Eye, 
  Download, 
  Share, 
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Folder,
  File as FileIconFallback,
  Image,
  Video,
  Music,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

const typeToIcon = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileText,
  pptx: FileText,
  txt: FileText,
  html: FileText,
  mp4: Video,
  mp3: Music,
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  svg: Image,
  folder: Folder,
  zip: FileIconFallback,
};

const typeToBadge = {
  pdf: 'text-red-600 bg-red-100',
  docx: 'text-blue-600 bg-blue-100',
  xlsx: 'text-green-600 bg-green-100',
  pptx: 'text-orange-600 bg-orange-100',
  txt: 'text-gray-600 bg-gray-100',
  html: 'text-purple-600 bg-purple-100',
  mp4: 'text-pink-600 bg-pink-100',
  mp3: 'text-indigo-600 bg-indigo-100',
  jpg: 'text-yellow-600 bg-yellow-100',
  jpeg: 'text-yellow-600 bg-yellow-100',
  png: 'text-yellow-600 bg-yellow-100',
  gif: 'text-yellow-600 bg-yellow-100',
  svg: 'text-yellow-600 bg-yellow-100',
  folder: 'text-blue-600 bg-blue-100',
  zip: 'text-gray-600 bg-gray-100',
};

function getIconForType(ext) {
  const Icon = typeToIcon[ext?.toLowerCase?.()] || FileIconFallback;
  return Icon;
}

function getBadgeForType(ext) {
  return typeToBadge[ext?.toLowerCase?.()] || 'text-gray-600 bg-gray-100';
}

export default function DocumentsView() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDataRoom, setFilterDataRoom] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('lastModified');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Original view uses mockDocuments; wiring to real endpoints will remain, but UI stays identical

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      const matchesDataRoom = filterDataRoom === 'all' || doc.dataRoom === filterDataRoom;
      return matchesSearch && matchesCategory && matchesStatus && matchesDataRoom;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'size': comparison = parseFloat(a.size) - parseFloat(b.size); break;
        case 'uploadDate': comparison = new Date(a.uploadDate) - new Date(b.uploadDate); break;
        case 'lastModified': comparison = new Date(a.lastModified) - new Date(b.lastModified); break;
        default: comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleViewDocument = (document) => {
    alert(`Document Viewer: Opening "${document.name}"`);
  };

  const handleDownloadDocument = (document, format = 'original') => {
    setShowDownloadOptions(false);
  };

  const handleShareDocument = (document) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleReanalyzeDocument = (document) => {
    alert('AI re-analysis started');
  };

  const handleAcceptRecommendations = (document) => {
    alert('Recommendations initiated');
  };

  function inferTypeFromMimeOrPath(mime, path) { return 'file'; }

  function makeMockDocuments(rooms) {
    const r1 = rooms[0] || { id: 'wf-mock-1', name: 'Marketing Campaigns' };
    const r2 = rooms[1] || { id: 'wf-mock-2', name: 'Customer Insights' };
    return [
      {
        id: 'mock-doc-1',
        name: 'Marketing Brief Q3.md',
        type: 'docx',
        size: '180 KB',
        uploadDate: new Date(),
        lastModified: new Date(),
        status: 'processed',
        category: 'marketing',
        tags: ['brief','q3','strategy'],
        dataRoomId: r1.id,
        dataRoomName: r1.name,
        provider: 'workspace',
        accessLevel: 'internal',
        version: '1.0',
        url: '',
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        workflowId: 'wf-mock-1',
      },
      {
        id: 'mock-doc-2',
        name: 'Customer Feedback Analysis.xlsx',
        type: 'xlsx',
        size: '512 KB',
        uploadDate: new Date(),
        lastModified: new Date(),
        status: 'reviewed',
        category: 'analytics',
        tags: ['sentiment','csat','retention'],
        dataRoomId: r2.id,
        dataRoomName: r2.name,
        provider: 'workspace',
        accessLevel: 'team',
        version: '2.0',
        url: '',
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        workflowId: 'wf-mock-2',
      },
      {
        id: 'mock-doc-3',
        name: 'Hero Banner.png',
        type: 'png',
        size: '2.3 MB',
        uploadDate: new Date(),
        lastModified: new Date(),
        status: 'indexed',
        category: 'media',
        tags: ['image','creative'],
        dataRoomId: r1.id,
        dataRoomName: r1.name,
        provider: 'workspace',
        accessLevel: 'internal',
        version: '1.0',
        url: '',
        mime: 'image/png',
        workflowId: 'wf-mock-1',
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-2">All deliverables and assets organized by their originating task/workflow.</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search documents..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="business">Business</option>
              <option value="analytics">Analytics</option>
              <option value="marketing">Marketing</option>
              <option value="legal">Legal</option>
              <option value="media">Media</option>
              <option value="general">General</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="indexed">Indexed</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="reviewed">Reviewed</option>
            </select>
            <select value={filterDataRoom} onChange={(e) => setFilterDataRoom(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Data Rooms</option>
              {dataRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="lastModified">Last Modified</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="uploadDate">Upload Date</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
            <div className="flex items-center space-x-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        <AnimatePresence>
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onOpenTask={() => openTaskDocuments(doc)}
              onPreview={() => openPreview(doc)}
              onDownload={(fmt) => onDownload(doc, fmt)}
              onShare={(payload) => onShare(doc, payload)}
              onReanalyze={() => onReanalyze(doc)}
              onAccept={(recs) => onAcceptRecommendations(doc, recs)}
              showDownloadMenu={showDownloadMenu}
              setShowDownloadMenu={setShowDownloadMenu}
            />
          ))}
        </AnimatePresence>
      </div>

      <TaskDocumentsModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        seedDoc={selectedCard}
        onPreview={openPreview}
        onDownload={onDownload}
      />

      <DocumentPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} document={previewDoc} />
    </div>
  );
}

function DocumentCard({ doc, onOpenTask }) {
  const Icon = getIconForType(doc.type);
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.02 }}
      onClick={onOpenTask}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`p-3 rounded-lg ${getBadgeForType(doc.type)}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate" title={doc.name}>{doc.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{doc.type || 'file'} • {doc.size || ''}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-1 items-end">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{doc.status || 'indexed'}</span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800" title={doc.dataRoomName}>{doc.dataRoomName}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Data Room:</span>
          <span className="font-medium text-gray-900 truncate" title={doc.dataRoomName}>{doc.dataRoomName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Version:</span>
          <span className="font-medium text-gray-900">{doc.version || '1.0'}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">AI Insights</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">Click to view analysis summary and recommendations.</p>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {(doc.tags || []).slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
        ))}
        {(doc.tags || []).length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{(doc.tags || []).length - 3}</span>
        )}
      </div>
    </motion.div>
  );
}

function inferTypeFromMimeOrPath(mime, path) {
  if (mime) {
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('word') || mime.includes('officedocument.word')) return 'docx';
    if (mime.includes('excel') || mime.includes('spreadsheet')) return 'xlsx';
    if (mime.includes('powerpoint') || mime.includes('presentation')) return 'pptx';
    if (mime.startsWith('image/')) return (mime.split('/')[1] || 'jpg');
    if (mime.startsWith('video/')) return 'mp4';
    if (mime.startsWith('audio/')) return 'mp3';
    if (mime.includes('html')) return 'html';
    if (mime.includes('text')) return 'txt';
  }
  if (path) {
    const ext = path.split('.').pop();
    return ext || 'file';
  }
  return 'file';
}

function suggestDownloadName(doc, format) {
  const base = doc.name?.replace(/\s+/g, '_') || 'document';
  if (format === 'original') return base;
  const ext = ({ pdf: 'pdf', google: 'zip', office: 'zip', image: 'png' })[format] || 'bin';
  return `${base}.${ext}`;
}


