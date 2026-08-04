import { useState, useMemo } from "react";

// ── Tabelas de apoio extraídas da planilha ──────────────────────────────────

const FAIXA_RENDA = [
  { inicio: new Date(2016,0,7),   fim: new Date(2016,4,19),  HIS1: 2172,  HIS2: 4344,  HMP: 7240,  decreto: "Decreto nº 56.759/2016" },
  { inicio: new Date(2016,4,20),  fim: new Date(2016,9,10),  HIS1: 2640,  HIS2: 5280,  HMP: 8800,  decreto: "Decreto nº 57.006/2016" },
  { inicio: new Date(2016,9,11),  fim: new Date(2017,4,9),   HIS1: 2640,  HIS2: 5280,  HMP: 8800,  decreto: "Decreto nº 57.377/2016" },
  { inicio: new Date(2017,4,10),  fim: new Date(2018,6,10),  HIS1: 2811,  HIS2: 5622,  HMP: 9370,  decreto: "Decreto nº 57.684/2017" },
  { inicio: new Date(2018,6,11),  fim: new Date(2019,4,5),   HIS1: 2862,  HIS2: 5724,  HMP: 9540,  decreto: "Decreto nº 58.302/2018" },
  { inicio: new Date(2019,4,6),   fim: new Date(2021,1,8),   HIS1: 2994,  HIS2: 5988,  HMP: 9980,  decreto: "Decreto nº 58.741/2019" },
  { inicio: new Date(2021,1,9),   fim: new Date(2022,3,5),   HIS1: 3300,  HIS2: 6600,  HMP: 11000, decreto: "Decreto nº 60.066/2021" },
  { inicio: new Date(2022,3,6),   fim: new Date(2023,1,23),  HIS1: 3636,  HIS2: 7272,  HMP: 12120, decreto: "Decreto nº 61.218/2022" },
  { inicio: new Date(2023,1,24),  fim: new Date(2024,0,3),   HIS1: 3906,  HIS2: 7812,  HMP: 13020, decreto: "Decreto nº 62.175/2023" },
  { inicio: new Date(2024,0,4),   fim: new Date(2025,0,9),   HIS1: 4236,  HIS2: 8472,  HMP: 14120, decreto: "Decreto nº 63.122/2024" },
  { inicio: new Date(2025,0,10),  fim: new Date(2099,0,1),   HIS1: 4554,  HIS2: 9108,  HMP: 15180, decreto: "Decreto nº 64.006/2025" },
];

const TABELA_REQUISITOS = [
  { inicio: new Date(2002,0,1),  fim: new Date(2014,10,30), req: "Prova de que a unidade foi destinada à família com renda compatível com os limites legais." },
  { inicio: new Date(2014,11,1), fim: new Date(2016,4,19),  req: "Prova de que a unidade foi destinada à família com renda compatível com os limites legais." },
  { inicio: new Date(2016,4,20), fim: new Date(2016,9,10),  req: "Comprovação da renda para empreendimentos de uso misto e, para outros, prova de que a unidade foi destinada à família com renda compatível." },
  { inicio: new Date(2016,9,11), fim: new Date(2017,4,9),   req: "Prova de que a unidade foi destinada à família com renda compatível com os limites legais." },
  { inicio: new Date(2017,4,10), fim: new Date(2018,6,10),  req: "\"comprovar renda\"" },
  { inicio: new Date(2018,6,11), fim: new Date(2021,1,8),   req: "Prova de que a unidade foi destinada à família com renda compatível com os limites legais." },
  { inicio: new Date(2021,1,9),  fim: new Date(2023,9,25),  req: "\"renda declarada\" compatível com a faixa prevista em lei" },
  { inicio: new Date(2023,9,26), fim: new Date(2024,1,14),  req: "\"certidão atestando o enquadramento\"" },
  { inicio: new Date(2024,1,15), fim: new Date(2024,1,18),  req: "\"certidão atestando o enquadramento\" + emitida por supervisionadas do BACEN" },
  { inicio: new Date(2024,1,19), fim: new Date(2024,11,31), req: "\"certidão atestando o enquadramento\" + emitida por supervisionadas do BACEN + certificação CA-600, modelo de certidão e critérios de aferição da renda" },
  { inicio: new Date(2025,0,1),  fim: new Date(2099,0,1),   req: "certidão atestando o enquadramento + emitida por supervisionadas do BACEN + modelo e critérios da portaria + responsabilidade do promotor, a quem compete a recepção e guarda dos documentos" },
];

const TIPOS_IRREGULARIDADE = [
  "Renda incompatível",
  "Documentação insuficiente",
  "Averbação ausente na matrícula",
  "Locação sem averbação (Art. 47 §9º)",
  "Destinação irregular por alvará anterior a 2023",
  "Adquirente repetido",
];

const TIPOS_REGULARIDADE = [
  "Renda compatível e documentação adequada",
  "Certidão de enquadramento apresentada",
  "Averbação na matrícula regularizada",
  "Fora do escopo da fiscalização (MCMV)",
  "Unidade não comercializada",
  "Dação em pagamento — fora do escopo",
];

const FUNDAMENTACOES = [
  { label: "Fora do escopo (MCMV)", texto: "Fora do escopo da fiscalização, conforme art. 47, §11, da Lei nº 16.050/2014, unidade vinculada ao Programa Minha Casa Minha Vida." },
  { label: "Não comercializada", texto: "Unidade não comercializada." },
  { label: "Dação em pagamento", texto: "A transferência de unidades para o antigo proprietário do terreno, realizada por meio de dação em pagamento, constitui forma de quitação da obrigação assumida pelo empreendedor e não caracteriza ato de destinação irregular para os fins de que tratam os arts. 46 e 47 da Lei 16.050/2014. A unidade permanece sujeita à fiscalização quanto à sua futura alienação ou locação, conforme parecer de SEHAB/AJ em Doc. 151324055." },
  { label: "Locação sem averbação (irregular)", texto: "Unidade encontra-se irregular para locação por não apresentar averbação na matrícula, conforme exigido pelo Art. 47, § 9º, I e III, da Lei 17.975/2023." },
  { label: "Locação com averbação (regular)", texto: "Unidade encontra-se regular para locação por apresentar averbação na matrícula, conforme exigido pelo Art. 47, § 9º, I e III, da Lei 17.975/2023." },
  { label: "Alvará anterior a 2023 (irregular)", texto: "Com base na data de aprovação do Alvará de Aprovação do empreendimento, verifica-se que a unidade encontra-se em situação irregular, uma vez que a possibilidade de destinação para locação somente passou a ser admitida após a revisão do Plano Diretor Estratégico, promovida pela Lei Municipal nº 17.975, de 2023, conforme parecer PGM Nº 439 de 6 de Maio de 2025." },
];

const TIPOLOGIAS = ["HIS1", "HIS2", "HMP"];
const STATUS_OPTIONS = ["Regular", "Irregular", "Fora do Escopo", "Não Comercializada"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getFaixaByDate(date) {
  if (!date) return null;
  return FAIXA_RENDA.find(f => date >= f.inicio && date <= f.fim) || null;
}

function getRequisitoByDate(date) {
  if (!date) return null;
  return TABELA_REQUISITOS.find(r => date >= r.inicio && date <= r.fim) || null;
}

function getAlertaRenda(renda, tipologia, data) {
  if (!renda || !tipologia || !data) return null;
  const faixa = getFaixaByDate(data);
  if (!faixa) return null;
  const limite = faixa[tipologia];
  if (!limite) return null;
  const rendaNum = parseFloat(String(renda).replace(/[^0-9,.]/g, "").replace(",", "."));
  if (isNaN(rendaNum)) return null;
  return rendaNum > limite
    ? { tipo: "erro", msg: `Renda R$ ${rendaNum.toLocaleString("pt-BR", {minimumFractionDigits:2})} excede o limite de R$ ${limite.toLocaleString("pt-BR", {minimumFractionDigits:2})} para ${tipologia} (${faixa.decreto})` }
    : { tipo: "ok", msg: `Renda dentro do limite (R$ ${limite.toLocaleString("pt-BR", {minimumFractionDigits:2})} para ${tipologia})` };
}

function fmt(v) {
  if (!v && v !== 0) return "—";
  return v;
}

// ── Componente de campo ──────────────────────────────────────────────────────

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a9bb0", marginBottom: 5 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "9px 12px", borderRadius: 8,
        border: "1.5px solid #2d3a4a", background: "#141e2b",
        color: "#e2e8f0", fontSize: 13, fontFamily: "inherit",
        outline: "none", transition: "border-color .2s",
      }}
      onFocus={e => e.target.style.borderColor = "#3b82f6"}
      onBlur={e => e.target.style.borderColor = "#2d3a4a"}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "9px 12px", borderRadius: 8,
        border: "1.5px solid #2d3a4a", background: "#141e2b",
        color: value ? "#e2e8f0" : "#64748b", fontSize: 13,
        fontFamily: "inherit", outline: "none", cursor: "pointer",
        appearance: "none",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : o.label}
        </option>
      ))}
    </select>
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "9px 12px", borderRadius: 8,
        border: "1.5px solid #2d3a4a", background: "#141e2b",
        color: "#e2e8f0", fontSize: 13, fontFamily: "inherit",
        outline: "none", resize: "vertical",
      }}
      onFocus={e => e.target.style.borderColor = "#3b82f6"}
      onBlur={e => e.target.style.borderColor = "#2d3a4a"}
    />
  );
}

function Badge({ children, cor }) {
  const cores = {
    verde: { bg: "#052e16", color: "#4ade80", border: "#166534" },
    vermelho: { bg: "#2d0a0a", color: "#f87171", border: "#7f1d1d" },
    amarelo: { bg: "#2d1f00", color: "#fbbf24", border: "#78350f" },
    azul: { bg: "#0c1a3a", color: "#60a5fa", border: "#1e3a8a" },
    cinza: { bg: "#1e2533", color: "#94a3b8", border: "#334155" },
  };
  const c = cores[cor] || cores.cinza;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11,
      fontWeight: 700, letterSpacing: "0.05em",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  );
}

// ── Painel de Apoio Documental ───────────────────────────────────────────────

function PainelApoio({ dataAssinatura, tipologia }) {
  const date = dataAssinatura ? new Date(dataAssinatura) : null;
  const faixa = date ? getFaixaByDate(date) : null;
  const req = date ? getRequisitoByDate(date) : null;

  return (
    <div style={{
      background: "#0c1520", border: "1px solid #1e3a5a",
      borderRadius: 12, padding: 20,
    }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        📋 Requisito Documental à Época
      </h3>

      {!date && (
        <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>Informe a data de assinatura do contrato para ver o requisito aplicável.</p>
      )}

      {date && req && (
        <div style={{ background: "#0f2236", borderRadius: 8, padding: 14, marginBottom: 14, border: "1px solid #1e4060" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Requisito mínimo</p>
          <p style={{ margin: 0, color: "#e2e8f0", fontSize: 13, lineHeight: 1.6 }}>{req.req}</p>
        </div>
      )}

      {date && faixa && (
        <div style={{ background: "#0f2236", borderRadius: 8, padding: 14, border: "1px solid #1e4060" }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Limites de renda na época ({faixa.decreto})</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {["HIS1","HIS2","HMP"].map(t => (
              <div key={t} style={{
                background: tipologia === t ? "#1e3a5a" : "#0c1e30",
                borderRadius: 8, padding: "10px 12px", textAlign: "center",
                border: tipologia === t ? "1.5px solid #3b82f6" : "1px solid #1e3a5a",
              }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{t}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: tipologia === t ? "#60a5fa" : "#e2e8f0" }}>
                  R$ {faixa[t].toLocaleString("pt-BR", {minimumFractionDigits:2})}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {date && !faixa && (
        <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>Data fora do período coberto pelas tabelas.</p>
      )}
    </div>
  );
}

// ── Linha da tabela de registros ─────────────────────────────────────────────

function TabelaRow({ reg, idx, onEdit, onDelete }) {
  const corStatus = { Regular: "verde", Irregular: "vermelho", "Fora do Escopo": "amarelo", "Não Comercializada": "cinza" };
  return (
    <tr style={{ borderBottom: "1px solid #1e2a3a" }}>
      <td style={{ padding: "10px 14px", color: "#94a3b8", fontSize: 12 }}>{idx + 1}</td>
      <td style={{ padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{fmt(reg.unidade)}</td>
      <td style={{ padding: "10px 14px", color: "#94a3b8", fontSize: 12 }}>{fmt(reg.tipologia)}</td>
      <td style={{ padding: "10px 14px", color: "#cbd5e1", fontSize: 12 }}>{fmt(reg.adquirente)}</td>
      <td style={{ padding: "10px 14px", color: "#cbd5e1", fontSize: 12 }}>
        {reg.renda ? `R$ ${parseFloat(String(reg.renda).replace(/[^0-9.,]/g,"").replace(",",".")).toLocaleString("pt-BR",{minimumFractionDigits:2})}` : "—"}
      </td>
      <td style={{ padding: "10px 14px" }}>
        <Badge cor={corStatus[reg.status] || "cinza"}>{reg.status || "—"}</Badge>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEdit(idx)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #2d3a4a", background: "#1e2a3a", color: "#60a5fa", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Editar</button>
          <button onClick={() => onDelete(idx)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #3d1515", background: "#1a0a0a", color: "#ef4444", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✕</button>
        </div>
      </td>
    </tr>
  );
}

// ── Formulário principal ─────────────────────────────────────────────────────

const FORM_VAZIO = {
  unidade: "", tipologia: "", adquirente: "", renda: "", dataAssinatura: "",
  docContrato: "", averbacao: "", docMatricula: "",
  status: "", tipoIrregularidade: [], tipoRegularidade: [],
  fundamentacao: "", docFundamentacao: "",
};

function FormAnalise({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || FORM_VAZIO);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const date = form.dataAssinatura ? new Date(form.dataAssinatura) : null;
  const alertaRenda = useMemo(() =>
    getAlertaRenda(form.renda, form.tipologia, date),
    [form.renda, form.tipologia, form.dataAssinatura]
  );

  const reqDocumental = useMemo(() =>
    date ? getRequisitoByDate(date) : null,
    [form.dataAssinatura]
  );

  function toggleArray(k, v) {
    setForm(f => {
      const arr = f[k] || [];
      return { ...f, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
    });
  }

  function aplicarFundamentacao(texto) {
    setForm(f => ({
      ...f,
      fundamentacao: f.fundamentacao ? f.fundamentacao + "\n\n" + texto : texto
    }));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
      {/* Coluna principal */}
      <div style={{ background: "#111827", border: "1px solid #1f2d3d", borderRadius: 16, padding: 28 }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
          {initial?.unidade ? `Editando — Unidade ${initial.unidade}` : "Nova Análise"}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field label="Unidade">
            <Input value={form.unidade} onChange={set("unidade")} placeholder="Ex: 101" />
          </Field>
          <Field label="Tipologia Habitacional">
            <Select value={form.tipologia} onChange={set("tipologia")} options={TIPOLOGIAS} placeholder="Selecione..." />
          </Field>
          <Field label="Data Assinatura Contrato">
            <Input type="date" value={form.dataAssinatura} onChange={set("dataAssinatura")} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Adquirente">
            <Input value={form.adquirente} onChange={set("adquirente")} placeholder="Nome do adquirente" />
          </Field>
          <Field label="Renda do Adquirente (R$)" hint={alertaRenda ? alertaRenda.msg : undefined}>
            <Input value={form.renda} onChange={set("renda")} placeholder="0,00" />
            {alertaRenda && (
              <div style={{ marginTop: 6 }}>
                <Badge cor={alertaRenda.tipo === "ok" ? "verde" : "vermelho"}>
                  {alertaRenda.tipo === "ok" ? "✓ Dentro do limite" : "⚠ Acima do limite"}
                </Badge>
              </div>
            )}
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Doc. Contrato">
            <Input value={form.docContrato} onChange={set("docContrato")} placeholder="Nº ou descrição do documento" />
          </Field>
          <Field label="Averbação na Matrícula">
            <Select value={form.averbacao} onChange={set("averbacao")} options={["Sim","Não","Não se aplica"]} placeholder="Selecione..." />
          </Field>
        </div>

        <Field label="Doc. Matrícula">
          <Input value={form.docMatricula} onChange={set("docMatricula")} placeholder="Nº ou descrição" />
        </Field>

        {/* Status */}
        <Field label="Regular ou Irregular">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => set("status")(s)}
                style={{
                  padding: "8px 6px", borderRadius: 8, border: "1.5px solid",
                  borderColor: form.status === s ? "#3b82f6" : "#1f2d3d",
                  background: form.status === s ? "#1e3a5a" : "#0d1520",
                  color: form.status === s ? "#60a5fa" : "#64748b",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  transition: "all .15s",
                }}>
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Tipo de irregularidade */}
        {(form.status === "Irregular") && (
          <Field label="Tipo de Irregularidade (marque todas que se aplicam)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TIPOS_IRREGULARIDADE.map(t => (
                <button key={t} onClick={() => toggleArray("tipoIrregularidade", t)}
                  style={{
                    padding: "6px 12px", borderRadius: 20, border: "1.5px solid",
                    borderColor: form.tipoIrregularidade?.includes(t) ? "#ef4444" : "#2d3a4a",
                    background: form.tipoIrregularidade?.includes(t) ? "#2d0a0a" : "#0d1520",
                    color: form.tipoIrregularidade?.includes(t) ? "#f87171" : "#64748b",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Tipo de regularidade */}
        {(form.status === "Regular") && (
          <Field label="Tipo de Regularidade (marque todas que se aplicam)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TIPOS_REGULARIDADE.map(t => (
                <button key={t} onClick={() => toggleArray("tipoRegularidade", t)}
                  style={{
                    padding: "6px 12px", borderRadius: 20, border: "1.5px solid",
                    borderColor: form.tipoRegularidade?.includes(t) ? "#22c55e" : "#2d3a4a",
                    background: form.tipoRegularidade?.includes(t) ? "#052e16" : "#0d1520",
                    color: form.tipoRegularidade?.includes(t) ? "#4ade80" : "#64748b",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Fundamentação */}
        <Field label="Fundamentação">
          <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FUNDAMENTACOES.map(f => (
              <button key={f.label} onClick={() => aplicarFundamentacao(f.texto)}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "1px solid #2d3a4a",
                  background: "#1a2436", color: "#93c5fd", fontSize: 11,
                  cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                }}>
                + {f.label}
              </button>
            ))}
          </div>
          <Textarea value={form.fundamentacao} onChange={set("fundamentacao")} rows={4} placeholder="Insira ou selecione a fundamentação acima..." />
        </Field>

        {/* Requisito documental info */}
        {reqDocumental && (
          <div style={{ background: "#0c1a2e", border: "1px solid #1e4060", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#60a5fa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Requisito documental mínimo à época</p>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: 12, lineHeight: 1.6 }}>{reqDocumental.req}</p>
          </div>
        )}

        <Field label="Doc. Fundamentação">
          <Input value={form.docFundamentacao} onChange={set("docFundamentacao")} placeholder="Nº ou descrição dos documentos de fundamentação" />
        </Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onCancel} style={{ padding: "10px 22px", borderRadius: 8, border: "1px solid #2d3a4a", background: "transparent", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={() => onSave(form)} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Salvar Análise</button>
        </div>
      </div>

      {/* Painel lateral */}
      <PainelApoio dataAssinatura={form.dataAssinatura} tipologia={form.tipologia} />
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────────────

export default function App() {
  const [registros, setRegistros] = useState([]);
  const [modo, setModo] = useState("lista"); // lista | novo | editar
  const [editIdx, setEditIdx] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const filtrados = registros.filter(r => {
    const matchBusca = !busca || [r.unidade, r.adquirente].some(v => v?.toLowerCase().includes(busca.toLowerCase()));
    const matchStatus = !filtroStatus || r.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const stats = useMemo(() => ({
    total: registros.length,
    regulares: registros.filter(r => r.status === "Regular").length,
    irregulares: registros.filter(r => r.status === "Irregular").length,
    escopo: registros.filter(r => r.status === "Fora do Escopo").length,
  }), [registros]);

  function salvar(form) {
    if (editIdx !== null) {
      setRegistros(r => r.map((x, i) => i === editIdx ? form : x));
    } else {
      setRegistros(r => [...r, form]);
    }
    setModo("lista");
    setEditIdx(null);
  }

  function excluir(idx) {
    if (confirm("Excluir esta análise?")) setRegistros(r => r.filter((_, i) => i !== idx));
  }

  function editar(idx) {
    setEditIdx(idx);
    setModo("editar");
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0",
      padding: "0 0 60px",
    }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2436", background: "#0d1525", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#3b82f6" }}>▣</span> Sistema de Análise Documental
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#475569" }}>HIS/HMP — Fiscalização de Destinação</p>
        </div>
        {modo === "lista" && (
          <button onClick={() => { setModo("novo"); setEditIdx(null); }}
            style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            + Nova Análise
          </button>
        )}
        {modo !== "lista" && (
          <button onClick={() => { setModo("lista"); setEditIdx(null); }}
            style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid #2d3a4a", background: "transparent", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            ← Voltar à Lista
          </button>
        )}
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* Cards de resumo */}
        {modo === "lista" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Total de unidades", val: stats.total, cor: "#3b82f6" },
              { label: "Regulares", val: stats.regulares, cor: "#22c55e" },
              { label: "Irregulares", val: stats.irregulares, cor: "#ef4444" },
              { label: "Fora do Escopo", val: stats.escopo, cor: "#f59e0b" },
            ].map(c => (
              <div key={c.label} style={{ background: "#111827", border: "1px solid #1f2d3d", borderRadius: 14, padding: "18px 22px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: c.cor, lineHeight: 1 }}>{c.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Lista */}
        {modo === "lista" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <input
                value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por unidade ou adquirente..."
                style={{ flex: 1, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #2d3a4a", background: "#111827", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" }}
              />
              <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid #2d3a4a", background: "#111827", color: filtroStatus ? "#e2e8f0" : "#64748b", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                <option value="">Todos os status</option>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {registros.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
                <p style={{ fontSize: 48, margin: "0 0 16px" }}>📄</p>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px", color: "#64748b" }}>Nenhuma análise registrada</p>
                <p style={{ fontSize: 13, margin: 0 }}>Clique em "Nova Análise" para começar.</p>
              </div>
            ) : (
              <div style={{ background: "#111827", border: "1px solid #1f2d3d", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#0d1525", borderBottom: "1px solid #1f2d3d" }}>
                      {["#", "Unidade", "Tipo", "Adquirente", "Renda", "Status", "Ações"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((r, i) => (
                      <TabelaRow key={i} reg={r} idx={i} onEdit={editar} onDelete={excluir} />
                    ))}
                  </tbody>
                </table>
                {filtrados.length === 0 && (
                  <p style={{ textAlign: "center", padding: "30px", color: "#475569", fontSize: 13 }}>Nenhum resultado para o filtro aplicado.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Formulário novo/editar */}
        {(modo === "novo" || modo === "editar") && (
          <FormAnalise
            initial={editIdx !== null ? registros[editIdx] : undefined}
            onSave={salvar}
            onCancel={() => { setModo("lista"); setEditIdx(null); }}
          />
        )}
      </div>
    </div>
  );
}