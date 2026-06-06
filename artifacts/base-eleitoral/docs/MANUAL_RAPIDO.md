# Base Eleitoral 360 - Manual rápido

## Acesso

1. Acesse `https://base-eleitoral.vercel.app`.
2. Entre com o e-mail e senha cadastrados no Supabase Auth.
3. Se aparecer “perfil não encontrado”, crie ou revise o registro correspondente em `users_profiles`.

## Operação diária

1. Abra o Dashboard para ver o pulso geral da campanha.
2. Use Lideranças para cadastrar, editar e acompanhar força territorial.
3. Use Apoiadores para registrar pessoas, status político, vínculo com liderança e qualidade do cadastro.
4. Use Prospecção para acompanhar a jornada do contato até voto validado.
5. Use Agenda de Campo para organizar reuniões, caminhadas, visitas e ações por bairro.
6. Use Demandas para registrar solicitações da população e acompanhar retorno.

## Mapas e geocodificação

1. Cadastre endereço, bairro, cidade e estado nos registros.
2. Acesse Geocodificação e gere latitude/longitude dos registros pendentes.
3. Use Mapa RJ e Mapa Maricá para visualizar pins reais, clusters, heatmap e regiões com baixa cobertura.
4. Rode Diagnóstico para conferir se Mapbox, geocodificação e pontos reais estão saudáveis.

## Importação de planilhas

1. Acesse Importação.
2. Escolha o módulo: Lideranças, Apoiadores, Prospecção, Zonas, Agenda ou Demandas.
3. Baixe o modelo de planilha.
4. Faça upload, revise o mapeamento, valide erros e confirme a importação.

## Relatórios

1. Acesse Relatórios.
2. Escolha o relatório desejado.
3. Aplique filtros por cidade, bairro, zona, liderança, status e período.
4. Use a prévia executiva para orientar ações da semana.

## Diagnóstico final

Antes de apresentar ou operar:

1. Acesse Diagnóstico.
2. Clique em Rodar diagnóstico.
3. Confirme se Supabase, sessão, permissões, CRUD, Mapbox, geocodificação e mapas aparecem como aprovados.

## Recomendações de uso

- Mantenha telefone e endereço completos sempre que possível.
- Registros sem bairro/cidade reduzem a qualidade dos mapas e relatórios.
- Use “próxima ação” em Lideranças, Apoiadores, Prospecção, Agenda e Demandas para não perder retorno.
- Rode o diagnóstico após importações grandes ou alterações no Supabase.

