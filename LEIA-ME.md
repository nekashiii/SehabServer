# SEHAB Servidor Unificado

## O que é este servidor?

Este é o servidor unificado da SEHAB que combina os dois dashboards em um único processo:

- **Dashboard Fiscalização** — Painel de dados do setor de Fiscalização HIS/HMP com atualização automática powwer automate
- **Dashboard PROG** — Painel de programas habitacionais com upload de planilhas

## Fluxo de acesso

```
Iniciar servidor → http://localhost:5000
       ↓
  Tela de Login
       ↓
  Selecionar Dashboard
       ↙          ↘
Fiscalização     PROG
```

## Como iniciar

Execute o arquivo `INICIAR_SERVIDOR.bat` ou rode no terminal:

```
python app.py
```

## Estrutura de pastas

```
sehab_server/
├── app.py                  ← Servidor unificado (único arquivo a rodar)
├── INICIAR_SERVIDOR.bat    ← Atalho para Windows
├── requirements.txt        ← Dependências Python
├── users.json              ← Usuários cadastrados
├── dados.json              ← Dados do Dashboard Fiscalização
├── data/
│   └── planilha_atual.xlsx ← Planilha do Dashboard PROG
└── templates/
    ├── login.html          ← Tela de login
    ├── selecionar.html     ← Tela de seleção de dashboard
    ├── dashboard.html      ← Dashboard Fiscalização
    ├── prog_dashboard.html ← Dashboard PROG
    ├── trocar_senha.html
    └── esqueci_senha.html
```

## Rotas principais

| URL                | Descrição                         |
|--------------------|-----------------------------------|
| `/`                | Redireciona para login            |
| `/login`           | Tela de login                     |
| `/selecionar`      | Seleção de dashboard (pós-login)  |
| `/dashboard`       | Dashboard Fiscalização            |
| `/prog/`           | Dashboard PROG                    |
| `/logout`          | Encerrar sessão                   |

## Porta

O servidor roda na porta **5000** por padrão.
