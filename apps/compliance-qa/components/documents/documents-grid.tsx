"use client";

import { useState } from "react";
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "@tasco/ui";
import { Search, LayoutGrid, List, Plus, Filter } from "@tasco/ui/icons";
import { DocumentCard, Document } from "./document-card";

// Demo documents
const demoDocuments: Document[] = [
  {
    id: "1",
    name: "Procurement Policy v2.1",
    type: "pdf",
    category: "Internal Policies",
    uploadedAt: new Date("2024-01-15"),
    size: "2.4 MB",
    pages: 45,
    status: "ready",
  },
  {
    id: "2",
    name: "Travel & Expense Policy",
    type: "pdf",
    category: "Internal Policies",
    uploadedAt: new Date("2024-02-20"),
    size: "1.8 MB",
    pages: 28,
    status: "ready",
  },
  {
    id: "3",
    name: "Board Resolution 2024-05",
    type: "pdf",
    category: "Meeting Minutes",
    uploadedAt: new Date("2024-03-10"),
    size: "850 KB",
    pages: 12,
    status: "ready",
  },
  {
    id: "4",
    name: "Compliance Framework 2024",
    type: "pdf",
    category: "Governance Documents",
    uploadedAt: new Date("2024-01-05"),
    size: "5.2 MB",
    pages: 120,
    status: "ready",
  },
  {
    id: "5",
    name: "Vendor Contract Template",
    type: "docx",
    category: "Contracts",
    uploadedAt: new Date("2024-04-01"),
    size: "320 KB",
    pages: 8,
    status: "ready",
  },
  {
    id: "6",
    name: "DNP Holding Charter",
    type: "pdf",
    category: "Company Charters",
    uploadedAt: new Date("2023-06-15"),
    size: "1.1 MB",
    pages: 35,
    status: "ready",
  },
  {
    id: "7",
    name: "Q3 2024 Board Minutes",
    type: "pdf",
    category: "Meeting Minutes",
    uploadedAt: new Date("2024-10-05"),
    size: "920 KB",
    pages: 15,
    status: "processing",
  },
  {
    id: "8",
    name: "Circular 123/2024",
    type: "pdf",
    category: "Legal Documents",
    uploadedAt: new Date("2024-09-20"),
    size: "3.2 MB",
    pages: 65,
    status: "ready",
  },
];

const categories = [
  "All",
  "Legal Documents",
  "Company Charters",
  "Meeting Minutes",
  "Internal Policies",
  "Contracts",
  "Governance Documents",
];

export function DocumentsGrid() {
  const [documents, setDocuments] = useState<Document[]>(demoDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Document Library</h1>
            <p className="text-sm text-muted-foreground">
              {documents.length} documents indexed
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs
        defaultValue="All"
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="flex-1 overflow-hidden flex flex-col"
      >
        <div className="border-b px-4">
          <TabsList className="h-12 bg-transparent p-0">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeCategory} className="flex-1 overflow-auto p-4 mt-0">
          {filteredDocuments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No documents found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload documents to get started"}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-2"
              }
            >
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
