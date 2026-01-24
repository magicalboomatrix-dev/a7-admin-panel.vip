import React, { useState, useEffect } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import imageCompression from "browser-image-compression";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../utils/api";

import {
  FiBold, FiItalic, FiType, FiLink, FiImage, FiAlignLeft,
  FiAlignCenter, FiTrash2, FiSave, FiPlus, FiMove, FiX, FiEye, FiExternalLink
} from "react-icons/fi";
import { MdFormatColorText, MdFormatStrikethrough } from "react-icons/md";

const siteOptions = [
  { label: "A1 Satta", value: "a1satta.vip" },
  { label: "A3 Satta", value: "a3satta.vip" },
  { label: "A7 Satta", value: "a7satta.vip" },
  { label: "B7 Satta", value: "b7satta.vip" },
];

// --- Sub-Component: Individual Ad Editor ---
const AdInstance = ({ ad, position, index, onRemove, onDeleteDB, site }) => {
  const [isCompressing, setIsCompressing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: { 
          class: "text-blue-600 underline cursor-pointer",
          target: '_blank',
          rel: 'noopener noreferrer' 
        },
      }),
      Placeholder.configure({
        placeholder: "Write ad content or paste/drag images here...",
      }),
    ],
    content: ad.content,
    onUpdate: ({ editor }) => {
      ad.content = editor.getHTML();
    },
  });

  // Handle Image Compression & Insertion
  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsCompressing(true);
    try {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
    } catch (error) {
      console.error("Compression failed", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt("Enter URL:", previousUrl);
    
    // If cancelled
    if (url === null) return;

    // If empty, remove link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Fix: Force selection of the node (especially images) before applying link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-4">
      {/* Ad Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="cursor-move p-2 text-gray-400 hover:text-gray-600">
            <FiMove />
          </div>
          <span className="text-sm font-bold text-gray-600 uppercase">{position} #{index + 1}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={onRemove} className="p-2 text-amber-600 hover:bg-amber-50 rounded"><FiX /></button>
          {ad.id && <button onClick={() => onDeleteDB(ad.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FiTrash2 /></button>}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-2 border-b bg-white flex flex-wrap gap-1 items-center">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive("bold") ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}><FiBold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive("italic") ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}><FiItalic /></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded ${editor.isActive("strike") ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}><MdFormatStrikethrough /></button>
        <div className="h-6 w-[1px] bg-gray-200 mx-1" />
        <button onClick={addLink} className={`p-2 rounded ${editor.isActive("link") ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}><FiLink /></button>
        <label className="p-2 rounded hover:bg-gray-100 cursor-pointer relative">
          {isCompressing ? <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" /> : <FiImage />}
          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
        </label>
      </div>

      {/* Floating Image Menu */}
      {editor && (
        <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive("image")}>
          <div className="bg-slate-800 text-white p-1 rounded-lg shadow-xl flex items-center gap-1">
            <button onClick={addLink} className="p-2 hover:bg-slate-700 rounded text-xs flex items-center gap-1">
              <FiLink /> {editor.isActive("link") ? "Change Link" : "Link Image"}
            </button>
            <div className="w-[1px] h-4 bg-slate-600 mx-1" />
            <button onClick={() => editor.chain().focus().deleteSelection().run()} className="p-2 hover:bg-red-500 rounded text-xs flex items-center gap-1">
              <FiTrash2 /> Remove Image
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <div className="p-4 min-h-[150px] prose prose-sm max-w-none focus:outline-none custom-editor">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .custom-editor .ProseMirror { min-height: 120px; outline: none; }
        .custom-editor img { 
          display: inline-block; 
          max-width: 100%; 
          height: auto; 
          border-radius: 8px; 
          cursor: pointer;
          transition: all 0.2s;
        }
        .custom-editor img.ProseMirror-selectednode { outline: 3px solid #3b82f6; }
        .custom-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: #adb5bd; pointer-events: none; height: 0;
        }
        /* Style for linked images */
        .custom-editor a { cursor: pointer; }
      `}</style>
    </div>
  );
};

// --- Main Page Component ---
export default function PremiumAdsEditor() {
  const [ads, setAds] = useState({ top: [], middle: [], bottom: [] });
  const [site, setSite] = useState(siteOptions[0].value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAds();
  }, [site]);

  const fetchAds = async () => {
    try {
      const res = await api.get(`/ads?site=${encodeURIComponent(site)}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setAds({
        top: data.filter(a => a.position === "top").sort((a, b) => (a.order || 0) - (b.order || 0)),
        middle: data.filter(a => a.position === "middle").sort((a, b) => (a.order || 0) - (b.order || 0)),
        bottom: data.filter(a => a.position === "bottom").sort((a, b) => (a.order || 0) - (b.order || 0)),
      });
    } catch (err) { 
      console.error("Fetch error:", err); 
      setAds({ top: [], middle: [], bottom: [] });
    }
  };

  const addAd = (position) => {
    const newAd = { _tempId: Date.now(), content: "", position, site, order: ads[position].length };
    setAds(prev => ({ ...prev, [position]: [...prev[position], newAd] }));
  };

  const handleSave = async (position) => {
    setIsSaving(true);
    try {
      const payload = ads[position].map((ad, idx) => ({
        ...ad,
        order: idx,
        id: ad.id || ad._id || undefined
      }));
      await api.post(`/ads?site=${encodeURIComponent(site)}`, payload);
      alert(`${position} ads saved successfully!`);
      fetchAds();
    } catch (err) { 
      alert("Save failed. Please check your connection."); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const onDragEnd = (result, position) => {
    if (!result.destination) return;
    const items = Array.from(ads[position]);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setAds(prev => ({ ...prev, [position]: items }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ADS MANAGER</h1>
          <select 
            className="mt-2 p-2 bg-white border rounded-lg shadow-sm focus:ring-2 ring-blue-500 outline-none cursor-pointer" 
            value={site} 
            onChange={(e) => setSite(e.target.value)}
          >
            {siteOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => window.open(`https://${site}`, "_blank")} 
             className="px-5 py-2.5 bg-white border rounded-xl font-medium flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
           >
             <FiExternalLink /> View Site
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {["top", "middle", "bottom"].map((pos) => (
          <div key={pos} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-bold capitalize text-slate-700">{pos} Section</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => addAd(pos)} 
                  className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  title="Add New Ad"
                >
                  <FiPlus />
                </button>
                <button 
                  onClick={() => handleSave(pos)} 
                  disabled={isSaving} 
                  className="p-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  title="Save All in Section"
                >
                  <FiSave />
                </button>
              </div>
            </div>

            <DragDropContext onDragEnd={(res) => onDragEnd(res, pos)}>
              <Droppable droppableId={pos}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 min-h-[100px]">
                    {ads[pos].map((ad, index) => (
                      <Draggable key={ad.id || ad._tempId} draggableId={String(ad.id || ad._tempId)} index={index}>
                        {(p) => (
                          <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                            <AdInstance 
                              ad={ad} 
                              position={pos} 
                              index={index} 
                              site={site}
                              onRemove={() => setAds(prev => ({ 
                                ...prev, 
                                [pos]: prev[pos].filter(a => (a.id || a._tempId) !== (ad.id || ad._tempId)) 
                              }))}
                              onDeleteDB={async (id) => {
                                if(window.confirm("Delete permanently from database?")) {
                                  try {
                                    await api.delete(`/ads/${id}`);
                                    fetchAds();
                                  } catch (err) {
                                    alert("Delete failed.");
                                  }
                                }
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ))}
      </div>
    </div>
  );
}
