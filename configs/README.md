# Configuracoes por autoescola

Este diretorio guarda os arquivos especificos de cada cliente.
O template em `template/` pode ser copiado para novos nomes.

## Como criar uma nova autoescola

1. Copie o template:
   ```bash
   cp -r configs/template configs/autoescola-nome
   ```
2. Edite `configs/autoescola-nome/frontend/config.js` e substitua os valores
   do `FIREBASE_CONFIG` pelo projeto Firebase da autoescola.
3. Preencha `configs/autoescola-nome/backend/.env` com as credenciais do
   Firebase Admin e os dominios (`FRONTEND_URL`, `BASE_URL`).
4. Aplique a configuracao no projeto antes do deploy ou teste local:
   ```bash
   node scripts/apply-config.js autoescola-nome
   ```
5. Faca deploy do frontend (Netlify) e do backend usando os arquivos copiados.

## Boas praticas

- Gere uma chave de servico do Firebase por autoescola e guarde apenas neste
  diretorio (nao comite os `.env`).
- Ajuste o `API_BASE` no `config.js` para apontar para a instancia do backend.
- Apos copiar os arquivos, confira os valores diretamente em
  `frontend/js/config.js` e `backend/.env` antes de subir para producao.

## Estrutura

```
configs/
  template/
    frontend/config.js   # modelo de configuracao do cliente
    backend/.env         # modelo de variaveis do backend
  autoescola-nome/
    frontend/config.js   # valores reais do cliente
    backend/.env
```

Use o script `scripts/apply-config.js` sempre que alternar entre clientes.
