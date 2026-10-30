# Regras do repositório BLESSAINT

## Versão nos arquivos (regra do Arnold, 30/10/2026)
Antes de TODA publicação, rodar `python3 tools/carimbar-versao.py business/index.html`. Ele troca o `?v=` de todos os .js/.css e o nome do cache do service worker, para o navegador sempre buscar a atualização (sem precisar de Ctrl+Shift+R). Vale também para a Gestão do Studio (o build já faz sozinho).
