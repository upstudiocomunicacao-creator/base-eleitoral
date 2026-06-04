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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mapa de Força</h2>
        <p className="text-sm text-slate-500 font-medium">Estrutura organizacional e fluxo de inteligência da campanha.</p>
      </div>

      <div className="relative py-16 px-4 bg-slate-50/50 rounded-3xl border border-slate-200 border-dashed overflow-x-auto min-h-[700px] flex justify-center items-start">
        <div className="flex flex-col items-center gap-12 min-w-[800px] relative">
          
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10">
            <NodeCard node={nodes[0]} onClick={() => setSelectedNode(nodes[0].id)} isTopLevel />
          </motion.div>
          <div className="w-0.5 h-12 bg-slate-300 border-l-2 border-dashed border-slate-300 absolute top-[130px] opacity-60" />

          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="z-10 mt-2">
            <NodeCard node={nodes[1]} onClick={() => setSelectedNode(nodes[1].id)} />
          </motion.div>

          <div className="w-[600px] h-0 border-t-2 border-dashed border-slate-300 absolute top-[340px] opacity-60" />
          <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-300 absolute top-[340px] opacity-60" />
          <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-300 absolute top-[340px] -ml-[600px] opacity-60" />
          <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-300 absolute top-[340px] ml-[600px] opacity-60" />

          <div className="flex gap-12 z-10 w-full justify-center mt-2">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}><NodeCard node={nodes[2]} onClick={() => setSelectedNode(nodes[2].id)} /></motion.div>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}><NodeCard node={nodes[3]} onClick={() => setSelectedNode(nodes[3].id)} /></motion.div>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}><NodeCard node={nodes[4]} onClick={() => setSelectedNode(nodes[4].id)} /></motion.div>
          </div>

          <div className="w-0.5 h-12 border-l-2 border-dashed border-slate-300 absolute top-[520px] opacity-60" />
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="z-10 mt-2">
             <NodeCard node={nodes[5]} onClick={() => setSelectedNode(nodes[5].id)} />
          </motion.div>

        </div>
      </div>

      <Sheet open={!!selectedNode} onOpenChange={(v) => !v && setSelectedNode(null)}>
        <SheetContent className="bg-slate-50 border-l-0 sm:max-w-md p-0">
          <SheetHeader className="bg-[#0f2241] text-white p-6 pb-8">
            <SheetTitle className="text-white text-2xl font-bold flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                {nodes.find(n => n.id === selectedNode) && (() => {
                  const NodeIcon = nodes.find(n => n.id === selectedNode)!.icon;
                  return <NodeIcon className="h-6 w-6 text-blue-300" />;
                })()}
              </div>
              {nodes.find(n => n.id === selectedNode)?.title}
            </SheetTitle>
            <SheetDescription className="text-blue-200/80">
              Métricas consolidadas deste nível operacional.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6 -mt-4">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
               <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                 <span className="text-sm font-semibold text-slate-500 uppercase">Total Vinculados</span>
                 <span className="font-bold text-slate-800">1.240</span>
               </div>
               <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                 <span className="text-sm font-semibold text-slate-500 uppercase">Ativos 7d</span>
                 <span className="font-bold text-emerald-600">85%</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-semibold text-slate-500 uppercase">Grau Confiança</span>
                 <span className="font-bold text-blue-600">Alto</span>
               </div>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NodeCard({ node, onClick, isTopLevel = false }: { node: any, onClick: () => void, isTopLevel?: boolean }) {
  if (isTopLevel) {
    return (
      <Card 
        className="w-56 cursor-pointer border-0 bg-[#0f2241] shadow-xl shadow-blue-900/20 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden"
        onClick={onClick}
      >
        <CardContent className="p-5 flex flex-col items-center text-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="p-3 bg-white/10 text-white rounded-2xl backdrop-blur-md shadow-inner">
            <node.icon className="h-7 w-7" />
          </div>
          <div className="font-bold text-base text-white tracking-wide">{node.title}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="w-56 cursor-pointer border-0 bg-gradient-to-b from-white to-slate-50 shadow-sm hover:shadow-xl hover:border-blue-400 border border-slate-200 hover:-translate-y-1 transition-all duration-300 rounded-2xl"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col items-center text-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-md">
          <node.icon className="h-6 w-6" />
        </div>
        <div className="font-bold text-sm text-slate-800">{node.title}</div>
      </CardContent>
    </Card>
  );
}
