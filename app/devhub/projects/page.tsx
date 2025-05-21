"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn, signOut, useSession, SessionContextValue } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const mockProjects = [
  { id: '1', name: 'Space Portfolio', description: 'A portfolio site for astronauts.' },
  { id: '2', name: 'Dev Deck Core', description: 'Core engine for collaborative design.' },
  { id: '3', name: 'Open Source Docs', description: 'Documentation for open source tools.' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const { data: session }: SessionContextValue = useSession();
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      signIn('github');
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      const accessToken = (session as any)?.accessToken;
      if (accessToken) {
        fetch('https://api.github.com/user/repos?per_page=100', {
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(res => res.json())
          .then(setGithubRepos);
      }
    }
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neon">Your GitHub Projects</h1>
        <button onClick={() => signOut()} className="btn-neon px-6 py-2 rounded-full font-semibold">Sign Out</button>
      </div>
      {githubRepos.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-accent-cyan mb-2">Repositories</h2>
          <div className="grid gap-2">
            {githubRepos.map((repo: any) => (
              <div key={repo.id} className="p-3 rounded bg-gray-800 flex justify-between items-center">
                <span>{repo.full_name}</span>
                <button className="btn-neon px-3 py-1 rounded text-xs" onClick={() => router.push(`/devhub/projects/${repo.id}`)}>Open</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-400">No repositories found or loading...</div>
      )}
    </div>
  );
} 