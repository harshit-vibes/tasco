"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  Input,
  Textarea,
  cn,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tasco/ui";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  FileText,
  Search,
  Send,
  Database,
} from "@tasco/ui/icons";
import { useDocuments, useRAGQuery } from "@tasco/rag/hooks";
import type { Document, RAGResult } from "@tasco/rag/types";
import { useSettings } from "@tasco/lyzr";

export default function KnowledgeBaseDetailPage() {
  const { settings, isLoaded } = useSettings();
  const params = useParams();
  const router = useRouter();
  const knowledgeBaseId = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queryText, setQueryText] = useState("");

  const {
    documents,
    isLoading: isLoadingDocs,
    isUploading,
    error: docsError,
    uploadDocument,
    deleteDocument,
  } = useDocuments({
    apiKey: settings.lyzrApiKey,
    baseUrl: settings.ragBaseUrl,
    knowledgeBaseId,
    autoLoad: isLoaded && !!settings.lyzrApiKey,
  });

  const {
    results,
    isLoading: isQuerying,
    error: queryError,
    query,
    clearResults,
  } = useRAGQuery({
    apiKey: settings.lyzrApiKey,
    baseUrl: settings.ragBaseUrl,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        await uploadDocument({
          file,
          knowledgeBaseId,
        });
      } catch (err) {
        console.error("Failed to upload file:", err);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      await deleteDocument(doc.id);
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const handleQuery = async () => {
    if (!queryText.trim()) return;

    try {
      await query({
        query: queryText,
        knowledgeBaseId,
        topK: 5,
        retrievalType: "basic",
      });
    } catch (err) {
      console.error("Failed to query:", err);
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/knowledge-base">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground font-mono">{knowledgeBaseId}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="query" className="gap-2">
            <Search className="h-4 w-4" />
            Query Playground
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {/* Upload Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Upload Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOCX, TXT, MD
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Error */}
          {docsError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {docsError.message}
            </div>
          )}

          {/* Documents List */}
          {isLoadingDocs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Documents</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Upload documents to start building your knowledge base.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload First Document
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      {getFileIcon(doc.type)}
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type.toUpperCase()} • {doc.chunkCount || 0} chunks
                        {doc.createdAt && ` • ${new Date(doc.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{doc.name}" from this knowledge base.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteDocument(doc)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Query Playground Tab */}
        <TabsContent value="query" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Test RAG Retrieval</h3>
              <p className="text-sm text-muted-foreground">
                Enter a query to test document retrieval from this knowledge base.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your query..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                className="flex-1"
              />
              <Button
                onClick={handleQuery}
                disabled={isQuerying || !queryText.trim()}
              >
                {isQuerying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Card>

          {/* Query Error */}
          {queryError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {queryError.message}
            </div>
          )}

          {/* Query Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Results ({results.length})</h3>
                <Button variant="ghost" size="sm" onClick={clearResults}>
                  Clear
                </Button>
              </div>
              {results.map((result, index) => (
                <Card key={index} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Source: {result.source || "Unknown"}
                    </span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Score: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm">{result.content}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Empty Results */}
          {!isQuerying && results.length === 0 && queryText && (
            <Card className="p-8 text-center">
              <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Enter a query and click search to retrieve relevant documents.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
