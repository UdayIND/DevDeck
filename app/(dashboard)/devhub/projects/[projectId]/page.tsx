"use client";
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { RoomProvider, useStorage, useUpdateMyPresence, useOthers, useSelf, useMutation } from '@/lib/liveblocks.config';
import { LiveMap } from '@liveblocks/client';
import { nanoid } from 'nanoid';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const mockProjects = [
  { 
    id: '1', 
    name: 'DevDeck Portfolio', 
    description: 'Professional portfolio showcasing development skills and projects.', 
    readme: '# DevDeck Portfolio\n\nA modern portfolio application built with Next.js and TypeScript.\n\n## Features\n- Responsive design\n- Dark/light theme support\n- Project showcase\n- Contact integration\n\n## Tech Stack\n- Next.js 14\n- TypeScript\n- Tailwind CSS\n- Framer Motion', 
    files: [
      { name: 'index.tsx', content: '// DevDeck Portfolio - Main Entry Point\nimport React from "react";\nimport Portfolio from "./components/Portfolio";\n\nexport default function App() {\n  return <Portfolio />;\n}', type: 'tsx' },
      { name: 'components/Portfolio.tsx', content: '// Portfolio Component\nimport React from "react";\n\nconst Portfolio: React.FC = () => {\n  return (\n    <div className="portfolio-container">\n      <h1>Welcome to DevDeck Portfolio</h1>\n    </div>\n  );\n};\n\nexport default Portfolio;', type: 'tsx' }
    ] 
  },
  { 
    id: '2', 
    name: 'Collaborative Design System', 
    description: 'A comprehensive design system for team collaboration and consistency.', 
    readme: '# Collaborative Design System\n\nA modern design system built for team collaboration.\n\n## Components\n- UI Components Library\n- Design Tokens\n- Documentation\n- Storybook Integration\n\n## Development\n```bash\nnpm install\nnpm run dev\nnpm run storybook\n```', 
    files: [
      { name: 'index.ts', content: '// Design System Entry Point\nexport * from "./components";\nexport * from "./tokens";\nexport * from "./utils";', type: 'ts' },
      { name: 'components/Button.tsx', content: '// Button Component\nimport React from "react";\nimport { ButtonProps } from "../types";\n\nconst Button: React.FC<ButtonProps> = ({ children, variant = "primary", ...props }) => {\n  return (\n    <button className={`btn btn-${variant}`} {...props}>\n      {children}\n    </button>\n  );\n};\n\nexport default Button;', type: 'tsx' }
    ] 
  },
  { 
    id: '3', 
    name: 'API Documentation Hub', 
    description: 'Interactive API documentation with live examples and testing capabilities.', 
    readme: '# API Documentation Hub\n\nInteractive documentation for REST APIs with live testing.\n\n## Features\n- Auto-generated from OpenAPI specs\n- Interactive testing interface\n- Code examples in multiple languages\n- Authentication testing\n\n## Usage\n```bash\nnpm run build-docs\nnpm run serve-docs\n```', 
    files: [
      { name: 'docs/README.md', content: '# API Documentation\n\nThis directory contains the API documentation and configuration files.\n\n## Structure\n- `openapi.yaml` - OpenAPI specification\n- `examples/` - Code examples\n- `assets/` - Documentation assets', type: 'md' },
      { name: 'openapi.yaml', content: 'openapi: 3.0.0\ninfo:\n  title: DevDeck API\n  version: 1.0.0\n  description: DevDeck collaborative platform API\npaths:\n  /api/health:\n    get:\n      summary: Health check endpoint\n      responses:\n        200:\n          description: Service is healthy', type: 'yaml' }
    ] 
  },
];

function getProjects() {
  const stored = localStorage.getItem("devhub-projects");
  return stored ? JSON.parse(stored) : mockProjects;
}
function saveProjects(projects: any[]) {
  localStorage.setItem("devhub-projects", JSON.stringify(projects));
}

function getRandomColor() {
  const COLORS = ["#00fff7", "#ff00c8", "#ffe600", "#00ff5a", "#fff", "#000", "#ff5722", "#2196f3", "#4caf50", "#e91e63", "#9c27b0"];
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

function getPresenceInfo(presence: any) {
  try {
    return presence?.message ? JSON.parse(presence.message) : {};
  } catch {
    return {};
  }
}

function FileTree({ files, onSelect, selectedFile, onContextMenu, onDrop }: any) {
  return (
    <Tree
      tree={files}
      rootId={0}
      render={(node: any, { depth = 0, isOpen = false, onToggle = () => {} }: { depth: number; isOpen: boolean; onToggle: () => void; }) => (
        <div style={{ marginLeft: depth * 16 }}>
          {node.droppable ? (
            <span className="font-bold text-accent-cyan mr-1">📁</span>
          ) : (
            <span className="mr-1">📄</span>
          )}
          <button
            className={`w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${selectedFile?.id === node.id ? 'bg-gray-700 text-accent-cyan' : ''}`}
            onClick={() => onSelect(node)}
            onContextMenu={e => onContextMenu(e, node)}
          >
            {node.text}
          </button>
        </div>
      )}
      dragPreviewRender={(monitorProps: { item: any }) => <div>{monitorProps.item.text}</div>}
      onDrop={(dropResult: any) => {
        // Handle file/folder reorganization
        // This would update the file structure in the project
      }}
    />
  );
}

function ProjectDetailsInner({ params }: { params: { projectId: string } }) {
  const { user, isLoaded } = useUser();
  const files = useStorage((root) => root.files || []);
  const readme = useStorage((root) => root.readme || '');
  const issues = useStorage((root) => root.issues || []);
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  const self = useSelf();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [addingFile, setAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("js");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editReadme, setEditReadme] = useState("");
  const [editVisibility, setEditVisibility] = useState("public");
  const [tab, setTab] = useState<'editor' | 'history' | 'issues'>('editor');
  const [commitMessage, setCommitMessage] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [newContributor, setNewContributor] = useState("");
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const router = useRouter();
  const [repoFiles, setRepoFiles] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
  const [ciTab, setCiTab] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingCI, setLoadingCI] = useState(false);
  const accessToken = null; // GitHub integration disabled for now
  const [selectedRepoFile, setSelectedRepoFile] = useState<any>(null);
  const [repoFileContent, setRepoFileContent] = useState<string>('');
  const [repoFileSha, setRepoFileSha] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [commitHistory, setCommitHistory] = useState<any[]>([]);
  const [prs, setPRs] = useState<any[]>([]);
  const [workflowLog, setWorkflowLog] = useState<string>('');
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [creatingPR, setCreatingPR] = useState(false);
  const [prTitle, setPRTitle] = useState('');
  const [prBody, setPRBody] = useState('');
  const [isGitHubRepo, setIsGitHubRepo] = useState(false);
  const [githubRepo, setGithubRepo] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  // Liveblocks mutations
  const addFile = useMutation(({ storage }, file) => {
    const files = storage.get("files") || [];
    storage.set("files", [...files, file]);
  }, []);
  const updateFile = useMutation(({ storage }, fileName, content) => {
    const files = (storage.get("files") || []).map((f: any) => f.name === fileName ? { ...f, content } : f);
    storage.set("files", files);
  }, []);
  const deleteFile = useMutation(({ storage }, fileName) => {
    const files = (storage.get("files") || []).filter((f: any) => f.name !== fileName);
    storage.set("files", files);
  }, []);
  const renameFile = useMutation(({ storage }, oldName, newName) => {
    const files = (storage.get("files") || []).map((f: any) => f.name === oldName ? { ...f, name: newName } : f);
    storage.set("files", files);
  }, []);
  const setReadme = useMutation(({ storage }, newReadme) => {
    storage.set("readme", newReadme);
  }, []);
  const addIssue = useMutation(({ storage }, issue) => {
    const issues = storage.get("issues") || [];
    storage.set("issues", [issue, ...issues]);
  }, []);
  const updateIssue = useMutation(({ storage }, updatedIssue) => {
    const issues = (storage.get("issues") || []).map((i: any) => i.id === updatedIssue.id ? updatedIssue : i);
    storage.set("issues", issues);
  }, []);

  // Load project and files
  useEffect(() => {
    const projects = getProjects();
    const found = projects.find((p: any) => p.id === params.projectId);
    if (found) {
      setProject(found);
      setIsGitHubRepo(false);
      setLoading(false);
    } else if (params.projectId && accessToken) {
      // Try to fetch as GitHub repo
      setLoading(true);
      fetch(`https://api.github.com/repositories/${params.projectId}`, {
        headers: { Authorization: `token ${accessToken}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(repo => {
          if (repo && repo.id) {
            setGithubRepo(repo);
            setIsGitHubRepo(true);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [params.projectId, accessToken]);

  // Update file content when switching files
  useEffect(() => {
    setFileContent(selectedFile?.content || "");
    setIsDirty(false);
  }, [selectedFile]);

  // Load file history when file changes
  useEffect(() => {
    if (!project || !selectedFile) return;
    const key = `history-${project.id}-${selectedFile.name}`;
    const h = JSON.parse(localStorage.getItem(key) || '[]');
    setHistory(h);
  }, [project, selectedFile]);

  // Load contributors when project changes
  useEffect(() => {
    setContributors(project?.contributors || []);
  }, [project]);

  // On mount, set random name/color if not set
  useEffect(() => {
    const info = getPresenceInfo(self?.presence);
    if (!info.name || !info.color) {
      const name = `User-${nanoid(4)}`;
      const color = getRandomColor();
      updateMyPresence({ message: JSON.stringify({ name, color }) });
    }
  }, [self, updateMyPresence]);

  // Load repo files and workflows
  useEffect(() => {
    if (params.projectId && accessToken) {
      setLoadingFiles(true);
      // Fetch repo details (owner/name) from GitHub API
      fetch(`https://api.github.com/repositories/${params.projectId}`, {
        headers: { Authorization: `token ${accessToken}` },
      })
        .then(res => res.json())
        .then(repo => {
          // Fetch file tree
          fetch(`https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(tree => {
              setRepoFiles(tree.tree || []);
              setLoadingFiles(false);
            });
          // Fetch workflows
          setLoadingCI(true);
          fetch(`https://api.github.com/repos/${repo.full_name}/actions/workflows`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(data => {
              setWorkflows(data.workflows || []);
              setLoadingCI(false);
            });
          // Fetch workflow runs
          fetch(`https://api.github.com/repos/${repo.full_name}/actions/runs`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(data => setWorkflowRuns(data.workflow_runs || []));
        });
    }
  }, [params.projectId, accessToken]);

  // Fetch branches and commits on repo load
  useEffect(() => {
    if (params.projectId && accessToken) {
      fetch(`https://api.github.com/repositories/${params.projectId}`, {
        headers: { Authorization: `token ${accessToken}` },
      })
        .then(res => res.json())
        .then(repo => {
          fetch(`https://api.github.com/repos/${repo.full_name}/branches`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(branches => {
              setBranches(branches);
              setSelectedBranch(repo.default_branch);
            });
          fetch(`https://api.github.com/repos/${repo.full_name}/commits?sha=${repo.default_branch}`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(setCommitHistory);
          fetch(`https://api.github.com/repos/${repo.full_name}/pulls`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(setPRs);
        });
    }
  }, [params.projectId, accessToken]);

  // Save file content with commit
  const handleSave = () => {
    if (!project || !selectedFile) return;
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx === -1) return;
    const fileIdx = projects[idx].files.findIndex((f: any) => f.name === selectedFile.name);
    if (fileIdx === -1) return;
    projects[idx].files[fileIdx].content = fileContent;
    saveProjects(projects);
    setIsDirty(false);
    setProject(projects[idx]);
    // Save commit to history
    const key = `history-${project.id}-${selectedFile.name}`;
    const h = JSON.parse(localStorage.getItem(key) || '[]');
    h.unshift({
      timestamp: Date.now(),
      message: commitMessage || 'Update',
      content: fileContent,
    });
    localStorage.setItem(key, JSON.stringify(h));
    setHistory(h);
    setCommitMessage('');
  };

  // Add new file
  const handleAddFile = () => {
    if (!newFileName || !project) return;
    if (project.files.some((f: any) => f.name === newFileName)) {
      toast.error("File already exists");
      return;
    }
    
    const newFile = { name: newFileName, content: "", type: newFileType };
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx !== -1) {
      projects[idx].files.push(newFile);
      saveProjects(projects);
      setProject(projects[idx]);
      addFile(newFile);
    }
    setNewFileName("");
    setNewFileType("js");
    setShowCreateFileModal(false);
    toast.success("File created successfully!");
  };

  // Delete file
  const handleDeleteFile = (fileName: string) => {
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx !== -1) {
      projects[idx].files = projects[idx].files.filter((f: any) => f.name !== fileName);
      saveProjects(projects);
      setProject(projects[idx]);
      deleteFile(fileName);
      if (selectedFile?.name === fileName) setSelectedFile(null);
      toast.success("File deleted successfully!");
    }
  };

  // Rename file
  const handleRenameFile = (oldName: string) => {
    if (!renameValue || !project) return;
    if (project.files.some((f: any) => f.name === renameValue)) {
      toast.error("File already exists");
      return;
    }
    
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx !== -1) {
      projects[idx].files = projects[idx].files.map((f: any) => f.name === oldName ? { ...f, name: renameValue } : f);
      saveProjects(projects);
      setProject(projects[idx]);
      renameFile(oldName, renameValue);
      if (selectedFile?.name === oldName) setSelectedFile({ ...selectedFile, name: renameValue });
    }
    setRenamingFile(null);
    setRenameValue("");
    setShowRenameModal(false);
    toast.success("File renamed successfully!");
  };

  // Edit project
  const openEdit = () => {
    setEditName(project.name);
    setEditDescription(project.description);
    setEditReadme(project.readme);
    setEditVisibility(project.visibility || "public");
    setEditingProject(true);
  };
  const handleEditSave = () => {
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx === -1) return;
    projects[idx].name = editName;
    projects[idx].description = editDescription;
    projects[idx].readme = editReadme;
    projects[idx].visibility = editVisibility;
    saveProjects(projects);
    setProject(projects[idx]);
    setEditingProject(false);
  };
  const handleDeleteProject = () => {
    const projects = getProjects().filter((p: any) => p.id !== project.id);
    saveProjects(projects);
    setShowDeleteModal(false);
    toast.success("Project deleted successfully!");
    router.push("/devhub/projects");
  };

  // Add contributor
  const handleAddContributor = () => {
    if (!newContributor) return;
    if (contributors.some((c: any) => c.email === newContributor)) return;
    const updated = [...contributors, { email: newContributor }];
    setContributors(updated);
    setNewContributor("");
    // Persist
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx !== -1) {
      projects[idx].contributors = updated;
      saveProjects(projects);
      setProject(projects[idx]);
    }
  };

  // Remove contributor
  const handleRemoveContributor = (email: string) => {
    const updated = contributors.filter((c: any) => c.email !== email);
    setContributors(updated);
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx !== -1) {
      projects[idx].contributors = updated;
      saveProjects(projects);
      setProject(projects[idx]);
    }
  };

  // Add issue
  const handleAddIssue = () => {
    if (!newIssueTitle) return;
    addIssue({ id: Date.now(), title: newIssueTitle, desc: newIssueDesc, status: 'open', comments: [] });
    setNewIssueTitle("");
    setNewIssueDesc("");
  };

  // Add comment
  const handleAddComment = () => {
    if (!selectedIssue || !newComment) return;
    const updatedIssue = {
      ...selectedIssue,
      comments: [...selectedIssue.comments, { text: newComment, ts: Date.now() }],
    };
    updateIssue(updatedIssue);
    setNewComment("");
    setSelectedIssue(updatedIssue);
  };

  const handleExport = () => {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const projects = getProjects().map((p: any) => p.id === project.id ? imported : p);
        saveProjects(projects);
        setProject(imported);
        toast.success('Project imported successfully!');
      } catch {
        toast.error('Invalid project file.');
      }
    };
    reader.readAsText(file);
  };

  // Presence bar
  const renderPresenceBar = () => (
    <div className="flex gap-2 mb-4 items-center">
      {self && (
        <div className="flex items-center gap-1">
          {(() => { const info = getPresenceInfo(self.presence); return <span className="w-4 h-4 rounded-full" style={{ background: info.color || '#00fff7' }}></span>; })()}
          <span className="text-xs font-bold">You</span>
        </div>
      )}
      {others.map((user) => {
        const info = getPresenceInfo(user.presence);
        return (
          <div key={user.connectionId} className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full" style={{ background: info.color || '#00fff7' }}></span>
            <span className="text-xs">{info.name || 'User'}</span>
          </div>
        );
      })}
    </div>
  );

  // Live cursors
  const renderCursors = () => (
    <>
      {others.map((user) => {
        const info = getPresenceInfo(user.presence);
        return user.presence?.cursor ? (
          <div
            key={user.connectionId}
            className="absolute pointer-events-none z-50"
            style={{
              left: user.presence.cursor.x,
              top: user.presence.cursor.y,
              color: info.color || '#00fff7',
            }}
          >
            <svg width="24" height="24" style={{ filter: "drop-shadow(0 0 4px #000)" }}>
              <circle cx="12" cy="12" r="8" fill={info.color || '#00fff7'} opacity={0.7} />
            </svg>
            <span className="text-xs font-bold" style={{ color: info.color || '#00fff7' }}>{info.name || 'User'}</span>
          </div>
        ) : null;
      })}
    </>
  );

  // Track mouse movement in editor area
  const editorAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!editorAreaRef.current) return;
      const rect = editorAreaRef.current.getBoundingClientRect();
      updateMyPresence({ cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top } });
    };
    const area = editorAreaRef.current;
    if (area) {
      area.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (area) area.removeEventListener('mousemove', handleMouseMove);
    };
  }, [updateMyPresence]);

  // File open handler
  const handleOpenRepoFile = (file: any) => {
    setSelectedRepoFile(file);
    setRepoFileContent('');
    setRepoFileSha('');
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}?ref=${selectedBranch}`, {
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(res => res.json())
          .then(data => {
            setRepoFileContent(atob(data.content));
            setRepoFileSha(data.sha);
          });
      });
  };

  // File save/commit handler
  const handleSaveRepoFile = (commitMsg: string) => {
    if (!commitMsg.trim()) {
      toast.error('Please enter a commit message');
      return;
    }
    
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/contents/${selectedRepoFile.path}`, {
          method: 'PUT',
          headers: {
            Authorization: `token ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMsg,
            content: btoa(repoFileContent),
            sha: repoFileSha,
          }),
        })
          .then(res => res.json())
          .then(() => {
            toast.success('File committed to GitHub!');
          });
      });
  };

  // Branch switch handler
  const handleSwitchBranch = (branch: string) => {
    setSelectedBranch(branch);
    setSelectedRepoFile(null);
    setRepoFileContent('');
    setRepoFileSha('');
    // Optionally reload file tree for the branch
  };

  // Branch create handler
  const handleCreateBranch = () => {
    if (!newBranchName) return;
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/git/refs/heads/${selectedBranch}`, {
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(res => res.json())
          .then(ref => {
            fetch(`https://api.github.com/repos/${repo.full_name}/git/refs`, {
              method: 'POST',
              headers: {
                Authorization: `token ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ref: `refs/heads/${newBranchName}`,
                sha: ref.object.sha,
              }),
            })
              .then(res => res.json())
              .then(() => {
                setBranches([...branches, { name: newBranchName }]);
                setSelectedBranch(newBranchName);
                setCreatingBranch(false);
                setNewBranchName('');
              });
          });
      });
  };

  // PR create handler
  const handleCreatePR = () => {
    if (!prTitle || !selectedBranch) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/pulls`, {
          method: 'POST',
          headers: {
            Authorization: `token ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: prTitle,
            body: prBody,
            head: selectedBranch,
            base: repo.default_branch,
          }),
        })
          .then(res => res.json())
          .then(() => {
            setCreatingPR(false);
            setPRTitle('');
            setPRBody('');
            toast.success('Pull request created!');
          });
      });
  };

  // Commit revert handler
  const handleRevertCommit = (sha: string) => {
    toast('Revert functionality will be available in a future update', {
      icon: 'ℹ️',
    });
  };

  // CI/CD re-run workflow handler
  const handleRerunWorkflow = (runId: string) => {
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/actions/runs/${runId}/rerun`, {
          method: 'POST',
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(() => toast.success('Workflow re-run triggered!'));
      });
  };

  // CI/CD view logs handler
  const handleViewWorkflowLog = (runId: string) => {
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/actions/runs/${runId}/logs`, {
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(res => res.text())
          .then(setWorkflowLog);
      });
  };

  if (!isLoaded) return <div className="text-center text-white py-20">Loading...</div>;
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Please sign in to access projects</h1>
        <p className="text-gray-400">GitHub integration is currently disabled</p>
      </div>
    );
  }
  if (loading) return <div className="text-center text-white py-20">Loading...</div>;
  if (!project && !isGitHubRepo) return notFound();
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Link href="/devhub/projects" className="text-accent-blue hover:underline">← Back to Projects</Link>
      <h1 className="text-3xl font-bold text-neon mt-4 mb-2">
        {isGitHubRepo ? githubRepo?.full_name : project?.name}
      </h1>
      <div className="flex gap-2 mb-4">
        <button className={`btn-neon px-4 py-1 rounded ${!ciTab ? '' : 'opacity-50'}`} onClick={() => setCiTab(false)}>Project</button>
        <button className={`btn-neon px-4 py-1 rounded ${ciTab ? '' : 'opacity-50'}`} onClick={() => setCiTab(true)}>CI/CD</button>
      </div>
      {ciTab ? (
        <div className="bg-gray-900 rounded p-4">
          <h2 className="text-xl font-bold text-accent-cyan mb-4">GitHub Actions (CI/CD)</h2>
          {loadingCI ? (
            <div className="text-gray-400">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="text-gray-400">No workflows found.</div>
          ) : (
            <ul className="space-y-4">
              {workflows.map((wf: any) => (
                <li key={wf.id} className="p-3 rounded bg-gray-800">
                  <div className="font-semibold text-accent-cyan">{wf.name}</div>
                  <div className="text-xs text-gray-400">{wf.path}</div>
                  <div className="mt-2">
                    <strong>Recent Runs:</strong>
                    <ul className="space-y-1 mt-1">
                      {workflowRuns.filter((run: any) => run.workflow_id === wf.id).slice(0, 3).map((run: any) => (
                        <li key={run.id} className="flex items-center gap-2">
                          <span className={`text-xs rounded px-2 py-1 ${run.conclusion === 'success' ? 'bg-green-700' : run.conclusion === 'failure' ? 'bg-red-700' : 'bg-gray-700'}`}>{run.conclusion || run.status}</span>
                          <span className="text-xs">{run.name}</span>
                          <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs">View Logs</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : isGitHubRepo ? (
        loadingFiles ? (
          <div className="text-gray-400">Loading repository files...</div>
        ) : repoFiles.length > 0 ? (
          <div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-accent-cyan mb-2 flex items-center gap-4">Files</h2>
              <div className="flex gap-4">
                <div className="w-48 bg-gray-800 rounded p-2 text-gray-200">
                  <div className="font-bold mb-2">File Tree</div>
                  <ul>
                    {repoFiles.filter(f => f.type === 'blob').map(f => (
                      <li key={f.sha} className="truncate text-xs text-white py-1 cursor-pointer" onClick={() => handleOpenRepoFile(f)}>{f.path}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gray-900 rounded p-2 min-h-[300px]">
                  {selectedRepoFile ? (
                    <>
                      <MonacoEditor
                        height="300px"
                        language={selectedRepoFile.path.endsWith('.js') ? 'javascript' : selectedRepoFile.path.endsWith('.ts') ? 'typescript' : selectedRepoFile.path.endsWith('.md') ? 'markdown' : selectedRepoFile.path.endsWith('.json') ? 'json' : 'plaintext'}
                        value={repoFileContent}
                        onChange={v => setRepoFileContent(v ?? '')}
                        options={{ readOnly: false, minimap: { enabled: false } }}
                      />
                      <div className="flex gap-2 mt-2 items-center">
                        <input
                          className="p-1 rounded bg-gray-800 text-white border border-gray-700 flex-1"
                          placeholder="Commit message"
                          value={commitMessage}
                          onChange={e => setCommitMessage(e.target.value)}
                        />
                        <button className="btn-neon px-4 py-1 rounded" onClick={() => handleSaveRepoFile(commitMessage)}>Save to GitHub</button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">Select a file to view/edit.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No files found in this repository.</div>
        )
      ) : (
        <>
          <p className="mb-6 text-gray-300">{project.description}</p>
          {/* ...rest of local project UI... */}
        </>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Delete Project</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-all"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create File Modal */}
      {showCreateFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Create New File</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g., index.js, styles.css"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File Type
                </label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="js">JavaScript (.js)</option>
                  <option value="ts">TypeScript (.ts)</option>
                  <option value="tsx">React TypeScript (.tsx)</option>
                  <option value="css">CSS (.css)</option>
                  <option value="md">Markdown (.md)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="txt">Text (.txt)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateFileModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFile}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 px-4 py-2 rounded-lg text-white font-medium transition-all"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename File Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Rename File</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New File Name
              </label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new file name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRenameFile(renamingFile || '')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 px-4 py-2 rounded-lg text-white font-medium transition-all"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetails({ params }: { params: { projectId: string } }) {
  return (
    <RoomProvider id={`devhub-project-${params.projectId}`}
      initialPresence={{ cursor: null, message: null }}
      initialStorage={{ canvasObjects: new LiveMap(), files: [], readme: '', issues: [] }}
    >
      <ProjectDetailsInner params={params} />
    </RoomProvider>
  );
} 