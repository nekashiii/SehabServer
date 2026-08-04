"""
Gerenciador de usuários SEHAB Dashboard
Execute: python gerenciar_usuarios.py

Comandos disponíveis:
  adicionar   — adiciona um novo usuário
  listar      — lista todos os usuários
  resetar     — reseta senha para padrão e desbloqueia
  remover     — remove um usuário
"""

import json, os, hashlib

USERS_FILE = 'users.json'
SENHA_PADRAO = 'sehab2025'  # ← mesma do app.py

def hash_senha(senha):
    return hashlib.sha256(senha.encode()).hexdigest()

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE) as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

def adicionar_usuario(nome, email):
    users = load_users()
    email = email.strip().lower()
    if email in users:
        print(f'  ⚠ Usuário {email} já existe.')
        return
    users[email] = {
        'nome': nome,
        'email': email,
        'senha': hash_senha(SENHA_PADRAO),
        'primeiro_acesso': True,
        'tentativas': 0,
        'bloqueado': False
    }
    save_users(users)
    print(f'  ✓ {nome} ({email}) adicionado. Senha padrão: {SENHA_PADRAO}')

def listar_usuarios():
    users = load_users()
    if not users:
        print('  Nenhum usuário cadastrado.')
        return
    print(f'\n  {"NOME":<25} {"EMAIL":<35} {"STATUS":<15} {"1º ACESSO"}')
    print('  ' + '-'*85)
    for email, u in users.items():
        status = 'BLOQUEADO' if u.get('bloqueado') else f'✅ ok ({u.get("tentativas",0)} tent.)'
        primeiro = ' Sim' if u.get('primeiro_acesso') else '—'
        print(f'  {u["nome"]:<25} {email:<35} {status:<15} {primeiro}')

def resetar_usuario(email):
    users = load_users()
    email = email.strip().lower()
    if email not in users:
        print(f'  ⚠ Usuário {email} não encontrado.')
        return
    users[email]['senha'] = hash_senha(SENHA_PADRAO)
    users[email]['primeiro_acesso'] = True
    users[email]['tentativas'] = 0
    users[email]['bloqueado'] = False
    save_users(users)
    print(f'  ✓ {email} resetado. Senha padrão: {SENHA_PADRAO}')

def remover_usuario(email):
    users = load_users()
    email = email.strip().lower()
    if email not in users:
        print(f'  ⚠ Usuário {email} não encontrado.')
        return
    nome = users[email]['nome']
    del users[email]
    save_users(users)
    print(f'  ✓ {nome} ({email}) removido.')

def menu():
    print('\n╔══════════════════════════════════╗')
    print('║   SEHAB — Gerenciar Usuários     ║')
    print('╚══════════════════════════════════╝')
    while True:
        print('\n  1. Adicionar usuário')
        print('  2. Listar usuários')
        print('  3. Resetar senha (volta para padrão)')
        print('  4. Remover usuário')
        print('  5. Sair')
        op = input('\n  Opção: ').strip()

        if op == '1':
            nome  = input('  Nome completo: ').strip()
            email = input('  E-mail: ').strip()
            adicionar_usuario(nome, email)
        elif op == '2':
            listar_usuarios()
        elif op == '3':
            email = input('  E-mail do usuário: ').strip()
            resetar_usuario(email)
        elif op == '4':
            email = input('  E-mail do usuário: ').strip()
            remover_usuario(email)
        elif op == '5':
            print('  Até logo!')
            break
        else:
            print('  Opção inválida.')

if __name__ == '__main__':
    menu()
