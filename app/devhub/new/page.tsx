"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [readme, setReadme] = useState("");
  const [visibility, setVisibility] = useState("public");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projects = JSON.parse(localStorage.getItem("devhub-projects") || "[]");
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      readme,
      visibility,
    };
    localStorage.setItem("devhub-projects", JSON.stringify([newProject, ...projects]));
    router.push("/devhub/projects");
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold text-neon mb-6">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Project Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">README (Markdown)</label>
          <textarea value={readme} onChange={e => setReadme(e.target.value)} rows={6} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Visibility</label>
          <select value={visibility} onChange={e => setVisibility(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <button type="submit" className="btn-neon px-6 py-2 rounded-full font-semibold">Create Project</button>
      </form>
    </div>
  );
} 