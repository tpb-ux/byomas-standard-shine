import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Activity, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  usePipelineAlerts, usePipelineLogs, usePipelineMetrics, resolveAlert,
} from "@/hooks/useObservability";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const STAGES = ["fetch", "parser", "publisher", "curator", "cron", "health", "dispatcher"];
const LEVELS = ["info", "warn", "error"];

export default function Observability() {
  const qc = useQueryClient();
  const [stage, setStage] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [correlationId, setCorrelationId] = useState("");

  const { data: alerts = [], isLoading: alertsLoading } = usePipelineAlerts(true);
  const { data: metrics = [] } = usePipelineMetrics(24);
  const { data: logs = [], isLoading: logsLoading } = usePipelineLogs({
    stage: stage === "all" ? undefined : stage,
    level: level === "all" ? undefined : level,
    correlationId: correlationId || undefined,
    limit: 200,
  });

  // KPIs por estágio (24h)
  const kpis = useMemo(() => {
    const byStage: Record<string, { ok: number; failed: number; total: number }> = {};
    for (const m of metrics) {
      if (m.event !== "source.run" && m.event !== "run") continue;
      const s = m.stage;
      if (!byStage[s]) byStage[s] = { ok: 0, failed: 0, total: 0 };
      byStage[s].ok += m.items_ok;
      byStage[s].failed += m.items_failed;
      byStage[s].total += m.items_in;
    }
    return byStage;
  }, [metrics]);

  // Série por hora (fetch)
  const series = useMemo(() => {
    const buckets = new Map<string, { hour: string; ok: number; failed: number }>();
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now - i * 60 * 60 * 1000);
      const key = `${d.getHours().toString().padStart(2, "0")}h`;
      buckets.set(key, { hour: key, ok: 0, failed: 0 });
    }
    for (const m of metrics) {
      if (m.stage !== "fetch" || m.event !== "source.run") continue;
      const d = new Date(m.created_at);
      const key = `${d.getHours().toString().padStart(2, "0")}h`;
      const b = buckets.get(key);
      if (b) { b.ok += m.items_ok; b.failed += m.items_failed; }
    }
    return Array.from(buckets.values());
  }, [metrics]);

  // Saúde por fonte
  const sourceHealth = useMemo(() => {
    const map = new Map<string, { name: string; ok: number; failed: number; last: string; durations: number[] }>();
    for (const m of metrics) {
      if (m.stage !== "fetch" || m.event !== "source.run" || !m.source_id) continue;
      const k = m.source_id;
      if (!map.has(k)) map.set(k, { name: m.source_name ?? "—", ok: 0, failed: 0, last: m.created_at, durations: [] });
      const e = map.get(k)!;
      e.ok += m.items_ok;
      e.failed += m.items_failed;
      if (new Date(m.created_at) > new Date(e.last)) e.last = m.created_at;
      if (m.duration_ms) e.durations.push(m.duration_ms);
    }
    return Array.from(map.values()).map((s) => ({
      ...s,
      avgMs: s.durations.length ? Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length) : 0,
      status: s.failed === 0 && s.ok > 0 ? "green" : s.ok === 0 ? "red" : "yellow",
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [metrics]);

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      toast.success("✅ Alerta resolvido");
      qc.invalidateQueries({ queryKey: ["pipeline_alerts"] });
    } catch (e: any) {
      toast.error(`❌ ${e.message}`);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <Helmet><title>Observabilidade · Admin · Amazonia Research</title></Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Observabilidade do Pipeline</h1>
          <p className="text-muted-foreground">Logs estruturados, métricas e alertas (últimas 24h)</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["fetch", "publisher"].map((s) => {
          const k = kpis[s] ?? { ok: 0, failed: 0, total: 0 };
          const rate = k.ok + k.failed > 0 ? Math.round((k.ok / (k.ok + k.failed)) * 100) : 100;
          return (
            <Card key={s} className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize text-muted-foreground">{s} · taxa sucesso 24h</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rate}%</div>
                <p className="text-xs text-muted-foreground mt-1">{k.ok} ok / {k.failed} falhas</p>
              </CardContent>
            </Card>
          );
        })}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Itens processados 24h</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.values(kpis).reduce((a, b) => a + b.total, 0)}</div>
          </CardContent>
        </Card>
        <Card className={alerts.length > 0 ? "border-destructive bg-destructive/10" : "bg-primary/5 border-primary/20"}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Alertas abertos</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader><CardTitle>Alertas abertos</CardTitle></CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando…</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-primary" />Nenhum alerta aberto</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severidade</TableHead><TableHead>Estágio</TableHead>
                  <TableHead>Fonte</TableHead><TableHead>Título</TableHead>
                  <TableHead>Criado</TableHead><TableHead>E-mail</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><Badge variant={a.severity === "critical" ? "destructive" : "secondary"}>{a.severity}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{a.stage}</TableCell>
                    <TableCell>{a.source_name ?? "—"}</TableCell>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}</TableCell>
                    <TableCell>{a.notified_email_at ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => handleResolve(a.id)}>Resolver</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Gráfico */}
      <Card>
        <CardHeader><CardTitle>Fetch (sucesso vs falhas) — últimas 24h</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="hour" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="ok" stroke="hsl(var(--primary))" strokeWidth={2} name="Sucesso" />
              <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} name="Falhas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Saúde por fonte */}
      <Card>
        <CardHeader><CardTitle>Saúde por fonte (24h)</CardTitle></CardHeader>
        <CardContent>
          {sourceHealth.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Sem execuções nas últimas 24h</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Fonte</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Sucesso</TableHead><TableHead className="text-right">Falhas</TableHead>
                <TableHead className="text-right">Tempo médio</TableHead><TableHead>Última</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {sourceHealth.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "green" ? "default" : s.status === "yellow" ? "secondary" : "destructive"}>
                        {s.status === "green" ? "Saudável" : s.status === "yellow" ? "Atenção" : "Falha"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{s.ok}</TableCell>
                    <TableCell className="text-right">{s.failed}</TableCell>
                    <TableCell className="text-right">{s.avgMs}ms</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(s.last), { addSuffix: true, locale: ptBR })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Logs estruturados</CardTitle>
          <div className="flex flex-wrap gap-2 mt-3">
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estágio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estágios</SelectItem>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Nível" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Correlation ID" value={correlationId} onChange={(e) => setCorrelationId(e.target.value)} className="w-[280px]" />
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando…</div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Quando</TableHead><TableHead>Nível</TableHead>
                <TableHead>Estágio</TableHead><TableHead>Evento</TableHead>
                <TableHead>Fonte</TableHead><TableHead>Mensagem</TableHead>
                <TableHead className="text-right">Duração</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleTimeString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant={l.level === "error" ? "destructive" : l.level === "warn" ? "secondary" : "outline"}>{l.level}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{l.stage}</TableCell>
                    <TableCell className="font-mono text-xs">{l.event}</TableCell>
                    <TableCell className="text-xs">{l.source_name ?? "—"}</TableCell>
                    <TableCell className="text-xs max-w-md truncate" title={l.message ?? ""}>{l.message}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{l.duration_ms ? `${l.duration_ms}ms` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}