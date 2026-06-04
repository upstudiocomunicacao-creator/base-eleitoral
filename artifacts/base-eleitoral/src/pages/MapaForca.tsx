import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState } from "react";
import { Network, Users, MapPin, Map, BarChart3, Database, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function MapaForca() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = [
    { id: "candidato", title: "Candidato", icon: Target, level: 0 },
    { id: "coordenacao", title: "Coordenação Geral", icon: Network, level: 1 },
    { id: "liderancas_rj", title: "Lideranças RJ", icon: Users, level: 2 },
    { id: "liderancas_marica", title: "Lideranças Maricá", icon: Users, level: 2 },
    { id: "liderancas_tematicas", title: "Lideranças Temáticas", icon: Users, level: 2 },
    { id: "apoiadores", title: "Apoiadores", icon: Users, level: 3 },
    { id: "prospeccao", title: "Prospecção", icon: Database, level: 4 },
    { id: "inteligencia", title: "Mapas e Inteligência", icon: Map, level: 5 },
    { id: "mapa_rj", title: "Mapa RJ", icon: MapPin, level: 6 },
    { id: "mapa_marica", title: "Mapa Maricá", icon: MapPin, level: 6 },
    { id: "mapa_calor", title: "Mapa de Calor", icon: MapPin, level: 6 },
    { id: "comparativo", title: "Comparativo Eleitoral", icon: BarChart3, level: 7 },
    { id: "zonas", title: "Zonas e Eleitores", icon: Map, level: 8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mapa de Força</h2>
        <p className="text-muted-foreground">Estrutura organizacional e fluxo de inteligência da campanha.</p>
      </div>

      <div className="relative py-12 px-4 bg-white rounded-lg shadow-sm border overflow-x-auto min-h-[600px] flex justify-center items-start">
        <div className="flex flex-col items-center gap-12 min-w-[800px]">
          
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10">
            <NodeCard node={nodes[0]} onClick={() => setSelectedNode(nodes[0].id)} />
          </motion.div>
          <div className="w-0.5 h-12 bg-blue-200 absolute top-[120px]" />

          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="z-10">
            <NodeCard node={nodes[1]} onClick={() => setSelectedNode(nodes[1].id)} />
          </motion.div>

          <div className="w-[600px] h-0.5 bg-blue-200 absolute top-[308px]" />
          <div className="w-0.5 h-12 bg-blue-200 absolute top-[308px]" />
          <div className="w-0.5 h-12 bg-blue-200 absolute top-[308px] -ml-[300px]" />
          <div className="w-0.5 h-12 bg-blue-200 absolute top-[308px] ml-[300px]" />

          <div className="flex gap-8 z-10 w-full justify-center">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}><NodeCard node={nodes[2]} onClick={() => setSelectedNode(nodes[2].id)} /></motion.div>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}><NodeCard node={nodes[3]} onClick={() => setSelectedNode(nodes[3].id)} /></motion.div>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}><NodeCard node={nodes[4]} onClick={() => setSelectedNode(nodes[4].id)} /></motion.div>
          </div>

          {/* ... Add more layout connections as needed, simplified for brevity ... */}
          <div className="w-0.5 h-12 bg-blue-200 absolute top-[470px]" />
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="z-10">
             <NodeCard node={nodes[5]} onClick={() => setSelectedNode(nodes[5].id)} />
          </motion.div>

        </div>
      </div>

      <Sheet open={!!selectedNode} onOpenChange={(v) => !v && setSelectedNode(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{nodes.find(n => n.id === selectedNode)?.title}</SheetTitle>
            <SheetDescription>
              Resumo e métricas principais deste nível da hierarquia.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <p className="text-sm text-gray-600">Nenhum detalhe adicional configurado para este nó no momento.</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NodeCard({ node, onClick }: { node: any, onClick: () => void }) {
  return (
    <Card 
      className="w-48 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
          <node.icon className="h-6 w-6" />
        </div>
        <div className="font-semibold text-sm text-gray-900">{node.title}</div>
      </CardContent>
    </Card>
  );
}