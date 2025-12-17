"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { MOCK_GRAPH_DATA } from "@/lib/mockData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function GraphPage() {
  const [data, setData] = useState<any>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  // Fetch graph data
  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await api.getGraph();
        setData(res?.nodes ? res : MOCK_GRAPH_DATA);
      } catch (e) {
        console.error("Graph fetch failed, using mock", e);
        setData(MOCK_GRAPH_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  // Auto-resize graph
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDims({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    setTimeout(handleResize, 100);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply Hybrid Layout (Option C)
  useEffect(() => {
    if (!graphRef.current || !data.nodes?.length) return;

    const g = graphRef.current;

    // Strong repulsion to spread clusters
    g.d3Force("charge").strength(-220);

    // Slight outward push for PII and Files
    g.d3Force("radialPII", (node: any) => {
      if (node.group === "PII") return 250;
      if (node.group === "File") return 180;
      return 0;
    }).strength(0.1);

    // Balanced cluster separation
    g.d3Force("x", (node: any) => {
      if (node.group === "Database") return -150;
      if (node.group === "Table") return 0;
      if (node.group === "Column") return 150;
      if (node.group === "PII") return 250;
      return 0;
    }).strength(0.05);

    // Collision to prevent overlapping nodes
    import("d3-force").then((d3) => {
      g.d3Force(
        "collision",
        d3.forceCollide().radius((node: any) => node.val * 1.8)
      );
    });

    // Link distances (dynamic)
    g.d3Force("link").distance((link: any) => {
      const target = String(link.target?.id || link.target);

      if (target.includes("PII")) return 180;
      if (target.includes("Column")) return 140;
      if (target.includes("Field")) return 120;
      return 100;
    });
  }, [data]);

  // Node sizes by type
  const getNodeSize = (node: any) => {
    switch (node.group) {
      case "Database":
        return 16;
      case "Table":
        return 13;
      case "Column":
        return 10;
      case "Field":
        return 9;
      case "PII":
        return 8;
      case "File":
        return 12;
      default:
        return 7;
    }
  };

  // Render UI
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold tracking-tight">Data Lineage Graph</h1>

      <Card className="flex-1 flex flex-col overflow-hidden bg-card border-border">
        <CardHeader className="py-3 border-b">
          <CardTitle>Entity Relationships</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0 relative" ref={containerRef}>
          {!loading && (
            <ForceGraph2D
              ref={graphRef}
              width={dims.width}
              height={dims.height}
              graphData={data}
              backgroundColor="#0d0d0d"
              nodeLabel="id"
              linkColor={() => "rgba(255,255,255,0.2)"}
              nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                const label = node.id;
                const size = getNodeSize(node);

                // Draw node circle
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI);
                ctx.fillStyle = node.color || "#999";
                ctx.fill();

                // Draw label on zoom
                if (globalScale > 1.3) {
                  ctx.font = `${12 / globalScale}px Sans-Serif`;
                  ctx.fillStyle = "#fff";
                  ctx.fillText(label, node.x! + size + 3, node.y! + 3);
                }
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.006}
              cooldownTime={2000}
              warmupTicks={120}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
