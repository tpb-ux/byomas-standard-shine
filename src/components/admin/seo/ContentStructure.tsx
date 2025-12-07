import { useMemo } from "react";
import { FileText, Hash, Type, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContentStructureProps {
  content: string;
}

interface HeadingNode {
  level: number;
  text: string;
  children: HeadingNode[];
}

export default function ContentStructure({ content }: ContentStructureProps) {
  const analysis = useMemo(() => {
    const headings: { level: number; text: string }[] = [];
    
    // Match markdown headings
    const mdMatches = content.matchAll(/^(#{1,6})\s+(.+)$/gm);
    for (const match of mdMatches) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
      });
    }

    // Match HTML headings
    const htmlMatches = content.matchAll(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi);
    for (const match of htmlMatches) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].trim(),
      });
    }

    // Build tree structure
    const buildTree = (items: { level: number; text: string }[]): HeadingNode[] => {
      const tree: HeadingNode[] = [];
      const stack: HeadingNode[] = [];

      items.forEach(item => {
        const node: HeadingNode = { level: item.level, text: item.text, children: [] };

        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
          stack.pop();
        }

        if (stack.length === 0) {
          tree.push(node);
        } else {
          stack[stack.length - 1].children.push(node);
        }

        stack.push(node);
      });

      return tree;
    };

    // Count paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    // Count lists
    const listItems = (content.match(/^[\-\*]\s/gm) || []).length +
                      (content.match(/^\d+\.\s/gm) || []).length;

    // Word count
    const words = content.split(/\s+/).filter(w => w.length > 0).length;

    // Reading time (avg 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    return {
      headings,
      tree: buildTree(headings),
      paragraphs: paragraphs.length,
      listItems,
      words,
      readingTime,
    };
  }, [content]);

  const renderTree = (nodes: HeadingNode[], depth = 0): React.ReactNode => {
    return nodes.map((node, index) => (
      <div key={index} className="relative">
        <div 
          className="flex items-center gap-2 py-1.5"
          style={{ paddingLeft: `${depth * 20}px` }}
        >
          {depth > 0 && (
            <div className="absolute left-0 top-0 bottom-0 border-l-2 border-border" 
                 style={{ left: `${(depth - 1) * 20 + 8}px` }} />
          )}
          <Badge 
            variant="outline" 
            className={`text-xs ${
              node.level === 1 ? "bg-primary/10 text-primary border-primary/30" :
              node.level === 2 ? "bg-blue-500/10 text-blue-500 border-blue-500/30" :
              "bg-muted text-muted-foreground"
            }`}
          >
            H{node.level}
          </Badge>
          <span className={`text-sm ${node.level === 1 ? "font-medium" : ""}`}>
            {node.text.length > 60 ? node.text.substring(0, 60) + "..." : node.text}
          </span>
        </div>
        {node.children.length > 0 && renderTree(node.children, depth + 1)}
      </div>
    ));
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "bg-primary text-primary-foreground",
      "bg-blue-500 text-white",
      "bg-purple-500 text-white",
      "bg-orange-500 text-white",
      "bg-pink-500 text-white",
      "bg-gray-500 text-white",
    ];
    return colors[level - 1] || colors[5];
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Content Stats */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-normal flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Estatísticas do Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border text-center">
              <Type className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-light">{analysis.words}</p>
              <p className="text-xs text-muted-foreground">Palavras</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <Hash className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-light">{analysis.headings.length}</p>
              <p className="text-xs text-muted-foreground">Headings</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-light">{analysis.paragraphs}</p>
              <p className="text-xs text-muted-foreground">Parágrafos</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <List className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-light">{analysis.listItems}</p>
              <p className="text-xs text-muted-foreground">Itens de Lista</p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-accent/50 border border-border">
            <p className="text-sm text-center">
              ⏱️ Tempo estimado de leitura: <strong>{analysis.readingTime} minutos</strong>
            </p>
          </div>

          {/* Heading Distribution */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-3">Distribuição de Headings</p>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map(level => {
                const count = analysis.headings.filter(h => h.level === level).length;
                if (count === 0) return null;
                return (
                  <Badge key={level} className={getLevelColor(level)}>
                    H{level}: {count}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heading Tree */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-normal flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Estrutura de Headings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.tree.length > 0 ? (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {renderTree(analysis.tree)}
            </div>
          ) : (
            <div className="text-center py-8">
              <Hash className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">
                Nenhum heading encontrado no conteúdo.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Use # para H1, ## para H2, ### para H3, etc.
              </p>
            </div>
          )}

          {analysis.tree.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-border">
              <p className="text-xs text-muted-foreground">
                💡 Uma boa estrutura tem 1 H1, 3-5 H2s e H3s para subseções.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
