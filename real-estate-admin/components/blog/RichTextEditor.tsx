'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Link2, Image as ImageIcon, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Quote, Undo, Redo, X, Check
} from 'lucide-react';
import api from '@/lib/api';

import { API_BASE, toFullUrl } from '@/lib/utils';

interface RichTextEditorProps {
  value:    string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl]       = useState('');
  const [showLink, setShowLink]     = useState(false);
  const [showMedia, setShowMedia]   = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaPage, setMediaPage]   = useState(1);
  const [mediaPages, setMediaPages] = useState(1);
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg my-4' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write your blog content here...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value]);

  if (!editor) return null;

  // ── Link ──────────────────────────────────────────────────────
  const applyLink = () => {
    if (!linkUrl) { editor.chain().focus().unsetLink().run(); }
    else { editor.chain().focus().setLink({ href: linkUrl }).run(); }
    setShowLink(false);
    setLinkUrl('');
  };

  // ── Media Library ─────────────────────────────────────────────
  const fetchMedia = async (p = 1, q = mediaSearch) => {
    setMediaLoading(true);
    try {
      const res = await api.get('/admin/media', { params: { page: p, limit: 18, search: q } });
      setMediaItems(res.data.data.items);
      setMediaPages(res.data.data.pages);
      setMediaPage(p);
    } catch {}
    finally { setMediaLoading(false); }
  };

  const openMedia = () => { setShowMedia(true); fetchMedia(1); };

  const insertImage = (url: string, alt = '') => {
    editor.chain().focus().setImage({ src: toFullUrl(url), alt }).run();
    setShowMedia(false);
  };

  const uploadAndInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      insertImage(res.data.data.media.url, res.data.data.media.alt);
    } catch {}
    finally { setUploading(false); e.target.value = ''; }
  };

  const ToolBtn = ({ onClick, active, title, children }: any) => (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded hover:bg-gray-200 transition ${active ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}>
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={15} /></ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {[1,2,3].map(l => (
          <ToolBtn key={l} onClick={() => editor.chain().focus().toggleHeading({ level: l as any }).run()}
            active={editor.isActive('heading', { level: l })} title={`H${l}`}>
            <span className="text-xs font-bold">H{l}</span>
          </ToolBtn>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={15} /></ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <div className="relative">
          <ToolBtn onClick={() => setShowLink(!showLink)} active={editor.isActive('link')} title="Add Link"><Link2 size={15} /></ToolBtn>
          {showLink && (
            <div className="absolute top-8 left-0 z-20 bg-white border rounded-lg shadow-lg p-2 flex gap-2 w-72">
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://example.com" onKeyDown={e => e.key === 'Enter' && applyLink()}
                className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <button type="button" onClick={applyLink} className="text-green-500 hover:text-green-600"><Check size={16} /></button>
              <button type="button" onClick={() => setShowLink(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
          )}
        </div>

        {/* Image */}
        <ToolBtn onClick={openMedia} title="Insert Image"><ImageIcon size={15} /></ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={15} /></ToolBtn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]" />

      {/* Media Modal */}
      {showMedia && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Insert Image</h3>
              <div className="flex gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAndInsert} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                  {uploading ? 'Uploading...' : 'Upload New'}
                </button>
                <button type="button" onClick={() => setShowMedia(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
            </div>
            <div className="p-3 border-b">
              <input value={mediaSearch} onChange={e => { setMediaSearch(e.target.value); fetchMedia(1, e.target.value); }}
                placeholder="Search images..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {mediaLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {mediaItems.map(item => (
                    <div key={item._id} onClick={() => insertImage(item.url, item.alt)}
                      className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition">
                      <img src={toFullUrl(item.url)} alt={item.alt} className="w-full aspect-square object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {mediaPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button disabled={mediaPage === 1} onClick={() => fetchMedia(mediaPage - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
                  <span className="text-sm text-gray-500 py-1">{mediaPage}/{mediaPages}</span>
                  <button disabled={mediaPage === mediaPages} onClick={() => fetchMedia(mediaPage + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
